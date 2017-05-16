app.controller('technicianListingController', ['$cookies','$scope', '$location', '$state',  '$http', '$rootScope', 'notifyDlg', '$timeout', 
  function($cookies, scope, location, state, http, rscope, noDlg, timeout) {
  // scope.passed = state.current.data.customerData
  // var config={
  //   params : {"servicesOffer" : {'modIss_id' : scope.passed.issue.modIssId,
  //             'catMan_id' : scope.passed.issue.catMan_id},
  //             "zipCode" : {"zip" : scope.passed.zipCode}}
  // }
  //  console.log(JSON.stringify(scope.passed)) node. 7.3.0 npm 3.10.10
  // if (localStorageService.isSupported){
  //   var storageType = localStorageService.gerStorageType();
  //   console.log("storage type:" + storageType);
  // }

  var temp =$cookies.get("techList");

  // // var temp;
  if (angular.isUndefined(temp)){
    // $cookies.remove("techList");
    scope.passed = state.current.data.customerData      
    var config={
        params : {"servicesOffer" : {'modIss_id' : scope.passed.issue.modIssId,
                  'catMan_id' : scope.passed.issue.catMan_id},
                  "zipCode" : {"zip" : scope.passed.zipCode}}
      }
    console.log("Serv/" + JSON.stringify(config) + "/Issues")
    http.get("Serv/Issues",config)
          .then(function(response){
              console.log("response.data: " + JSON.stringify(response));
              scope.listServices = response.data;
              
              $cookies.put("techList", scope.listServices.data, {
                expires: new Date(now),
                path: '/'
              });
              // if (localStorageService.isSupported){
              //   localStorageService.set("techList",  response.data);
              // }
    }).
    catch(function(err){noDlg.show(scope, err, "Error")});
  } else {
          console.log("temp is not null on refresh");
           scope.listServices = temp;
  }
}
]);
