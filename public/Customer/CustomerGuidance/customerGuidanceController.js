app.controller('customerGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices',
  function(scope, state, logSer, http, rscope, noDlg, goto)
  {
    scope.hasGone = false
    scope.showMap = function()
    {
      scope.hasGone = true
    }

   }]);
