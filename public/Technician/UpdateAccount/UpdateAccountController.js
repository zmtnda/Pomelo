app.controller('updateAccountController', ['$scope', '$location','$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout',
  function(scope, location, state, logSer, http, rscope, noDlg, goto, timeout) {

    http.get("Serv/" + rscope.loggedUser.tec_id + "/all")
      .then(function(response){
          // console.log("response.data: " + JSON.stringify(response));
          scope.listServices = response.data;
      }).
    catch(function(err){noDlg.show(scope, err, "Error")});
}]);
