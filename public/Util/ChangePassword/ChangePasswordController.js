app.controller('changePasswordController', ['$rootScope','$scope', '$state', '$http', 'notifyDlg', '$timeout', 'userPersistenceService',
 function(rscope, scope, state, http, noDlg, timeout, persisService) {
   scope.pass = {};

   scope.changePass = function()
   {
     scope.newPass = {};
     scope.newPass.password = scope["pass"]["newPass"];

     http.put("User/" + rscope.loggedUser.id + "/info", scope.newPass)
     .then(function(response){
       console.log(JSON.stringify(response["data"]));
       rscope.loggedUser.password = scope.newPass.password;
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
