app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', '$timeout',
  function(scope, state, rscope,goSer, logSer, regPopSer, timeout) {
    scope.user = {};

   scope.login = function(){
     logSer.login(scope.user.email, scope.user.password);
   }

   scope.addUser = function(){
     regPopSer.show(scope, "Register")
   }

   scope.goToAbout = function()
   {
     timeout(function() {
       state.go('about');
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

   rscope.logout = logSer.logout;

}])
