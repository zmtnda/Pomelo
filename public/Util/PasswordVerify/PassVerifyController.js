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
         noDlg.show(rscope, "Your services has been added successfully");
         goSer.goToTechnician();
         return response["data"]
       })
   }
}]);
