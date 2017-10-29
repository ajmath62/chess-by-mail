(function(){
    angular
    .module("app")
    .controller("ChessController", ["$scope", function($scope){
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
                moveValidity = chess.moveValidity($scope.gameState, $scope.firstClick, squareName);

                if (moveValidity.validity) {
                    chess.makeMove($scope.gameState, $scope.firstClick, squareName);
                    $scope.gameState.lastMove = [$scope.firstClick, squareName];

                    switch(moveValidity.details) {
                    // If the move was a castle, move the rook
                    case "castle-king":
                        chess.makeMove($scope.gameState, chess.getNeighboringSquare(squareName, [1, 0]), chess.getNeighboringSquare(squareName, [-1, 0]));
                        break;
                    case "castle-queen":
                        chess.makeMove($scope.gameState, chess.getNeighboringSquare(squareName, [-2, 0]), chess.getNeighboringSquare(squareName, [1, 0]));
                        break;
                    // If the move was en passant, delete the captured pawn
                    case "enpassant-white":
                        delete $scope.gameState.pieces[chess.getNeighboringSquare(squareName, [0, -1])];
                        break;
                    case "enpassant-black":
                        delete $scope.gameState.pieces[chess.getNeighboringSquare(squareName, [0, 1])];
                        break;
                    default:
                        break;
                    }

                    if (chess.checkPromotion($scope.gameState))
                        // Don't end the move until the promotion has been completed
                        $scope.gameState.promotable = squareName;
                    else
                        // End the move now
                        $scope.moveCleanup();
                }
                else {
                    switch(moveValidity.reason) {
                    case "check":
                        // Flash the offending squares
                        $scope.gameState.flash = moveValidity.details;
                        break;
                    case "out of turn":
                        // Flash the White/Black to play sign
                        $scope.gameState.flash = ["current-player"];
                        break;
                    case "illegal move":
                        break;
                    default:
                        break;
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };

        $scope.promote = function(pieceName) {
            $scope.gameState.pieces[$scope.gameState.promotable] = $scope.gameState.currentPlayer + " " + pieceName;
            $scope.gameState.promotable = "";
            $scope.moveCleanup();
        };

        $scope.moveCleanup = function() {
            // Flip turns. This will prompt the game string to be updated (see hash-directives.js)
            flipPlayer($scope.gameState);
            $scope.upToDateString.value = false;

            $scope.gameOver.value = chess.checkMate($scope.gameState);
        };
    }]);
}());
