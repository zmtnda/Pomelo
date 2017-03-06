var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Verify';

router.get("/:email/:hash", function(req, res) {
   console.log("Verify email for registration");

   var email = req.params.email;
   var hash = req.params.hash;
   var check_query = " SELECT L.id_log, T.active " +
                     " FROM Logins JOIN technician " +
                     " WHERE L.email=? AND L.passwordSalt=? AND L.id_log=T.log_id";
   var enable_query = " UPDATE technician SET status=1 WHERE log_id=? ";

   connections.getConnection(res, function(cnn) {
      cnn.query(query, [email, hash], function(err, result) {
         if(err || result.length == 0) {
            console.log("Error checking account");
            res.status(400).json(err);
         } else if (result[0].active == 1) {
            console.log("Account already activated");
            res.end();
         } else {
            cnn.query(enable_query, result[0].id_log, function(err, result) {
               if(err) {
                  console.log("Error activate account");
                  res.status(400).json(err);
               } else {
                  console.log("Successful activate account")
                  res.end();
               }
            })
         }
      });
      cnn.release();
   });
});

module.exports = router;
