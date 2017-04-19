// Type for insert verification
// 1 - registration
// 2 - forgot password
// 3 - review

var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var nodemailer = require('nodemailer');
var emailCheck = require('email-check');
var crypto = require('crypto');
router.baseURL = '/Send';

function getHash() {
  return crypto.randomBytes(50).toString('hex');
}

router.get('/', function(req, res) {
  console.log(req.get('host'));
  var link = 'http://'+ req.get('host')+ '/Verify/account/';
  var hash = crypto.randomBytes(50).toString('hex');
  res.status(200).json({hash: hash, length: hash.length});
});

// Send email for account verification
// Need email and passwordHash of customer
router.post('/confirmEmail', function(req, res) {
  console.log('Send email for acc verification');
  let vld = req.validator;
  var body = req.body;
  let insert_verification_query = ' INSERT INTO EmailVerification VALUES (?,?,1,NOW()) ';
  let check_email_query =
    ' SELECT L.email, T.status FROM Logins L INNER JOIN Technicians T ON L.id_log = T.log_id AND L.email = ?';

  let title = '[Pomelo] Please verify your email address.';
  var link = 'http://' + req.get('host') + '/Verify/confirmEmail?';
  let hash = getHash();

  if(vld.hasFields(body, ['email'])) {
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) { //check if email exists
          cnn.query(check_email_query, body.email, callback);
        },
        function(result, fields, callback) {
          console.log(`In check email - ${JSON.stringify(result)}`);
          if (result.length > 0 && result[0].status == 0) //insert hash
            cnn.query(insert_verification_query, [hash, body.email], callback);
          else if (result.length > 0 && result[0].status != 0)
            callback({success: 0, response: `Email ${body.email} already activated.`}, null);
          else
            callback({success: 0, response: `Email ${body.email} doesn't exists.`}, null);
        }
      ], function(error, result) {
        if (error) {
          console.log(`Error sending mail for ${body.email}`);
          res.status(400).json(error);
        } else {
          console.log('Sending email for acc verification');
          link = link + `email=${body.email}&hash=${hash}`;
          var content = `<b>Please verify your account</b><br><a href=${link}>${link}</a>`;
          mail(res, body.email, title, content);
        }
      });
      cnn.release();
  });
 }
});

// Forgot password, send link to reset password
// Need email of technician
router.post('/resetPassword', function(req, res) {
  console.log('Sending email for resetting password');
  let vld = req.validator;
  var body = req.body;
  let insert_verification_query = ' INSERT INTO EmailVerification VALUES (?,?,2,NOW()) ';
  let check_email_query = ' SELECT 1 FROM Logins WHERE email=? ';

  let title = '[Pomelo] Reset Your Password.';
  var link = 'http://'+ req.get('host')+ '/Verify/resetPassword?';
  let hash = getHash();

  if(vld.hasFields(body, ['email'])) {
    connections.getConnection(res, function(cnn) {
      async.waterfall([
        function(callback) {
          cnn.query(check_email_query, [body.email], callback);
        },
        function(result, fields, callback) {
          if (result.length > 0)
            cnn.query(insert_verification_query, [hash, body.email], callback);
          else
            callback({success: 0, response: 'Email doesn\'t exist.'});
        }
      ], function(err, result) {
        if (err) {
          console.log(err);
          res.status(200).json(err);
        } else {
          console.log('Sending email for reset password');
          link = link + `email=${body.email}&hash=${hash}`;
          var content = `<b>Please click link to reset your password</b><br><a href=${link}>${link}</a>`;
          mail(res, body.email, title, content);
        }
      });
    });
  }
});

// Send mail for review when technician change status to completedDate
// Need serHisId
// Need technician permisson, need tec_id later to check for match
router.post('/review', function(req, res) {
  console.log('Email for review technician');
  let vld = req.validator;
  var body = req.body;
  let check_query =
    ' SELECT SH.id_serHis, SH.isReview, C.email ' +
    ' FROM (SELECT id_serHis, isReview, cus_id ' +
    '       FROM ServicesHistory ' +
    '       WHERE id_serHis=?) SH' +
    ' INNER JOIN Customers C' +
    ' ON SH.cus_id=C.id_cus ';
  let insert_verification_query = ' INSERT INTO EmailVerification VALUES (?,?,3,NOW()) ';

  var link = 'http://'+ req.get('host')+ '/Verify/review?';
  let title = '[Pomelo] Please review your service.';
  let hash = getHash();

   if(vld.hasFields(body, ['serHisId'])) {
     connections.getConnection(res, function(cnn) {
       async.waterfall([
         function(callback) { // check for exists ServicesHistory
           cnn.query(check_query, [body.serHisId], callback);
         },
         function(result, fields, callback) {
           console.log(result);
           if (result.length > 0 && result[0].isReview == 0) {// exists
             body.email = result[0].email
             cnn.query(insert_verification_query, [hash, body.email], callback);
           }
           else if (result.length > 0 && result[0].isReview != 0) // is reviewed
             callback({success: 0, response: 'Service already reviewed'})
           else
             callback({success: 0, response: `No service found with id ${body.serHisId}`})
         }
       ], function(err, result) {
         if (err) {
           console.log(err);
           res.status(400).json(err);
         } else {
           console.log('Sending email for review');
           link = link + `email=${body.email}&serHisId=${body.serHisId}&hash=${hash}`;
           var content = `<b>Please Review the service</b><br><a href=${link}>${link}</a>`;
            mail(res, body.email , title, content);
         }
       });
         cnn.release();
      })
   }
});

// Send mail function
// Need receiver, title and body of email
// Need to set mail to noreply@pomelo.com later
function mail(res, receiver, title, body) {
   // create reusable transporter object using the default SMTP transport
   var transporter = nodemailer.createTransport({
       service: 'Gmail',
       auth: {
           user: 'noreply.nnguy101@gmail.com',
           pass: 'noreplypassword'
       }
   });

   // setup email data with unicode symbols
   var mailOptions = {
      from: '"Pomelo 👻" <noreply.nnguy101@gmail.com>', // sender address
      to: receiver, // change to receiver later
      subject: title, // Subject line
      html: body// html body
   };

   // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).json(error);
      }
//      console.log('Message %s sent: %s', info.messageId, info.response);
//      console.log('Accepted: ' + info.accepted);
//      console.log('Rejected: ' + info.rejected);
//      console.log('Pending: ' + info.pending);
      res.json({success: 1, sent: 1})
   });
}

module.exports = router;
