app.controller('adminController', ['$scope', '$state', 'users', 'servs', '$http', 'notifyDlg', 'registerPopService', 'addServicePop', 'cates',
  function(scope, state, users, servs, http, noDlg, regPopSer, addSerPop, cates) {

    //Display diplay in thumbnaills' lists
    scope.users = users;
    scope.servs = servs;
    scope.cates = cates;
    scope.manus = undefined;
    scope.models = undefined

    //Data display in dropdown lists
    scope.formattedCates = cates.map(function(ea){return JSON.stringify(ea)})
    scope.formattedManusInModel = undefined

    scope.addUser = function(){
      regPopSer = regPopSer.show(scope, "Add an User")
      .then(function(){state.reload()});
    }

    // addCategory tag
    scope.addCategory = function(newCate){
      http.post("cate/", {"newCategory": newCate})
      .then(function(){
        state.reload();
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    // addManufacturer tag
    scope.initManData = function(cateData){
      var parsedCateDataJSON = JSON.parse(cateData)

      http.get("cate/" + parsedCateDataJSON.id_cat + "/manu")
      .then(function(res){
        scope.manus = res.data
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.addManufacturer = function(postingManu, selectedCate){
      var parsedSelectedCateJSON = JSON.parse(selectedCate)

      http.post("cate/" + parsedSelectedCateJSON.id_cat + "/manu", {"newManufacturer": postingManu})
      .then(function(res){
        state.reload()
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    // addModel tag
    // It initialize data in the dropdown list of "Select a manufacturer"
    scope.initManDataInModelTag = function(selectedCate){
      var parsedCateDataJSON = JSON.parse(selectedCate)
      scope.models = []
      
      http.get("cate/" + parsedCateDataJSON.id_cat + "/manu")
      .then(function(res){
        scope.formattedManusInModel = res.data.map(function(ea){return JSON.stringify(ea)})
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.addModel = function(postingModel, selectedCate, selectedManu){
      var parsedCateDataJSON = JSON.parse(selectedCate)
      var parsedManuDataJSON = JSON.parse(selectedManu)

      http.post("cate/" + parsedCateDataJSON.id_cat + "/" + parsedManuDataJSON.manId + "/model", {"newModel": postingModel})
      .then(function(res){
        state.reload()
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.initModelData = function(selectedCate, selectedManu){
      var parsedCateDataJSON = JSON.parse(selectedCate)
      var parsedManuDataJSON = JSON.parse(selectedManu)
      console.log("???" + selectedManu)
      http.get("cate/" + parsedCateDataJSON.id_cat + "/" + parsedManuDataJSON.manId + "/model")
      .then(function(res){
        scope.models = res.data
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
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
