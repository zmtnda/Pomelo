app.controller('issueGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg',
  function(scope, state, logSer, http, rscope, noDlg) {
    scope.user = {};
<<<<<<< HEAD
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software"]
=======
    scope.allTypes = ["Laptop", "Desktop", "Smart Phones", "Software", "Tablet"]
    scope.allManufactueres = ["Apple", "Sony", "Samsung", "Google", "Dell", "ASUS"]
	

>>>>>>> 96773cf49b9418f74d7c75c2bb74dec6648598be
    scope.manufactueres = ["Apple", "Sony"]
    scope.models = ["iPhone 6"]
    scope.issues = ["Cracked Screen", "Broken Keyboard"]
    scope.progressBarDisplay = {'background-color':'blue'}
    scope.progressPercentage = "70%"
    scope.progressBarDisplay = {"width": "70%"};
<<<<<<< HEAD
=======
	
	var decideManu = function (type)
	{
		if (type === "Desktop")
		{
			manufactueres.append("Apple", "Window")
		}
	}

>>>>>>> 96773cf49b9418f74d7c75c2bb74dec6648598be
}]);
