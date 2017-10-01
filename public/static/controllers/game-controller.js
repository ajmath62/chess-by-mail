(function(){
    angular
    .module("app", [])
    .controller("GameController", ["$scope", function($scope){
        $scope.gameName = "chess";
        $scope.hash = "";
        $scope.gameState = {};

        $scope.getGameString = function() {
            $scope.hash = gameToString($scope.gameName, $scope.gameState);
        }

        $scope.loadGame = function() {
            [$scope.gameName, $scope.gameState] = stringToGame($scope.hash);
        }
    }])
}());
