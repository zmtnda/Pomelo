 app.controller('registerController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance",
  function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns) {
    scope.user = {};
    scope.isValidZip = function(value)
    {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
    }

    scope.postUser = function()
    {
		  logSer.addUser(scope.user.email, scope.user.password, scope.user.role, scope.user.firstName,
         scope.user.lastName, scope.user.hourlyRate, scope.user.city, scope.user.zip)
		  .then (function(){
        if (scope.isValidZip(scope.user.zip)){
          console.log("It is valid ZIP code")
        }
        else
        {
          console.log("It is not valid zip code!");
        }
      })
      .then (function(){
			  if(rscope.loggedUser.email !== 'Admin@11.com'){
					console.log("I am not admin" +rscope.loggedUser.email);
          noDlg.show(scope, "A confirmation link has sent to your email account.", "Confirm")
				}
				else
        {
					console.log("I am admin");
					state.reload();
				}
		  })
      .then(function(){
        uibIns.close("Cancel")
      })
		  .catch(function(err){
        console.log("ERROR!!!!!");
        noDlg.show(scope, emf.formatErrorCodeAndErrorArray(err), "Error")
      });
	}
}])
