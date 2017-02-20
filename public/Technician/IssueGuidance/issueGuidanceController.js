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
      scope.offerrings[numOfferings] = {"offerId": numOfferings,
                                        "cate": selectedCategoryName,
                                        "cateId": selectedCategoryId,
                                        "offer": {"manus": [],
                                                  "models": [],
                                                  "issues": []},
                                        "display": {"manus": [],
                                                    "models": [],
                                                    "issues": []}}
      numOfferings = numOfferings + 1
    }

    /////           categories              //////

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
      goToNext("Please select Manufacturer(s)", "20%");
      scope.hasConfirmedCate = 1
    }

    /////           Manu              //////
    var onClickConfirmManusHelper2 = function(offerId, indexForLoopingOfferManus)
    {
      http.get('Cate/'+ scope.offerrings[offerId]["cateId"] + '/' +
       scope.offerrings[offerId]["offer"]["manus"][indexForLoopingOfferManus]["manuId"] + '/model') //manuId is not accessible. I have to have loop catch each element
      .then(function(response)
      {
        return response["data"]
      })
      .then(function(prev)
      {
        console.log("dataONE" + JSON.stringify(prev))
        scope.offerrings[offerId]["display"]["models"] = prev
        console.log("data" + JSON.stringify(scope.offerrings))
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    var onClickConfirmManusHelper = function(offerId)
    {
      var offeredManuIdsArray = scope.offerrings[offerId]["offer"]["manus"]
      //console.log(JSON.stringify(scope.offerrings[offerId]["offer"]["manus"]));
      for(var i = 0; i < offeredManuIdsArray.length; i++)
      {
        onClickConfirmManusHelper2(offerId, i)
      }
      console.log("HI" + JSON.stringify(scope.offerrings), null, "    ")
    }

    /// FLow: 1. get all the manus selected in the offerrings
    ///       2. use HTTP calls to get models for a selected manu
    ///       3. put the models from Step 2 in the display of the next column
    ///       Result: Initializes display's field by fetching data from the database
    scope.onClickConfirmManus = function(offerId)
    {
      for(var offerId in scope.offerrings)
      {
        onClickConfirmManusHelper(offerId)
      }
      console.log(JSON.stringify(scope.offerrings))
      scope.hasConfirmedManu = 1
    }

    scope.onClickManu = function(offerId, selectedManuId, selectedManuName)
    {
      console.log(selectedManuId + " || " + selectedManuName)
      scope.offerrings[offerId]["offer"]["manus"].push({"manuId": selectedManuId,
                                                        "manuName": selectedManuName})
    }

    /////           model              //////
    var onClickConfirmModelHelperTwo = function(offerId, indexForLoopingOfferModel)
    {
      http.get('Cate/'+ scope.offerrings[offerId]["offer"]["models"][indexForLoopingOfferModel]["modelId"] + '/issue')
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

    var onClickConfirmModelHelper = function(offerId)
    {
      var arrayForModelInAnOffer = scope.offerrings[offerId]["offer"]["model"]
      for(var i = 0; i < arrayForModelInAnOffer.length; i++)
      {
        onClickConfirmModelHelperTwo(offerId, i)
      }
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

    scope.onClickModel = function(offerId, selectedModelId, selectedModelName)
    {
      scope.offerrings[offerId]["offer"]["model"].push({"modelId": selectedModelId,
                                                        "modelName": selectedModelName})
    }

    /////           issue              //////
    scope.onClickIssue = function(offerId, selectedIssueId, selectedIssueName)
    {
      scope.offerrings[offerId]["offer"]["issue"].push({"issueId": selectedIssueId,
                                                        "issueName": selectedIssueName})
    }

    var goToNext = function(message, percent)
    {
        //if (scope.selectedButtonValues[selected].length != 0)
        //{
            updateProgressBar(message, percent);
        //    return 1
        //}
        //return 0
    }

}]);
