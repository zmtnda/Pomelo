app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'cates',
  function(scope, state, logSer, http, rscope, noDlg, cates)
  {
    /*IMPORTANT NOTE:
     1. The rest API uses manId while the controller uses manuId*/
    scope.progressMessage = "Please select the general type you can fix"

    var progressStages = {
      "cateStage": {"message": "Please select the general catergoies you can fix",
                    "percent": "0%"
                   },
      "manuStage": {"message": "Please select manufacturer(s)",
                    "percent": "20%"
                   },
      "modelStage": {"message": "Please select model(s)",
                    "percent": "40%"
                   },
      "issueStage": {"message": "Please select issue(s)",
                    "percent": "60%"
                   },
      "finalStage": {"message": "Please finalize your offers(s)",
                    "percent": "80%"
                  },
      "confirmAllOfferingsStage": {
                     "message": "Congrats!",
                     "percent": "100%"
                  }
    }
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

    /////           helpers functions shared by some other functions              //////
    var checkWhetherAFieldInJSONEmpty = function(fieldName)
    {
      var isAllEmpty = false

      for(var offerId in scope.offerrings)
      {
        if(!angular.equals(scope.offerrings[offerId]["offer"][fieldName], []) ||
         !angular.equals(scope.offerrings[offerId]["offer"][fieldName], undefined) ||
         !angular.equals(scope.offerrings[offerId]["offer"][fieldName], null) ||
         !angular.equals(scope.offerrings[offerId]["offer"][fieldName], {}))
        {
          isAllEmpty = true
        }
      }

      return isAllEmpty
    }

    var updateProgressBar = function(stage)
    {
      scope.progressMessage = progressStages[stage].message
      scope.progressPercentage = progressStages[stage].percent
      scope.progressBarDisplay = {"width": progressStages[stage].percent}
    }

    var checkDuplicate = function(arr, obj, inputField, expectedDupVal)
    {
      var bool = false
      arr.forEach(function(ea){
        if(ea[inputField] === expectedDupVal)
          bool = true
      });
      return bool
    }

    /// FLow: 1. get all the manus selected in the offerrings
    ///       2. use HTTP calls to get models for a selected manu
    ///       3. put the models from Step 2 in the display of the next column
    ///       Result: Initializes display's field by fetching data from the database

    /////           categories              //////

    scope.onClickCategory = function(selectedCategoryId, selectedCategoryName)
    {
      var dup = false;
      var newOffer =  {"amount": undefined,
                        "offerId": numOfferings,
                        "cateButtonStyle": 0,
                        "cate": selectedCategoryName,
                        "cateId": selectedCategoryId,
                        "offer": {"manus": [],
                                  "models": [],
                                  "issues": []},
                        "display": {"manus": [],
                                    "models": [],
                                    "issues": []}}

      for(var i = 0; i < Object.keys(scope.offerrings).length; i++)
      {
        if(scope.offerrings[i]["cate"] === selectedCategoryName)
          dup = true;
      }

      if(!dup)
      {
        scope.offerrings[numOfferings] = newOffer
        numOfferings = numOfferings + 1
      }
      else
      {
        noDlg.show(scope, "You have selected " + selectedCategoryName + " before", "Warning")
      }
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
        prev.forEach(function(element)
        {
          scope.offerrings[offerId]["display"]["manus"].push({"manId": element["manId"],
                                                              "manufacturer": element["manufacturer"],
                                                              "manuButtonStyle": 0})
        })
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    scope.onClickRedoCategory = function()
    {
      numOfferings = 0;
      scope.hasConfirmedCate = 0
      scope.hasConfirmedManu = 0
      scope.hasConfirmedModel = 0
      scope.hasConfirmedIssue = 0
      updateProgressBar("cateStage");
      scope.offerrings = {}
    }

    scope.onClickConfirmCategory = function()
    {
      if(!angular.equals(scope.offerrings, {}))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmCategoryHelper(offerId)
        }
        updateProgressBar("manuStage");
        scope.hasConfirmedCate = 1
      }
      else
      {
        noDlg.show(scope, "You forgot to select a category", "Warning")
      }
    }

    /////           Manu              //////
    var onClickConfirmManusHelper3 = function(offerId, manuId)
    {
      http.get('Cate/'+ scope.offerrings[offerId]["cateId"] + '/' +
        manuId + '/model') //manuId is not accessible. I have to have loop catch each element
      .then(function(response)
      {
        return response["data"]
      })
      .then(function(prev)
      {
        prev.forEach(function(element)
        {
          scope.offerrings[offerId]["display"]["models"].push({"model": element["model"],
                                                               "modelButtonStyle": 0,
                                                               "modelId": element["modelId"],
                                                               "correspondingManuId": manuId})
        })
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    var onClickConfirmManusHelper2 = function(offerId, indexForLoopingOfferManus)
    {
      var manuId = scope.offerrings[offerId]["offer"]["manus"][indexForLoopingOfferManus]["manuId"]
      onClickConfirmManusHelper3(offerId, manuId)
    }

    var onClickConfirmManusHelper = function(offerId)
    {
      var offeredManuIdsArray = scope.offerrings[offerId]["offer"]["manus"]

      for(var i = 0; i < offeredManuIdsArray.length; i++)
      {
        onClickConfirmManusHelper2(offerId, i)
      }
    }

    scope.onClickRedoManus = function()
    {
      scope.hasConfirmedManu = 0
      scope.hasConfirmedModel = 0
      scope.hasConfirmedIssue = 0

      for(var i in scope.offerrings)
      {
        scope.offerrings[i]["offer"]["manus"] = []
      }
    }

    scope.onClickConfirmManus = function()
    {
      if(checkWhetherAFieldInJSONEmpty("manus"))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmManusHelper(offerId)
        }
        scope.hasConfirmedManu = 1
        updateProgressBar("modelStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select a manufacturer", "Warning")
      }
    }

    scope.onClickManu = function(offerId, selectedManuId, selectedManuName, manuButtonStyle)
    {
      var newManu = {"manuId": selectedManuId,
                     "manuName": selectedManuName}
      if(!checkDuplicate(scope.offerrings[offerId]["offer"]["manus"], newManu,  "manuName", selectedManuName))
      {
        scope.offerrings[offerId]["offer"]["manus"].push(newManu)
      }
      else
      {
        noDlg.show(scope, "You have selected " + selectedManuName + " before", "Warning")
      }
    }

    /////           model              //////
    var onClickConfirmModelHelperThree = function(offerId, modelId)
    {
      http.get('Cate/'+ modelId + '/issues')
      .then(function(response)
      {
        return response["data"]
      })
      .then(function(prev)
      {
        prev.forEach(function(element)
        {
          scope.offerrings[offerId]["display"]["issues"].push({"issueId" : element["issueId"],
                                                               "issueButtonStyle": 0,
                                                               "issue" : element["issue"],
                                                               "correspondingModelId": modelId})
        })
      })
      .catch(function(err){
        noDlg.show(scope, err, "Error")
      })
    }

    var onClickConfirmModelHelperTwo = function(offerId, indexForLoopingOfferModel)
    {
      var modelId = scope.offerrings[offerId]["offer"]["models"][indexForLoopingOfferModel]["modelId"]
      onClickConfirmModelHelperThree(offerId, modelId)
    }

    var onClickConfirmModelHelper = function(offerId)
    {
      var arrayForModelInAnOffer = scope.offerrings[offerId]["offer"]["models"]
      for(var i = 0; i < arrayForModelInAnOffer.length; i++)
      {
        onClickConfirmModelHelperTwo(offerId, i)
      }
    }

    scope.onClickRedoModels = function()
    {
      scope.hasConfirmedModel = 0
      scope.hasConfirmedIssue = 0

      for(var i in scope.offerrings)
      {
        //scope.offerrings[i]["display"]["models"] = []
        scope.offerrings[i]["offer"]["models"] = []
      }
    }

    scope.onClickConfirmModel = function()
    {
      if(checkWhetherAFieldInJSONEmpty("models"))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmModelHelper(offerId)
        }
        scope.hasConfirmedModel = 1
        updateProgressBar("issueStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select a model", "Warning")
      }
    }

    scope.onClickModel = function(offerId, selectedModelId, selectedModelName)
    {
      var newModel = {"modelId": selectedModelId,
                      "modelName": selectedModelName}

      if(!checkDuplicate(scope.offerrings[offerId]["offer"]["models"], newModel,  "modelName", selectedModelName))
      {
        scope.offerrings[offerId]["offer"]["models"].push(newModel)
      }
      else
      {
        noDlg.show(scope, "You have selected " + selectedModelName + " before", "Warning")
      }
    }

    /////           issue              //////
    scope.onClickConfirmIssue = function()
    {
      if(checkWhetherAFieldInJSONEmpty("issues"))
      {
        scope.hasConfirmedIssue= 1
        updateProgressBar("finalStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select an issue", "Warning")
      }
    }

    scope.onClickRedoModels = function()
    {
      scope.hasConfirmedIssue = 0

      for(var i in scope.offerrings)
      {
        scope.offerrings[i]["display"]["issues"] = []
        scope.offerrings[i]["offer"]["issues"] = []
      }
    }

    scope.onClickIssue = function(offerId, selectedIssueId, selectedIssueName)
    {
      var newIssue = {"issueId": selectedIssueId,
                      "issueName": selectedIssueName}
      if(!checkDuplicate(scope.offerrings[offerId]["offer"]["issues"], newIssue,  "issueName", selectedIssueName))
      {
        scope.offerrings[offerId]["offer"]["issues"].push(newIssue)
      }
      else
      {
        noDlg.show(scope, "You have selected "+ selectedIssueName +" issue before", "Denied")
      }
    }

    /////           Amount              //////
    scope.onConfirmAllOfferrings = function()
    {
      if(checkWhetherAFieldInJSONEmpty("amount"))
      {
        updateProgressBar("confirmAllOfferingsStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to enter prices", "Warning")
      }
    }

}]);
