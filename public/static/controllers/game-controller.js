(function(){
    angular
    .module("app", [])
    .controller("GameController", ["$scope", function($scope){
        $scope.gameName = "chess";
        $scope.hash = "";

        $scope.openGame = function(){
            $scope.hash = gameToString();
        }
    }])
}());
