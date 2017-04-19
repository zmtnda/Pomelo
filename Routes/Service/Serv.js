var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Serv';
var formatDate = ', DATE_FORMAT(timestamp, \'\%b \%d \%Y \%h\:\%i \%p\') as formatDate';

// Begin '/Serv/' functions
/* Add a new service for the technician
* Front end will make sure all the required params are attached with JSON
* Valid only if technician himself
* Valid only if the serivce is not already offered
* which mean no duplicate modIss_id and catMan_id pair
*/

router.post('/:tecId', function(req, res) {
  var vld = req.validator;
  var tecId = req.session.tec_id;
  var qryParams = [];
  var selectParams = [];
  var insertParams = [];
  var dupModIssIds = [];
  var updateParams = [];
  var modIssids =  req.body.offer.modIss_Id;
  var catManids =  req.body.offer.catMan_Id;
  var map = {};
  
  if(vld.checkTech()){
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback){
          //map saves the initial state
          for( var i = 0; i < modIssids.length; i++){
            map[modIssids[i]] = new Array();
            map[modIssids[i]].push(tecId);
            map[modIssids[i]].push(modIssids[i]);
            map[modIssids[i]].push(catManids[i]);
            map[modIssids[i]].push(req.body.offer.servType[i]);
            map[modIssids[i]].push(req.body.offer.amount[i]);
            map[modIssids[i]].push(1);
          }
          for( var i = 0; i < modIssids.length; i++){
            qryParams.push('(?,?,?)');
            selectParams.push(tecId);
            selectParams.push(modIssids[i]);
            selectParams.push(catManids[i]);
          }
          callback(null);
        },
        function(callback){
          var selectQuery = ' SELECT id_serTec, modIss_id FROM ServicesOfferedByTech WHERE '
      							+ ' (tec_Id , modIss_id, catMan_Id ) IN (' + qryParams.join(',') + ')'
                    + ' ORDER BY modIss_id ';
          cnn.query(selectQuery, selectParams, callback);
        },
        function(results, fields, callback){
            for( var i = 0; i < results.length; i++){
              var index = modIssids.indexOf(results[i].modIss_id);
              if (index > -1){
                dupModIssIds.push(results[i]);
                //remove the item from the modIssids array
                modIssids.splice(index, 1);
              }
            } 
            for( var i = 0; i < dupModIssIds.length; i++){
              for (var j = 0; j < 6; j++){
                updateParams.push(map[dupModIssIds[i].modIss_id][j]);
              }
              updateParams.push(dupModIssIds[i].id_serTec);
              updateParams.push(dupModIssIds[i].modIss_id);
            } 
          callback(null);
        },
        function(callback){
          if (updateParams.length > 0){
            var updateQuery = ' UPDATE ServicesOfferedByTech SET tec_id = ?, modIss_id = ?, catMan_id = ?, '
                            + ' servType = ?, estAmount = ?, status = ? WHERE id_serTec = ? AND modIss_id = ? '
            cnn.query(updateQuery, updateParams, callback);
          }
          else
            callback(null, 0, 0);
        },
        function(rows, fields, callback){
          qryParams = [];
          for( var i = 0; i < modIssids.length; i++){
              qryParams.push('(?,?,?,?,?,?)');
              for (var j = 0; j < 6; j++){
                insertParams.push(map[modIssids[i]][j]);
              }
          }
          callback(null);
        },
        function(callback){
          if (insertParams.length > 0){
            var insertQuery = ' INSERT INTO ServicesOfferedByTech (tec_id, modIss_id, '
                           + 'catMan_id, servType, estAmount, status) VALUES '
                           + qryParams.join(',');
            cnn.query(insertQuery, insertParams, callback);
        }
        else
          callback(null);
        }], function(err, results){
          if (err){
            res.status(400).json(err); // closes reponse
          } else if (dupModIssIds.length > 0){
            //overwrote rows of those records
              res.json(dupModIssIds);
            }
            else{
              res.location(router.baseURL + '/' + results.affectedRows).end();
            }
        });
			cnn.release();
  })}});
      
  // Retrieve all the Services in the database.
  // AU must be admin.
  router.get('/all', function(req, res) {
  var vld = req.validator;
  var LogUser = req.session.id;

  var selectQry = ' SELECT category, manufacturer, model, issue, servType, estAmount, status '
                + ' FROM ServicesOfferedByTech T1 '
                + ' INNER JOIN (SELECT id_catMan, category, manufacturer '
                + ' FROM CategoriesManufacturers T1 '
                + ' INNER JOIN Categories T2 ON T1.cat_id = T2.id_cat '
                + ' INNER JOIN Manufacturers T3 ON T1.man_id = T3.id_man '
                + ' ) T2 ON T1.catMan_id = T2.id_catMan '
                + ' INNER JOIN (SELECT id_modIss, model, issue '
                + ' FROM ModelsIssues T1 '
                + ' INNER JOIN Models T2 ON T1.mod_id = T2.id_mod '
                + ' INNER JOIN Issues T3 ON T1.iss_id = T3.id_iss '
                + ' ) T3 ON T1.modIss_id = T3.id_modIss '
                + ' ORDER BY tec_id ';

  if(vld.checkAdmin(LogUser)){
  	connections.getConnection(res, function(cnn) {
  		cnn.query(selectQry, LogUser, function(err, result){
  			if(err){
  				res.status(400).end();
  			}
  			else{
  				res.json(result);
  			}
  		});
      cnn.release();
  	});
  }});

