app.controller('updateAccountController', ['$scope', '$location','$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout', 'passVerifyPop', 'changePasswordPop', 'changeEmailPop',
  function(scope, location, state, logSer, http, rscope, noDlg, goto, timeout, passVerifyPop, changePasswordPop, changeEmailPop) {

    // console.log(rscope.loggedUser);
    // scope.user = {};
    // scope.user.email = rscope.loggedUser.email;
    // console.log("scope user email is: " + scope.user.email);
    scope.email = rscope.loggedUser.email;
    scope.firstName = rscope.loggedUser.firstName;
    scope.lastName = rscope.loggedUser.lastName;
    scope.hourlyRate = rscope.loggedUser.hourlyRate;
    scope.city = rscope.loggedUser.city;
    scope.zip = rscope.loggedUser.zip;

    scope.onClickChangeEmail = function()
    {
      changeEmailPop.show(scope, "changeEmailPop");
    }

    scope.onClickChangePassword = function()
    {
      changePasswordPop.show(scope, "changePasswordPop");
    }

    scope.onClickChangeFirstName = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
    }

    scope.onCLickChangeLastName = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
    }

    scope.onClickChangeCity = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
    }

    scope.onClickChangeHourlyRate = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
    }

    scope.onClickChangeZipCode = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
    }
}]);
