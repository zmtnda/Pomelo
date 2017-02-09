app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg',
  function(scope, state, logSer, http, rscope, noDlg, cate) {
    scope.progressMessage = "Please select the general type you can fix"

    // A set of boolean that indicates which column should be shown
    scope.hasSelectedType = false
    scope.hasSelectedManu = false
    scope.hasSelectedModel = false
    scope.hasSelectedIssue = false

    scope.user = {};
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software", "Tablet"]
    scope.allManufactueres = ["Apple", "Sony", "Samsung", "Google", "Dell", "ASUS"]

    scope.manufactueres = ["Apple", "Sony"]
    scope.models = ["iPhone 6"]
    scope.issues = ["Cracked Screen", "Broken Keyboard"]

    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "0%"
    scope.progressBarDisplay = {"width": "0%"};

    scope.selectType = function(selectedType)
    {
      console.log(selectedType)
      scope.progressMessage = "Select the manufactuer"
      scope.progressPercentage = "20%"
      scope.progressBarDisplay = {"width": "20%"};
      scope.hasSelectedType = true
    }

    scope.selectManu = function(selectedType)
    {
      scope.progressMessage = "Select a model"
      scope.progressPercentage = "40%"
      scope.progressBarDisplay = {"width": "40%"};
      scope.hasSelectedManu = true
    }

    scope.selectModel = function(selectedType)
    {
      scope.progressMessage = "Select an issue"
      scope.progressPercentage = "60%"
      scope.progressBarDisplay = {"width": "60%"};
      scope.hasSelectedModel = true
    }

    scope.selectIssue = function(selectedType)
    {
      scope.progressMessage = "Make a price"
      scope.progressPercentage = "80%"
      scope.progressBarDisplay = {"width": "80%"};
      scope.hasSelectedIssue = true
    }

}]);
