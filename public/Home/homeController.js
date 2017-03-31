app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', '$timeout',
  function(scope, state, rscope,goSer, logSer, regPopSer, timeout) {
    scope.user = {};

   scope.login = function(){
       logSer.login(scope.user.email, scope.user.password);
   }

   scope.addUser = function(){
     regPopSer.show(scope, "Register")
     //regPopSer.close()
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

   rscope.logout = logSer.logout;

}])
