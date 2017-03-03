app.controller('addServiceController', ['$rootScope','$scope', '$state','logService', '$http', function(rscope, scope, state, logSer, http) {
   scope.category = {};
   scope.manufacturer = {};

   scope.categorySubmitted = 0;
   scope.manufacturerSubmitted = 0;
   scope.modelSubmitted = 0;

   this.addCategory = function(newCategory)
   {
     return http.post("cate/", {newCategory: newCategory});
   }

   this.addManufacturer = function(newManufacturer)
   {
     return http.post("cate/", {newManufacturer: newManufacturer});
   }

   this.addModel = function(newCategory)
   {
     return http.post("cate/", {newCategory: newCategory});
   }

   scope.postCategory = function(){
     scope.categorySubmitted = 1;
     this.addCategory(scope.newCategory)
   }

   scope.postManufacturer = function(){
     scope.manufacturerSubmitted = 1;
     logSer.addManufacturer(scope.newManufacturer)
   }

   scope.postModel = function(){
     scope.modelSubmitted = 1;
     logSer.addModel(scope.newModel)
   }

}])
