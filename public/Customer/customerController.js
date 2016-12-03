  app.controller('customerController', ['$scope', '$state','registerPopService', '$http', 'notifyDlg', '$rootScope', 'logService',function(scope, state, regPopSer, http, noDlg, rscope, logSer) {
      scope.user = {};
      scope.viewEnum = {
        NONE: 0,
        PERSONAL: 1,
        SERVICES: 2,
        HISTORY: 3,
  		  SERVOFFER: 4
      };

      scope.isShowPersonalField = 0;
      scope.isShowListServices = 0;
  	  scope.isShowServiceOfferField = 0;
      scope.isShowOrderHistory = 0;
      scope.listServices = [];
  	  scope.offerServices = [];
      scope.field = {};
      scope.hists = [];
      scope.tech = [];

      scope.clearPrevArrays = function() {
        scope.offerServices = [];
        scope.field = {};
        scope.hists = [];
        scope.tech = [];
      }

      scope.switchView = function(newView) {
  		 console.log("switchview");
        switch (newView) {
          case scope.viewEnum.NONE:
            scope.clearPrevArrays();
            scope.isShowPersonalField = 0;
            scope.isShowListServices = 0;
  			    scope.isShowServiceOfferField = 0;
            scope.isShowOrderHistory = 0;
            break;
          case scope.viewEnum.PERSONAL:
            scope.clearPrevArrays();
            scope.isShowPersonalField = 1;
            scope.isShowListServices = 0;
  			    scope.isShowServiceOfferField = 0;
            scope.isShowOrderHistory = 0;
            break;
          case scope.viewEnum.SERVICES:
            scope.isShowListServices = 1;
  			    scope.isShowServiceOfferField = 1;
            scope.isShowPersonalField = 0;
            scope.isShowOrderHistory = 0;
            break;
  		  case scope.viewEnum.SERVOFFER:
            scope.clearPrevArrays();
            scope.isShowOrderHistory = 0;
            scope.isShowListServices = 0;
  			    scope.isShowServiceOfferField = 1;
            scope.isShowPersonalField = 0;
            break;
          case scope.viewEnum.HISTORY:
            scope.clearPrevArrays();
            scope.isShowOrderHistory = 1;
            scope.isShowListServices = 0;
  			    scope.isShowServiceOfferField = 0;
            scope.isShowPersonalField = 0;
            break;
        }
      }

      scope.modifyCustomer = function(){
        if (scope.isShowPersonalField == 0) {
          scope.switchView(scope.viewEnum.PERSONAL);
        } else {
          scope.switchView(scope.viewEnum.NONE);
        }
      }

      scope.showOrderHistory = function(){
  		  console.log("showOrderHistory==1");

          if (scope.isShowOrderHistory == 1) {
            scope.switchView(scope.viewEnum.NONE);
          } else {
            scope.switchView(scope.viewEnum.HISTORY);
            http.get('User/serviceHistory/all')
            .then(function(res){
                  scope.hists = res.data;
            })
            .catch(function(err){noDlg.show(scope, err, "Error")});
        }
      }

      scope.postModify = function(){
          //modify!!
          scope.switchView(scope.viewEnum.NONE);
          http.put("User/"+rscope.loggedUser.id, scope.user)
          .then(function(){
            scope.user = {};
            noDlg.show(scope, "Please re-login to see the changes", "NOTE!!!","Message");
            //state.();
          })
          .catch(function(err){noDlg.show(scope, err, "Error")});
      }

      scope.order = function(id, techId){
          http.put('Serv/' + id + "/" + techId + '/Order')
          .then(function(){
            state.reload();
          })
          .catch(function(err){noDlg.show(scope, err, "Error")});
      }

      //Deletes customer account
      scope.deleteCustomer = function () {
          //Asks for deletion confirmation
          if (window.confirm("Are you sure you want to delete your account?"))
          {
              http.delete("User/" + rscope.loggedUser.id)
              .then(function () {
                  state.go('home');
                  logSer.logout();
              })
              .catch(function (err) { noDlg.show(scope, err, "Error") });
          }
      }

      scope.showListServices = function(){
        if (scope.isShowServiceOfferField == 1) {
          scope.switchView(scope.viewEnum.NONE);
        } else {
          scope.switchView(scope.viewEnum.SERVOFFER);
          http.get('Serv/')
          .then(function(response) {
             scope.listServices = response.data;
          })
          .catch(function(err){noDlg.show(scope, err, "Error")});
        }
      }

  	  scope.changedValue = function(item){
  		 if (scope.isShowServiceOfferField == 1) {
  			scope.switchView(scope.viewEnum.SERVICES);
  			http.get('Serv/'+ item.id +'/Services')
          .then(function(response) {
             scope.offerServices = response.data;

             var array = [];
             for (var i = 0; i < scope.offerServices.length; i++) {
               http.get('User/'+ rscope.loggedUser.id + "/" + scope.offerServices[i].technicianId + '/Name')
                 .then(function(response) {
                    array.push((response.data).firstName + " " + (response.data).lastName);
                 })
                 .catch(function(err){noDlg.show(scope, err, "Error")});
             }
             scope.tech = array;

          })
          .catch(function(err){noDlg.show(scope, err, "Error")});
        } else {
  			     scope.switchView(scope.viewEnum.NONE);
        }
  	 }
  }])
