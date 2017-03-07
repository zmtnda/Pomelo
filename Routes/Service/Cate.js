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
		cnn.query('SELECT id_cat, category from Categories ',
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
	var insert_query = ' INSERT INTO Categories (category) values (?) ';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newCategory'])) {
		connections.getConnection(res, function(cnn) {
       	cnn.query(check_query, [body.newCategory],
    		function(err, result) {
				if(err) {
					console.log("Error check for existing cate");
					res.status(400).json(err);
				} else if(result.length >0) {
					console.log("Category already exists");
					res.json({sucess: 1, created: 0});
				} else {
             	cnn.query(insert_query, [body.newCategory],
    				function(err, result){
    					if(err) {
    						console.log("error create new category");
    						res.status(400).json(err);
    					} else {
    						console.log("create new category successful");
                   	res.json({sucess: 1, created: 1});
    					}
    				});
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
		' SELECT m.id_man AS manId, m.manufacturer FROM manufacturers m, ' +
		' categoriesmanufacturers c WHERE c.man_id = m.id_man AND c.cat_id = ?'

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
// require catId, and new manufactures
router.post('/:catId/manu', function(req, res) {
	console.log("Add new CategoriesManufacturers");
	var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
   var body = req.body;
	var catId = req.params.catId;
	var check_query =
		' SELECT id_man FROM Manufacturers WHERE ' +
		' LCASE(manufacturer) = LCASE(?) GROUP BY id_man ';
	var insert_CM_query =
		' INSERT INTO CategoriesManufacturers (cat_id, man_id) VALUES (?, ?) ';
	var insert_Manu_query = ' INSERT INTO Manufacturers (manufacturer) VALUES (?) ';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newManufacturer'])) {
		connections.getConnection(res, function(cnn) {
			cnn.query(check_query, [body.newManufacturer],
			function(err, result) {
				if(err) {
					console.log("Error check exist manufacturer");
					res.status(400).json(err);
				} else if (result.length > 0) { //create new CategoriesManufacturers
					cnn.query(insert_CM_query, [catId, result[0].id_man] ,
					function(err, result) {
						if(err) {
							console.log("Error insert new CategoriesManufacturers with exist man");
							res.status(400).json(err);
						} else {
							console.log("Add new CategoriesManufacturers successful");
							res.json({success: 1});
						}
					});
				} else { // no manufacturer - need to create new manufacturer
					cnn.query(insert_Manu_query, [body.newManufacturer],
					function(err, result) {
						if (err) {
							console.log("Error add new Manufacturers");
							res.status(400).json(err);
						} else { // insert into CategoriesManufacturers
							cnn.query(insert_CM_query, [catId, result.insertId],
							function(err, result) {
								if(err) {
									console.log("Error insert new CategoriesManufacturers with new man");
									res.status(400).json(err);
								} else {
									console.log("Add new CategoriesManufacturers successful");
									res.json({success: 1});
								}
							});
						}
					});
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
		' WHERE CM.id_catMan = M.catMan_id and CM.cat_id = ? and CM.man_id = ? '

	connections.getConnection(res, function(cnn) {
		cnn.query(query, [catId, manId],
		function(err, result) {
			if(err) {
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
		' SELECT count(*) AS count FROM Models M, CategoriesManufacturers CM WHERE ' +
		' LCASE(M.model) = LCASE(?) AND M.catMan_id = CM.id_catMan AND CM.cat_id = ? ' +
		' AND CM.man_id = ? ';
	var insert_query =
		' INSERT INTO Models (model, catMan_id) values (?, ' +
		' (SELECT id_catMan FROM CategoriesManufacturers WHERE ' +
		' cat_id = ?  AND man_id = ?))';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newModel'])) {
		connections.getConnection(res, function(cnn) {
			cnn.query(check_query, [body.newModel, catId, manId],
			function(err, result){
				if(err){
					console.log("Err checking exist model");
					res.status(400).json(err);
				}
				else if(result.length && result[0].count > 0) {
					console.log("models already exists");
					res.json({success: 1, created: 0});
				} else {
					cnn.query(insert_query, [body.newModel, catId, manId],
					function(err, result) {
						if(err) {
							console.log("Error insert new model");
							res.status(400).json(err);
						} else {
							console.log("Add new model successful");
							res.json({success: 1, created: 1});
						}
					});
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
	var checkAdmin = ' SELECT id_iss AS count FROM Issues WHERE LCASE(issue) = LCASE(?)';
	var insert_query = ' INSERT INTO Issues (issue) VALUES (?)';

   if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newIssue'])) {
      connections.getConnection(res, function(cnn) {
         cnn.query(check_query, [body.newIssue],
         function(err, result) {
				if(err) {
					console.log("Err get count issues");
					res.status(400).json(err);
				}
            else if(result.length > 0) {
					console.log("Issue already exist");
               res.json({success: 1, created: 0});
            } else {
					cnn.query(insert_query, [body.newIssue],
               function(err, result) {
                  if(err) {
                     console.log("error create new issue");
      					res.status(400).json(err);
                  } else {
                     console.log("create new issue successful");
                     res.json({success: 1, created: 1});
                  }
               });
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
			if(err) {
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
router.post('/:modelId/issues', function(req, res) {
	console.log('Assign issue to model');
   var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
	var modelId = req.params.modelId;
   var body = req.body;
	var check_query = ' SELECT mod_id FROM ModelsIssues WHERE mod_id=? AND iss_id=? ';
	var insert_query = ' INSERT INTO ModelsIssues (mod_id, iss_id) VALUES (?,?) ';

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['issueId'])) {
		connections.getConnection(res, function(cnn) {
			cnn.query(check_query, [modelId, body.issueId],
		 	function(err, result){
				if(err) {
					console.log("Error checking for exist model issue");
					res.status(400).json(err);
				} else if (result.length > 0) {
					console.log("Issue for this model already exists");
					res.json({success: 1, created: 0});
				} else {
					cnn.query(insert_query, [modelId, body.issueId],
					function(err, result) {
						if(err) {
							console.log("Err assign issue into model");
							res.status(400).json(err);
						} else {
							console.log("Assign issue to model successful");
							res.json({success: 1, created: 1});
						}
					});
				}
			});
			cnn.release();
		});
	}
});

module.exports = router;
