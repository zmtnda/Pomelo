app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'cates',
  function(scope, state, logSer, http, rscope, noDlg, cates)
  {
    scope.progressMessage = "Please select the general type you can fix"

    // Store the data of the buttons seletced by the user
    scope.selectedButtonValues = {
      "selectedType": [],
      "selectedManu": [],
      "selectedModel": [],
      "selectedIssue": []
    }

    // A set of boolean that indicates which column has been confirmed
    scope.hasConfirmedCate = 0
    scope.hasConfirmedManu = 0
    scope.hasConfirmedModel = 0
    scope.hasConfirmedIssue = 0

    // Data fetched from DB:
    scope.user = {};

    // Initializes all categories
    scope.allCates = cates

    scope.offerrings = { }
    var numOfferings = 0

    scope.typeButtonStatesArray = []
    scope.manuButtonStatesJSON = {}
    scope.modelButtonStatesJSON = {}
    scope.issueButtonStatesJSON = {}

    // Style for the progress bar
    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "0%"
    scope.progressBarDisplay = {"width": "0%"};

    var updateProgressBar = function(message, percent)
    {
      scope.progressMessage = message
      scope.progressPercentage = percent
      scope.progressBarDisplay = {"width": percent};
    }

    scope.onClickCategory = function(selectedCategoryId, selectedCategoryName)
    {
      scope.offerrings[numOfferings] = {"cate": selectedCategoryName,
                                        "cateId": selectedCategoryId,
                                        "offer": {"manus": [],
                                                  "models": [],
                                                  "issues": []},
                                        "display": {"manus": [],
                                                    "models": [],
                                                    "issues": []}}
      numOfferings = numOfferings + 1
    }

    // A helper that avoids http calls share the same enviroment.
    var onClickConfirmCategoryHelper = function(offerId)
    {
      http.get('Cate/'+ scope.offerrings[offerId]["cateId"] + '/manu')
      .then(function(response)
      {
        return response["data"]
      })
      .then(function(prev)
      {
        scope.offerrings[offerId]["display"]["manus"] = prev
        console.log(JSON.stringify(scope.offerrings[offerId]["display"]["manus"]))
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    scope.onClickConfirmCategory = function()
    {
      for(var offerId in scope.offerrings)
      {
        onClickConfirmCategoryHelper(offerId)
      }
      scope.hasConfirmedCate = 1
    }

    var onClickConfirmManusHelper = function(offerId)
    {
      console.log(JSON.stringify(scope.offerrings));
      http.get('Cate/'+ scope.offerrings[offerId]["cateId"] + '/' +
       scope.offerrings[offerId]["offer"]["manus"]["manuId"] + '/manu')
      .then(function(response)
      {
        return response["modelId"]
      })
      .then(function()
      {
        scope.offerrings[offerId]["display"]["models"] = prev
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    scope.onClickConfirmManus = function(offerId)
    {
      for(var offerId in scope.offerrings)
      {
        onClickConfirmManusHelper(offerId)
      }
      scope.hasConfirmedManu = 1
    }

    var onClickConfirmModelHelper = function(offerId)
    {
      http.get('Cate/'+ scope.offerrings[offerId]["offer"]["models"]["modelId"] + '/issue')
      .then(function(response){
        return response["issueId"]
      })
      .then(function(prev){
        scope.offerrings[offerId]["display"]["issues"].push(prev)
      })
      .catch(function(err){
        noDlg.show(scope, err, "Error")
      })
    }

    scope.onClickConfirmModel = function(offerId)
    {
      var arrayForIssueInAnOffer = scope.offerrings[offerId]["offer"]["issue"]
      var correspondingIssue = undefined

      for(var i = 0; i < arrayForIssueInAnOffer.length; i++)
      {
        onClickConfirmModelHelper(offerId)
      }
    }

    scope.onClickManu = function(offerId, selectedManuId, selectedManuName)
    {
      console.log(selectedManuId + " || " + selectedManuName)
      scope.offerrings[offerId]["offer"]["manus"].push({"manuId": selectedManuId,
                                                        "manuName": selectedManuName})
    }

    scope.onClickModel = function(offerId, selectedModelId, selectedModelName)
    {
      scope.offerrings[offerId]["offer"]["model"].push({"modelId": selectedModelId,
                                                        "modelName": selectedModelName})
    }

    scope.onClickIssue = function(offerId, selectedIssueId, selectedIssueName)
    {
      scope.offerrings[offerId]["offer"]["issue"].push({"issueId": selectedIssueId,
                                                        "issueName": selectedIssueName})
    }

    scope.canGoToNext = function(selected, message, percent)
    {
        if (scope.selectedButtonValues[selected].length != 0)
        {
            updateProgressBar(message, percent);
            return 1
        }
        return 0
    }

}]);
