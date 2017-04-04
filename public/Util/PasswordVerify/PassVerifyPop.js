app.service("passVerifyPop", ["$uibModal", function(uibM) {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            controller: "passVerifyController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
            templateUrl: 'Util/PasswordVerify/PassVerifyTemplate.html',
            scope: scp,
            size: 'md'
         }).result;
      }
}]);
