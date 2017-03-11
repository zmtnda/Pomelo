var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var cnnPool = require('./Routes/Connections.js');

var async = require('async');

var app = express();

// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

// Parse all request bodies using JSON
app.use(bodyParser.json());

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

app.use(function(req, res, next) {
   req.validator = new Validator(req, res);
	next();
/* console.log("main.js" + req.method + " " + req.path);
   if ((req.method === 'POST' &&
    (req.path === '/User' || req.path === '/Ssns')))
	 {
      console.log("yes main.js");

		next();
	 }
   else
	{
      console.log("no main.js");

		res.status(401).json([{tag: Validator.Tags.noLogin}]);
	} */

});

app.use('/User', require('./Routes/Account/User'));
app.use('/Ssns', require('./Routes/Account/Ssns'));
app.use('/Serv', require('./Routes/Service/Serv'));
app.use('/Cate', require('./Routes/Service/Cate'));
app.use('/Receipt', require('./Routes/Transaction/Receipt'));
app.use('/Verify', require('./Routes/Mail/Verify'));
app.use('/Send', require('./Routes/Mail/Send'));
app.use('/Review', require('./Routes/Review/Review'));

// Clear all content from the database,
// reset all autoincrement IDs to 1,
// and add back one User,
// an admin named Admin IAM with email admin@11.com and password "password".
// Clear all current sessions. AU must be an admin.
app.delete('/DB', function(req, res) {

   cnnPool.getConnection(res, function(cnn) {
      async.series([
         function(callback){
            cnn.query('delete from Users', callback);
         },
         function(callback){
            cnn.query('delete from Services', callback);
         },
         function(callback){
            cnn.query('delete from serviceHistory', callback);
         },
         function(callback){
            cnn.query('alter table Users auto_increment = 1', callback);
         },
         function(callback){
            cnn.query('alter table Services auto_increment = 1', callback);
         },
         function(callback){
            cnn.query('alter table serviceHistory auto_increment = 1', callback);
         },
         function(callback){
            cnn.query(' INSERT INTO Users (id, email, password, role, firstName, '
				+ ' lastName, phone, whenRegistered) '
				+ ' VALUES (1, "Admin@11.com", "password", 2, '
				+ ' "Admin", "IAM", 123456789, NOW());'
            , callback);
         },
         function(callback){
            for (var session in Session.sessions)
               delete Session.sessions[session];
            res.send();
         }
      ],
      function(err, status) {
         console.log(err);
      }
   );
   cnn.release();
   });
});

/* Testing Material */
app.get('/test', function(req, res) {
   console.log("In test route");
   res.status(200).end();
});

var sbCounter = 0;

app.get('/slowboat', function(req, res, next) {
   console.log("In slowboat route");
   setTimeout(function(){
      console.log("Slowboat hit done");
      res.status(200).json(sbCounter++);
   }, 5000);
   console.log("Done with route");
});

// Messing around with a simple route and with mysql
app.get('/data', function (req, res, next) {
   cnnPool.getConnection(res, function(cnn) {
      cnn.query('Select * from User', function (err, data) {
         //cnn.release();
         res.status(200).json(data);
      });
   });
   console.log('Done setting up /data query');
});

app.use(function(err, req, res, next) {
   console.error(err.stack);
   res.status(500).send('error', {error: err});
});

app.listen(process.env.NODE_PORT || 3000, process.env.NODE_IP || 'localhost',
function () {
   console.log('App Listening on port 3000');
});
