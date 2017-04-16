app.controller('adminController', ['$scope', '$state', 'users', 'servs', '$http', 'notifyDlg', 'registerPopService', 'cates',
  function(scope, state, users, servs, http, noDlg, regPopSer, cates) {

    //Display diplay in thumbnaills' lists
    scope.users = users;
    scope.servs = servs;
    scope.cates = cates;
    scope.manus = undefined
    scope.models = undefined
    scope.issues = undefined

    //Data display in dropdown lists
    scope.formattedCates = cates.map(function(ea){return JSON.stringify(ea)})
    scope.formattedManusInModel = undefined
    scope.formattedManusInIssue = undefined
    scope.formattedModelInIssue = undefined

    scope.addUser = function(){
      regPopSer.show(scope, "Add an User")
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

      http.get("cate/" + parsedCateDataJSON.id_cat + "/" + parsedManuDataJSON.manId + "/model")
      .then(function(res){
        scope.models = res.data
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    // addIssue tag
    scope.initManDataInIssueTag = function(selectedCate){
      var parsedCateDataJSON = JSON.parse(selectedCate)
      scope.models = []

      http.get("cate/" + parsedCateDataJSON.id_cat + "/manu")
      .then(function(res){
        scope.formattedManusInIssue = res.data.map(function(ea){return JSON.stringify(ea)})
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.initModelDataInIssueTag = function(selectedCate, selectedManu){
      var parsedCateDataJSON = JSON.parse(selectedCate)
      var parsedManuDataJSON = JSON.parse(selectedManu)

      http.get("cate/" + parsedCateDataJSON.id_cat + "/" + parsedManuDataJSON.manId + "/model")
      .then(function(res){
        scope.formattedModelInIssue = res.data.map(function(ea){return JSON.stringify(ea)})
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.initIssueData = function(selectedModel){
      var parsedModelDataJSON = JSON.parse(selectedModel)

      http.get("cate/" + parsedModelDataJSON.modelId + "/issues")
      .then(function(res){
        scope.issues = res.data
      })
      .catch(function(err){noDlg.show(scope, err, "Error")});
    }

    scope.addIssue = function(postingIssue, selectedModel){
      var parsedModelDataJSON = JSON.parse(selectedModel)

      http.post("cate/" + parsedModelDataJSON.modelId + "/issues", {"issue": postingIssue, "issueId": -1})
      .then(function(res){
        state.reload()
      })
      .catch(function(err){noDlg.show(scope, err, "Error", "lg")});
    }
}])
