app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg',
  function(scope, state, logSer, http, rscope, noDlg, cate) {
    scope.progressMessage = "Please select the general type you can fix"

    // Store the data of the buttons seletced by the user
    var selectedButtonValues = {
      "selectedType": null,
      "selectedManu": [],
      "selectedModel": [],
      "selectedIssue": []
    }

    // A set of boolean that indicates which column should be shown
    scope.hasSelectedType = false
    scope.hasSelectedManu = false
    scope.hasSelectedModel = false
    scope.hasSelectedIssue = false

    // Data fetched from DB:
    scope.user = {};
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software", "Tablet"]
    scope.allManufactueres = ["Apple", "Sony", "Samsung", "Google", "Dell", "ASUS"]

    // Data being displayed
    scope.manufactueres = ["Apple", "Sony"]
    scope.models = ["iPhone 6"]
    scope.issues = ["Cracked Screen", "Broken Keyboard"]
    scope.offerings = [[], [] , []]

    // Style for the progress bar
    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "0%"
    scope.progressBarDisplay = {"width": "0%"};

    // A function that determines the styles of buttons
    // Logic: Buttons turn grey if they are selected.
    scope.buttonStyle = function(input){
      if(selectedButtonValues["selectType"] === input ||
         selectedButtonValues["selectedManu"].includes(input) ||
         selectedButtonValues["selectedModel"].includes(input) ||
         selectedButtonValues["selectedIssue"].includes(input))
        return {"background-color": "grey"}
      else {
        return {"background-color": "white"}
      }
    }

    var updateProgressBar = function(message, percent)
    {
      scope.progressMessage = message
      scope.progressPercentage = percent
      scope.progressBarDisplay = {"width": percent};
    }

    scope.selectType = function(selectedType)
    {
      console.log(selectedType)
      selectedButtonValues["selectType"] = selectedType
      updateProgressBar("Select the manufactuer", "25%")
      scope.hasSelectedType = true
    }

    scope.selectManu = function(selectedManu)
    {
      selectedButtonValues["selectedManu"].push(selectedManu)
      updateProgressBar("Select a model", "50%")
      scope.hasSelectedManu = true
    }

    scope.selectModel = function(selectedModel)
    {
      selectedButtonValues["selectedModel"].push(selectedModel)
      updateProgressBar("Select an issue", "75%")
      scope.hasSelectedModel = true
    }

    scope.selectIssue = function(selectedIssue)
    {
      selectedButtonValues["selectedIssue"].push(selectedIssue)
      updateProgressBar("Select an issue", "80%")
      scope.hasSelectedIssue = true
    }

}]);
