app.filter("buttonFilter", function()
{
  var stateNames = ["btn-default", "btn-default active"];
  return function(input) {
    return stateNames[input];
  };
})

app.filter("thumbnailFilter", function(){
  var stateNames = ["thumbnail", "thumbnail activeThumbnail"];
  return function(input) {
    return stateNames[input];
  };
})