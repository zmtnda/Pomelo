var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Cate';

// Getl all categories from database as JSON
// No need Authorization to do this
router.get('/', function(req, res) {
	console.log("Get all catergoies");
	connections.getConnection(res, function(cnn) {
		cnn.query('SELECT id_cat, category FROM Categories ',
		function(err, result){
			if(err){
				console.log(JSON.stringify(err))
				console.log("error get cats from database");
				res.status(404).end();
			} else {
				console.log("get all cats successful");
				res.json(result);
			}
			cnn.release();
		});
	});
});

// Add a new categories into database
// Require admin to add new categories
// Require a newCategory field
router.post('/', function(req, res) {
	console.log("Add new catergoies");
	var vld = req.validator;
  var admin = req.session && req.session.isAdmin();
  var body = req.body;
	var check_query = ' SELECT id_cat AS count FROM Categories WHERE category = ?';
	var insert_query = ' INSERT INTO Categories (category) VALUES (?) ';

	if (vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newCategory'])) {
		connections.getConnection(res, function(cnn) {
			async.waterfall([
				function(callback) { // check exists category
					cnn.query(check_query, [body.newCategory], callback);
				},
				function(result, fields, callback) {
					if (result.length == 0) // insert new category
						cnn.query(insert_query, [body.newCategory], callback);
					else
						callback({success: 0, response: `Category ${body.newCategory} already exists`});
				}
			], function(err, result) {
				if (err) {
					console.log(err);
					res.status(400).json(err);
				} else {
					result.success = 1;
					res.status(200).json(result);
				}
			});
			cnn.release();
		});
	}
});

// Get all manufacture for a specific type of device -> categoryId
// Require a type of device
// No need Authorization to do this
router.get('/:catId/manu', function(req, res) {
	console.log("get manufactures for a sepecific category");
	var vld = req.validator;
	var body = req.body;
  var catId = req.params.catId;
	var query =
		' SELECT c.id_catMan AS catMan_id, m.id_man AS manId, m.manufacturer '+
		' FROM Manufacturers m, CategoriesManufacturers c ' +
		' WHERE c.man_id = m.id_man AND c.cat_id = ?'

	connections.getConnection(res, function(cnn) {
		cnn.query(query, [catId],
		function(err, result) {
			if(err) {
				console.log("error get manufactures for category");
				res.status(400).json(err);
			} else {
				console.log("get manufactures for cat successful");
				res.json(result);
			}
		});
	});
});

// Insert new CategoriesManufacturers
// require catId, and new manufactures, and manId
// if manId is <= 0 then add new manu
// if manId is > 1 then just add in
router.post('/:catId/manu', function(req, res) {
	console.log("Add new CategoriesManufacturers");
	var vld = req.validator;
  var admin = req.session && req.session.isAdmin();
  var body = req.body;
	var catId = req.params.catId;
	var check_exist_manName_query =
		' SELECT id_man FROM Manufacturers WHERE ' +
		' LCASE(manufacturer) = LCASE(?) GROUP BY id_man ';
	var check_exist_catMan_query = 'SELECT 1 FROM CategoriesManufacturers WHERE cat_id=? AND man_id=? ';
	var insert_CM_query =
		' INSERT INTO CategoriesManufacturers (cat_id, man_id) VALUES (?, ?) ';
	var insert_Man_query = ' INSERT INTO Manufacturers (manufacturer) VALUES (?) ';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newManufacturer'])) {
		connections.getConnection(res, function(cnn) {
			async.waterfall([
				function(callback) { // new manu -> check for existing manu name
						cnn.query(check_exist_manName_query, [body.newManufacturer], callback);
				},
				function(result, fields, callback) {
					if (result.length == 0) // insert new manufacturer
						cnn.query(insert_Man_query, [body.newManufacturer], callback);
					else { // already there, check existing catMan
						console.log("hmm?");
						body.id_man = result[0].id_man;
						cnn.query(check_exist_catMan_query, [catId, result[0].id_man], callback);
					}
				},
				function(result, fields, callback) {
					console.log("helllo " + result);
					if (result.hasOwnProperty('insertId')) // with new manu
						cnn.query(insert_CM_query, [catId, result.insertId], callback);
					else if (result.length == 0) // insert with exsting manId
						cnn.query(insert_CM_query, [catId, body.id_man], callback);
					else
						callback({success: 0, response: `CatMan already exists`}, null);
				}
			], function(err, result) {
				if (err)
					res.status(400).json(err);
				else {
					result.success = 1;
					res.status(200).json(result);
				}
			});
			cnn.release();
		});
	}
});

