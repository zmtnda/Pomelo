app.controller('servicesController', ['$scope', '$location','$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout',
  function(scope, location, state, logSer, http, rscope, noDlg, goto, timeout) {


    http.get("Serv/" + rscope.loggedUser.tec_id + "/all")
      .then(function(response){
          console.log("response.data: " + JSON.stringify(response));
          scope.listServices = response.data;
      }).
    catch(function(err){noDlg.show(scope, err, "Error")});

    scope.goToissueGudiance = function()
    {
      timeout(function() {
        state.go('issueGudiance');
      })
    }

    scope.onChoosingItemBase = function(idSertech)
    {
      console.log("CHOOSING ITEM BASED");
      scope.listServices[idSertech]["servType"] = 0;
    }

    scope.onChoosingHourBase = function(idSertech)
    {
      scope.listServices[idSertech]["servType"] = 1;
    }

    scope.updateService = function(id_serTec, status, estAmount, servType){
      scope.update = {}
      scope.update.status = status;
      scope.update.servType = servType;
      scope.update.estAmount = estAmount;

      console.log("UPDATE IS: " + JSON.stringify(scope.update));
      http.put("Serv/" + id_serTec + "/issue", scope.update)
      .then(function(response){
        noDlg.show(rscope, "Service updated sucessfully.");

        console.log("response.data: " + JSON.stringify(response));
      }).
      catch(function(err){noDlg.show(scope, err, "Error")});
    }
}]);
