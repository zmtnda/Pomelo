app.controller("forgotPasswordControoler", ['$scope', "$http", "notifyDlg", function(scope, http, notifyDlg){

  scope.emailInput = undefined;
  scope.errMessage = undefined;

  scope.onClickSend = function (email)
  {
    http.get("Send/resetPassword", {"email": email})
    .catch(function (err) {
      scope.errMessage = "Unknown error during sending your email. Please contact us at pomelotech@pomelotech.com"
      console.log("Reset Emaill Error. " + JSON.stringify(err));
    })
  }
}])

app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', '$timeout', "$uibModal",
  function(scope, state, rscope,goSer, logSer, regPopSer, timeout, uibM) {
    scope.user = {};

    scope.retnHm = function(){
      timeout(function() {
        state.go('home');
      })
    }

   scope.login = function(){
     logSer.login(scope.user.email, scope.user.password);
   }

   scope.addUser = function(){
     regPopSer.show(scope, "Register")
   }

   scope.findTechnician = function(){
     timeout(function() {
       state.go('customerGudiance');
     })
   }

   scope.goToAbout = function()
   {
     timeout(function() {
       state.go('about');
     })
   }

   scope.goToForgotPassword = function()
   {
     return uibM.open({
        animation: false,
        controller: "forgotPasswordControoler", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
        templateUrl: 'Util/Register/forgotPassword.template.html',
        scope: scope,
        size: 'lg'
     }).result;
   }

   scope.goToTechnician = function(){
     timeout(function() {
       state.go('technician');
     })
   }

   scope.goToOpinion = function(){
     timeout(function() {
       state.go('opinion');
     })
   }

   scope.customerGuidance = function(){
     timeout(function() {
       state.go('customerGudiance');
     })
   }

   rscope.logout = logSer.logout;

}])
