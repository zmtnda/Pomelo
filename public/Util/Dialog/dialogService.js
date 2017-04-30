// Declare a service that allows an error message.
app.service("notifyDlg", ["$uibModal", function(uibM)
{
      var thisPop;

      this.show = function(scp, msg, hdr, siz)
      {
            scp.msg = msg;
            scp.hdr = hdr;
            scp.submitted = 0;
            thisPop = uibM.open({
                  animation: false,
                  backdrop: true,
                  templateUrl: "Util/Dialog/dialogTemplate.html",
                  scope: scp,
                  size: siz || 'sm'
            });
            return thisPop;
      }

      this.closePop = function()
      {
            thisPop.close();
      }
}]);
