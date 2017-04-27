app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {
      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('upload', {
        url: '/upload',
        templateUrl: 'TestUpload/upload.template.html',
        controller: 'uploadController',
      })
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
      .state("emailSuccess", {
        url: '/emailSuccess',
        templateUrl: 'Email/emailSuccess.template.html',
        controller: 'emailSuccessController'
      })
      .state("/404Page", {
        url: '/404Page',
        templateUrl: '404Page/404Page.template.html',
      })
      .state('about', {
         url: '/about',
         templateUrl: 'About/about.html',
        //  controller: '',
      })
      .state('orders', {
         url: '/technician/Orders',
         templateUrl: 'Technician/Orders/Orders.template.html',
         controller: 'ordersController',
      })
      .state('processingSearch', {
         url: '/Customer/ProcessingSearch',
         templateUrl: 'Customer/ProcessingSearch/processingSearch.template.html',
         controller: 'processingSearchController',
         data: {
            customerData: undefined
          }
       })
      .state('services', {
         url: '/Technician/Services',
         templateUrl: 'Technician/Services/services.template.html',
         controller: 'servicesController',
       })
       .state('technicianListing', {
          url: '/customer/technicianListing',
          templateUrl: 'Customer/TechnicianListing/technicianListingTemplate.html',
          controller: 'technicianListingController',
          data: {
            customerData: undefined
          }
        })
       .state('updateAccount', {
          url: '/technician/updateAccount',
          templateUrl: 'Technician/UpdateAccount/UpdateAccount.template.html',
          controller: 'updateAccountController',
        })
      .state('opinion', {
         url: '/opinion',
         templateUrl: 'Opinion/opinion.template.html',
        //  controller: '',
      })
      .state('forgotPassword', {
         url: '/register/forgotPassword',
         templateUrl: 'Util/Register/forgotPassword.template.html',
         controller: 'forgotPasswordController',
      })
      .state('customerGudiance', {
         url: '/customer/CustomerGuidance',
         templateUrl: 'Customer/CustomerGuidance/customerGuidance.template.html',
         controller: 'customerGuidanceController',
         resolve: {
           cates: ['$q', '$http', '$stateParams', function($q, http, prms){
             return http.get('Cate/')
             .then(function(response){
               return $q.resolve(response.data)
             })
           }]
         }
      })
      .state('issueGudiance', {
         url: '/technician/IssueGuidance',
         templateUrl: 'Technician/IssueGuidance/issueGuidance.template.html',
         controller: 'issueGuidanceController',
         resolve: {
           cates: ['$q', '$http', '$stateParams', function($q, http, prms){
             return http.get('Cate/')
             .then(function(response){
               return $q.resolve(response.data)
             })
           }]
         }
      })
      .state('transcationHistory', {
         url: '/technician/transcationHistory',
         templateUrl: 'Technician/TranscationHistoryPage/transcationHistoryPage.template.html',
         controller: 'transcationHistoryPageController',
         resolve:{
           userListing: ['$q', '$http', '$rootScope', function($q, http, rscope){
             return http.get('Receipt/'+ rscope.loggedUser.tec_id +'/technician')
             .then(function(res){
               res.data.forEach(function(ea)
               {
                 if(ea.status === 0)
                 {
                   ea.status = "Waiting for pick up"
                 }
                 else if (ea.status === 1)
                 {
                   ea.status = "Working on it"
                 }
                 else if (ea.status === 2)
                 {
                   ea.status = "Completed"
                 }
                 else if (ea.status === 3)
                 {
                   ea.status = 'Closed'
                 }
               })
               return $q.resolve(res)
             })
              .then(function (res) {
                return $q.resolve(res.data)
              })
              .catch(function(err){
                return $q.reject(err)
              })
           }]
         }
      })
      .state('admin', {
         url: '/admin',
         templateUrl: 'Admin/admin.template.html',
         controller: 'adminController',
         resolve: { // It makes sure everthing inside this block is ready before the website is loaded.
            servs: ['$q', '$http', '$stateParams', function($q, http, prms) {
               return http.get('Serv/all')
               .then(function(response) {
                  return $q.resolve(response.data)//Note resolve() will put all the data in $scope
               })
               .catch(function(err){
                  return $q.reject(err)
               });
            }],//need one to get all users
            users: ['$q', '$http', '$stateParams', function($q, http, prms){
               return http.get('User/?soFull=true')
               .then(function(response){
                  return $q.resolve(response.data)
               });
            }],
            cates: ['$q', '$http', '$stateParams', function($q, http, prms){
              return http.get('Cate/')
              .then(function(response){
                return $q.resolve(response.data)
              })
            }]
         }
      })

   }]);
