app.controller('customerGuidanceController', ['$scope', '$state', '$http', "cates",
  function(scope, state, http, cate)
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
    scope.hasClickedIssue = false

    scope.cates = cate
    scope.models = undefined
    scope.manus = undefined
    scope.issues = undefined

    scope.onClickNext = function()
    {
      if(!scope.hasGone)
      {
        scope.hasGone = true
      }
      else if(!scope.hasClickedCate)
      {
        http.get('Cate/' + scope.customerData.category.id_cat + '/manu')
        .then(function(res){
          scope.manus = res.data
          scope.hasClickedCate = true
        })
      }
      else if(!scope.hasClickedManu)
      {
        http.get('Cate/' + scope.customerData.category.id_cat + '/' + scope.customerData.manufacturer.manId + '/model')
        .then(function(res){
          scope.models = res.data
          scope.hasClickedManu = true
        })
      }
      else if(!scope.hasClickedModel)
      {
        http.get('Cate/' + scope.customerData.model.modelId + '/issues')
        .then(function(res){
          scope.issues = res.data
          scope.hasClickedModel = true
        })
      }
      else if(!scope.hasClickedIssue)
      {


      }
    }

    scope.onClickPrevious = function()
    {
      if(scope.hasClickedIssue)
      {
        scope.hasClickedIssue = false
      }
      if(scope.hasClickedModel)
      {
        scope.hasClickedModel = false
      }
      else if(scope.hasClickedManu)
      {
        scope.hasClickedManu = false
      }
      else if(scope.hasClickedCate)
      {
        scope.hasClickedCate = false
      }
      else if(scope.hasGone)
      {
        scope.hasGone = false
      }
    }

    scope.onClickCategory = function(selectedCate, selectedId)
    {
      scope.customerData.category = selectedCate
      console.log("selectID  " + selectedId)
      var selection = angular.elemenet(document.querySelector(selectedId))
      selection.addClass('buttonFocus')
    }

    scope.onClickManu = function(selectedManu)
    {
      scope.customerData.manufacturer = selectedManu
    }

    scope.onClickModel = function(selectedModel)
    {
      scope.customerData.model = selectedModel
    }

    scope.onClickIssue = function(selectedIssue)
    {

    }
  }]);
