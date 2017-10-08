(function(){
    angular
    .module("app", [])
    .controller("GameController", ["$scope", function($scope){
        $scope.gameName = null;
        $scope.inputHash = "";
        $scope.outputHash = "";
        $scope.gameState = {};

        $scope.getGameString = function() {
            $scope.outputHash = gameToString($scope.gameName, $scope.gameState);
        };

        $scope.goToMenu = function() {
            var menuConfirmation = confirm("This will erase any moves you may have made. Be sure that you have obtained an up-to-date game description string. Are you sure you want to return to the menu?");
            if (menuConfirmation) {
                $scope.gameName = null;
                $scope.outputHash = "";
                $scope.gameState = {};
            }
        };

        $scope.loadGame = function() {
            try {
                [$scope.gameName, $scope.gameState] = stringToGame($scope.inputHash);
                $scope.inputHash = "";
            }
            catch (e) {
                alert("Invalid game description string.");
            }
        };

        $scope.newGame = function(gameName) {
            $scope.inputHash = "";
            $scope.gameName = gameName;
            if (gameName === "chess")
                newChessGame($scope.gameState);
            else if (gameName === "shogi")
                newShogiGame($scope.gameState);
        };
    }]);
}());
