var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var bcrypt = require('bcryptjs');
var async = require('async');
const saltRounds = 10;

router.baseURL = '/Ssns';

// Begin '/Ssns/' functions

// Returns a list of all active sessions. Admin-privileged AU required.
// Returns array of
//             cookie - Unique cookie value for session
//             usrId  - ID of User logged in
router.get('/', function(req, res) {
   var body = [], ssn;
   console.log("In get / ssns");
   if (req.validator.checkAdmin()) {
      for (cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         console.log("Session: " + cookie + ' -> ' + ssn);
         body.push({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
      };
      res.status(200).json(body);
   }
	else
		console.log("I am not Admin");
});

// A successful POST generates a browser-session cookie that will permit continued access for 2 hours.
// Indicated User becomes the AU.
// An unsuccessful POST results in a 400/No Permission error code, with no further information.
//
// Fields {
//          email    : Email of user requesting login
//          password : Password of user
//       }
router.post('/', function(req, res) {
  var cookie;
  var body = {};
  console.log('POST Ssns/');
  console.log(req.body.email);
  console.log(req.body.password);
  var selectQry = ' SELECT * FROM '
                + ' (SELECT * FROM Logins WHERE email = ?) l '
                + ' LEFT JOIN Technicians t ON l.id_log = t.log_id '
  connections.getConnection(res, function(cnn) {
    async.waterfall([
      function (callback) {
        cnn.query(selectQry, req.body.email, callback);
      },
      function (result, fields, callback) {
        if (req.validator.check(result.length && bcrypt.compareSync(req.body.password, result[0].passwordHash), Tags.badLogin)) {
           if(result[0].role == 2 || (result[0].role == 1 && result[0].status == 1)) {
             delete result[0].passwordHash;
             console.log("same pass");
             console.log(result[0]);
             body.techInfo = result[0];
             callback(null, result[0].panelAlbum_id);
           } else if (result[0].role == 1 && result[0].status == 0) {
             callback({success: 0, response: 'Need to verify your email'});
           } else {
             callback({success: 0, response: 'Account is disabled'});
           }
        }
      },
      function (panelAlbum_id, callback) {
        cnn.query("SELECT * FROM Photos WHERE alb_id = ?", panelAlbum_id, callback);
      }
    ], function (err, result) {
      if(err){
         res.status(400).json(err);
      } else {
        body.techInfo.panelAlbum = result;
        cookie = ssnUtil.makeSession(body.techInfo, res);
        res.location(router.baseURL + '/'  + cookie).send(body.techInfo);
      }
      // else if (req.validator.check(result.length && bcrypt.compareSync(req.body.password, result[0].passwordHash), Tags.badLogin)) {
      //    if(result[0].role == 2 || (result[0].role == 1 && result[0].status == 1)) {
      //      cookie = ssnUtil.makeSession(result[0], res);
      //      delete result[0].passwordHash;
      //      console.log("same pass");
      //      console.log(result[0]);
      //      res.location(router.baseURL + '/'  + cookie).send(result[0]);
      //    } else if (result[0].role == 1 && result[0].status == 0) {
      //      res.status(400).json({success: 0, response: 'Need to verify your email'});
      //    } else {
      //      res.status(400).json({success: 0, response: 'Account is disabled'});
      //    }
      // }
    });
    cnn.release();
    // cnn.query(selectQry, req.body.email, function(err, result) {
    //   if(err){
    //      res.status(400).json(err);
    //   }
    //   else if (req.validator.check(result.length && bcrypt.compareSync(req.body.password, result[0].passwordHash), Tags.badLogin)) {
    //      if(result[0].role == 2 || (result[0].role == 1 && result[0].status == 1)) {
    //        cookie = ssnUtil.makeSession(result[0], res);
    //        delete result[0].passwordHash;
    //        console.log("same pass");
    //        console.log(result[0]);
    //        res.location(router.baseURL + '/'  + cookie).send(result[0]);
    //      } else if (result[0].role == 1 && result[0].status == 0) {
    //        res.status(400).json({success: 0, response: 'Need to verify your email'});
    //      } else {
    //        res.status(400).json({success: 0, response: 'Account is disabled'});
    //      }
    //   }
    //   cnn.release();
    // });
  });
});

// Begin 'Ssns/:cookie' functions

// Log out the specified Ssn.
//
// AU must be owner of Ssn or admin.
router.delete('/:cookie', function(req, res, next) {
   if (req.validator.check(req.params.cookie === req.cookies[ssnUtil.cookieName]
    || req.session.isAdmin(), Tags.noPermission)) {
       ssnUtil.deleteSession(req.params.cookie);
       res.sendStatus(200);
   }
});

// Returns usrId that corresponds to the provided (valid) cookie
//
// Note that this function is not specified in the project API Interface but is
// kept since it seems like it could be a handy utility
router.get('/:cookie', function(req, res, next) {
   var cookie = req.params.cookie;
   var vld = req.validator;
   if (vld.checkPrsOK(ssnUtil.sessions[cookie].id)) {
      res.json({prsId: req.session.id});
   }
})

module.exports = router;
