app.factory("userPersistenceService", [
	"$cookies", function($cookies) {
		var email = "";
		var password = "";
    var inSession = null;
		return {
			setCookieData: function(email, password) {
				email = email;
				password = password;
				$cookies.put("email", email);
				$cookies.put("password", password);
			},
			getCookieEmail: function() {
				email = $cookies.get("email");
				return email;
			},
			getCookiePass: function() {
				password = $cookies.get("password");
				return password;
			},
			clearCookieData: function() {
				$cookies.remove("email");
				$cookies.remove("inSession");
				$cookies.remove("password");
			},
      setInSession: function(isInSession) {
				inSession = isInSession;
				$cookies.put("inSession", isInSession);
			},
      getInSession: function() {
				if($cookies.get("inSession")){
					inSession = $cookies.get("inSession");
					return inSession;
				}
				else {
					inSession = false;
					return false;
				}
			}
		}
	}
]);
