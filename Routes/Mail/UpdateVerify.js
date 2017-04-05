var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var bcrypt = require('bcryptjs');
var async = require('async');
router.baseURL = '/UpdateVerify';
const saltRounds = 10;

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
            callback({success: 0, response: 'Hash doesn\'t match'});
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

module.exports = router;
