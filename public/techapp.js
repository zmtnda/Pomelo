
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap',
   'ngRoute',
   'ngCookies'
]).filter("btnState", function(){
   var stateNames = ["btn-warning", "btn-success"];

   return function(input) {
      return stateNames[input];
   };
});
