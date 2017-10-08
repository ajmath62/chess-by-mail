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

                    switch (shogi.checkPromotion($scope.gameState)) {
                    case "forbidden":
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
                        break;
                    case "permitted":
                        $scope.gameState.promotable = squareName;
                        break;
                    case "forced":
                        $scope.gameState.pieces[squareName] += "_";
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
                        break;
                    default:
                        break;
                    }
                }
                else {
                    var errorType, errorDetails, fromSquare, toSquare;
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        $("#sh-" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#sh-" + toSquare).addClass("warning");}, 400);
                        setTimeout(function(){$("#sh-" + fromSquare).removeClass("warning");}, 400);
                        setTimeout(function(){$("#sh-" + toSquare).removeClass("warning");}, 800);
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };

        $scope.promote = function(actuallyPromote) {
            // AJK TODO prevent the player from doing anything else in the meanwhile
            if (actuallyPromote)
                $scope.gameState.pieces[$scope.gameState.promotable] += "_";
            $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
            $scope.gameState.promotable = "";
        }
    }])
}());
