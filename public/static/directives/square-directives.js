(function(){
    angular
    .module("app")
    .directive("gmFlash", function(){
        return {
            restrict: "EA",
            link: function(scope, element, attrs) {
                scope.$watch("gameState.flash", function(value) {
                    // If the element is in gameState.flash, mark it with a warning for 400ms
                    if (contains(value, attrs.id)) {
                        var index = value.indexOf(attrs.id);
                        setTimeout(function(){element.addClass("warning");}, index * 400);
                        setTimeout(function(){element.removeClass("warning");}, (index+1) * 400);
                    }
                });
            }
        }
    })
}());
