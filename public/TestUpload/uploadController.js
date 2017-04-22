app.controller('uploadController', ['$scope', '$location', '$state', '$http', '$rootScope', '$timeout', 'notifyDlg',
  function (scope, location, state, http, rootScope, timeout, notifyDlg) {
    scope.images = [{url: 'https://s3-us-west-2.amazonaws.com/pomelotech/nnguy101%40gmail.com/pomeloTest/20170421_f12af0f0d91ed7da9569_safe.png'},
      {url: 'https://s3-us-west-2.amazonaws.com/pomelotech/nnguy101%40gmail.com/pomeloTest/20170420_12620a88d124642f3894_safe.png'}];

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
        description: scope.description,
        albumName: scope.albumName,
        albumId: -1 // -1 if new, > 0 if exists
      };
      fd.append("metaData", JSON.stringify(metaData));

      http.post('/Upload/uploadAlbum', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      })
      .success(function(res) {
        console.log(res);
        scope.images = res.images;
      })
      .error(function(err) {
        console.log(err)
      });
    }
 }]);