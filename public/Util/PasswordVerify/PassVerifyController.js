app.controller('passVerifyController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance", '$timeout',
 function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout) {
   scope.user = {};

   scope.verifyPass = function()
   {
     console.log(JSON.stringify(rscope.loggedUser));
     http.post("user/" + rscope.loggedUser.id + "/validation", scope.user)
       .then(function(response)
       {
         console.log(JSON.stringify(response));
          if(response["data"]["success"] == 1){
            noDlg.show(rscope, "Your services has been added successfully");
            timeout(function() {
              state.go('updateAccount');
            })
          }

        console.log(response["data"]["success"]);
         return response["data"]["success"];
       })
       .catch(function(err){
         console.log("ERRRRRRORRRRRRR");
         throw err;
       });
   }
}]);
