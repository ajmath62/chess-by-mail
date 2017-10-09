(function() {
    angular
    .module("app")
    .directive("gmPromotion", function(){
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                "gmIf": "="
            },
            template: "<div ng-show='gmIf'><div class='gm-modal-background'></div><div class='gm-modal-dialog' ng-transclude></div></div>",
        };
    });
}());
