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
      scope.first = {};
      scope.first.firstName = scope.firstName;
      console.log(JSON.stringify(scope.firstName));
      http.put("User/" + rscope.loggedUser.id + "/info", scope.first)
      .then(function(response){
        console.log(JSON.stringify(response["data"]));
        noDlg.show(scope, "Update first name sucessfully")
      })
      .catch(function(err){
        console.log("ERRRRRRORRRRRRR");
        noDlg.show(scope, "Mysql error", "Note");
      });
    }

    scope.onCLickChangeLastName = function()
    {
      scope.last = {};
      scope.last.lastName = scope.lastName;
      http.put("User/" + rscope.loggedUser.id + "/info", scope.last)
      .then(function(response){
        console.log(JSON.stringify(response["data"]));
        noDlg.show(scope, "Update last name sucessfully")
      })
      .catch(function(err){
        console.log("ERRRRRRORRRRRRR");
        noDlg.show(scope, "Mysql error", "Note");
      });
    }

    scope.onClickChangeCity = function()
    {
      scope.putCity = {};
      scope.putCity.city = scope.city;
      http.put("User/" + rscope.loggedUser.id + "/info", scope.putCity)
      .then(function(response){
        console.log(JSON.stringify(response["data"]));
        noDlg.show(scope, "Update city sucessfully")
      })
      .catch(function(err){
        console.log("ERRRRRRORRRRRRR");
        noDlg.show(scope, "Mysql error", "Note");
      });
    }

    scope.onClickChangeHourlyRate = function()
    {
      scope.hour = {};
      scope.hour.hourlyRate = scope.hourlyRate;
      http.put("User/" + rscope.loggedUser.id + "/info", scope.hour)
      .then(function(response){
        console.log(JSON.stringify(response["data"]));
        noDlg.show(scope, "Update hourly rate sucessfully")
      })
      .catch(function(err){
        console.log("ERRRRRRORRRRRRR");
        noDlg.show(scope, "Mysql error", "Note");
      });
    }

    scope.onClickChangeZipCode = function()
    {
      scope.putZip = {};
      scope.putZip.zip = scope.zip;
      http.put("User/" + rscope.loggedUser.id + "/info", scope.putZip)
      .then(function(response){
        console.log(JSON.stringify(response["data"]));
        noDlg.show(scope, "Update city sucessfully")
      })
      .catch(function(err){
        console.log("ERRRRRRORRRRRRR");
        noDlg.show(scope, "Mysql error", "Note");
      });
    }
}]);
