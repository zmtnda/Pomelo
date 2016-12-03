app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {
      //redirect to home if path is not matched
      $router.otherwise("/");
      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('technician', {
         url: '/technician',
         templateUrl: 'Technician/technician.template.html',
         controller: 'technicianController',
      })
      .state('customer', {
         url: '/customer',
         templateUrl: 'Customer/customer.template.html',
         controller: 'customerController',
      })
      .state('admin', {
         url: '/admin',
         templateUrl: 'Admin/admin.template.html',
         controller: 'adminController',
         resolve: { // It makes sure everthing inside this block is ready before the website is loaded.
            servs: ['$q', '$http', '$stateParams', function($q, http, prms) {
               return http.get('Serv/')
               .then(function(response) {
                 //console.log("ra"+JSON.stringify(response.data));
                  return $q.resolve(response.data)//Note resolve() will put all the data in $scope
               });
            }],//need one to get all users
            users: ['$q', '$http', '$stateParams', function($q, http, prms){
               return http.get('User/?soFull=true')
               .then(function(response){
                 //console.log("scope.servs response"+JSON.stringify(response));
                  return $q.resolve(response.data)
               });
            }]
         }
      })

   }]);
