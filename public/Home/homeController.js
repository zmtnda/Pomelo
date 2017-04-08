app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', '$timeout',
  function(scope, state, rscope,goSer, logSer, regPopSer, timeout) {
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
     timeout(function() {
       state.go('forgotPassword');
     })
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
