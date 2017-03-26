app.controller('awaitingListPageController', ['$scope', '$state','logService', '$http', '$rootScope', 'notifyDlg', 'userListing',
  function(scope, state, logSer, http, rscope, noDlg, userListing) {

    scope.sortValue = ""
    scope.filterValue = ""
    scope.userListingData = userListing

    scope.setSortValue = function(inputStr)
    {
        scope.sortValue = inputStr
    }

    scope.setFilterValue = function(inputStr)
    {
        scope.filterValue = inputStr
    }

    scope.sampleData = [
                        {
                          "email": "cus1@pomelo.com",
                          "name": "Yiupang Chan",
                          "category": "Desktop",
                          "manufacturer": "Dell",
                          "model": "Dell Desktop",
                          "issue": "Can't turn on",
                          "description": "My Dell Desktop doesn’t turn on, please help!",
                          "amount": 200.5,
                          "status": 1,
                          "orderedDate": "2016-02-22T08:00:00.000Z",
                          "completedDate": "2017-03-08T20:32:18.000Z"
                        },
                        {
                          "email": "custttt2@pomelo.com",
                          "name": "Yiupang Leee",
                          "category": "Desktop",
                          "manufacturer": "Apple",
                          "model": "Apple Desktop",
                          "issue": "Can't turn off",
                          "description": "My Dell Desktolllelp!",
                          "amount": 270.5,
                          "status": 2,
                          "orderedDate": "2016-02-22T08:00:00.000Z",
                          "completedDate": "2017-03-08T20:32:18.000Z"
                        },
                        {
                          "email": "cus1@pomelo.com",
                          "name": "Leo Keen",
                          "category": "Laptop",
                          "manufacturer": "Hp",
                          "model": "Hp Desktop",
                          "issue": "Can't turn on",
                          "description": "My Hp Desktop doesn’t turn on, please help!",
                          "amount": 8800.5,
                          "status": 3,
                          "orderedDate": "2016-02-22T08:00:00.000Z",
                          "completedDate": "2017-03-08T20:32:18.000Z"
                        }
                      ]


}]);
