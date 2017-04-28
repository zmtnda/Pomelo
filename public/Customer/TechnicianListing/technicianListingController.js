app.controller('technicianListingController', ['$scope', '$location', '$state',  '$http', '$rootScope', 'notifyDlg', '$timeout',
  function(scope, location, state, http, rscope, noDlg, timeout) {
scope.passed = state.current.data.customerData
var config={
  params : {"servicesOffer" : {'modIss_id' : scope.passed.issue.modIssId,
            'catMan_id' : scope.passed.issue.catMan_id},
            "zipCode" : {"zip" : scope.passed.zipCode}}
}
//  console.log(JSON.stringify(scope.passed))
 console.log("Serv/" + JSON.stringify(config) + "/Issues")

// http({
//   url :"Serv/Issues",
//   method : "GET",
//   params : scope.body
// }).then(function(response){
//             console.log("response.data: " + JSON.stringify(response));
//             scope.listServices = response.data;
//   }).
//   catch(function(err){noDlg.show(scope, err, "Error")});
// }]);
  http.get("Serv/Issues",config)
        .then(function(response){
            console.log("response.data: " + JSON.stringify(response));
            scope.listServices = response.data;
  }).
  catch(function(err){noDlg.show(scope, err, "Error")});
}]);
