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
    var search = function(){

    }

    timeout(function(){
       state.go("technicianListing");
    }, 4000)
}]);
