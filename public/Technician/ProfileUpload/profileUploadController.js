app.controller('profileuploadController', ['$scope', '$location', '$state', '$http', '$rootScope', '$timeout', 'notifyDlg','$rootScope',
  function (scope, location, state, http, rootScope, timeout, notifyDlg, rscope) {
    scope.images = [];

    scope.uploadedFile = function (element) {
      scope.$apply(function (scope) {
        scope.files = element.files;
      });
      if (element.files && element.files[0]) {
        var reader = new FileReader();
        var reader = new FileReader();

        reader.onload = function (e) {
          $('#avatar').attr('src', e.target.result);

          // scope.avatar = e.target.result;
        }
        reader.readAsDataURL(element.files[0]);
      }


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
        // photoMetaData.push({
        //   description: 'photo description ' + i
        // });
      });

      fd.append("albumMetaData", JSON.stringify(albumMetaData));
      fd.append("photoMetaData", JSON.stringify(photoMetaData));

      http.post('/Photo/uploadProfile', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      })
      .success(function(res) {
        console.log(res);
        rscope.loggedUser.avatar = res.url;
        scope.avatar = res.url;
      })
      .error(function(err) {
        console.log(err)
      });
    }
 }]);
