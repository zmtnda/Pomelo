app.controller('customerGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', "cates",
  function(scope, state, logSer, http, rscope, noDlg, goto, cate)
  {
    scope.customerData = {
      issue: undefined,
      category: undefined,
      manufacturer: undefined,
      model: undefined,
    }

    scope.hasGone = false
    scope.hasMapped = false
    scope.hasClickedCate = false
    scope.hasClickedManu = false
    scope.hasClickedModel = false

    scope.cates = cate
    scope.models = undefined
    scope.manus = undefined
    scope.issues = undefined

    scope.showMap = function()
    {
      scope.hasGone = true
    }

    scope.showCategory = function(){
      scope.hasMapped = true
      scope.hasGone = false

    }

    scope.onClickCategory = function(selectedCate){
      http.get('Cate/' + selectedCate.id_cat + '/manu')
      .then(function(res){
        scope.manus = res.data
        scope.customerData.category = selectedCate
        scope.hasClickedCate = true
      })
    }

    scope.onClickManu = function(selectedManu){
      http.get('Cate/' + scope.customerData.category.id_cat + '/' + selectedManu.manId + '/model')
      .then(function(res){
        scope.models = res.data
        scope.customerData.manufacturer = selectedManu
        scope.hasClickedManu = true
      })
    }

    scope.onClickModel = function(selectedModel){
      http.get('Cate/' + selectedModel.modelId + '/issues')
      .then(function(res){
        scope.issues = res.data
        scope.customerData.model = selectedModel
        scope.hasClickedModel = true
      })
    }

    scope.onClickIssue = function(selectedModel){
      /*http.get('Cate/' + selectedModel.modelId + '/issue')
      .then(function(res){
        scope.issues = res.data
        scope.customerData.model = selectedModel
        scope.hasClickedModel = true
      })*/
    }


  }]);
