app.filter("buttonFilter", function()
{
  var stateNames = ["btn-default", "btn-default active"];
  return function(input) {
    return stateNames[input];
  };
})
