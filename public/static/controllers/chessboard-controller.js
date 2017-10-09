(function(){
    angular
    .module("app")
    .controller("ChessboardController", ["$scope", function($scope){
        $scope.rows = [8, 7, 6, 5, 4, 3, 2, 1];
        $scope.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];

        $scope.firstClick = null;
        $scope.clickSquare = function(squareName) {
            var comments, moveValidity, fromSquare, toSquare;

            // If there is a promotion dialog open, don't allow other interaction
            if ($scope.gameState.promotable)
                return;

            if ($scope.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if ($scope.gameState.pieces[squareName]) {
                    $scope.firstClick = squareName;
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                [moveValidity, comments] = chess.moveValidity($scope.gameState, $scope.firstClick, squareName);
                if (moveValidity) {
                    chess.makeMove($scope.gameState.pieces, $scope.firstClick, squareName);
                    $scope.gameState.lastMove = [$scope.firstClick, squareName];
                    $scope.upToDateString.value = false;

                    if (chess.checkPromotion($scope.gameState)) {
                        $scope.gameState.promotable = squareName;
                    }
                    else
                        // If there is a promotion, flip whose turn it is after selecting which
                        // piece to promote to. Otherwise, flip whose turn it is now.
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);

                    // If the move was a castle, move the rook
                    if (comments === "castle-king")
                        chess.makeMove($scope.gameState.pieces, chess.getNeighboringSquare(squareName, [1, 0]), chess.getNeighboringSquare(squareName, [-1, 0]));
                    else if (comments === "castle-queen")
                        chess.makeMove($scope.gameState.pieces, chess.getNeighboringSquare(squareName, [-2, 0]), chess.getNeighboringSquare(squareName, [1, 0]));
                    // If the move was en passant, delete the captured pawn
                    else if (comments === "enpassant-white") {
                        delete $scope.gameState.pieces[chess.getNeighboringSquare(squareName, [0, -1])];
                    }
                    else if (comments === "enpassant-black") {
                        delete $scope.gameState.pieces[chess.getNeighboringSquare(squareName, [0, 1])];
                    }
                }
                else {
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        // Flash the two squares involved to alert the player why their move is illegal
                        $("#ch-" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#ch-" + toSquare).addClass("warning");}, 400);
                        setTimeout(function(){$("#ch-" + fromSquare).removeClass("warning");}, 400);
                        setTimeout(function(){$("#ch-" + toSquare).removeClass("warning");}, 800)
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };

        $scope.promote = function(pieceName) {
            $scope.gameState.pieces[$scope.gameState.promotable] = $scope.gameState.currentPlayer + " " + pieceName;
            $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
            $scope.gameState.promotable = "";
        }
    }]);
}());
