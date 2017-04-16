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
  var qryParams = [];
  var modIssids =  req.body.offer.modIss_Id;
  var catManids =  req.body.offer.catMan_Id;
  var map = {};

  //saving the initial state
  for( var i = 0; i < modIssids.length; i++){
    map[modIssids[i]] = new Array();
    map[modIssids[i]].push(req.params.tecId);
    map[modIssids[i]].push(modIssids[i]);
    map[modIssids[i]].push(catManids[i]);
    map[modIssids[i]].push(req.body.offer.servType[i]);
    map[modIssids[i]].push(req.body.offer.amount[i]);
    map[modIssids[i]].push(1);
  }

  if(vld.checkTech()){
    connections.getConnection(res, function(cnn) {
      var selectParams = [];
      for( var i = 0; i < modIssids.length; i++){
        qryParams.push('(?,?,?)');
        selectParams.push(req.params.tecId);
        selectParams.push(modIssids[i]);
        selectParams.push(catManids[i]);
        console.log("selectParams " + selectParams);
      }
      var serQuery = ' SELECT modIss_id FROM ServicesOfferedByTech WHERE '
      							+ ' (tec_Id , modIss_id, catMan_Id ) IN (' + qryParams.join(',') + ')'
                    + ' AND status <> 0 '
                    + ' ORDER BY modIss_id ';
      cnn.query(serQuery, selectParams, function(err, results) {
      if(err) {
                console.log("there is error checking duplicate ");

        res.status(400).json(err); // closes reponse
      }
      //if results return 0 no duplicate just insert all
      //if results are same row as the leignth of modiss it's all duplicate
      //if < has some duplicate
      if (results.length == modIssids.length){
        //res.location(router.baseURL + '/' + results).end();
                        console.log("found duplicate ");

        res.json(results);
      } else {
                        console.log("there is no duplicate ");

        var dupModIssIds = [];
        var insertParams = [];
        qryParams = [];
        for( var i = 0; i < results.length; i++){
          var index = modIssids.indexOf(results[i].modIss_id);
          if (index > -1){
            dupModIssIds.push(results[i]);
            modIssids.splice(index, 1);
          }
        }
        for( var i = 0; i < modIssids.length; i++){
          qryParams.push('(?,?,?,?,?,?)');
          for (var j = 0; j < 6; j++){
            insertParams.push(map[modIssids[i]][j]);
          }
          //insertParams.push(map[modIssids[i]]);
          // console.log("map[modIssids[i] " + map[modIssids[i]]);
        }
        //insertParams.length  must be > 0
        // bcoz of "if (results.length == modIssids.length)""
        if (vld.check(insertParams.length > 0 , Tags.dupService)){
          var insertQuery = ' INSERT INTO ServicesOfferedByTech (tec_id, modIss_id, '
                          + 'catMan_id, servType, estAmount, status) VALUES '
                          + qryParams.join(',');
          cnn.query(insertQuery, insertParams, function(err, results) {
            if(err) {
            res.status(400).json(err); // closes reponse
            } else{
            //expecting a return of array of services jsut inserted
            if (dupModIssIds.length > 0){
              res.json(dupModIssIds);}
            else{
              res.location(router.baseURL + '/' + results.affectedRows).end();}
            }});
      }}});
      cnn.release();
    });
  }});
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
      console.log("body " + JSON.stringify(body));
      console.log("pkey " + pkey);
      console.log("tecId " + tecId);
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
