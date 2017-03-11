var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Review';

// Get review with specific id
router.get("/:revId", function(req, res) {
   var revId = req.params.revId;
   var check_query = ' SELECT * FROM Reviews WHERE id_rev=? ';
   var get_query =
      ' SELECT FINAL.*, CAT.category, MAN.manufacturer ' +
      ' FROM ' +
      ' (SELECT SUBCM.*, CM.cat_id, CM.man_id' +
      ' FROM ' +
      ' (SELECT SUBMI.*, M.model, I.issue ' +
      ' FROM ' +
      ' (SELECT SUB.*, MI.iss_id, MI.mod_id ' +
      ' FROM ' +
      ' (SELECT R.*, SH.description, SH.amount, SH.status, SH.orderedDate, '+
      '        SH.completedDate, C.email, SO.modIss_id, SO.catMan_id ' +
      ' FROM (SELECT * FROM Reviews WHERE id_rev=?) R' +
      ' INNER JOIN ServicesHistory SH ON SH.id_serHis = R.serHis_id ' +
      ' INNER JOIN Customers C ON C.id_cus = R.cus_id ' +
      ' INNER JOIN ServicesOfferedByTech SO ON SO.id_serTec = SH.serTec_id) SUB  ' +
      ' INNER JOIN ModelsIssues MI ON MI.id_modIss = SUB.modIss_id) SUBMI' +
      ' INNER JOIN Models M ON M.id_mod = SUBMI.mod_id ' +
      ' INNER JOIN Issues I ON I.id_iss = SUBMI.iss_id) SUBCM ' +
      ' INNER JOIN CategoriesManufacturers CM ON CM.id_catMan = SUBCM.catMan_id) FINAL ' +
      ' INNER JOIN Categories CAT ON CAT.id_cat = FINAL.cat_id ' +
      ' INNER JOIN Manufacturers MAN ON MAN.id_man = FINAL.man_id '
      ;
   connections.getConnection(res, function(cnn) {
      async.waterfall([
         function(callback) {
            cnn.query(check_query, revId, callback);
         },
         function(result, fields, callback) {
            if(result.length == 0) {
               callback({success: 0, response: 'No satisfy row'}, '');
            } else {
               cnn.query(get_query, revId, callback);
            }
         }
      ], function(err, result) {
         if(err) {
            console.log("Error");
            res.status(400).json(err)
         } else if(result.length == 0) {
            res.json({success: 0, response: 'Not suppose to happen, need to check DB!'})
         } else {
            console.log("good");
            res.json(result);
         }
      });
      cnn.release();
   })

});

module.exports = router;
