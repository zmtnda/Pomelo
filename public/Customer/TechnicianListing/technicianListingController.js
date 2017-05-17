app.controller('technicianListingController', ['$cookies','$scope', '$location', '$state',  '$http', '$rootScope', 'notifyDlg', '$timeout',
  function($cookies, scope, location, state, http, rscope, noDlg, timeout) {
  var temp = [];
  temp =$cookies.getObject("techList");

  if (angular.isUndefined(temp)){
    // $cookies.remove("techList");
    console.log("before cookie is stored: ");
    scope.passed = state.current.data.customerData
    var config={ params : {"servicesOffer" : {'modIss_id' : scope.passed.issue.modIssId,
                  'catMan_id' : scope.passed.issue.catMan_id},
                  "zipCode" : {"zip" : scope.passed.zipCode}}
              }
    console.log("Serv/" + JSON.stringify(config) + "/Issues")
    http.get("Serv/Issues",config)
          .then(function(response){
              console.log("response: " + JSON.stringify(response));
              scope.listServices = response.data;
             var expireDate = new Date();
    // expireDate.setDate(expireDate.getDate() + 1); 
    expireDate.setTime(expireDate.getTime()+(30*1000));
    $cookies.remove("techList");
    $cookies.putObject("techList", response.data, {'expires' : expireDate, 'path': '/'});
    console.log("finish stored cookie: ");
    }).
    catch(function(err){noDlg.show(scope, err, "Error")});
  } else {
    //   $cookies.remove("techList");
      console.log("temp is not null on refresh"+ JSON.stringify(temp));
      scope.listServices = temp;
  }}
]);
