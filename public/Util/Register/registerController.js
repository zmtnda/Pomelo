 app.controller('registerController', ['$rootScope','$scope', '$state', 'goToServices', 'logService',
  '$http', 'notifyDlg', "errorMessageFormatter", '$uibModalStack',
  "$uibModalInstance", '$timeout',
  function(rscope, scope, state, goSer, logSer, http, noDlg, emf, uibIns, timeout, uibMStack) {

    scope.user = {confirmationEmail: "",
                  confirmationPassword: ""};
    scope.noMissingFields = false
    scope.hasClickedSignUp = false
    scope.parsedError = true
    scope.validEmailLength = true
    scope.validPasswordLength = true
    scope.validNameLength = true
    scope.validCityLength = true
    scope.validZipLength = true
    scope.waitingResponse = false

    scope.postUser = function()
    {
      scope.hasClickedSignUp = true
      scope.parsedError = undefined
      scope.noMissingFields = scope.user.email && scope.user.password && scope.user.role && scope.user.firstName &&
                              scope.user.lastName && scope.user.hourlyRate && scope.user.city && scope.user.zip

      if(scope.noMissingFields)
      {
        scope.waitingResponse = true
        scope.validEmailLength = scope.user.email.length <= 128
        scope.validPasswordLength = scope.user.password.toString().length <= 32
        scope.validNameLength = scope.user.firstName.length <= 45 && scope.user.lastName.length <= 45
        scope.validCityLength = scope.user.city.length <= 20
        scope.validZipLength = scope.user.zip.toString().length <= 20
        scope.validLength = emf.hasMetLengths(scope.user.email, scope.user.password, scope.user.firstName, scope.user.lastName, scope.user.city, scope.user.zip.toString())
        scope.validEmailFormat = emf.checkEmailByRegex(scope.user.email)
       
        if (!scope.validEmailFormat)
        {
          scope.parsedError = "Invalid email format."
        }
        else if(scope.validLength && scope.validEmailFormat)
        {
          logSer.addUser(scope.user.email, scope.user.password, scope.user.role, scope.user.firstName,
                         scope.user.lastName, scope.user.hourlyRate, scope.user.city, scope.user.zip)
          .then (function()
          {
            console.log("Opening Confirm")
            noDlg.show(scope, "A confirmation link has sent to your email account.", "Confirm")
    		  })
          .then(function(){
            $uibModalStack.dismissAll();
          })
    		  .catch(function(err)
          {
            scope.parsedError = emf.formatErrorCodeAndErrorArray(err)
          });
        }
        scope.waitingResponse = false
      }
	 }
}])
