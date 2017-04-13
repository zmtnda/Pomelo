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
          console.log(JSON.stringify(errorJSON));
          errorStr = "You are missing field(s)."
        }
        else
        {
          if(errorStr != null && errorStr.code != null)
          {
            errorStr = dataField["code"]
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
}]);
