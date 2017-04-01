app.controller('adminController', ['$scope', '$state', 'users', 'servs', '$http', 'notifyDlg', 'registerPopService', 'addServicePop', 'cates',
  function(scope, state, users, servs, http, noDlg, regPopSer, addSerPop, cates) {

    scope.users = users;
    scope.servs = servs;
    scope.cates = cates;
    scope.postingModel = "Enter a new category here"
    scope.selection = undefined; // for dropdown lists

    scope.addUser = function(){
      regPopSer = regPopSer.show(scope, "Add an User")
      .then(function(){state.reload()});
    }

    scope.addCategory = function(newCate){
      http.post("cate/", {"newCategory": newCate})
      .then(function(){
        state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.addManufacturer = function(){
      //TODO
    }

    scope.addModel = function(){
      //TODO
    }

    scope.postService = function()
    {
      //TODO
      http.post("User/" + 0 + "/Serv", scope.field + "/?admin=true")
      .then(function(){state.go('admin');})
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.deleteUser = function(id){
      //TODO
      http.delete("User/" + id)
      .then(function(){
          state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
     }

    scope.modifyUser = function(){
      //TODO
    }

    scope.deleteService = function(id){
      http.delete("Serv/" + id)
      .then(function(){
          state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.modifyService = function(id){
        //TODO
    }
}])
