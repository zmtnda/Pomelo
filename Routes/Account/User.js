var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
router.baseURL = '/User';

var formatDate = ', DATE_FORMAT(whenCompleted, \'\%b \%d \%Y \%h\:\%i \%p\') as formatDate';
var bcrypt = require('bcryptjs');
const saltRounds = 10;

router.get('/serviceHistory/all', function(req, res) {
   var vld = req.validator;
   var qry;
   var admin = req.session || req.session.isAdmin();
   var qryParams;

   //console.log(req.query.permission + JSON.stringify(req.session));
   if(vld.check(admin, Tags.noPermission)) {
      connections.getConnection(res, function(cnn) {
         qry = 'SELECT x.*, y.*, z.serviceName, v.status, v.amount ' + formatDate +
			' FROM serviceHistory x JOIN Users y JOIN Services z JOIN ServicesOffer v WHERE x.userId = ? ' +
			' AND x.technicianId = y.id AND x.serviceID = z.id AND x.serviceID = v.serviceID AND x.technicianId = v.technicianId ';

         qryParams = req.session.id;
         cnn.query(qry, qryParams, function(err, response) {
            if (err) {
               console.log(err);
            }
            res.json(response);
         });
         cnn.release();
      });
   }
});

// Begin '/User/' functions

// GET email=<email or email prefix>
// Return a single user whose email matches the provided one as a resource URL.
//
// Authorization is only granted to users with admin status.
// Not Found error will be returned should there be no user with the specified email.
//
// email - principal string identifier, unique across all Users
// id - id of user with said email, so that URI would be User/<id>
router.get('/', function(req, res) {
   var specifier = req.query.email || !req.session.isAdmin() && req.session.email;
   var getAllBasedOnEmail = req.query.all;
   connections.getConnection(res, function(cnn) {
      var handler = function(err, prsArr) {
         res.json(prsArr[0]); // array notation to grab first person.
         cnn.release();
      }
      var allHandler = function(err, prsArr) {
         res.json(prsArr);
         cnn.release();
      }

      if(req.query.soFull)
      {
        cnn.query('SELECT * FROM logins l left join technicians t '
                  + 'on l.id_log = t.log_id order by l.id_log', function(err, prsArr){
         console.log(JSON.stringify(prsArr));
          res.json(prsArr); // array notation to grab first person.
          cnn.release();

        });
      }
      else if(getAllBasedOnEmail)
      {
         cnn.query("SELECT * FROM logins l left join technicians t on " +
               "l.id_log = t.log_id and email = ?", [specifier], allHandler);
      }
      else if (specifier)
      {
         cnn.query('SELECT id_log, email FROM logins WHERE email = ?', [specifier], handler);
      }
      else
         cnn.query('SELECT id_log, email FROM logins', handler);
   });
});

// Adds a new User, returning the location of the newly added User.
// No AU required.
//    email - unique Email for new User
//    firstName
//    lastName
//    password
//    phone (optional)
//    role 0 for consumer, 1 for technician, 2 for admin
//    WhenRegistered When was the user first registered
router.post('/', function(req, res) {
	console.log("POST Users/");
   var vld = req.validator;  // Shorthands
   var body = req.body;
   /* var admin = req.session && req.session.isAdmin(); */
var admin = req.session;
	 if (admin && !body.password)
	//if (!body.password)

      body.password = "*";                       // Blockig password
   body.whenRegistered = new Date();

   if(vld.hasFields(body, ['email', 'firstName', 'lastName', 'password', 'role']) // this checks for key existance
      && vld.chain(body["email"], Tags.missingField) // this checks for value existance
      .chain(body["firstName"], Tags.missingField)
      .chain(body["lastName"], Tags.missingField)
      .chain(body["password"], Tags.missingField)
      .check(body.role >= 0 && body.role <=2, Tags.badValue, ["role"])) {
         connections.getConnection(res, function(cnn) {
            body.password = bcrypt.hashSync(body.password, saltRounds); // Hash passwords using Bcrypt.
            cnn.query('INSERT INTO Users SET ?', body, function(err, result) {
               if(err) {
                  res.status(400).json(err);
               } else {
                  res.location(router.baseURL + '/' + result.insertId).end();
               }
            });
            cnn.release();
         });
   }
});

// Begin '/User/:id' functions

// Returns object for User <usrId>, with all fields.
//
// AU must be User in question or admin.
// NotFound return if usrId does not exist
router.get('/:id', function(req, res) {
   var vld = req.validator;
   //check valid user
   if (vld.checkPrsOK(req.params.id)) {
      connections.getConnection(res, function(cnn) {
         cnn.query('SELECT * FROM Users WHERE id = ?', req.params.id, function(err, result) {
            if(err) {
					console.log("Error in router.get(/:id)");
               res.status(400).json(err); // ends response
            } else if (vld.check(result.length, Tags.notFound)) {
					console.log("router.get(/:id) success");
               res.json(result[0]); // ends response
            }
         });
         cnn.release();
      });
   }
});

