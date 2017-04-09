app.controller('changeEmailController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance", '$timeout', 'passVerifyPop', 'userPersistenceService',
 function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout, passVerifyPop, persisService) {
   scope.user = {};

   scope.changePass = function()
   {
     scope.newEmail = {};
     scope.newEmail.email = scope["email"];
     http.put("User/" + rscope.loggedUser.id + "/info", scope.newEmail)
     .then(function(response){
       console.log(JSON.stringify(response["data"]));
       rscope.loggedUser.email = scope.newEmail.email;
       persisService.setCookieData(scope.newEmail.email, rscope.loggedUser.password);
       timeout(function() {
         state.go('technician');
       })
     })
     .catch(function(err){
       console.log("ERRRRRRORRRRRRR");
       noDlg.show(scope, "Mysql error", "Note");
     });
   }

}]);
