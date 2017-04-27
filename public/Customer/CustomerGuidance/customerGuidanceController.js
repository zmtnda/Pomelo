app.filter("thumbnailFilter", function(){
    var stateNames = ["thumbnail", "thumbnail activeThumbnail"];
  return function(input) {
    return stateNames[input];
  };
})

app.controller('customerGuidanceController', ['$scope', '$state', '$http', "cates", 'notifyDlg', 'errorMessageFormatter',
  function(scope, state, http, cate, notifyDlg, emf)
  {
    scope.customerData = {
      issue: undefined,
      category: undefined,
      manufacturer: undefined,
      model: undefined,
      zipCode: undefined
    }

    scope.thumbnailStyles = {}

    scope.hasEnterZipCode = false
    scope.hasMapped = false
    scope.hasClickedCate = false
    scope.hasClickedManu = false
    scope.hasClickedModel = false
    scope.hasClickedIssue = false
    scope.isValidZip = true

    scope.cates = cate
    scope.models = undefined
    scope.manus = undefined
    scope.issues = undefined

    scope.nextMessage = "Next"
    scope.guidanceMessage = "Find technicians in your city"
    scope.deviceIcon = "img/deviceCollection/";

    var changeState = function(state)
    {
      if(state === "cate")
      {
          scope.guidanceMessage = "Please select the category of your device."
      }
      else if(state === "manu")
      {
          scope.guidanceMessage = "Please select the brand of your device."
      }
      else if(state === "model")
      {
          scope.guidanceMessage = "What is the model of your device."
      }
      else if(state === "issue")
      {
          scope.guidanceMessage = "Please select the issue you're having."
      }
      else
      {
          scope.guidanceMessage = "Find technicians in your city"
      }
    }

    var checkIfEmpty = function(str)
    {
      if(!str)
      {
        notifyDlg.show(scope, "You haven't entered an input.", "Error!", 'md');
        return false;
      }
      return true;
    }

    var cancelThumbnailStyle = function(type)
    {
        for(var key2 in scope.thumbnailStyles[type])
        {
          if(scope.thumbnailStyles[type][key2] == 1)
          {
            console.log("key2: " + key2)
            scope.thumbnailStyles[type][key2] = 0
          }
        }
    }

    var changeThumbnailStyle = function(type, name)
    {
      if(scope.thumbnailStyles[type] == undefined)
      {
        cancelThumbnailStyle(type)
        scope.thumbnailStyles[type] = {[name]: 1}
      }
      else
      {
        if(scope.thumbnailStyles[type][name] == 1)
          scope.thumbnailStyles[type][name] = 0;
        else
        {
          cancelThumbnailStyle(type)
          console.log("BYE "+JSON.stringify(scope.thumbnailStyles) + "\n type: " + type + "\n  name: " + name)
          scope.thumbnailStyles[type][name] = 1;
        }
      }
    }

    scope.onClickNext = function()
    {
      if(!scope.hasEnterZipCode)
      {
        if(checkIfEmpty(scope.customerData.zipCode))
        {
          changeState("cate")
          scope.hasEnterZipCode = true
        }
      }
      else if(!scope.hasClickedCate)
      {
        if(checkIfEmpty(scope.customerData.category))
        {
          changeState("manu")
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
          changeState("model")
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
          changeState("issue")
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
        changeState("issue")
        scope.hasClickedIssue = false
      }
      if(scope.hasClickedModel)
      {
        cancelThumbnailStyle("issue")
        changeState("model")
        scope.customerData.issue = undefined
        scope.hasClickedModel = false
      }
      else if(scope.hasClickedManu)
      {
        cancelThumbnailStyle("model")
        changeState("manu")
        scope.customerData.model = undefined
        scope.hasClickedManu = false
      }
      else if(scope.hasClickedCate)
      {
        cancelThumbnailStyle("manu")
        changeState("cate")
        scope.customerData.manufacturer = undefined
        scope.hasClickedCate = false
      }
      else if(scope.hasEnterZipCode)
      {
        cancelThumbnailStyle("cate")
        changeState("default")
        scope.customerData.category = undefined
        scope.hasEnterZipCode = false
      }
    }

    scope.onClickCategory = function(selectedCate, selectedId)
    {
      changeThumbnailStyle("cate", selectedCate.category)
      scope.customerData.category = selectedCate
    }

    scope.onClickManu = function(selectedManu)
    {
      changeThumbnailStyle("manu", selectedManu.manufacturer)
      scope.customerData.manufacturer = selectedManu
    }

    scope.onClickModel = function(selectedModel)
    {
      changeThumbnailStyle("model", selectedModel.model)
      scope.customerData.model = selectedModel
    }

    scope.onClickIssue = function(selectedIssue)
    {
      changeThumbnailStyle("issue", selectedIssue.issue)
      /*TODO add animation for the text changes*/
      scope.nextMessage = "Find technicians!!"
      scope.customerData.issue = selectedIssue
    }

    scope.getCateImage = function(cate)
    {
      if(cate.category === "Desktop")
      {
        return "img/deviceCollection/001-computer-2.png"
      }
      else if(cate.category === "Laptop")
      {
        return "img/deviceCollection/019-laptop.png"
      }
      else if(cate.category === "Tablet")
      {
        return "img/deviceCollection/002-apple-2.png"
      }
      else if(cate.category === "Smart Phone")
      {
        return "img/deviceCollection/015-apple.png"
      }
    }

    scope.$watch("customerData.zipCode", function(newVal)
    {
      if(scope.customerData.zipCode != undefined)
      {
        scope.isValidZip =  emf.checkIfValidZipCode(newVal);
      }
    })

  }]);