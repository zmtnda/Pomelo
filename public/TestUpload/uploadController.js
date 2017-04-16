app.controller('uploadController', ['$scope', '$location', '$state', '$http', '$rootScope', '$timeout', 'notifyDlg',
  function (scope, location, state, http, rootScope, timeout, notifyDlg) {
    scope.uploadedFile = function (element) {
      alert("yo")
      scope.$apply(function (scope) {
        scope.files = element.files;
      });
    }

    scope.addFile = function () {
      alert("yeah");
      var fd = new FormData();
      angular.forEach(scope.files, function (file) {
        fd.append('images', file);
      });

      var metaData = {
        name: 'whatever',
        type: 'image'
      };
      fd.append("metaData", JSON.stringify(metaData));

      http.post('/Upload/profile', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      })
      .success(function(res) {
        console.log(res);
      })
      .error(function(err) {
        console.log(err)
      });
    }
 }]);