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
        res.json(result[0]);
      }
    });
    cnn.release();
  })
});

// Post a review
// Require stars, comment, serHisId, cusId, tecId
// Check if serHisId and serTec EXISTS
// Insert into review table
// Update ratings for technician
router.post("/", function(req, res) {
  let vld = req.validator;
  var body = req.body;
  let check_hash_query =
    ' SELECT 1 FROM EmailVerification WHERE hash=? AND email=? AND type=3';
  let check_serHis_query =
    ' SELECT SH.serTec_id FROM ' +
    ' (SELECT serTec_id FROM ServicesHistory WHERE id_serHis=? AND cus_id=? AND isReview=0) SH ' +
    ' INNER JOIN ServicesOfferedByTech SO ' +
    ' ON SO.id_serTec = SH.serTec_id AND SO.tec_id=?';
  let post_review_query =
    ' INSERT INTO Reviews (stars, comment, serHis_id, cus_id, tec_id) VALUES ' +
    ' (?,?,?,?,?) ';
  let update_ratings_query =
    ' UPDATE Technicians SET ratings = (SELECT CAST(SUM(stars)/COUNT(1) AS DECIMAL(5,4)) ' +
    '                                   FROM Reviews WHERE tec_id=?)' +
    ' WHERE id_tec=? ';
  let delete_hash_query = ' DELETE FROM EmailVerification where hash=? ';

  if(vld.hasFields(body, ['email', 'hash', 'stars', 'comment', 'serHisId', 'cusId', 'tecId'])) {
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) { // check hash verify
          cnn.query(check_hash_query, [body.hash, body.email], callback);
        },
        function(result, fields, callback) { // check serhis exists
          if (result.length > 0)
            cnn.query(check_serHis_query, [body.serHisId, body.cusId, body.tecId], callback);
          else
            callback({success: 0, response: 'Hash doens\'t match'});
        },
        function(result, fields, callback) { //post reviews
          if(result.length > 0)
            cnn.query(post_review_query, [body.stars, body.comment, body.serHisId,
                body.cusId, body.tecId], callback);
          else
            callback({success: 0, response: 'No serHis found or already reviewed'}, '');
        },
        function(result, fields, callback) { // calculate start for tec
          body.revId = result.insertId;
          cnn.query(update_ratings_query, [body.tecId, body.tecId], callback);
        },
        function(result, fields, callback) { // delete hash verify
          cnn.query(delete_hash_query, [body.hash], callback);
        }
      ], function(err, result) {
        if(err) {
          console.log("Error posting review");
          res.status(400).json(err)
        } else {
          res.json({success: 1, revId: body.revId});
        }
      });
      cnn.release();
    });
  }
})

// Get all reviews for specific technician
router.get("/technician/:tecId", function(req, res) {
  var tecId = req.params.tecId;
  var check_tec_query = ' SELECT id_tec FROM Technicians WHERE id_tec=? AND status=1';
  var get_review_query =
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
    ' FROM (SELECT * FROM Reviews WHERE tec_id=?) R' +
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
        cnn.query(check_tec_query, tecId, callback);
      },
      function(result, fields, callback) {
        if(result.length == 0) {
           callback({success: 0, response: 'No tech satisfy'}, '');
        } else {
           cnn.query(get_review_query, tecId, callback);
        }
      }
    ], function(err, result) {
      if(err) {
        console.log("Error getting review for tech");
        res.status(400).json(err)
      } else {
        res.json(result)
      }
    });
  });
});

// Calculate stars for specific technician
// NO NEED THIS SINCE UPDATE RATINGS IN POST
router.get("/calculate/:tecId", function(req, res) {
  var tecId = req.params.tecId;
  var check_tec_query = ' SELECT id_tec FROM Technicians WHERE id_tec=? AND status=1';
  var get_star_query = ' SELECT IFNULL(SUM(stars)/COUNT(1), 0) AS stars FROM Reviews WHERE tec_id=?';
  connections.getConnection(res, function(cnn) {
    async.waterfall([
      function(callback) {
        cnn.query(check_tec_query, tecId, callback);
      },
      function(result, fields, callback) {
        if(result.length == 0) {
           callback({success: 0, response: 'No tech satisfy'}, '');
        } else {
           cnn.query(get_star_query, tecId, callback);
        }
      }
    ], function(err, result) {
      if(err) {
        console.log("Error getting review for tech");
        res.status(400).json(err)
      } else {
        res.json(result[0])
      }
    });
  });
});

module.exports = router;
