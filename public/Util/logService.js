app.service("logService", ["$rootScope", '$http', '$state', 'notifyDlg', '$route', 'userPersistenceService',
function(rscope, http, state, nDlg, route, persisService) {
    rscope.loggedUser = {email:null};
    rscope.inSession = persisService.getInSession();
    rscope.cookie = null;

		this.addUser = function(emailP, passwordP, roleP, fNameP, lNameP, hRateP, cityP, zipP)
		{
			return http.post("User/", {email: emailP, passwordHash: passwordP, role: roleP,
        firstName: fNameP, lastName: lNameP, hourlyRate: hRateP, city: cityP, zip: zipP})
        .then(function(){
          console.log("in add user: " + emailP)
          return http.post("Send/confirmEmail", {"email": emailP})// "success": 1/ 0 "response": already activated/ doesn't exist
        })
        .then(function(res){
          if (res.success) {
            // pop up: please verify the email.
          }
        })
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
        var result;
        http.post("Ssns/", {email: emailParam, password: passwordParam})
        .then(function(response){
          result = response;
          var location;
          location = response.headers().location.split('/');
          rscope.cookie = location[location.length - 1];
          return http.get("Ssns/" + location[location.length - 1]);
        })
        .then(function(response){
          rscope.loggedUser.id = result.data.id_log;
          rscope.loggedUser.email = emailParam;
          rscope.loggedUser.password = passwordParam;
          rscope.loggedUser.role = result.data.role;
          rscope.loggedUser.tec_id = result.data.id_tec;
          rscope.loggedUser.firstName = result.data.firstName;
          rscope.loggedUser.lastName = result.data.lastName;
          rscope.loggedUser.hourlyRate = result.data.hourlyRate;
          rscope.loggedUser.city = result.data.city;
          rscope.loggedUser.zip = result.data.zip;
          rscope.loggedUser.ratings = result.data.ratings;
          rscope.loggedUser.bad_id = result.data.bad_id;

          rscope.inSession = true;
          persisService.setInSession(true);
          persisService.setCookieData(emailParam, passwordParam);
          persisService.setTechId(rscope.loggedUser.tec_id);
          
          if(rscope.loggedUser.role === 0){
            state.go('customer');
           }
          else if(rscope.loggedUser.role === 1){
            state.go('technician');
          }
          else if(rscope.loggedUser.role === 2){
            state.go('admin');
           }
        })
        .catch(function(err){
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
