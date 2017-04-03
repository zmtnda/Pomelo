// Declare a service that allows an error message.
app.service("notifyDlg", ["$uibModal", function(uibM) {

      this.show = function(scp, msg, hdr, siz) {
         scp.msg = msg;
         scp.hdr = hdr;
  			 scp.submitted = 0;
           return uibM.open({
              templateUrl: "Util/Dialog/dialogTemplate.html",
              scope: scp,
              size: siz || 'sm'
           }).result;
      }
}]);
