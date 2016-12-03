
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap',
   'ngRoute'
]).filter("btnState", function(){
   var stateNames = ["btn-warning", "btn-success"];

   return function(input) {
      return stateNames[input];
   };
});
