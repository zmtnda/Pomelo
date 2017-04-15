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
      ' SH.id_serHis AS serHis, SH.serTec_id AS serTecID, SH.cus_id AS cusId, Cus.email AS customer' +
      ' SO.catMan_id AS catManId ,Manu.manufacturer, C.category, M.model,' +
      ' I.issue,SH.description, SH.amount AS finalAmount,' +
      ' SH.status AS SHStatus, SH.orderedDate, SH.completedDate, SH.isReview' +
      ' FROM' +
      ' ServicesHistory SH, ServicesOfferedByTech SO, ModelsIssues MI, Issues I,' +
		' Models M, CategoriesManufacturers CM, Categories C, Manufacturers Manu, Customer Cus ' +
      ' WHERE' +
      ' SH.id_serHis=? AND SH.serTec_id = SO.id_serTec AND SO.modIss_id = MI.id_modIss' +
      ' AND MI.iss_id = I.id_iss AND MI.mod_id = M.id_mod AND M.catMan_id = CM.id_catMan' +
      ' AND CM.cat_id = C.id_cat AND CM.man_id = Manu.id_man AND SH.cus_id = Cus.id_cus';

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

// get all the transactions for the tecId
// AU must be technician or Admin
router.get('/:tecId/technician', function(req, res) {
   var vld = req.validator;
   var tec_id = req.session.tec_id;
   var formatDate = ', DATE_FORMAT(orderedDate, \'\%b \%d \%Y \%h\:\%i \%p\') as orderedDate '
                 + ', DATE_FORMAT(completedDate, \'\%b \%d \%Y \%h\:\%i \%p\') as completedDate ';
   //   qry = 'SELECT x.*, y.*, z.serviceName, v.status, v.amount ' + formatDate +
   var selectQry = ' SELECT id_serHis, serTec_id, cus_id, email, category, manufacturer, model, issue, '
                 + ' description, amount, T4.status ' + formatDate
                 + ' FROM ServicesOfferedByTech T1 '
                 + ' INNER JOIN (SELECT id_catMan, category, manufacturer '
                 + ' FROM CategoriesManufacturers T1 '
                 + ' INNER JOIN Categories T2 ON T1.cat_id = T2.id_cat '
                 + ' INNER JOIN Manufacturers T3 ON T1.man_id = T3.id_man '
                 + ' ) T2 ON T1.catMan_id = T2.id_catMan AND T1.tec_id = ? '
                 + ' INNER JOIN (SELECT id_modIss, model, issue '
                 + ' FROM ModelsIssues T1 '
                 + ' INNER JOIN Models T2 ON T1.mod_id = T2.id_mod '
                 + ' INNER JOIN Issues T3 ON T1.iss_id = T3.id_iss '
                 + ' ) T3 ON T1.modIss_id = T3.id_modIss AND T1.tec_id = ? '
                 + ' INNER JOIN (SELECT id_serHis, serTec_id, cus_id, email, description, amount, '
                 + ' status, orderedDate, completedDate '
                 + ' FROM ServicesHistory T1 '
                 + ' INNER JOIN Customers T2 ON T1.cus_id = T2.id_cus '
                 + ' ) T4 ON T1.id_serTec = T4. serTec_id AND T1.tec_id = ? '
                 + ' AND T4.status <> 4 '
                 + ' ORDER BY orderedDate ';

   connections.getConnection(res, function(cnn) {
      cnn.query(selectQry, [tec_id,tec_id,tec_id],
      function(err, result) {
         if(err) {
            console.log("Error geting serHis: " + tec_id);
            res.status(400).json(err);
         }else {
            console.log("Get info serHis successful" + tec_id);
            res.json(result);
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
// modify SerivcesHistory table
//
router.put('/:serHisId/issue', function(req, res) {
  var vld = req.validator;
  var body = req.body;
  var logId = req.session.id;
	var pkey = req.params.serHisId;

  var selectQry = ' UPDATE ServicesHistory SET ? WHERE id_serHis = ? '

  if (vld.checkPrsOK(logId)) {
    connections.getConnection(res, function(cnn) {
      console.log("body " + JSON.stringify(body));
      console.log("pkey " + pkey);
      console.log("logId " + logId);
			cnn.query( selectQry, [body, pkey], function(err, result){
				if(err){
					res.status(400).json(err);
				}
				else{
					res.json({success: 1});
				}
			});
      cnn.release();
		});
  }
});
module.exports = router;
