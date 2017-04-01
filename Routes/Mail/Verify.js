var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Verify';

// Test
router.get("/", function(req, res) {
   res.status(200).json({success:1, reponse: "exists"});
});

// Activate account of technician after creating
// Need email and hash in link
router.get("/account/:email/:hash", function(req, res) {
   console.log("Verify email for registration");

   var email = req.params.email;
   var hash = req.params.hash;
   var check_query =
   ' SELECT L.id_log, T.status ' +
   ' FROM (SELECT id_log ' +
   '       FROM Logins ' +
   '       WHERE DATEDIFF(NOW(), whenRegistered) < 10 AND email=? ' +
   '         AND passwordHash=?) L ' +
   ' INNER JOIN Technicians T ' +
   ' ON L.id_log = T.log_id ';
   var enable_query = ' UPDATE Technicians SET status=1 WHERE log_id=? ';

   connections.getConnection(res, function(cnn) {
      cnn.query(check_query, [email, hash], function(err, result) {
         if(err) {
            console.log("Error checking account");
            res.status(400).json(err);
         } else if(result.length == 0) {
            console.log("No row statisfy in table");
            res.status(200).json({success: 0});
         } else {
            cnn.query(enable_query, result[0].id_log, function(err, result) {
               if(err) {
                  console.log("Error activate account");
                  res.status(400).json(err);
               } else {
                  console.log("Successful activate account")
                  res.status(200).json({success: 1});
               }
            })
         }
      });
      cnn.release();
   });
});

// Review service
// Need serHis_id and has
// Need to test with other query for larger dataset
router.get("/review/:serHis_id/:hash", function(req, res) {
   var serHis_id = req.params.serHis_id;
   var hash = req.params.hash;
   var query =
      ' SELECT FINALCUS.*, CUS.email AS customer ' +
      ' FROM (SELECT SHSOMIMC1.*, MAN.manufacturer, CAT.category ' +
      '       FROM (SELECT SHSOMI2.*, CM.man_id, CM.cat_id ' +
      '             FROM (SELECT SHSOMI1.*, M.model, I.issue '+
      '                   FROM (SELECT SHSO.*, MI.mod_id, MI.iss_id '+
      '                         FROM (SELECT SH.*, SO.modIss_id, SO.catMan_id, SO.servType ' +
      '                               FROM (SELECT id_serHis, serTec_id, cus_id, description, '+
      '                                       amount AS finalAmount, status AS SHStatus, ' +
	   '                                       orderedDate, completedDate, isReview '+
      '                                     FROM ServicesHistory ' +
      '                                     WHERE id_serHis=? AND serHisHash=? ' +
      '                               ) SH ' +
      '                               INNER JOIN ServicesOfferedByTech SO ON SH.serTec_id = SO.id_serTec ' +
      '                          ) SHSO ' +
      '                         INNER JOIN ModelsIssues MI ON SHSO.modIss_id = MI.id_modIss ' +
      '                   ) SHSOMI1 ' +
      '                   INNER JOIN Issues I ON SHSOMI1.iss_id = I.id_iss '+
      '                   INNER JOIN Models M ON SHSOMI1.mod_id = M.id_mod ' +
      '                   ) SHSOMI2 ' +
      '             INNER JOIN CategoriesManufacturers CM ON CM.id_catMan = SHSOMI2.catMan_id ' +
      '             ) SHSOMIMC1 ' +
      '       INNER JOIN Manufacturers MAN ON SHSOMIMC1.man_id = MAN.id_man ' +
      '       INNER JOIN Categories CAT ON SHSOMIMC1.cat_id = CAT.id_cat ' +
      '       ) FINALCUS ' +
      ' INNER JOIN Customers CUS ON FINALCUS.cus_id = CUS.id_cus';

      // ' SELECT' +
      // ' SH.id_serHis AS serHisId, SH.serTec_id AS serTecID, SH.cus_id AS cusId, Cus.email AS customer, ' +
      // ' SO.catMan_id AS catManId ,Manu.manufacturer, C.category, M.model,' +
      // ' I.issue, SH.description, SH.amount AS finalAmount,' +
      // ' SH.status AS SHStatus, SH.orderedDate, SH.completedDate, SH.isReview' +
      // ' FROM' +
      // ' ServicesHistory SH, ServicesOfferedByTech SO, ModelsIssues MI, Issues I,' +
      // ' Models M, CategoriesManufacturers CM, Categories C, Manufacturers Manu, ' +
      // ' Customers Cus ' +
      // ' WHERE' +
      // ' SH.id_serHis=? AND SH.serHisHash=? AND  SH.serTec_id = SO.id_serTec '+
      // ' AND SO.modIss_id = MI.id_modIss AND MI.iss_id = I.id_iss ' +
      // ' AND MI.mod_id = M.id_mod AND M.catMan_id = CM.id_catMan' +
      // ' AND CM.cat_id = C.id_cat AND CM.man_id = Manu.id_man';

   connections.getConnection(res, function(cnn) {
      cnn.query(query, [serHis_id, hash], function(err, result) {
         if(err) {
            console.log("Err getting info for reivew");
            res.status(400).json(err);
         } else if (result.length == 0) {
            console.log("No row in table");
            res.status(200).json({success: 0});
         } else {
            console.log("Success get review");
            result[0].success = 1;
            res.json(result[0]);
         }
      })
      cnn.release();
   });
});

module.exports = router;