// Get all models for a specific category and manufactures
// Require categoryId and manufactureId
// No need Authorization for this
router.get('/:catId/:manId/model', function(req, res) {
	console.log("get models");
	var vld = req.validator;
	var catId = req.params.catId;
  var manId = req.params.manId;
	var query =
		' SELECT M.id_mod AS modelId, M.model FROM Models M, CategoriesManufacturers CM ' +
		' WHERE CM.id_catMan = M.catMan_id AND CM.cat_id = ? AND CM.man_id = ? '

	connections.getConnection(res, function(cnn) {
		cnn.query(query, [catId, manId],
		function(err, result) {
			if (err) {
				console.log("error get models");
				res.status(400).json(err);
			} else {
				console.log("get models successful");
				res.json(result);
			}
		});
		cnn.release();
	});
});

// Add new model based on category and manufacturer
// Require categoryId, manufacturerId, and new model name
// Need admin Authorization
router.post('/:catId/:manId/model', function(req, res) {
	console.log("Add new models")
	var vld = req.validator;
	var admin = req.session && req.session.isAdmin();
	var body = req.body;
	var catId = req.params.catId;
	var manId = req.params.manId;
	var check_query =
		' SELECT 1 FROM Models M, CategoriesManufacturers CM WHERE ' +
		' LCASE(M.model) = LCASE(?) AND M.catMan_id = CM.id_catMan AND CM.cat_id = ? ' +
		' AND CM.man_id = ? ';
	var insert_query =
		' INSERT INTO Models (model, catMan_id) values (?, ' +
		' (SELECT id_catMan FROM CategoriesManufacturers WHERE ' +
		' cat_id = ?  AND man_id = ?))';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newModel'])) {
		connections.getConnection(res, function(cnn) {
			async.waterfall([
				function(callback) {
					cnn.query(check_query, [body.newModel, catId, manId], callback);
				},
				function(result, fields, callback) {
					if (result.length > 0) // already exists
						callback(null, {success: 1, created: 0, response: `Model '${body.newModel}' arealdy exist`}, null);
					else //new model
						cnn.query(insert_query, [body.newModel, catId, manId], callback);
				}
			], function(err, result) {
				if (err) {
					console.log(err);
					res.status(400).json(err);
				} else {
					result.success = 1;
					result.created = result.created == 0 ? 0 : 1;
					console.log(result);
					res.status(200).json(result);
				}
			});
			cnn.release();
		});
	}
});

// Get all issues
// No need Authorization for this
router.get('/issues', function(req, res) {
		console.log("get issues based on category");
		var vld = req.validator;

		connections.getConnection(res, function(cnn) {
			cnn.query(' SELECT id_iss as issueId, issue FROM Issues ',
			function(err, result) {
				if (err) {
					console.log("error get issues");
					res.status(400).json(err);
				} else {
					console.log("get issues successful");
					res.json(result);
				}
				cnn.release();
			});
		});
});

