app.controller('homeController', ['$scope', '$state', '$rootScope','goToServices','logService', 'registerPopService', function(scope, state, rscope,goSer, logSer, regPopSer) {
    scope.user = {};

   scope.login = function(){
       logSer.login(scope.user.email, scope.user.password);
   }

   scope.addUser = function(){
       regPopSer = regPopSer.show(scope, "Register")
		 .then(function(){state.issueSelection()});
   }

   scope.goToAbout = function()
   {
     goSer.goToAbout();
   }

   rscope.logout = logSer.logout;

   rscope.goMain = function(role){
     if(role == 0)
        state.go('customer');
     else if(role == 1)
        state.go('technician');
     else if(role == 2)
        state.go('admin');
   }

}])
