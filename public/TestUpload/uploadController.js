app.controller('uploadController', ['$scope', '$location', '$state', '$http', '$rootScope', '$timeout', 'notifyDlg',
  function (scope, location, state, http, rootScope, timeout, notifyDlg) {
    scope.images = [];

    scope.uploadedFile = function (element) {
      scope.$apply(function (scope) {
        scope.files = element.files;
      });
    }

    scope.addFile = function () {
      var fd = new FormData();
      var photoMetaData = [];

      var albumMetaData = {
        description: scope.description,
        albumName: scope.albumName,
        albumId: -1 // -1 if new, > 0 if exists
      };

      var i=0;
      angular.forEach(scope.files, function (file) {
        i++;
        fd.append('images', file);
        photoMetaData.push({
          description: 'photo description ' + i
        });
      });

      fd.append("albumMetaData", JSON.stringify(albumMetaData));
      fd.append("photoMetaData", JSON.stringify(photoMetaData));

      http.post('/Photo/uploadAlbum', fd, {
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