var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var nodemailer = require('nodemailer');
router.baseURL = '/Send';

router.get("/", function(req, res) {
   console.log(req.get('host'));
   var link = 'http://'+ req.get('host')+ '/Verify/account/';
   res.status(200).end('<a href="' + link + '">' + link + '</a>');
});

// Send email for account verification
// Need email and passwordHash of customer
router.post("/account", function(req, res) {
   console.log("Send email for acc verification");
   var vld = req.validator;
   var body = req.body;
   var check_query =
      ' SELECT * ' +
      ' FROM (SELECT email, passwordHash, id_log ' +
	   '       FROM Logins ' +
	   '       WHERE email=? AND passwordHash=?) L ' +
      ' INNER JOIN Technicians T ' +
      ' ON L.id_log = T.log_id';

   var link = 'http://'+ req.get('host')+ '/Verify/account/';
   var title = '[Pomelo] Please verify your email address.';

   if(vld.hasFields(body, ['email', 'passwordHash'])) {
      connections.getConnection(res, function(cnn) {
         cnn.query(check_query, [body.email, body.passwordHash],
         function(err, result) {
            if(err) {
               console.log("Error checking before email verify acc");
               res.status(400).json(err);
            } else if (result.length == 0 ) {
               console.log("No row satisfy - No mail send");
               res.json({success: 0});
            } else if (result.length > 0 && result[0].status == 1) {
               console.log("Already Activated! - No mail send");
               res.json({success: 1, sent: 0});
            } else { //send mail here
               console.log("Sending email for acc verification");
               link = link + body.email + '/' + body.passwordHash;
               var content = '<b>Please verify your account</b><br>' +
                      '<a href='+ link + '>' + link + '</a>';
               mail(res, body.email, title, content);
            }
         });
         cnn.release();
      });
   }
});

// Send mail for review when technician change status to completedDate
// Need serHisId, and serHisHash
router.post("/review", function(req, res) {
   console.log("Email for review technician");
   var vld = req.validator;
   var body = req.body;
   var check_query =
      ' SELECT SH.id_serHis, SH.serHisHash, SH.isReview, C.email ' +
      ' FROM (SELECT id_serHis, serHisHash, isReview, cus_id ' +
      '       FROM ServicesHistory ' +
      '       WHERE id_serHis=? AND serHisHash=? ) SH' +
      ' INNER JOIN Customers C'
      ' ON SH.cus_id=C.id_cus ';

   var link = 'http://'+ req.get('host')+ '/Verify/review/';
   var title = '[Pomelo] Please review your service.';

   if(vld.hasFields(body, ['serHisId', 'serHisHash'])) {
      connections.getConnection(res, function(cnn) {
         cnn.query(check_query, [body.serHisId, body.serHisHash],
         function(err, result) {
            if(err) {
               console.log("Error check review for send mail");
               res.status(400).json(err);
            } else if (result.length == 0) {
               console.log("No satisfy row");
               res.json({success: 0});
            } else if (result[0].isReview == 1) {
               console.log("Already review");
               res.json({success: 1, sent: 0})
            } else {
               console.log("Sending email for review");
               link = link + body.serHisId + '/' + body.serHisHash;
               var content = '<b>Please Review the service</b><br>' +
                      '<a href='+ link + '>' + link + '</a>';
               mail(res, result[0].email, title, content);
            }
         });
         cnn.release();
      })
   }
});

// Send mail function
// Need reciever, title and body of email
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
      to: 'nnguy101@gmail.com', // change to reciever later
      subject: title, // Subject line
      html: body// html body
   };

   // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).json(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      console.log('Accepted: ' + info.accepted);
      console.log('Rejected: ' + info.rejected);
      console.log('Pending: ' + info.pending);
      res.json({success: 1, sent: 1})
   });
}

module.exports = router;
