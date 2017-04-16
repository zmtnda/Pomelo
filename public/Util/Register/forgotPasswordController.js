app.controller('forgotPasswordController', ['$scope', '$state', '$http',  "errorMessageFormatter", '$timeout', '$location',
 function(scope, state, http, emf, timeout, location) {
   scope.email = undefined
   scope.confirmationEmail = undefined
   scope.newPassword = undefined
   scope.hasClickedSubmit = false
   scope.confirmNewPassword = undefined
   scope.validEmail = false;
   scope.validLength = false
   scope.success = false
   scope.parsedError = undefined
   var queryParamObj = location.search()
   var currentEmail = queryParamObj.email
   var currentHash = queryParamObj.hash

   var redirect = function()
   {
       timeout(function() {
         state.go('home');
       }, 2000)
    }

   scope.onClickSubmit = function()
   {
     scope.parsedError = undefined
     scope.hasClickedSubmit = true

     if(currentEmail != scope.confirmationEmail)
     {
       scope.parsedError = "The email you entered is not same as the email of your account."
     }
     else if(scope.email && scope.newPassword)
     {
        scope.validEmail = emf.checkEmailByRegex(scope.email)
        scope.validLength = emf.hasMetLengths(scope.email, scope.newPassword.toString());

        if(!scope.validLength){
          scope.parsedError = "Your new password has to be at least 8 characters long."
        }
        else if (!scope.validEmail)
        {
          scope.parsedError = "Invalid email's format."
        }
        else
        {
          http.put("Verify/resetPassword", {'email': currentEmail, 'hash': currentHash, 'newPassword': scope.newPassword})
          .then(function(){
            scope.parsedError = "Your password has been reset. You will be redirected to the home page in a few seconds."
          })
          .then(function(){
            scope.success = true
            redirect();
          })
          .catch(function(err){
            scope.parsedError = "This page has expired. Please request a new page for resetting your password."
            console.log(JSON.stringify(err))
          })
        }
     }
   }
}])
