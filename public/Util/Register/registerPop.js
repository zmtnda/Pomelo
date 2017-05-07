app.service("registerPopService", ["$uibModal", function(uibM) 
{
      var thisPop;

      this.show = function(scp, hdr) 
      {
         scp.hdr = hdr;
         thisPop = uibM.open({
            animation: false,
            controller: "registerController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
            templateUrl: 'Util/Register/registerTemplate.html',
            scope: scp,
            component: "registerPop",
            size: 'lg'
         });
         return thisPop;
      }

      this.closePop = function()
      {
            thisPop.close();
      }
}]);
