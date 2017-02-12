app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg',
  function(scope, state, logSer, http, rscope, noDlg, cate)
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
    scope.hasSelectedType = 0
    scope.hasSelectedManu = 0
    scope.hasSelectedModel = 0
    scope.hasSelectedIssue = 0

    // Data fetched from DB:
    scope.user = {};
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software", "Tablet"]
    scope.allManufacturers = ["Apple", "Sony", "Samsung", "Google", "Dell", "ASUS"]

    // Data being displayed
    scope.manufacturers = ["Apple", "Sony", "Samsung", "Google", "Dell", "ASUS"]
    scope.models = ["iPhone 6"]
    scope.issues = ["Cracked Screen", "Broken Keyboard"]
    scope.offerings = [[], [], [], []]
    
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

    var canGoToNext = function(selected, message, percent)
    {
        if (scope.selectedButtonValues[selected].length != 0)
        {
            updateProgressBar(message, percent);
            return 1
        }
        return 0
    }

    scope.confirm = function(input)
    {
      if(input === "type")
      {
        if (canGoToNext("selectedType", "Select the Manufacturers", "20%"))
          scope.hasSelectedType = true
      }
      else if(input === "manu")
      {
        if (canGoToNext("selectedManu", "Select a model", "40%"))
          scope.hasSelectedManu = true
      }
      else if(input === "model")
      {
        if (canGoToNext("selectedModel", "Select a model", "60%"))
          scope.hasSelectedModel = true
      }
      else if(input === "issue")
      {
        if (canGoToNext("selectedIssue", "Select an issue", "80%"))
          scope.hasSelectedIssue = true
      }
    }

    // find a way to keep track of index
    scope.selectType = function(selectedType, typeInIndex)
    {
      if (scope.typeButtonStatesArray[typeInIndex] === 1)
        scope.typeButtonStatesArray[typeInIndex] = 0
      else {
        scope.typeButtonStatesArray[typeInIndex] = 1
        scope.selectedButtonValues["selectedType"].push(selectedType)
      }
    }

    scope.selectManu = function(selectedManu, selectedType, manuInIndex)
    {
      if (scope.manuButtonStatesJSON[selectedType] === undefined) {
        scope.manuButtonStatesJSON[selectedType] = []
      }

      if (scope.manuButtonStatesJSON[selectedType][manuInIndex] === 1)
        scope.manuButtonStatesJSON[selectedType][manuInIndex] = 0
      else {
        scope.manuButtonStatesJSON[selectedType][manuInIndex] = 1
        scope.selectedButtonValues["selectedManu"].push(selectedManu)
      }
    }

    scope.selectModel = function(selectedModel, selectedManu, modelInIndex)
    {
      if (scope.modelButtonStatesJSON[selectedManu] === undefined) {
        scope.modelButtonStatesJSON[selectedManu] = []
      }

      if (scope.modelButtonStatesJSON[selectedManu][modelInIndex] === 1)
        scope.modelButtonStatesJSON[selectedManu][modelInIndex] = 0
      else {
        scope.modelButtonStatesJSON[selectedManu][modelInIndex] = 1
        scope.selectedButtonValues["selectedModel"].push(selectedModel)
      }
    }

    scope.selectIssue = function(selectedIssue, selectedModel, issueInIndex)
    {
      if (scope.issueButtonStatesJSON[selectedModel] === undefined) {
        scope.issueButtonStatesJSON[selectedModel] = []
      }

      if (scope.issueButtonStatesJSON[selectedModel][issueInIndex] === 1)
        scope.issueButtonStatesJSON[selectedModel][issueInIndex] = 0
      else {
        scope.issueButtonStatesJSON[selectedModel][issueInIndex] = 1
        scope.selectedButtonValues["selectedIssue"].push(selectedIssue)
      }
    }
}]);
