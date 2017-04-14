app.controller('forgotPasswordController', ['$rootScope','$scope', '$state', 'goToServices', 'logService', '$http', 'notifyDlg', "errorMessageFormatter", '$timeout',
 function(rscope, scope, state, goSer, logSer, http, noDlg, emf, timeout) {
   scope.email = undefined
   scope.confirmationEmail = undefined
   scope.newPassword = undefined
   scope.hasClickedSubmit = false

   scope.onClickSubmit = function(){
     scope.hasClickedSubmit = true

   }
}])