// modify SerivcesOfferedByTech table
router.put('/:serTecId/issue', function(req, res) {
  var vld = req.validator;
  var body = req.body;
  var tecId = req.session.tec_id;
  var logId = req.session.id;
	var pkey = req.params.serTecId;
  /*Though id_serTec is PK also check tec_id to make sure to get the right data*/
  var selectQry = ' UPDATE ServicesOfferedByTech SET ? WHERE id_serTec = ? AND tec_id = ? '

  if (vld.checkPrsOK(logId)) {
    connections.getConnection(res, function(cnn) {
			cnn.query( selectQry, [body, pkey, tecId], function(err, result){
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
// Retrieve all the Services in the database.
// AU must be technician himself.
router.get('/:tecId/all', function(req, res) {
	var vld = req.validator;
	var LogUser = req.params.tecId;
  var userId = req.session.id;
  var selectQry = ' SELECT id_serTec, category, manufacturer, model, issue, servType, estAmount, status '
                + ' FROM ServicesOfferedByTech T1 '
                + ' INNER JOIN (SELECT id_catMan, category, manufacturer '
                + ' FROM CategoriesManufacturers T1 '
                + ' INNER JOIN Categories T2 ON T1.cat_id = T2.id_cat '
                + ' INNER JOIN Manufacturers T3 ON T1.man_id = T3.id_man '
                + ' ) T2 ON T1.catMan_id = T2.id_catMan '
                + ' INNER JOIN (SELECT id_modIss, model, issue '
                + ' FROM ModelsIssues T1 '
                + ' INNER JOIN Models T2 ON T1.mod_id = T2.id_mod '
                + ' INNER JOIN Issues T3 ON T1.iss_id = T3.id_iss '
                + ' ) T3 ON T1.modIss_id = T3.id_modIss '
                + ' WHERE tec_id = ? ';
	if(vld.checkPrsOK(userId)){
		connections.getConnection(res, function(cnn) {
			cnn.query(selectQry, LogUser, function(err, result){
				if(err){
					res.status(400).end();
				}
				else{
					res.json(result);
				}
			});
      cnn.release();
		});
}});

// Customer Retrieve all the technicians for the issue
// No AU required
router.get('/:issId/Issues', function(req, res) {
	var vld = req.validator;
	var user = req.session;
	var issId = req.params.issId;
    var selectQry = ' SELECT tech.firstName, tech.lastName, tech.hourlyRate, '
                  + ' tech.city, tech.ratings, tech.bad_id, category, manufacturer, '
                  + ' model, issue, servType, estAmount '
                  + ' FROM ServicesOfferedByTech T1 '
                  + ' INNER JOIN (SELECT id_catMan, category, manufacturer '
                  + ' FROM CategoriesManufacturers T1 '
                  + ' INNER JOIN Categories T2 ON T1.cat_id = T2.id_cat '
                  + ' INNER JOIN Manufacturers T3 ON T1.man_id = T3.id_man '
                  + ' ) T2 ON T1.catMan_id = T2.id_catMan '
                  + ' INNER JOIN (SELECT id_modIss, model, issue '
                  + ' FROM ModelsIssues T1 '
                  + ' INNER JOIN Models T2 ON T1.mod_id = T2.id_mod '
                  + ' INNER JOIN Issues T3 ON T1.iss_id = T3.id_iss '
                  + ' AND T3.id_iss = ? '
                  + ' ) T3 ON T1.modIss_id = T3.id_modIss '
                  + ' INNER JOIN Technicians tech ON T1.tec_id = tech.id_tec '
                  + ' ORDER BY tech.ratings DESC';
		connections.getConnection(res, function(cnn) {
			cnn.query(selectQry, issId,
			function(err, result){
				if(!err){
					res.json(result);
					cnn.release();
				}
				else{
					res.status(404).end();
					cnn.release();
				}
			});
		});

});


module.exports = router;
