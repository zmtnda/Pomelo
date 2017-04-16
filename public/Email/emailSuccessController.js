app.controller('emailSuccessController', ['$scope', '$state','$timeout',
 function(scope, state, timeout) {
     scope.redirect = function()
     {
         timeout(function() {
           state.go('home');
         }, 2000)
      }
      scope.redirect();
}])
