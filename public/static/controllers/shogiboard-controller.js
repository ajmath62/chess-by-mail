(function() {
    angular
    .module("app")
    .controller("ShogiController", ["$scope", function($scope){
        $scope.rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
        $scope.columns = [9, 8, 7, 6, 5, 4, 3, 2, 1];

        $scope.firstClick = null;
        $scope.clickSquare = function(squareName) {
            if ($scope.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if ($scope.gameState.pieces[squareName]) {
                    $scope.firstClick = squareName;
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                var comments, moveValidity;
                [moveValidity, comments] = shogi.moveValidity($scope.gameState, $scope.firstClick, squareName);
                if (moveValidity) {
                    shogi.makeMove($scope.gameState.pieces, $scope.firstClick, squareName);
                    $scope.gameState.lastMove = [$scope.firstClick, squareName];
                    $scope.upToDateString.value = false;

                    if (shogi.checkPromotion($scope.gameState)) {
                        $scope.gameState.promotablePawn = squareName;
                    }
                    else
                        // If there is a promotion, flip whose turn it is after selecting which
                        // piece to promote to. Otherwise, flip whose turn it is now.
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
                }
                else {
                    var errorType, errorDetails, fromSquare, toSquare;
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        $("#ch-" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#ch-" + toSquare).addClass("warning");}, 400);
                        setTimeout(function(){$("#ch-" + fromSquare).removeClass("warning");}, 400);
                        setTimeout(function(){$("#ch-" + toSquare).removeClass("warning");}, 800);
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };
    }])
}());
