// Declare a service that allows an error message.
app.service("errorMessageFormatter", ["$uibModal", function(uibM) {

      this.formatErrorCodeAndErrorArray = function(errorJSON)
      {
        var dataField = errorJSON["data"]
        var errorStr = ""
        var tagError = ""
        var paramsError = ""

        if(Array.isArray(dataField))
        {
          console.log("In errorMessageFormatter " + JSON.stringify(errorJSON));
          errorStr = "You are missing field(s)."
        }
        else
        {
          if(errorStr != null && dataField != null)
          {
            errorStr = dataField["code"]
            console.log("In errorMessageFormatter " + errorStr);
            if(errorStr === "ER_DUP_ENTRY")
            {
              errorStr = "This email has been used."
            }
            else if(errorStr === "EENVELOPE")
            {
              errorStr = "This email doesn't exist."
            }
          }
          else if(dataField.success === 0)// Check if the email actually exist in email providers.
          {
            console.log("ERROR: " + JSON.stringify(errorJSON));
            errorStr = dataField.response;
          }
          else
          {
            console.log("ERROR: " + JSON.stringify(errorJSON));
            errorStr = "Unkown error. Please contact us through pomelotech@pomelo.com."
          }
        }
        return errorStr
      }

      this.checkIfValidZipCode = function(zipCode)
      {
        return /^\d{5}(?:[-\s]\d{4})?$/.test(zipCode);
      }

      this.hasMetLengths = function(email, password, firstName, lastName, city, zip)
      {
        if(!city && !zip)
        {
          return email.length <= 128 && password.toString().length <= 32
        }
        else {
          return email.length <= 128 && password.toString().length <= 32 && firstName.length <= 45 && lastName.length <= 45 && city.length <= 20 && zip.toString().length <= 20
        }

      }

      this.checkEmailByRegex = function(email)
      {
        var reg = /^([A-Za-z0-9_\-\.]){1,}\@([A-Za-z0-9_\-\.]){1,}\.([A-Za-z]{2,4}){1,2}$/;
        return reg.test(email)
      }
}]);
