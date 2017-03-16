app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'cates','notifyDlg', 'goToServices',
  function(scope, state, logSer, http, rscope, noDlg, cates, nDlg, goto)
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

    scope.serviceType = [
            {name : "Item Based Service ($/Item)", id : 0},
            {name : "Time Based Service ($/Hour)", id : 1}];

    // A set of boolean that indicates which column has been confirmed
    scope.hasConfirmedCate = false
    scope.hasConfirmedManu = false
    scope.hasConfirmedModel = false
    scope.hasConfirmedIssue = false

    // Initializes all categories
    scope.allCates = cates

    scope.offerrings = []
    scope.postoffers = {}

    var numOfferings = 0

    scope.typeButtonStatesArray = []
    scope.manuButtonStatesJSON = {}
    scope.modelButtonStatesJSON = {}
    scope.issueButtonStatesJSON = {}

    // Style for the progress bar
    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "0%"
    scope.progressBarDisplay = {"width": "0%"};

    scope.disableTagButton = {'visibility': 'hidden'}; // then button will hidden.
    scope.disableTagButton = {'visibility': 'visible'}; // then button will visible.

    /////           helpers functions shared by some other functions              //////
    var checkWhetherHasAFieldInJSON = function(fieldName)
    {
      for(var offerId in scope.offerrings)
      {
        if(!scope.offerrings[offerId]["offer"][fieldName] ||
         scope.offerrings[offerId]["offer"][fieldName].length === 0)
        {
          return false;
        }
      }
      return true
    }

    var updateProgressBar = function(stage)
    {
      scope.progressMessage = progressStages[stage].message
      scope.progressPercentage = progressStages[stage].percent
      scope.progressBarDisplay = {"width": progressStages[stage].percent}
    }

    var popAnElement = function(offerId, type, checkingField, findingName, correspondingModelId)
    {
      var loopingArray = scope.offerrings[offerId]["offer"][type]
      if(type === "issues")
      {
        for(var i = 0; i < loopingArray.length; i++)
        {
          if(correspondingModelId === scope.offerrings[offerId]["offer"][type][i]["correspondingModelId"] &&
             scope.offerrings[offerId]["offer"][type][i][checkingField] === findingName)
          {
            scope.offerrings[offerId]["offer"][type].splice(i, 1);
          }
        }
      }
      else
      {
        for(var i = 0; i < loopingArray.length; i++)
        {
          if(scope.offerrings[offerId]["offer"][type][i][checkingField] === findingName)
          {
             scope.offerrings[offerId]["offer"][type].splice(i, 1);
          }
        }
      }
    }

    // return true if the button turn from white to grey; otherwise, false
    var changeButtonStyle = function(type, offerId, checkingField, findingName, buttonStyleName, correspondingModelId)
    {
      var loopingArray = scope.offerrings[offerId]["display"][type]
      var counter = 0;
      var checkingTheRightElementInTheArray

      if(type === "issues")
      {
        for(var i = 0; i < loopingArray.length; i++)
        {
          checkingTheRightElementInTheArray = (scope.offerrings[offerId]["display"][type][i][checkingField] === findingName &&
                                              correspondingModelId === scope.offerrings[offerId]["display"][type][i]["correspondingModelId"])

          if(checkingTheRightElementInTheArray && scope.offerrings[offerId]["display"][type][i][buttonStyleName] === 0)
           {
             scope.offerrings[offerId]["display"][type][i][buttonStyleName] = 1
             return true
           }
           else if (checkingTheRightElementInTheArray && scope.offerrings[offerId]["display"][type][i][buttonStyleName] === 1)
           {
             scope.offerrings[offerId]["display"][type][i][buttonStyleName] = 0
             return false
           }
         }
      }
      else
      {
        for(var i = 0; i < loopingArray.length; i++)
        {
          if(scope.offerrings[offerId]["display"][type][i][checkingField] === findingName)
          {
             if(scope.offerrings[offerId]["display"][type][i][buttonStyleName] === 0)
             {
               scope.offerrings[offerId]["display"][type][i][buttonStyleName] = 1
               return true;
             }
             else
             {
               scope.offerrings[offerId]["display"][type][i][buttonStyleName] = 0
               return false;
             }
          }
        }
      }

      return false
    }

    var checkDuplicate = function(arr, obj, inputField, expectedDupVal, correspondingModelId)
    {
      var bool = false
      if(correspondingModelId)
      {
        arr.forEach(function(ea){
          if(ea[inputField] === expectedDupVal && ea[inputField].correspondingModelId === correspondingModelId)
            bool = true
        });
      }
      else
      {
        arr.forEach(function(ea){
          if(ea[inputField] === expectedDupVal)
            bool = true
        });
      }

      return bool
    }

    /// FLow: 1. get all the manus selected in the offerrings
    ///       2. use HTTP calls to get models for a selected manu
    ///       3. put the models from Step 2 in the display of the next column
    ///       Result: Initializes display's field by fetching data from the database

    /////           categories              //////
    scope.onClickCategory = function(selectedCategoryId, selectedCategoryName, selectedCategoryIndex)
    {
      var selected = false;
      var newOffer =  {"offerId": numOfferings,
                        "cateButtonStyle": 0,
                        "cate": selectedCategoryName,
                        "cateId": selectedCategoryId,
                        "offer": {"manus": [],
                                  "models": [],
                                  "issues": []},
                        "display": {"manus": [],
                                    "models": [],
                                    "issues": []}}

      // Reason for creating extra logic: changeButtonStyle() only handles display array
      for(var i = 0; i < Object.keys(scope.offerrings).length; i++)
      {
        if(scope.offerrings[i]["cate"] === selectedCategoryName &&
           scope.allCates[selectedCategoryIndex]["cateButtonStyle"] === 1)
        {
          scope.offerrings.splice(i, 1);
          scope.allCates[selectedCategoryIndex]["cateButtonStyle"] = 0
          numOfferings = numOfferings - 1
          selected = true
        }
      }

      if(!selected)
      {
        scope.offerrings[numOfferings] = newOffer
        numOfferings = numOfferings + 1
        scope.allCates[selectedCategoryIndex]["cateButtonStyle"] = 1
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
                                                              "catMan_id": element["catMan_id"],
                                                              "manufacturer": element["manufacturer"],
                                                              "manuButtonStyle": 0})
        })
      })
      .catch(function(err)
      {
        noDlg.show(scope, err, "Error")
      })
    }

    scope.onClickConfirmCategory = function()
    {
      if(!angular.equals(scope.offerrings, []))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmCategoryHelper(offerId)
        }
        updateProgressBar("manuStage");
        scope.hasConfirmedCate = true
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
      scope.hasConfirmedCate = false
      scope.hasConfirmedManu = false
      scope.hasConfirmedModel = false
      scope.hasConfirmedIssue = false

      for(var i in scope.offerrings)
      {
        scope.offerrings[i]["offer"]["manus"] = []
        scope.offerrings[i]["display"]["manus"] = []
      }

      updateProgressBar("cateStage")
    }

    scope.onClickConfirmManus = function()
    {
      if(checkWhetherHasAFieldInJSON("manus"))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmManusHelper(offerId)
        }
        scope.hasConfirmedManu = true
        updateProgressBar("modelStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select a manufacturer", "Warning")
      }
    }

    scope.onClickManu = function(offerId, selectedManuId, selectedCatMan_id, selectedManuName, manuButtonStyle)
    {
       var newManu = {"manuId": selectedManuId,
                     "catMan_id": selectedCatMan_id,
                     "manuName": selectedManuName}
       if(changeButtonStyle("manus", offerId, "manufacturer", selectedManuName, "manuButtonStyle"))
       {
         scope.offerrings[offerId]["offer"]["manus"].push(newManu)
       }
       else
       {
         popAnElement(offerId, "manus", "manuName", selectedManuName)
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
                                                               "modIss_Id": element["modIssId"],
                                                               "correspondingModelId": modelId})
        })
      })
      .catch(function(err)
      {
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
      scope.hasConfirmedManu = false
      scope.hasConfirmedModel = false
      scope.hasConfirmedIssue = false

      for(var i in scope.offerrings)
      {
        scope.offerrings[i]["offer"]["models"] = []
        scope.offerrings[i]["display"]["models"] = []
      }

      updateProgressBar("manuStage")
    }

    scope.onClickConfirmModel = function()
    {
      if(checkWhetherHasAFieldInJSON("models"))
      {
        for(var offerId in scope.offerrings)
        {
          onClickConfirmModelHelper(offerId)
        }
        scope.hasConfirmedModel = true
        updateProgressBar("issueStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select a model", "Warning")
      }
    }

    scope.onClickModel = function(offerId, selectedModelId, selectedModelName, correspondingManuId)
    {
      var newModel = {"modelId": selectedModelId,
                      "modelName": selectedModelName,
                      "correspondingManuId": correspondingManuId}// I added correspondingManuId in order to fix issue #123

      if(changeButtonStyle("models", offerId, "model", selectedModelName, "modelButtonStyle"))
      {
        scope.offerrings[offerId]["offer"]["models"].push(newModel)
      }
      else
      {
        popAnElement(offerId, "models", "modelName", selectedModelName)
      }
    }

    /////           issue              //////
    scope.onClickConfirmIssue = function()
    {
      if(checkWhetherHasAFieldInJSON("issues"))
      {
        scope.hasConfirmedIssue= true
        updateProgressBar("finalStage");
      }
      else
      {
        noDlg.show(scope, "You forgot to select an issue", "Warning")
      }
    }

    scope.onClickIssue = function(offerId, selectedIssueId, selectedModIss_Id, selectedIssueName, correspondingModelId, correspondingModelName)
    {
      var newIssue = {"issueId": selectedIssueId,
                      "correspondingModelId": correspondingModelId, // added correspondingModelId in order to make popAnElement() works
                      "correspondingModelName": correspondingModelName,
                      "modIss_Id": selectedModIss_Id,
                      "issueName": selectedIssueName}

      if(changeButtonStyle("issues", offerId, "issue", selectedIssueName, "issueButtonStyle", correspondingModelId))
      {
        scope.offerrings[offerId]["offer"]["issues"].push(newIssue)
      }
      else
      {
        popAnElement(offerId, "issues", "issueName", selectedIssueName, correspondingModelId)
      }
    }

    scope.onClickRedoIssues = function()
    {
      scope.hasConfirmedModel = false
      scope.hasConfirmedIssue = false

      for(var i in scope.offerrings)
      {
        scope.offerrings[i]["offer"]["issues"] = []
        scope.offerrings[i]["display"]["issues"] = []
      }

      updateProgressBar("modelStage")
    }


    scope.onConfirmAllOfferrings = function()
    {
        updateProgressBar("confirmAllOfferingsStage");
        console.log("LEOS JSON!!!!" + JSON.stringify(scope.offerrings));
        var offer = {};
        offer["tec_Id"] = rscope.loggedUser.tec_id;
        var catman = [];
        var modIss = [];
        var serviceType = [];
        var amount = [];

        for(var i = 0; i < scope.offerrings.length; i++)
        {
          for(var j = 0; j < scope.offerrings[i]["offer"]["manus"].length; j++){
            catman.push(scope.offerrings[i]["offer"]["manus"][j]["catMan_id"]);
          }
          for(var j = 0; j < scope.offerrings[i]["offer"]["issues"].length; j++){
            modIss.push(scope.offerrings[i]["offer"]["issues"][j]["modIss_Id"]);
            serviceType.push(scope.offerrings[i]["offer"]["issues"][j]["serviceType"]);
            amount.push(scope.offerrings[i]["offer"]["issues"][j]["amount"]);
          }
        }
        offer["catMan_Id"] = catman;
        offer["modIss_Id"] = modIss;
        offer["servType"] = serviceType;
        offer["amount"] = amount;

        scope.postoffers["offer"] = offer;
        console.log("MY JSON!!!!" + JSON.stringify(scope.postoffers));
        http.post("serv/" + rscope.loggedUser.tec_id, scope.postoffers)
          .then(function(response)
          {
            nDlg.show(rscope, "Your services has been added successfully");
            goto.goToTechnician();
            return response["data"]
          })
    }
}]);
