app.service("logService", ["$rootScope", '$http', '$state', 'notifyDlg', '$route',
function(rscope, http, state, nDlg, route) {
      rscope.loggedUser = {email:null};
      rscope.inSession = null;
      rscope.cookie = null;

		this.addUser = function(roleP, emailP, passwordP, fName, lName, phoneP)
		{
			return http.post("User", {email: emailP, password: passwordP, role: roleP, firstName: fName, lastName: lName, phone: phoneP});
		}
      this.login = function(emailParam, passwordParam)
      {
        http.post("Ssns", {email: emailParam, password: passwordParam})
        .then(function(response){
           console.log("Logged In");
          var location;
          location = response.headers().location.split('/');
          rscope.cookie = location[location.length - 1];
          return http.get("Ssns/" + location[location.length - 1]);
        })
        .then(function(response){
          return http.get('/User?email=' + emailParam + '&all=true');
        })
        .then(function(response){
          console.log("???" + JSON.stringify(response.data))
          rscope.loggedUser.id = response.data[0].id || response.data.id;
          rscope.loggedUser.email = emailParam;
          rscope.loggedUser.password = passwordParam;
          rscope.loggedUser.role = response.data[0].role;
          rscope.loggedUser.firstName = response.data[0].firstName || response.data.firstName;
          rscope.loggedUser.lastName = response.data[0].lastName || response.data.lastName;
          rscope.inSession = true;

          if(rscope.loggedUser.role === 0)
             state.go('customer');
          else if(rscope.loggedUser.role === 1)
             state.go('technician');
          else if(rscope.loggedUser.role === 2)
             state.go('admin');
        })
        .catch(function(err){
           console.log("what ? ? "+ JSON.stringify(err));
            for (var key in rscope.loggedUser)
                rscope.loggedUser.key = null;
            rscope.inSession = null;
            rscope.cookie = null;
            nDlg.show(rscope, "Invalid Input??????");
        });
      }

      this.logout = function(){
          return http.delete('Ssns/'+rscope.cookie)
          .then(function(){
            for (var key in rscope.loggedUser)
                rscope.loggedUser.key = null;
            rscope.inSession = null;
            rscope.cookie = null;
            state.go('home');
          });
      }

      this.isLoggedIn = function(){
        if(rscope.inSession == true)
         return 1;
        else {
         return 0;
        }
      }

}]);
