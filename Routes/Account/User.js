var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
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
			' FROM ServiceHistory x JOIN Users y JOIN Services z JOIN ServicesOffer v WHERE x.userId = ? ' +
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
// Authorization is only granted to users.
// Not Found error will be returned should there be no user with the specified email.
//
// email - principal string identifier, unique across all Users
// id - id of user with said email, so that URI would be User/<id>
router.get('/', function(req, res) {
   var technician = (req.session && !req.session.isAdmin()) && req.session.email;
   var admin = req.query.soFull && (req.session && req.session.isAdmin());
   var usrId = req.session && req.session.id;
   connections.getConnection(res, function(cnn) {
      var handler = function(err, prsArr) {
         res.json(prsArr[0]); // array notation to grab first person.
         cnn.release();
      }
      var allHandler = function(err, prsArr) {
         res.json(prsArr);
         cnn.release();
      }
      if(admin)
      {
        console.log("user is admin get req.query.soFull");
        cnn.query('SELECT * FROM Logins l LEFT JOIN Technicians t '
                  + 'ON l.id_log = t.log_id ORDER BY l.id_log', function(err, prsArr){
         console.log(JSON.stringify(prsArr));
          res.json(prsArr); // array notation to grab first person.
          cnn.release();

        });
      }
      else if (technician)
      {
        console.log("user is not admin");
         cnn.query('SELECT id_log, email FROM Logins WHERE email = ?', [technician], handler);
      }
      else {
        res.status(400);
        res.send('Unauthorized user');
        cnn.release();
       }
   });
});

