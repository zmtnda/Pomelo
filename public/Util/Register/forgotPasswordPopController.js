app.controller("forgotPasswordPopController", ['$scope', "$http", "errorMessageFormatter", "$uibModalInstance",
  function(scope, http, emf, uibIns){

  scope.emailInput = undefined;
  scope.errMessage = undefined;

  scope.onClickSend = function (email)
  {
    if(!emf.checkEmailByRegex(scope.emailInput))
    {
      scope.errMessage = "Invalid email."
    }
    else if (!scope.emailInput) {
      scope.errMessage = "You haven't entered an email."
    }
    else
    {
      http.post("Send/resetPassword", {"email": email})
      .then(function(res)
      {
        if(res.data.success == 0)
        {
          scope.errMessage = "Email doesn't exist in our system."
        }
        else
        {
          uibIns.close("Cancel")
        }
      })
      .catch(function (err)
      {
        scope.errMessage = emf.formatErrorCodeAndErrorArray(err);
        console.log("Reset Emaill Error. " + JSON.stringify(err));
      })
    }
  }
}])