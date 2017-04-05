app.controller('customerGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', "cates",
  function(scope, state, logSer, http, rscope, noDlg, goto, cate)
  {
    scope.customerData = {
      issue: "",
      category: "",
      manufacturer: "",
      model: "",
      issue: ""
    }

    scope.hasGone = false
    scope.hasMapped = false
    scope.cates = cate

    scope.showMap = function()
    {
      scope.hasGone = true
    }

    scope.showCategory = function(){
      scope.hasMapped = true
      scope.hasGone = false
      console.log("asd");
    }

  }]);
