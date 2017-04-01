app.directive("serviceListDirective", [function(){

  return {
    restrict: 'E',
    scope:{
      listDataType: '='
    }
    template: "<select ng-model='selection' ng-options='item for item in items'> </select>"
    transclude:true,
    controller: function($scope){
      $scope.items = ["ab", "abc", "abcd", "abcde"]
    }
  }
}])
