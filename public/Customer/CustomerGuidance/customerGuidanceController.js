app.controller('customerGuidanceController', ['$scope', '$state', '$http', "cates", 'notifyDlg',
  function(scope, state, http, cate, notifyDlg)
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

    var checkIfEmpty = function(str)
    {
      if(!str)
      {
        notifyDlg.show(scope, "You haven't entered an input.", "Error!", 'md');
        return false;
      }
      return true;
    }

    scope.onClickNext = function()
    {
      if(!scope.hasEnterZipCode)
      {
        if(checkIfEmpty(scope.customerData.zipCode))
        {
          scope.guidanceMessage = "Please select the category of your device."
          scope.hasEnterZipCode = true
        }
      }
      else if(!scope.hasClickedCate)
      {
        if(checkIfEmpty(scope.customerData.category))
        {
          http.get('Cate/' + scope.customerData.category.id_cat + '/manu')
          .then(function(res){
            scope.manus = res.data
            scope.hasClickedCate = true
          })
        }
      }
      else if(!scope.hasClickedManu)
      {
        if(checkIfEmpty(scope.customerData.manufacturer))
        {
          http.get('Cate/' + scope.customerData.category.id_cat + '/' + scope.customerData.manufacturer.manId + '/model')
          .then(function(res){
            scope.models = res.data
            scope.hasClickedManu = true
          })
        }
      }
      else if(!scope.hasClickedModel)
      {
        if(checkIfEmpty(scope.customerData.model))
        {
          http.get('Cate/' + scope.customerData.model.modelId + '/issues')
          .then(function(res){
            scope.issues = res.data
            scope.hasClickedModel = true
          })
        }
      }
      else if(!scope.hasClickedIssue)
      {
        if(checkIfEmpty(scope.customerData.issue))
        {
          state.get("processingSearch").data.customerData = scope.customerData
          state.go("processingSearch")
        }
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
      /*add animation for the text changes*/
      scope.nextMessage = "Find technicians!!"
      scope.customerData.issue = selectedIssue
    }

    scope.getCateClasses = function(cate){
      console.log("cate: " + cate)
      if(cate === "Desktop")
      {
        console.log("TRUE");
        return {

        //"background-image": "url(" + "./img/deviceCollection/001-computer-2.png" + ")"
       }
      }

    }

  }]);