// Update User <usrId>, with body giving an object with one or more of the specified fields.
//
// AU must be the User in question, or an admin.
// Note: Role changes require an admin.
//
// Errors if there is old password is not provide when changing the password
router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session && req.session.isAdmin();

  // console.log("CHANING INFO " + JS);
   if(vld.checkPrsOK(req.params.id) && vld.chain(!body.role || admin, Tags.noPermission))
   { // check to see if the user is trying to change the password
     console.log(JSON.stringify(body));
          connections.getConnection(res, function(cnn) { // Done with if conditional
              if(body.password) {
                  body.password = bcrypt.hashSync(body.password, saltRounds);
              }
           cnn.query("update Users set ? where id = ?", [req.body, req.params.id],
           function(err) {
              if(err)
              {
                console.log(err);
                 res.status(400).end();
              }
              else {
                 res.end();
              }
           });
           cnn.release();
        });
    }
});


// Delete the User in question, closed all services associated with either user or technician
//(Not deleting it but modifying the services and order)
// services status set to
// Requires admin AU/User in question. (Zin)
router.delete('/:id', function(req, res) {
   var vld = req.validator;
	var usrId = req.params.id;

   if(vld.checkPrsOK(usrId)) {
      connections.getConnection(res, function(cnn) {
         cnn.query(' DELETE FROM Users WHERE id = ? ', usrId,
			function(err) {
					if(err) {
						res.status(400).json(err); // closes response
					}
					else{
						console.log("user was deleted from User table trigger by /User/:id");
						//update tables for future consistency if have time
						res.end();
					}
				cnn.release();
			});

      });
	}
 });

// Begin '/User/:id/Serv' functions

// Returns an array of Serv for the specified User.
//
// Accept a query params(status) to get all the working services.
// AU must be User in question or admin.
//DO NOT USE THIS --Zin
/*
router.get('/:id/Serv', function(req, res) {
   var vld = req.validator;
   var qry;
   var qryParams;
   if(vld.checkPrsOK(req.params.id)) { // AU Check
      qry = "SELECT * FROM Services WHERE userId = ?";
      qryParams = [req.params.id];
      if(req.query.status) {
         qry += " and status = ?";
         qryParams.push(req.query.status);
      }
      qry += " ORDER BY timestamp DESC";
      connections.getConnection(res, function(cnn) {
         cnn.query(qry, qryParams, function(err, result) {
            if(err, result) {
               res.status(400).json(err); // closes response
            } else if(vld.check(result.length, Tags.notFound)) {
               res.json(result); // closes response
            }
         });
         cnn.release();
      });
   }
});*/

// Creates a new Serv for this User, on the specified User.
//
// Requires technician status for AU or Admin
//
// Fail if  the person in question has more than 5 services.
// Services must have unique names.
router.post('/:id/Serv', function(req, res) {
   var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
   var body = req.body;
   var qry;
   var qryParams;

   if(vld.checkPrsOK(req.params.id)
      && vld.check(req.session.role === 1 || admin, Tags.noPermission)
      && vld.hasFields(body, ['serviceId', 'amount'])) {
         // first check if poster has surpased their 5 service limit
         qry = " SELECT * FROM ServicesOffer WHERE technicianId = ? ";
         qryParams = req.params.id;
         connections.getConnection(res, function(cnn) {
            cnn.query(qry, qryParams, function(err, results) {
               if(err) {
                  res.status(400).json(err); // closes reponse
               } else if(vld.check(results.length < 100, Tags.maxServiceLimitReached)) {
                  // confirmed that user has not hit their service limit
                  // Now we can post their new service
                  body.status = 0;
                  body.technicianId = parseInt(req.params.id);
                  body.timestamp = new Date();
                  // making post request
                  qry = "INSERT INTO ServicesOffer SET ? ";
                  qryParams = body;
						console.log("post service in Json: " + JSON.stringify(body));
                  cnn.query(qry, qryParams, function(err) {
                     if(err) {
                        res.status(400).json(err); // closes response
                     } else {
								res.location(router.baseURL + '/' + results.insertId).end();
                     }
                  });
               }
            });
            cnn.release();
         });
      }
});

  // Allow user, |id|, to retrieve the name of another user in the database using their id, |otherId|.
  router.get('/:id/:otherId/Name', function(req, res) {
     var vld = req.validator;
     //check valid user
     if (vld.checkPrsOK(req.params.id)) {
        connections.getConnection(res, function(cnn) {
           cnn.query('SELECT firstName, lastName FROM Users WHERE id = ?', req.params.otherId, function(err, result) {
              if(err) {
                 res.status(400).json(err); // ends response
              } else if (vld.check(result.length, Tags.notFound)) {
                 res.json(result[0]); // ends response
              }
           });
           cnn.release();
        });
     }
  });

module.exports = router;
