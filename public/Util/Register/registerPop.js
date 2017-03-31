app.service("registerPopService", ["$uibModal", function(uibM) {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            animation: true,
            templateUrl: 'Util/Register/registerTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }
      /*this.close = function()
      {
         $uibModalInstance.dismiss("cancel")
      }*/
}]);
