app.service("registerPopService", ["$uibModal", function(uibM) {
   //return {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            animation: true,
            templateUrl: 'Util/registerTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }

      this.close = function()
      {
        //uibM.dismissAll();
      }
}]);
