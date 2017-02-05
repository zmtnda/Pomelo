
var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
router.baseURL = '/Serv';
var formatDate = ', DATE_FORMAT(timestamp, \'\%b \%d \%Y \%h\:\%i \%p\') as formatDate';

// Begin '/Serv/' functions

// Retrieve all the Services in the database.
// AU must be admin. (Zin edited can be technician)
router.get('/', function(req, res) {
	var vld = req.validator;
	var user = req.session;

	if(vld.check(user, Tags.noPermission)){
		connections.getConnection(res, function(cnn) {
			cnn.query(' SELECT * FROM ServicesOfferedByTech ',
			function(err, result){
				if(!err){
					res.json(result);
					cnn.release();
				}
				else{
					res.status(404).end();
					cnn.release();
				}
			});
		});
	}
});
// Retrieve all the technician and associated services
// based on the service chosen
router.get('/:servId/Services', function(req, res) {
	var vld = req.validator;
	var user = req.session;
	var servId = req.params.servId;;
	console.log("get from ServicesOffer");
	if(vld.check(user, Tags.noPermission)){
		connections.getConnection(res, function(cnn) {
			cnn.query(' SELECT *' + formatDate + ' FROM ServicesOffer WHERE serviceId = ? ', servId,
			function(err, result){
				if(!err){
					res.json(result);
					cnn.release();
				}
				else{
					res.status(404).end();
					cnn.release();
				}
			});
		});
	}
});
// Begin '/Serv/:techId' functions.

// Retrieve all the services provided by Serv owner or admin.
// Returns
//       Services     - URI of the services being offer,
//			serviceName	 - services technician offer
//			amount		 - the amount of services
//       userId       - ID of the User making the Serv
//       status       - 0 for open, 1 pending, 2 closed
//       timeStamp    - Time of Serv start
//       technicianId - of the creator of a service
//
router.get('/:techId', function(req, res) {
	var vld = req.validator;
	var techId = req.session && req.params.techId;

	if(vld.checkPrsOK(techId, Tags.noPermission)){
		connections.getConnection(res, function(cnn) {
			cnn.query(' SELECT *' + formatDate + ' FROM ServicesOffer T1 JOIN Services T2 '
			+ ' WHERE T1.serviceId = T2.id  AND technicianId = ? ', techId,
			function(err, result){
				if(!err){
					res.json(result);
					cnn.release();
				}
				else{
					res.status(404).end();
					cnn.release();
				}
			});
		});
	}
});
// Begin '/Serv/:userId' functions.

// Retrieve all the services requested by user or admin
// Returns
//       Services     - URI of the services being offer,
//			serviceName	 - services technician offer
//			amount		 - the amount of services
//       userId       - ID of the User making the Serv
//       status       - 0 for open, 1 pending, 2 closed
//       timeStamp    - Time of Serv start
//       technicianId - of the creator of a service
//
router.get('/:userId', function(req, res) {
	var vld = req.validator;
	var usrId = req.session && req.params.userId;

	if(vld.checkPrsOK(userId, Tags.noPermission)){
		connections.getConnection(res, function(cnn) {
			cnn.query(' SELECT * FROM ServicesOffer T1 JOIN Services T2 '
			+ ' WHERE T1.serviceId = T2.id  AND userId = ? ', usrId,
			function(err, result){
				if(!err){
					res.json(result);
					cnn.release();
				}
				else{
					res.status(404).end();
					cnn.release();
				}
			});
		});
	}
});
// Begin '/Serv/:servId' functions.

// Retrieve Serv-specific info. AU must be Serv owner or admin or customer.
// Returns
//       Services     - URI of the challenge being played,
//       userId       - ID of the User making the Serv
//       status       - 0 for open, 1 pending, 2 closed
//       timeStamp    - Time of Serv start
//       technicianId - of the creator of a service
//
router.get('/:servId', function(req, res) {
   var vld = req.validator;
	var servId = req.params.servId;
	var loginId = req.session && req.session.id;

   connections.getConnection(res, function(cnn) {
      cnn.query('SELECT * FROM ServicesOffer WHERE userId = ? && '
		+ ' serviceId = ? OR technicianId = ? && serviceId = ? ',
		[loginId, servId, logginId, servId],
      function(err, result) {
         if (!err)
            res.json(result[0]);
			else
				res.status(404).end();
			cnn.release();
      });
   });
});

