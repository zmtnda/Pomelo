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

	if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newCategory'])) {
		connections.getConnection(res, function(cnn) {
         cnn.query(' SELECT count(*) FROM Categories WHERE category = ?', body.newCategory,
            function(err, result) {
               if(result.length == 0) {
                  cnn.query(' INSERT INTO catergoies (category) values (?) ', body.newCategory,
         			function(err, result){
         				if(err) {
         					console.log("error create new category");
         					res.status(400).json(err);
         				} else {
         					console.log("create new category successful");
                  res.end();
         				}
         			});
               } else {
                  console.log("Error check for existing cate, or cate already exist");
   					res.status(400).json(err);
               }
            })
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

	connections.getConnection(res, function(cnn) {
		cnn.query(' SELECT m.id_man, m.manufacturer FROM manufacturers m, categoriesmanufacturers c ' +
					 ' WHERE c.man_id = m.id_man AND c.cat_id = ?', catId,
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

// Get all models for a specific category and manufactures
// Require categoryId and manufactureId
// No need Authorization for this
router.get('/:catId/:manId/model', function(req, res) {
	console.log("get models");
	var vld = req.validator;
	var catId = req.params.catId;
   var manId = req.params.manId;

	connections.getConnection(res, function(cnn) {
		cnn.query(' SELECT id_catMan AS id_model, model FROM categoriesmanufacturers ' +
					 ' WHERE cat_id = ? AND man_id = ? ', [catId, manId],
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

// Get all issues based on category
// Require categoryId
// No need Authorization for this
router.get('/:catId/issues', function(req, res) {
		console.log("get issues based on category");
		var vld = req.validator;
		var catId = req.params.catId;

		connections.getConnection(res, function(cnn) {
			cnn.query('SELECT id_catIss, issue from categoriesIssues WHERE cat_id = ?', catId,
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
// Rquired catId, newIssue
// Require Admin Authorization to access this
// Check if the issue already exist first
// Yes -> fail to add. No -> add new issue
router.post('/:catId/issues', function(req, res) {
   console.log('Add new issue');
   var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
   var body = req.body;
   var catId = req.params.catId

   if(vld.check(admin, Tags.noPermission) && vld.hasFields(body, ['newIssue'])) {
      connections.getConnection(res, function(cnn) {
         cnn.query(' SELECT count(*) FROM CategoriesIssues WHERE ' +
                   ' cat_id = ? AND issue = ?', [catId, newIssue],
            function(err, result) {
               if(result.length == 0) {
                  cnn.query(' INSERT INTO CategoriesIssues (cat_id, issue) ' +
                            ' VALUES (?,?)',[cat_id, newIssue],
                     function(err, result) {
                        if(err) {
                           console.log("error create new issue");
            					res.status(400).json(err);
                        } else {
                           console.log("create new issue successful");
                           res.end();
                        }
                  });
               } else {
                  console.log("Error checking exsiting issue or issue already exist");
                  res.status(400).json(err);
               }
         	});
         cnn.release();
      });
   }
});

module.exports = router;
