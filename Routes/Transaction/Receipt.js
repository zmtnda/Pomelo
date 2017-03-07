var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var crypto = require('crypto');
router.baseURL = '/Receipt';


// get specific service history base on the id of serviceHistory
// Rquire id_SerHis on path
router.get('/:serHisId', function(req, res) {
   console.log("Get specific serviceHistory");
   var vld = req.validator;
   var serHis_id = req.params.serHisId;

   var getSerHisSql =
      ' SELECT' +
      ' SH.id_serHis AS serHis, SH.serTec_id AS serTecID, cus_id AS cusId,' +
      ' SO.catMan_id AS catManId ,Manu.manufacturer, C.category, M.model,' +
      ' I.issue,SH.description, SH.amount AS finalAmount,' +
      ' SH.status AS SHStatus, SH.orderedDate, SH.completedDate, SH.isReview' +
      ' FROM' +
      ' ServicesHistory SH, ServicesOfferedByTech SO, ModelsIssues MI, Issues I,' +
		' Models M, CategoriesManufacturers CM, Categories C, Manufacturers Manu ' +
      ' WHERE' +
      ' SH.id_serHis=? AND SH.serTec_id = SO.id_serTec AND SO.modIss_id = MI.id_modIss' +
      ' AND MI.iss_id = I.id_iss AND MI.mod_id = M.id_mod AND M.catMan_id = CM.id_catMan' +
      ' AND CM.cat_id = C.id_cat AND CM.man_id = Manu.id_man'

   connections.getConnection(res, function(cnn) {
      cnn.query(getSerHisSql, serHis_id,
      function(err, result) {
         if(err) {
            console.log("Error geting serHis: " + serHisId);
            res.status(400).json(err);
         } else if (result.length == 0) {
            console.log("No row for given serHis_id");
            res.json({sucess:0});
         } else {
            console.log("Get info serHis successful");
            result[0].success = 1;
            res.json(result[0]);
         }
      });
      cnn.release();
   });
});

// Add new service history
// Requre:  - serTecID
//          - cusId
//          - description
//          - amount
// Status is pending (0), orderedDate will be NOW()
router.post('/', function(req, res) {
   console.log('Create transaction - service history');
   var vld = req.validator;
   var body = req.body;
   var hash = crypto.randomBytes(40).toString('hex');

   var insertSerHisSql =
      ' INSERT INTO ServicesHistory (serTec_id, cus_id, description, amount, ' +
      ' status, orderedDate, completedDate, serHisHash) VALUES ' +
      ' (?, ?, ?, ?, 0, NOW(), NOW(), ?)';

   if(vld.hasFields(body, ['serTecId', 'cusId',  'description', 'amount'])) {
      connections.getConnection(res, function(cnn) {
         cnn.query(insertSerHisSql, [body.serTecId, body.cusId,
            body.description, body.amount, hash],
         function(err, result) {
            if(err) {
               console.log("Error insert service history");
               res.status(400).json(err);
            } else {
               console.log("Insert new service history successful");
               res.json({success: 1});
            }
         });
         cnn.release();
      });
   }
});

module.exports = router;
