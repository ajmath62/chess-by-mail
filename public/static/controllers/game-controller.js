(function(){
    angular
    .module("app", [])
    .controller("GameController", ["$scope", function($scope){
        $scope.gameName = "chess";
        $scope.hash = "";

        $scope.getGameString = function() {
            $scope.hash = gameToString();
        }

        $scope.loadGame = function() {
            console.log(stringToGame($scope.hash));
        }
    }])
}());
