app.controller('ordersController', ['$scope', '$location','$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout',
  function(scope, location, state, logSer, http, rscope, noDlg, goto, timeout) {

        http.get("Receipt/" + rscope.loggedUser.tec_id + "/technician")
        .then(function(response){
          console.log("response.data: " + JSON.stringify(response));
          scope.listOrders = response.data;
        }).
        catch(function(err){noDlg.show(scope, err, "Error")});

        scope.goToissueGudiance = function()
        {
          timeout(function() {
            state.go('issueGudiance');
          })
        }
}]);
