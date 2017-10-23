(function(){
    angular
    .module("app", [])
    .controller("GameController", ["$scope", function($scope){
        $scope.gameName = null;
        $scope.inputHash = "";
        $scope.gameState = {};
        $scope.gameOver = {"value": null};
        $scope.upToDateString = {"value": null};

        $scope.goToMenu = function() {
            var confirmQuit;
            if ($scope.upToDateString.value)
                confirmQuit = true;
            else
                confirmQuit= confirm("This will erase any moves you may have made. Be sure that you have obtained an up-to-date game description string. Are you sure you want to return to the menu?");

            if (confirmQuit) {
                $scope.gameName = null;
                $scope.inputHash = "";
                $scope.gameState = {};
                $scope.gameOver = {"value": null};
                $scope.upToDateString.value = null;
            }
        };

        $scope.loadGame = function() {
            try {
                [$scope.gameName, $scope.gameState] = stringToGame($scope.inputHash);
                $scope.inputHash = "";
                $scope.gameOver = {"value": null};
                $scope.upToDateString.value = true;
            }
            catch (e) {
                console.log(e);
                alert("Invalid game description string.");
            }
        };

        $scope.newGame = function(gameName) {
            $scope.gameName = gameName;
            $scope.inputHash = "";
            $scope.gameState = {};
            $scope.gameOver = {"value": null};
            $scope.upToDateString.value = true;

            if (gameName === "chess")
                chess.newGame($scope.gameState);
            else if (gameName === "shogi")
                shogi.newGame($scope.gameState);
        };
    }]);
}());
