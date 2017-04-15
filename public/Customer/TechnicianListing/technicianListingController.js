app.controller('technicianListingController', ['$scope', '$location','$state', 'users', 'logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout',
  function(scope, location, state, users, logSer, http, rscope, noDlg, goto, timeout) {

    scope.users = users;

}]);