// Add a new issues based on category type
// Rquired newIssue
// Require Admin Authorization to access this
// Check if the issue already exist first
// Yes -> fail to add. No -> add new issue
router.post('/issues', function(req, res) {
  console.log('Add new issue');
  var vld = req.validator;
  var admin = req.session && req.session.isAdmin();
  var body = req.body;
	var check_query = ' SELECT id_iss AS count FROM Issues WHERE LCASE(issue) = LCASE(?)';
	var insert_query = ' INSERT INTO Issues (issue) VALUES (?)';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newIssue'])) {
	  connections.getConnection(res, function(cnn) {
			async.waterfall([
				function(callback) {
					cnn.query(check_query, [body.newIssue], callback);
				},
				function(result, fields, callback) {
					if (result.length == 0)
						cnn.query(insert_query, [body.newIssue], callback);
					else
						callback({success: 1, created: 0, response: `Issue '${body.newIssue}' already exist`});
				}
			], function(err, result) {
				if (err) {
					console.log(err);
					res.status(400).json(err);
				} else {
					result.success = 1;
					result.created = res.created == 0 ? 0 : 1;
					res.status(200).json(result);
				}
			});
      cnn.release();
    });
  }
});

// get issues based on models
// Require model ID on link
router.get('/:modelId/issues', function(req, res) {
	var vld = req.validator;
	var modelId = req.params.modelId;
	var query =
		' SELECT I.id_iss AS issueId, I.issue, MI.id_modIss AS modIssId, M.catMan_id ' +
		' FROM ModelsIssues MI, Models M ,Issues I ' +
		' WHERE MI.mod_id = ? AND MI.mod_id = M.id_mod AND MI.iss_id = I.id_iss';

	connections.getConnection(res, function(cnn) {
		cnn.query(query, [modelId],
		function(err, result) {
			if (err) {
				console.log("Error getting issues for model");
				res.status(400).json(err);
			} else {
				console.log("Get issues for model successful");
				res.json(result);
			}
		});
		cnn.release();
	});
});

// Assign new issue to specific model
// Require modelId on link and pass in issue Id
// if issue id is -1, then check to add new issue
router.post('/:modelId/issues', function(req, res) {
	console.log('Assign issue to model');
  var vld = req.validator;
  var admin = req.session && req.session.isAdmin();
	var modelId = req.params.modelId;
  var body = req.body;

	var check_exist_issue_query = ' SELECT id_iss FROM Issues WHERE LCASE(issue) = LCASE(?) ';
	var insert_new_issue_query = ' INSERT INTO Issues (issue) VALUES (?) ';
	var check_issue_in_model_query = ' SELECT mod_id FROM ModelsIssues WHERE mod_id=? AND iss_id=? ';
	var insert_issue_to_model_query = ' INSERT INTO ModelsIssues (mod_id, iss_id) VALUES (?,?) ';

	if (vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['issueId', 'issue'])) {
		connections.getConnection(res, function(cnn) {
			async.waterfall([
				function(callback) { // check if issue is new or not
					if (body.issueId == -1)
						cnn.query(check_exist_issue_query, body.issue, callback);
					else
						callback(null, {insertNewIssue: 1}, null);
				},
				function(result, fields, callback) {
					if (!result.hasOwnProperty('insertNewIssue') && result.length == 0) // insert new issue
						cnn.query(insert_new_issue_query, body.issue, callback);
					else if (!result.hasOwnProperty('insertNewIssue') && result.length > 0) // exists issue in table
						callback(null, result, null);
					else
						callback(null, {id_iss: body.issueId}, null); // id pass in
				},
				function(result, fields, callback) {
					if (result.hasOwnProperty('insertId')) // new insert issue no need to check
						callback(null, result, null);
					else {
						if (result.length > 0)	// assign new id if new issue exist in table
							body.issueId = result[0].id_iss;
						cnn.query(check_issue_in_model_query, [modelId, body.issueId], callback); // check issue with model
					}
				},
				function(result, fields, callback) {	// assign issue to model
					if (result.hasOwnProperty('insertId'))
						cnn.query(insert_issue_to_model_query, [modelId, result.insertId], callback);
					else if (result.length == 0)
						cnn.query(insert_issue_to_model_query, [modelId, body.issueId], callback);
					else // already exist issue with model
						callback({success: 0, respons: 'Issue already binded with model'}, null);
				}
			], function(err, result) {
				if (err) {
					console.log("Error posting issue to model");
					res.status(400).json(err);
				} else {
					result.success = 1;
					res.json(result)
				}
			});
			cnn.release();
		});
	}
});

module.exports = router;
