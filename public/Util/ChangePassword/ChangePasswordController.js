app.controller('changePasswordController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance", '$timeout', 'passVerifyPop', 'userPersistenceService',
 function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout, passVerifyPop, persisService) {
   scope.pass = {};

   scope.changePass = function()
   {
     scope.newPass = {};
     scope.newPass.password = scope["pass"]["newPass"];

     http.put("User/" + rscope.loggedUser.id + "/info", scope.newPass)
     .then(function(response){
       console.log(JSON.stringify(response["data"]));
       persisService.setCookieData(rscope.loggedUser.email, scope.newPass.password);
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
