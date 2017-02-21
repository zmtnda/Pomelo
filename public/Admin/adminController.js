app.controller('adminController', ['$scope', '$state', 'users', 'servs', '$http', 'notifyDlg', 'registerPopService', 'addServicePop', function(scope, state, users, servs, http, noDlg, regPopSer, addSerPop) {

    scope.users = users;
    scope.servs = servs;
    scope.wantModify = 0;
    scope.wantModifyP = 0;
    scope.addService = 0;

    scope.addUser = function(){
      regPopSer = regPopSer.show(scope, "Add an User")
      .then(function(){state.reload()});
    }

    scope.addCategory = function(){
      addSerPop = addSerPop.showAddCategory(scope, "Add a Category")
      .then(function(){state.reload()});
    }

    scope.addManufacturer = function(){
      addSerPop = addSerPop.showAddManufacturer(scope, "Add a Manufacturer")
      .then(function(){state.reload()});
    }

    scope.addModel = function(){
      addSerPop = addSerPop.showAddModel(scope, "Add a Model")
      .then(function(){state.reload()});
    }

    scope.postService = function()
    {
        http.post("User/" + 0 + "/Serv", scope.field + "/?admin=true")
        .then(function(){state.go('admin');})
        .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.deleteUser = function(id){
      http.delete("User/" + id)
      .then(function(){
          state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
     }

     /*FOR FUTURE
    scope.modifyUser = function(){
    }*/

    scope.deleteService = function(id){
      http.delete("Serv/" + id)
      .then(function(){
          state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    /* FOR FUTURE
    scope.modifyService = function(id){
        scope.wantModify = 1;
        http.put("User/"+id, scope.user)
        .then(function(){
          noDlg.show(scope, "Please re-login to see the changes", "NOTE!!!")
          state.reload()
        })
        .catch(function(err){noDlg.show(scope, err, "Error")});
    }*/
}])
