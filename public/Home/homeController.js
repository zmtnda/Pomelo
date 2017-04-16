app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', '$timeout', "$uibModal",
  function(scope, state, rscope,goSer, logSer, regPopSer, timeout, uibM) {
    scope.user = {};

    scope.retnHm = function(){
      timeout(function() {
        state.go('home');
      })
    }

    scope.TechnicianListing = function(){
      timeout(function() {
        state.go('technicianListing');
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
        controller: "forgotPasswordPopController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
        templateUrl: 'Util/Register/forgotPassword.pop.html',
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
