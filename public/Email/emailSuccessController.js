app.controller('emailSuccessController', ['$rootScope','$scope', '$state','$timeout',
 function(rscope, scope, state, timeout) {

     scope.redirect = function()
     {
         timeout(function() {
           state.go('home');
         }, 3000)
         console.log("redirect")
      }
      scope.redirect();
}])
