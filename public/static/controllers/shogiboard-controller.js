(function() {
    angular
    .module("app")
    .controller("ShogiController", ["$scope", function($scope){
        $scope.rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
        $scope.columns = [9, 8, 7, 6, 5, 4, 3, 2, 1];

        $scope.firstClick = null;
        $scope.clickSquare = function($event) {
            var squareName = $event.currentTarget.id;
            var isDrop = squareName.startsWith("*");

            // If there is a promotion dialog open, don't allow other interaction
            if ($scope.gameState.promotable)
                return;

            if ($scope.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if ($scope.gameState.pieces[squareName] || isDrop) {
                    $scope.firstClick = squareName;
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                var playerHand = $scope.gameState.inHand[$scope.gameState.currentPlayer];
                var comments, moveValidity;
                [moveValidity, comments] = shogi.moveValidity($scope.gameState, $scope.firstClick, squareName, playerHand);

                if (moveValidity) {
                    shogi.makeMove($scope.gameState.pieces, $scope.firstClick, squareName, playerHand);
                    $scope.upToDateString.value = false;

                    if (comments === "drop") {
                        $scope.gameState.lastMove = ["*" + $scope.gameState.currentPlayer, squareName];
                        // AJK TODO write a method that just does this one thing
                        $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
                    }
                    else {
                        $scope.gameState.lastMove = [$scope.firstClick, squareName];

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
                }
                else {
                    var errorType, errorDetails, fromSquare, toSquare;
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        $("#" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#" + toSquare).addClass("warning");}, 400);
                        setTimeout(function(){$("#" + fromSquare).removeClass("warning");}, 400);
                        setTimeout(function(){$("#" + toSquare).removeClass("warning");}, 800);
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };

        $scope.promote = function(userConfirm) {
            if (userConfirm)
                $scope.gameState.pieces[$scope.gameState.promotable] += "_";
            $scope.gameState.currentPlayer = getOtherColor($scope.gameState.currentPlayer);
            $scope.gameState.promotable = "";
        }
    }])
}());
