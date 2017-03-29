//Note: This service is not being used because of unknown issue with the Digest Cycle.

app.service("goToServices", ['$state', '$route',
function(state, route)
 {
   this.goToAdmin = function()
   {
     timeout(function() {
       state.go('admin');
     })
   }

   this.goToCustomer= function()
   {
     timeout(function() {
       state.go('customer');
     })
   }

   this.goToTechnician = function()
   {
     timeout(function() {
       state.go('technician');
     })
   }

   this.goToAbout = function()
   {
     timeout(function() {
       state.go('about');
     })
   }

   this.goToissueGudiance = function()
   {
     timeout(function() {
       state.go('issueGudiance');
     })
   }

   this.retnHm = function()
   {
     timeout(function() {
       state.go('home');
     })
   }

}]);
