app.controller('processingSearchController', ['$scope', '$location', '$state',  '$http', '$rootScope', 'notifyDlg', '$timeout',
  function(scope, location, state, http, rscope, noDlg, timeout) {
    /*
    Access selections:

    (function(){
      console.log(JSON.stringify(state.current.data.customerData))
    })()
    
    */
    /*Write a promise to do this
    */

    timeout(function(){
       state.get("technicianListing").data.customerData = state.current.data.customerData
       state.go("technicianListing")
    }, 1000)
}]);
