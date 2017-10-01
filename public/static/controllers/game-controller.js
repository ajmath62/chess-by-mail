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
        }

        $scope.goToMenu = function() {
            menuConfirmation = confirm("This will erase any moves you may have made. Be sure that you have obtained an up-to-date game description string. Are you sure you want to return to the menu?");
            if (menuConfirmation) {
                $scope.gameName = null;
                $scope.outputHash = "";
                $scope.gameState = {};
            }
        }

        $scope.loadGame = function() {
            try {
                [$scope.gameName, $scope.gameState] = stringToGame($scope.inputHash);
                $scope.inputHash = "";
            }
            catch (e) {
                alert("Invalid game description string.");
            }
        }

        $scope.newGame = function() {
            $scope.inputHash = "";
            $scope.gameName = "chess";
            $scope.gameState.pieces = {"A1": "white rook", "B1": "white knight", "C1": "white bishop",
            "D1": "white queen", "E1": "white king", "F1": "white bishop", "G1": "white knight",
            "H1": "white rook", "A2": "white pawn", "B2": "white pawn", "C2": "white pawn",
            "D2": "white pawn", "E2": "white pawn", "F2": "white pawn", "G2": "white pawn",
            "H2": "white pawn", "A7": "black pawn", "B7": "black pawn", "C7": "black pawn",
            "D7": "black pawn", "E7": "black pawn", "F7": "black pawn", "G7": "black pawn",
            "H7": "black pawn", "A8": "black rook", "B8": "black knight", "C8": "black bishop",
            "D8": "black queen", "E8": "black king", "F8": "black bishop", "G8": "black knight",
            "H8": "black rook"};  // Starting position
            $scope.gameState.pieceStyle = "symbol";
            $scope.gameState.promotablePawn = "";
            $scope.gameState.lastMove = ["", ""];
            $scope.gameState.currentPlayer = "white";
            $scope.gameState.castleLegality = {"white": {"A": true, "H": true}, "black": {"A": true, "H": true}};
        }
    }])
}());
