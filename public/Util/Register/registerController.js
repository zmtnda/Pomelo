 app.controller('registerController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", "$uibModalInstance", '$timeout',
  function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout) {
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
        if (!scope.isValidZip(scope.user.zip)){
          noDlg.show(scope, "It is valid ZIP code", "Error")
        }
      })
      .then(function(){
        uibIns.close("Cancel")
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
		  .catch(function(err){
        console.log("ERROR!!!!!");
        noDlg.show(scope, emf.formatErrorCodeAndErrorArray(err), "Error")
      });
	}
}])
