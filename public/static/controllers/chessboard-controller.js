(function(){
    angular
    .module("app")
    .controller("ChessboardController", ["$scope", function($scope){
        $scope.rows = [8, 7, 6, 5, 4, 3, 2, 1];
        $scope.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];

        $scope.firstClick = null;
        $scope.clickSquare = function(squareName) {
            var comments, moveValidity, fromSquare, toSquare;

            if ($scope.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if ($scope.gameState.pieces[squareName]) {
                    $scope.firstClick = squareName;
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                [moveValidity, comments] = chessMoveValidity($scope.gameState, $scope.firstClick, squareName);
                if (moveValidity) {
                    makeMove($scope.gameState.pieces, $scope.firstClick, squareName);
                    $scope.gameState.lastMove = [$scope.firstClick, squareName];

                    if (checkPromotion($scope.gameState)) {
                        $scope.gameState.promotablePawn = squareName;
                    }
                    else
                        // If there is a promotion, flip whose turn it is after selecting which
                        // piece to promote to. Otherwise, flip whose turn it is now.
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);

                    // If the move was a castle, move the rook
                    if (comments === "castle-king")
                        makeMove($scope.gameState.pieces, getNeighboringSquare(squareName, [1, 0]), getNeighboringSquare(squareName, [-1, 0]));
                    else if (comments === "castle-queen")
                        makeMove($scope.gameState.pieces, getNeighboringSquare(squareName, [-2, 0]), getNeighboringSquare(squareName, [1, 0]));
                    // If the move was en passant, delete the captured pawn
                    else if (comments === "enpassant-white") {
                        delete $scope.gameState.pieces[getNeighboringSquare(squareName, [0, -1])];
                    }
                    else if (comments === "enpassant-black") {
                        delete $scope.gameState.pieces[getNeighboringSquare(squareName, [0, 1])];
                    }
                }
                else {
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        $("#ch-" + fromSquare).addClass("warning");
                        // AJK TODO make this more abstracted, use the directive
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
            // AJK TODO prevent the player from doing anything else in the meanwhile
            $scope.gameState.pieces[$scope.gameState.promotablePawn] = $scope.gameState.currentPlayer + " " + pieceName;
            $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
            $scope.gameState.promotablePawn = "";
        }
    }]);
}());