// Adds a new User, returning the location of the newly added User.
// No AU required.
router.post('/', function(req, res) {

  console.log("POST Users/");
  var vld = req.validator;  // Shorthands
  var body = req.body;
  /* var admin = req.session && req.session.isAdmin(); */
  var admin = req.session;
  if (admin && !body.passwordHash)
    body.passwordHash = "*";                       // Blockig password
  body.whenRegistered = new Date();

   if(vld.hasFields(body, ['email', 'firstName', 'lastName', 'passwordHash', 'role', 'hourlyRate', 'city', 'zip'])
      && vld.chain(body["email"], Tags.missingField)
      .chain(body["firstName"], Tags.missingField) // z : we might not need this since hasFields
      .chain(body["lastName"], Tags.missingField) // z : called chain on each
      .chain(body["passwordHash"], Tags.missingField)
      .check(body.role >= 0 && body.role <=2, Tags.badValue, ["role"])) {
         connections.getConnection(res, function(cnn) {
           bcrypt.genSalt(saltRounds, function(err, salt) {
             bcrypt.hash(body.passwordHash, salt, function(err, hash) {
               // Store hash in your password DB.
               body.passwordSalt = salt;
               body.passwordHash = hash;
               var log_id = 0;
               var attrLoginTable = {email: body.email, passwordSalt: body.passwordSalt, passwordHash: body.passwordHash,
                 role: body.role, whenRegistered: body.whenRegistered};
                 cnn.query('INSERT INTO Logins SET ?', attrLoginTable, function(err, result) {
                    if(err) {
                       res.status(400).json(err);
                    } else {
                      log_id = result.insertId;
                      console.log("success login insert and id_lod = " + log_id);
                      var attrTechTable = {log_id: log_id, firstName: body.firstName, lastName: body.lastName,
                        hourlyRate: body.hourlyRate, city: body.city, zip: body.zip, ratings: '5', bad_id: '1', status: '1'};
                        console.log(JSON.stringify(attrTechTable));
                      cnn.query('INSERT INTO Technicians SET ?', attrTechTable, function(err, result) {
                        if(err) {
                          console.log("fail technician insert");
                           res.status(400).json(err);
                        } else {
                          console.log("success technician insert");
                        }
                      });
                       res.location(router.baseURL + '/' + log_id).end();
                    }
                 });
             });
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

// User validation for security purpose when updating account info
router.post('/:logId/validation', function(req, res) {
   var vld = req.validator;
   var password = req.body.password;
   var tech = req.params.logId;

   if(vld.checkPrsOK(tech))
   {
     connections.getConnection(res, function(cnn) {
       cnn.query('SELECT passwordHash FROM Logins WHERE id_log = ? ', tech,
          function(err, result){
            if(err) {
               res.status(400).json(err);
            }
            else if (req.validator.check(result.length > 0 && bcrypt.compareSync(req.body.password, result[0].passwordHash), Tags.noPermission)) {
              res.json({success: 1});
            }
          });
          cnn.release();
     });
   }});
// Update technician account,
// with json input giving all specified attributes.
// AU must be the technician in question, or an admin.
// Note: Currently DO NOT consider Role changes
// assuming password is correct
// Errors if there is old password is not provide when changing the password
router.put('/:logId/info', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var tech = req.params.logId;
   var attrLoginTable = {};

   if(vld.checkPrsOK(tech))
   {
      connections.getConnection(res, function(cnn) { // Done with if conditional
      async.series([
        function(callback) {
          if(body.password){
            bcrypt.genSalt(saltRounds, function(err, salt) {
              bcrypt.hash(body.password, salt, function(err, hash) {
              attrLoginTable.passwordSalt = salt;
              attrLoginTable.passwordHash = hash;
              delete body.password;
              callback(null);
              });
            });
          }
          else{
            callback(null);
          }
        },
				function(callback) {
          if(body.email){
            attrLoginTable.email = body.email;
            delete body.email;
            callback(null);
          }
          else{
            callback(null);
          }
        },
        function(callback) {
          cnn.query(' UPDATE Logins SET ? WHERE id_log = ? ', [attrLoginTable, tech], callback);
        },
        function(callback) {
          if (Object.keys(body).length){
           cnn.query(' UPDATE Technicians set ? WHERE log_id = ? ', [body, tech], callback);
         }
         else {
           callback(null);
         }
        }], function(err, result) {
				if (err) {
					res.status(400).json(err);
				} else {
					res.json({success: 1});
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
console.log ("delete user get called and id = " + usrId);
   if(vld.checkPrsOK(usrId)) {
      connections.getConnection(res, function(cnn) {
         cnn.query(' UPDATE Technicians SET status = 0 WHERE log_id = ? ', usrId,
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

// // Creates a new Serv for this User, on the specified User.
// //
// // Requires technician status for AU or Admin
// //
// // Fail if  the person in question has more than 5 services.
// // Services must have unique names.
// router.post('/:id/Serv', function(req, res) {
//    var vld = req.validator;
//    var admin = req.session && req.session.isAdmin();
//    var body = req.body;
//    var qry;
//    var qryParams;
//
//    if(vld.checkPrsOK(req.params.id)
//       && vld.check(req.session.role === 1 || admin, Tags.noPermission)
//       && vld.hasFields(body, ['serviceId', 'amount'])) {
//          // first check if poster has surpased their 5 service limit
//          qry = " SELECT * FROM ServicesOffer WHERE technicianId = ? ";
//          qryParams = req.params.id;
//          connections.getConnection(res, function(cnn) {
//             cnn.query(qry, qryParams, function(err, results) {
//                if(err) {
//                   res.status(400).json(err); // closes reponse
//                } else if(vld.check(results.length < 100, Tags.maxServiceLimitReached)) {
//                   // confirmed that user has not hit their service limit
//                   // Now we can post their new service
//                   body.status = 0;
//                   body.technicianId = parseInt(req.params.id);
//                   body.timestamp = new Date();
//                   // making post request
//                   qry = "INSERT INTO ServicesOffer SET ? ";
//                   qryParams = body;
// 						console.log("post service in Json: " + JSON.stringify(body));
//                   cnn.query(qry, qryParams, function(err) {
//                      if(err) {
//                         res.status(400).json(err); // closes response
//                      } else {
// 								res.location(router.baseURL + '/' + results.insertId).end();
//                      }
//                   });
//                }
//             });
//             cnn.release();
//          });
//       }
// });

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
