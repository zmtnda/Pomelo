app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg',
  function(scope, state, logSer, http, rscope, noDlg) {
    scope.user = {};
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software"]
    scope.manufactueres = ["Apple", "Sony"]
    scope.models = ["iPhone 6"]
    scope.issues = ["Cracked Screen", "Broken Keyboard"]

}]);
