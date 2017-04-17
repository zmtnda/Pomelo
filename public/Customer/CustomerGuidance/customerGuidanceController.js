app.controller('customerGuidanceController', ['$scope', '$state', '$http', "cates",
  function(scope, state, http, cate)
  {
    scope.customerData = {
      issue: undefined,
      category: undefined,
      manufacturer: undefined,
      model: undefined,
      zipCode: undefined
    }

    scope.hasEnterZipCode = false
    scope.hasMapped = false
    scope.hasClickedCate = false
    scope.hasClickedManu = false
    scope.hasClickedModel = false
    scope.hasClickedIssue = false

    scope.cates = cate
    scope.models = undefined
    scope.manus = undefined
    scope.issues = undefined

    scope.nextMessage = "Next"
    scope.guidanceMessage = "Find technicians in your city"

    scope.onClickNext = function()
    {
      if(!scope.hasEnterZipCode)
      {
        scope.hasEnterZipCode = true
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
        state.get("technicianListing").data.customerData = scope.customerData
        state.go("technicianListing")
      }
    }

    scope.onClickPrevious = function()
    {
      scope.nextMessage = "Next"
      if(scope.hasClickedIssue)
      {
        scope.hasClickedIssue = false
      }
      if(scope.hasClickedModel)
      {
        scope.customerData.issue = undefined
        scope.hasClickedModel = false
      }
      else if(scope.hasClickedManu)
      {
        scope.customerData.model = undefined
        scope.hasClickedManu = false
      }
      else if(scope.hasClickedCate)
      {
        scope.customerData.manufacturer = undefined
        scope.hasClickedCate = false
      }
      else if(scope.hasEnterZipCode)
      {
        scope.customerData.category = undefined
        scope.hasEnterZipCode = false
      }
    }

    scope.onClickCategory = function(selectedCate, selectedId)
    {
      scope.customerData.category = selectedCate
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
      scope.nextMessage = "Find technicians!!"
      scope.customerData.issue = selectedIssue
    }

  }]);
