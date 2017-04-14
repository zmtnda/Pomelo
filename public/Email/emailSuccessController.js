app.controller('emailSuccessController', ['$rootScope','$scope', '$timeout',
 function(rscope, scope, state, timeout) {

   scope.redirect = function(){
     timeout(function() {
       state.go('home');
     }, 3000)
   }
   }

   scope.redirect();
}])
