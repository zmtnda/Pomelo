app.controller('customerGuidanceController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'goToServices', "cates",
  function(scope, state, logSer, http, rscope, noDlg, goto, cate)
  {
    scope.customerData = {
      issue: undefined,
      category: undefined,
      manufacturer: undefined,
      model: undefined,
      issue: undefined
    }

    scope.hasGone = false
    scope.hasMapped = false
    scope.hasClickedCate = false
    scope.cates = cate
    scope.manus = undefined

    scope.showMap = function()
    {
      scope.hasGone = true
    }

    scope.showCategory = function(){
      scope.hasMapped = true
      scope.hasGone = false

    }

    scope.onClickCategory = function(seletcedCate){
      console.log("sadasd  " + JSON.stringify(seletcedCate))
      http.get('Cate/' + seletcedCate.id_cat + '/manu')
      .then(function(res){
        scope.manus = res.data
        console.log(JSON.stringify(res))
        scope.hasClickedCate = true
      })
    }

  }]);
