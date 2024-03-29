app.controller('technicianController', ['$scope', '$location','$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', '$timeout', 'passVerifyPop','userPersistenceService', '$uibModal',
  function(scope, location, state, logSer, http, rscope, noDlg, goto, timeout, passVerifyPop, persisService, uib) {
    scope.user = {};
    scope.user.reviews = {};
    scope.viewEnum = {
      NONE: 0,
      PROVIDE: 1,
      SERVICES: 2,
      PERSONAL: 3,
      ORDERS: 4
    };

    scope.user.tec_id = persisService.getTechId();
    // scope.avatar = loggedUser.avatar;

    console.log("LOGGED IS: " + scope.user.tec_id);
    console.log("LOGGED data: " + scope.user.tec_id);

    http.get("Review/technician/" +  scope.user.tec_id)
        .then(function(response){
          // console.log("response.data: " + JSON.stringify(response));
          // console.log("RESPONSE DATA: " + response.data.length);
          scope.user.reviews.length = response.data.length;
        }).
        catch(function(err){noDlg.show(scope, err, "Error")});



    scope.isShowProvide = 0;
    scope.isShowListServices = 0;
    scope.isShowListOrders = 0;
    scope.isShowPersonalField = 0;
    scope.listServices = [];
    scope.field = {};
	  var service = {};

    scope.switchView = function(newView) {
      switch (newView) {
        case scope.viewEnum.NONE:
          scope.isShowPersonalField = 0;
          scope.isShowListServices = 0;
          scope.isShowListOrders = 0;
          scope.isShowProvide = 0;
          break;
        case scope.viewEnum.PERSONAL:
          scope.isShowPersonalField = 1;
          scope.isShowListServices = 0;
          scope.isShowProvide = 0;
          scope.isShowListOrders = 0;
          break;
        case scope.viewEnum.SERVICES:
          scope.isShowListServices = 1;
          scope.isShowPersonalField = 0;
          scope.isShowProvide = 0;
          scope.isShowListOrders = 0;
          break;
        case scope.viewEnum.PROVIDE:
          scope.isShowProvide = 1;
          scope.isShowListServices = 0;
          scope.isShowPersonalField = 0;
          scope.isShowListOrders = 0;
          break;
        case scope.viewEnum.ORDERS:
          scope.isShowListOrders = 1;
          scope.isShowProvide = 0;
          scope.isShowListServices = 0;
          scope.isShowPersonalField = 0;
          break;
      }
    }

    scope.goToTranscationHistory = function()
    {
      timeout(function() {
        state.go('transcationHistory');
      })
    }

    scope.goToissueGudiance = function()
    {
      timeout(function() {
        state.go('issueGudiance');
      })
    }

    // Toggle view for modifying personal info
    scope.modifyTechnician = function()
    {
      passVerifyPop.show(scope, "passVerifyPop");
      // timeout(function() {
      //   state.go('updateAccount');
      // })
    }


    scope.gotoOrders = function()
    {
      timeout(function() {
        state.go('orders');
      })
    }
    //Toggle a list of services by a http call
    // scope.showListServices = function()
    // {
    //   if (scope.isShowOrderHistory == 1) {
    //     scope.switchView(scope.viewEnum.NONE);
    //   } else {
    //       console.log("rscope.loggedUser.tec_id: " + rscope.loggedUser.tec_id);
    //     http.get("Serv/" + rscope.loggedUser.tec_id + "/all")
    //     .then(function(response){
    //       console.log("response.data: " + JSON.stringify(response));
    //       scope.listServices = response.data;
    //       scope.switchView(scope.viewEnum.SERVICES);
    //     }).
    //     catch(function(err){noDlg.show(scope, err, "Error")});
    //   }
    // }

    scope.goToServices = function(){
      timeout(function() {
        state.go('services');
      })
    }

  scope.postModify = function()
    {
        scope.switchView(scope.viewEnum.NONE);
        http.put("User/"+rscope.loggedUser.id, scope.user)
        .then(function(){
          noDlg.show(scope, "Please re-login to see the changes", "NOTE!!!");
          //state.reload();
        })
        .catch(function(err){noDlg.show(scope, err, "Error")});
    }

  scope.completeService = function(id, amount, techId){
      if(window.confirm("Ok to confirm service completed."))
      {
        http.delete('Serv/' + id + "/" + techId + '/Order')
        var service =
        {
          "serviceId": id,
          "amount": amount
        };
  		  console.log("post service " + JSON.stringify(service));
        http.post("User/" + rscope.loggedUser.id + "/Serv", service)
        .then(function(){
            scope.isShowListServices = 1;
            scope.showListServices();
        })
        .catch(function(err){noDlg.show(scope, err, "Error")});
      }
    }

    scope.deleteService = function(id, techId){
      http.delete("Serv/" + id + "/" + techId + '/Order')
      .then(function(){
          scope.isShowListServices = 1;
          scope.showListServices();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.cancelService = function(id, amount, techId){
      if(window.confirm("Are you sure you want to cancel the service?"))
      {
        http.delete('Serv/' + id + "/" + techId + '/Order')
        var service =
        {
          "serviceId": id,
          "amount": amount
        };
  		  console.log("post service " + JSON.stringify(service));
        http.post("User/" + rscope.loggedUser.id + "/Serv", service)
        .then(function(){
          scope.isShowListServices = 1;
          scope.showListServices();
        })
        .catch(function(err){noDlg.show(scope, err, "Error")});
      }
    }


    //Delete a Technician
    scope.deleteTechnician = function(){
        //Asks for deletion confirmation
        if(window.confirm("Are you sure you want to delete your account?"))
        {
          console.log("USER IS:" + rscope.loggedUser.id);
            http.delete("User/" + rscope.loggedUser.id)
            .then(function(){
                state.go('home');
                logSer.logout();
            })
            .catch(function(err){noDlg.show(scope, err, "Error")});
        }
    }
    //Write a call to do post service
    scope.postService = function()
    {
		  var service =
      {
        "serviceId": scope.field.serviceName.id,
        "amount": scope.field.amount
      };

		 console.log("post service " + JSON.stringify(service));
       http.post("User/" + rscope.loggedUser.id + "/Serv", service)
       .then(function(){state.reload()})
       .catch(function(err){noDlg.show(scope, err, "Error")});
    }
    scope.gotoBottom = function() {
          // set the location.hash to the id of
          // the element you wish to scroll to.
          location.hash('userUpdate');

          // call $anchorScroll()
          $anchorScroll();
    };

    scope.changeAvatar = function(){
      uib.open({
         animation: false,
         controller: "profileuploadController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
         templateUrl: 'Technician/ProfileUpload/profileUpload.html',
         scope: scope,
         size: 'lg'
      }).result;
    }


}]);
