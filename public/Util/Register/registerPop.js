app.service("registerPopService", ["$uibModal", function(uibM) {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            controller: "registerController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
            templateUrl: 'Util/Register/registerTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }
}]);
