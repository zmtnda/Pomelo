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

    // Style for the progress bar
    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "0%"
    scope.progressBarDisplay = {"width": "0%"};

    // A function that determines the styles of buttons
    // Logic: Buttons turn grey if they are selected.
    // DEPROCATED!!
    /*scope.buttonStyle = function(input){
      var selectedButtonValues = scope.selectedButtonValues;
      if(selectedButtonValues["selectedType"].includes(input) ||
         selectedButtonValues["selectedManu"].includes(input) ||
         selectedButtonValues["selectedModel"].includes(input) ||
         selectedButtonValues["selectedIssue"].includes(input))
        return {"background-color": "#D3D3D3"}
      else {
        return {"background-color": "white"}
      }
    } */

    var updateProgressBar = function(message, percent)
    {
      scope.progressMessage = message
      scope.progressPercentage = percent
      scope.progressBarDisplay = {"width": percent};
    }

    var canGoToNext = function(isConfirmed, selected, message, percent)
    {
        if (isConfirmed === 1 && scope.selectedButtonValues[selected].length != 0)
        {
            updateProgressBar(message, percent);
            return 1
        }
        return 0
    }

    var updateButtonState = function()
    {


    }

    scope.confirm = function(input)
    {
      if(input === "selectedType")
      {
        if (canGoToNext(selectedType, "selectedType", "Select the Manufacturers", "20%"))
          scope.hasSelectedType = 1
      }
    }

    scope.typeButtonStatesArray = [[], [], [], []];
    // find a way to keep track of index
    scope.selectType = function(selectedType, typeInIndex)
    {
      scope.selectedButtonValues["selectedType"].push(selectedType)
      if (scope.typeButtonStatesArray[typeInIndex] === 1)
        scope.typeButtonStatesArray[typeInIndex] = 0
      else {
        scope.typeButtonStatesArray[typeInIndex] = 1
      }
    }

    scope.selectManu = function(selectedManu)
    {
      if (selectedManu !== 1)
        scope.selectedButtonValues["selectedManu"].push(selectedManu)
      if (canGoToNext(selectedManu, "selectedManu", "Select a model", "40%"))
        scope.hasSelectedManu = 1
    }

    scope.selectModel = function(selectedModel)
    {
      if (selectedModel !== 1)
        scope.selectedButtonValues["selectedModel"].push(selectedModel)
      if (canGoToNext(selectedModel, "selectedModel", "Select a model", "60%"))
        scope.hasSelectedModel = 1
    }

    scope.selectIssue = function(selectedIssue)
    {
      if (selectedIssue !== 1)
        scope.selectedButtonValues["selectedIssue"].push(selectedIssue)
      if (canGoToNext(selectedIssue, "selectedIssue", "Select an issue", "80%"))
        scope.hasSelectedIssue = 1
    }
}]);
