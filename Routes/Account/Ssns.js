var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var bcrypt = require('bcryptjs');
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
  console.log('POST Ssns/');
  console.log(req.body.email);
  console.log(req.body.password);
  connections.getConnection(res, function(cnn) {
    cnn.query('SELECT * FROM (SELECT * FROM Logins WHERE email = ?) l LEFT JOIN ' +
              'Technicians t ON l.id_log = t.log_id AND status <> 0 ', req.body.email, function(err, result) {
      if(err){
         res.status(400).json(err);
      }
      else if (req.validator.check(result.length && bcrypt.compareSync(req.body.password, result[0].passwordHash), Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result[0], res);
         console.log("same pass");
         console.log(result[0]);
         res.location(router.baseURL + '/'  + cookie).send(result[0]);
      }
      cnn.release();
    });
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
