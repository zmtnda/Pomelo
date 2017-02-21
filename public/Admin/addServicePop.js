app.service("addServicePop", ["$uibModal", function(uibM) {
      this.showAddCategory = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            animation: true,
            templateUrl: 'Admin/addCategoryTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }

      this.showAddManufacturer = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            animation: true,
            templateUrl: 'Admin/addManufacturerTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }

      this.showAddModel = function(scp, hdr) {
         scp.hdr = hdr;
         return uibM.open({
            animation: true,
            templateUrl: 'Admin/addModelTemplate.html',
            scope: scp,
            size: 'lg'
         }).result;
      }
}]);
