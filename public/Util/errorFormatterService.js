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
          /*dataField.forEach(function(ea){
            if(ea["tag"] === "missingField")

            // Separate by camel case
            errorStr = errorStr.concat(ea["params"][0])
          })
          errorStr = tagError.concat(errorStr)*/
        }
        else
        {
          errorStr = dataField["code"]
          if(errorStr === "ER_DUP_ENTRY")
            errorStr = "This email has been used."
          else {
            errorStr = "Unkown error. Please contact us."
          }
        }

        return errorStr
      }
}]);
