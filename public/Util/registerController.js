 app.controller('registerController', ['$rootScope','$scope', '$state', 'goToServices','logService', '$http', 'notifyDlg', function(rscope, scope, state, goSer, logSer, http, noDlg) {
    scope.user = {};
    scope.submitted = 0;

    scope.postUser = function(){
      //console.log(JSON.stringify(scope.user));
        //Do a post caToll
		  scope.submitted = 1;
		  logSer.addUser( scope.user.email, scope.user.password, scope.user.role, scope.user.firstName, scope.user.lastName, scope.user.hourlyRate, scope.user.city, scope.user.zip)
		  // .then (function(){
      //   if (isValidZip(scope.user.zip)){
      //     console.log("It is valid ZIP code")
      //   }
      //   else{
      //     console.log("It is not valid zip code!");
      //   }
      // })
      // .catch(function(err){console.log("Error")})
      .then (function(){
			   if(rscope.loggedUser.email !== 'Admin@11.com'){
					console.log("I am not admin" +rscope.loggedUser.email );
					//logSer.login(scope.user.email, scope.user.password);
				}
				else{
					console.log("I am admin");
					state.reload();
				}
		  })
		  .catch(function(err){console.log("ERROR!!!!!");noDlg.show(scope, err, "Error")});
	}

  scope.isValidZip = function(value){
      return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
  }
}])



/*
app.controller('registerController', ['$scope', '$state', 'goToServices','logService', '$http', 'notifyDlg', function(scope, state, goSer, logSer, http, noDlg) {
    scope.user = {};
    scope.submitted = 0;

    scope.postUser = function(){
        console.log(JSON.stringify(scope.user));
        //Do a post caToll
        http.post('Ssns/', {"email":"Admin@11.com", "password":"password"})
        .then(function(){
          scope.submitted = 1;
          http.post('User/', scope.user);
        })
        .catch(function(err){noDlg.show(scope, err, "Error")});
    }

}])
 */
