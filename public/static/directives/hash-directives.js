(function() {
    angular
    .module("app")
    .directive("gmOutputHash", function(){
        return {
            restrict: "E",
            replace: "true",
            template: "<input type=\"text\" size=\"60\"/>",
            link: function(scope, element, attrs) {
                scope.$watch("gameState.lastMove", function(value) {
                    var outputHash = gameToString(scope.gameName, scope.gameState);
                    element.val(outputHash);
                });

                element.bind("click", function(event){
                    scope.upToDateString.value = true;
                    element.select();
                });

                element.attr("id", attrs.id || "gm-output-hash");
            }
        };
    })
}());