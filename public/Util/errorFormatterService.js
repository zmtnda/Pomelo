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
          dataField.forEach(function(ea){
            if(ea["tag"] === "missingField")
              tagError = "You are missing "
            // Separate by camel case
            errorStr = errorStr.concat(tagError + ": " + ea["params"][0] + '\n\n')
          })
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
