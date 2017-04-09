app.service("changeEmailPop", ["$uibModal", function(uibM) {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            controller: "changeEmailController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
            templateUrl: 'Util/ChangeEmail/ChangeEmailTemplate.html',
            scope: scp,
            size: 'md'
         }).result;
      }

}]);
