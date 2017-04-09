app.controller('passVerifyController', ['$rootScope','$scope', '$state', 'logService', '$http', 'notifyDlg', '$timeout',
 function(rscope, scope, state, logSer, http, noDlg, timeout) {
   scope.user = {};

   scope.verifyPass = function()
   {
     console.log(JSON.stringify(rscope.loggedUser));
     console.log(JSON.stringify(scope.user));
     http.post("User/" + rscope.loggedUser.id + "/validation", scope.user)
       .then(function(response)
       {
         console.log(JSON.stringify(response));
         if(response["data"].hasOwnProperty("success")){
          if(response["data"]["success"] == 1){
            timeout(function() {
              state.go('updateAccount');
            })
            scope.success = response["data"]["success"]
            scope.$close();
            return response["data"]["success"];
          }
        }
        else{
          console.log("TAG!");
          return response
        }
       })
       .catch(function(err){
         console.log("ERRRRRRORRRRRRR");
         noDlg.show(scope, "Password is invalid.", "Note");
       });
   }
}]);