//Update Service table status and Create an order history
//if user order the service and have open ticket for that serivce
router.put('/:servId/:techId/Order', function(req, res) {
	var vld = req.validator;
	var servId = req.session && req.params.servId;
	var techId = req.params.techId;

		connections.getConnection(res, function(cnn) {
			//check if such servId exist and get techId
			cnn.query(' SELECT * FROM ServicesOffer WHERE id = ? AND technicianId = ? ', [servId, techId],
				function(err, result){
					console.log("Order servId= " + servId );
					if(vld.chain(result.length, Tags.notFound).check(!result[0].status == 1, Tags.alreadyTakenService)){
						//check if service is already taken when status = 1
						cnn.query(' UPDATE ServicesOffer SET status = ? WHERE id = ? AND technicianId = ? ', [1 ,servId, techId],
						function(err){
							if(err){
								res.status(400).end();
								console.log("Error Ordering the services");
							}
							else{
								console.log("Successfully updated service=" + JSON.stringify(result[0]));
								var order = {
									'userId': req.session.id,
									'technicianId': result[0].technicianId,
									'serviceId': result[0].serviceId,
									'whenCompleted': new Date()
								};
								//time to insert a new record in the orderhistory table
								cnn.query(' INSERT INTO serviceHistory SET ?', order,
								function(err){
									if(err){
										console.log("Error in Serv/:servId:techId/Order" + JSON.stringify(order));
										res.status(400).json(err);
									}
									else{
										console.log("Successfully added order history");
										res.end();
									}
										cnn.release();
								});
							}

						});
					}
					else
						cnn.release();
				});

	});
});

// Delete a service specified by <Servld>.
//	Serv/:servId
// Delete a service specified by <Servld>. Admin or Service Owner
// If there is an open ticket for that service only Admin can delete it
// status 0 for open, 1 pending, 2 closed, 3 cancel
router.delete('/:servId/:techId/Order', function(req, res) {
   // function is yet to be implemeneted.
	var vld = req.validator;
	var servId = req.params.servId;
	var loginId = req.session && req.session.id;
	var techId = req.params.techId;
	console.log("id = " + servId);
	connections.getConnection(res, function(cnn) {
		cnn.query(' SELECT * FROM servicesOffer WHERE serviceId = ? AND technicianId = ? ', [servId, techId],
			function(err, result){
				if(result.length ){
					// if(result[0].status == 1){
						// if(vld.checkAdmin() || loginId){
						// 	//continue to delete the following query
						// 	console.log("It is admin after all to delete the pending service Serv/:servId ");
						// }
						// else
						// 	cnn.release();
					// }
					//delete it don't require else
					cnn.query(' DELETE FROM servicesOffer WHERE serviceId = ? AND technicianId = ? ', [servId, techId],
						function(err){
							if (err)
								console.log("Error deleting Serv/:servId ");
							res.end();
							cnn.release();
						});
				}

				else{
					res.status(404).end();
					cnn.release();
				}

		});
	});
   res.end();
});
//delete from service table
// router.delete('/:servId', function(req, res) {
//    // function is yet to be implemeneted.
// 	var vld = req.validator;
// 	var servId = req.params.servId;
// 	var loginId = req.session && req.session.id;
// 	connections.getConnection(res, function(cnn) {
// 		cnn.query(' SELECT * FROM Services WHERE id = ? ', servId,
// 			function(err, result){
// 				if(result.length){
// 					if(result[0].status == 1){
// 						if(vld.checkAdmin()){
// 							//continue to delete the following query
// 							console.log("It is admin after all to delete the pending service Serv/:servId ");
// 						}
// 						else
// 							cnn.release();
// 					}
//
// 					//delete it don't require else
// 					cnn.query(' DELETE FROM Services WHERE id = ? ', servId,
// 						function(err){
// 							if (err)
// 								console.log("Error deleting Serv/:servId ");
// 							res.end();
// 							cnn.release();
// 						});
// 				}
// 				else{
// 					res.status(404).end();
// 					cnn.release();
// 				}
//
// 		});
// 	});
//    res.end();
// });

module.exports = router;
