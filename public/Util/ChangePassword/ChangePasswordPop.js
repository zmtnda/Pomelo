app.service("changePasswordPop", ["$uibModal", function(uibM) {
      this.show = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            controller: "changePasswordController", /*controller injection has to be here; otherwise, uibModalInstance wouldn't be resolved.*/
            templateUrl: 'Util/ChangePassword/ChangePasswordTemplate.html',
            scope: scp,
            size: 'md'
         }).result;
      }

}]);
