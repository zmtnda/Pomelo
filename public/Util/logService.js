app.service("logService", ["$rootScope", '$http', '$state', 'notifyDlg', '$route', 'userPersistenceService',
function(rscope, http, state, nDlg, route, persisService) {
    rscope.loggedUser = {email:null};
    rscope.inSession = persisService.getInSession();
    rscope.cookie = null;

		this.addUser = function(emailP, passwordP, roleP, fNameP, lNameP, hRateP, cityP, zipP)
		{
			return http.post("User/", {email: emailP, passwordHash: passwordP, role: roleP,
        firstName: fNameP, lastName: lNameP, hourlyRate: hRateP, city: cityP, zip: zipP});
		}

    this.logout = function(){
        return http.delete('Ssns/'+rscope.cookie)
        .then(function(){
          for (var key in rscope.loggedUser)
              rscope.loggedUser.key = null;
          rscope.inSession = null;
          rscope.cookie = null;
          state.go('home');
          persisService.clearCookieData();
        });
    }

    this.login = function(emailParam, passwordParam)
      {
        //this.logout();
        http.post("Ssns", {email: emailParam, password: passwordParam})
        .then(function(response){
           console.log("Logged In");
          var location;
          location = response.headers().location.split('/');
          rscope.cookie = location[location.length - 1];
          console.log("hi" + rscope.cookie);

          return http.get("Ssns/" + location[location.length - 1]);
        })
        .then(function(response){
           console.log("user email In");
          return http.get('/User?email=' + emailParam + '&all=true');
        })
        .then(function(response){
          console.log("???" + JSON.stringify(response.data))
          rscope.loggedUser.id = response.data[0].id_log || response.data.id_log;
          rscope.loggedUser.email = emailParam;
          rscope.loggedUser.password = passwordParam;
          rscope.loggedUser.role = response.data[0].role;
          rscope.loggedUser.tec_id = response.data[0].id_tec;
          rscope.loggedUser.firstName = response.data[0].firstName || response.data.firstName;
          rscope.loggedUser.lastName = response.data[0].lastName || response.data.lastName;
          rscope.inSession = true;
          persisService.setInSession(true);
          persisService.setCookieData(emailParam, passwordParam);
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
            nDlg.show(rscope, "Invalid username or password.");
        });
      }

      this.isLoggedIn = function(){
        if(rscope.inSession == true)
         return 1;
        else {
         return 0;
        }
      }

      if(rscope.inSession){
        var email = persisService.getCookieEmail();
        var pass = persisService.getCookiePass();
        this.login(email, pass);
      }
}]);
