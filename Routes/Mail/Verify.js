// Type for insert verification
// 1 - registration
// 2 - forgot password
// 3 - review

var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var bcrypt = require('bcryptjs');
const saltRounds = 10;
router.baseURL = '/Verify';

// Test
router.get('/', function(req, res) {
  res.status(200).json({success:1, reponse: 'exists'});
});

// Activate account of technician after creating
// Need email and hash in link
// type 1
router.get('/confirmEmail', function(req, res) {
  console.log('Verify email for registration');

  if (!req.query.hasOwnProperty('email') || !req.query.hasOwnProperty('hash'))
    res.status(400).json({error: 'Link doesn\'t exist'});
  else {
    let email = req.query.email;
    let hash = req.query.hash;
    let check_query =
      ' SELECT 1 FROM EmailVerification WHERE hash=? AND email=? AND type=1';
    let enable_query = ' UPDATE Technicians SET status=1 ' +
                       ' WHERE log_id=(SELECT id_log FROM Logins WHERE email=? LIMIT 1) ';
    let delete_hash_query = ' DELETE FROM EmailVerification where hash=? ';

    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) { // check hash
          cnn.query(check_query, [hash, email], callback);
        },
        function(result, fields, callback) { // update tech
          if (result.length > 0)
            cnn.query(enable_query, email, callback);
          else
            callback({success: 0, response: 'Link doens\'t exist'});
        },
        function(result, fields, callback) { // delete hash
          cnn.query(delete_hash_query, hash, callback);
        }
        ], function(err, result) {
          if (err) {
            console.log('Can\'t verify');
            res.redirect('/#/404Page')
          } else {
            res.redirect(`/#/emailSuccess?email=${email}&hash=${hash}`);
          }
      });
      cnn.release();
    });
  }
});

// Verify link for reset password
// type 2
router.get('/resetPassword', function(req, res) {
  console.log('In verify reset password');
  if (!req.query.hasOwnProperty('email') || !req.query.hasOwnProperty('hash'))
    res.status(400).json({error: 'Link doesn\'t exist'});
  else {
    let email = req.query.email;
    let hash = req.query.hash;

    let check_hash_query = ' SELECT 1 FROM EmailVerification WHERE hash=? AND email=? AND type=2';

    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) {
          cnn.query(check_hash_query, [hash, email], callback);
        },
        function(result, fields, callback) {
          if (result.length > 0)
            callback(null, result, null);
          else
            callback({success: 0, response: 'Link doesn\'t exist'})
        }
      ], function(err, result) {
        if (err) {
          console.log(err);
          res.redirect('/#/404Page')
        } else {
          res.redirect(`/#/register/forgotPassword?email=${email}&hash=${hash}`);
        }
      });
    });
  }
});

// reset password of user
// type 2
router.put('/resetPassword', function(req, res) {
  let vld = req.validator;
  let body = req.body;
  let check_hash_query = ' SELECT 1 FROM EmailVerification WHERE hash=? AND email=? AND type=2';
  let updatePassword = ' UPDATE Logins SET passwordHash=? WHERE email=? ';
  let delete_hash_query = ' DELETE FROM EmailVerification where hash=? ';

  if (vld.hasFields(body, ['email', 'newPassword', 'hash'])) {
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) { // check hash verify
          cnn.query(check_hash_query, [body.hash, body.email], callback);
        },
        function(result, fields, callback) { // generate salt
          if (result.length > 0)
            bcrypt.genSalt(saltRounds, callback);
          else
            callback({success: 0, response: 'Link does\'t exist'});
        },
        function(salt, callback){ // generate passwordHash
          bcrypt.hash(body.newPassword, salt, callback);
        },
        function(passwordHash, callback) { // update password
          cnn.query(updatePassword, [passwordHash, body.email], callback);
        },
        function(result, fields, callback) { // delete hash verify
          cnn.query(delete_hash_query, [body.hash], callback);
        }
      ], function(err, result) {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          console.log('Successfuly reset password');
          res.status(200).json({success: 1, reponse: 'Successfuly reset password'});
        }
      });
    });
  }
});

// Review service
// Need serHisId and has
// Need to test with other query for larger dataset
// type 3
router.get('/review', function(req, res) {
  let check_hash_query =
    ' SELECT 1 FROM EmailVerification WHERE hash=? AND email=? AND type=3';
  let get_info_for_review_query =
    ' SELECT FINALCUS.*, CUS.email AS customer ' +
    ' FROM (SELECT SHSOMIMC1.*, MAN.manufacturer, CAT.category ' +
    '       FROM (SELECT SHSOMI2.*, CM.man_id, CM.cat_id ' +
    '             FROM (SELECT SHSOMI1.*, M.model, I.issue '+
    '                   FROM (SELECT SHSO.*, MI.mod_id, MI.iss_id '+
    '                         FROM (SELECT SH.*, SO.modIss_id, SO.catMan_id, SO.servType, SO.tec_id ' +
    '                               FROM (SELECT id_serHis, serTec_id, cus_id, description, '+
    '                                       amount AS finalAmount, status AS SHStatus, ' +
    '                                       orderedDate, completedDate, isReview '+
    '                                     FROM ServicesHistory ' +
    '                                     WHERE id_serHis=? ' +
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

  if (!req.query.hasOwnProperty('email') || !req.query.hasOwnProperty('hash')
    || !req.query.hasOwnProperty('serHisId'))
    res.status(400).json({error: 'Link doesn\'t exist'});
  else {
    let serHisId = req.query.serHisId;
    let email = req.query.email;
    let hash = req.query.hash;
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) { // check hash
          cnn.query(check_hash_query, [hash, email], callback);
        },
        function(result, fields, callback) {
          if (result.length > 0)
            cnn.query(get_info_for_review_query, serHisId, callback);
          else
            callback({success: 0, reponse: 'Link doesn\'t exists'});
        }
      ], function(err, result) {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          result[0].success = 1;
          result[0].hash = hash;
          res.status(200).json(result[0]);
        }
      });
      cnn.release();
    });
  }
});

module.exports = router;
