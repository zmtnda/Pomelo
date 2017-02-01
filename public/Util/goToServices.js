app.service("goToServices", ['$state', '$route',
function(state, route) {
   this.goToAdmin = function() {
      state.go('admin');
   }

   this.goToCustomer= function() {
      state.go('customer');
   }

   this.goToTechnician = function() {
      state.go('technician');
   }

   this.goToAbout= function()
   {
     state.go('about');
   }

   this.retnHm = function(){
     state.go('home');
   }
}]);
