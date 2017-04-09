app.controller('changePasswordController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance", '$timeout', 'passVerifyPop',
 function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout, passVerifyPop) {
   scope.pass = {};

   scope.changePass = function()
   {
    //  console.log(JSON.stringify(rscope.loggedUser));
    //  console.log(JSON.stringify(scope.pass));
    //  scope.oldPass = {};
    //  scope.oldPass.password = scope["pass"]["oldPass"];
    //  http.post("User/" + rscope.loggedUser.id + "/validation", scope.oldPass)
    //    .then(function(response)
    //    {
    //      console.log(JSON.stringify(response));
    //      if(response["data"].hasOwnProperty("success")){
    //       if(response["data"]["success"] == 1){
            scope.newPass = {};
            scope.newPass.password = scope["pass"]["newPass"];

            http.put("User/" + rscope.loggedUser.id + "/info", scope.newPass)
            .then(function(response){
              console.log(JSON.stringify(response["data"]));
            })
            .catch(function(err){
              console.log("ERRRRRRORRRRRRR");
              noDlg.show(scope, "Mysql error", "Note");
            });
       //
      //       scope.success = response["data"]["success"]
      //       scope.$close();
      //       return response["data"]["success"];
      //     }
      //   }
      //   else{
      //     console.log("TAG!");
      //     return response
      //   }
      //  })
      //  .catch(function(err){
      //    console.log("ERRRRRRORRRRRRR");
      //    noDlg.show(scope, "Password is invalid.", "Note");
      //  });
   }

}]);
