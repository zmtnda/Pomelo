app.directive("ngNoOverflowSpan", function() {
  return {
    restrict : 'EAC',
    template: '<div>sdfdsfds</div>',
    link : function($scope, element, attrs) {
        console.log(element.innerWidth);
    }
  }
});
