(function(){
    angular
    .module("app", [])
    .controller("ChessboardController", ["$scope", function($scope){
        $scope.rows = [8, 7, 6, 5, 4, 3, 2, 1];
        $scope.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
        $scope.pieces = {"A1": "white rook", "B1": "white knight", "C1": "white bishop",
        "D1": "white queen", "E1": "white king", "F1": "white bishop", "G1": "white knight",
        "H1": "white rook", "A2": "white pawn", "B2": "white pawn", "C2": "white pawn",
        "D2": "white pawn", "E2": "white pawn", "F2": "white pawn", "G2": "white pawn",
        "H2": "white pawn", "A7": "black pawn", "B7": "black pawn", "C7": "black pawn",
        "D7": "black pawn", "E7": "black pawn", "F7": "black pawn", "G7": "black pawn",
        "H7": "black pawn", "A8": "black rook", "B8": "black knight", "C8": "black bishop",
        "D8": "black queen", "E8": "black king", "F8": "black bishop", "G8": "black knight",
        "H8": "black rook"};  // Starting position
        $scope.pieceStyle = "symbol";
        $scope.promotablePawn = "";
        $scope.lastMove = ["", ""];
        $scope.currentPlayer = "white";
        $scope.castleLegality = {"white": {"A": true, "H": true}, "black": {"A": true, "H": true}};

        // AJK TODO look into directives for these and/or the chess-utils functions
        $scope.firstClick = null;
        $scope.clickSquare = function(squareName) {
            if ($scope.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if ($scope.pieces[squareName]) {
                    $scope.firstClick = squareName;
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                var pieceType = $scope.pieces[$scope.firstClick];
                [moveValidity, comments] = checkMoveValidity($scope.firstClick, squareName);
                if (moveValidity) {
                    makeMove($scope.firstClick, squareName);
                    $scope.lastMove = [$scope.firstClick, squareName];

                    if (checkPromotion()) {
                        $scope.promotablePawn = squareName;
                    }
                    else
                        // If there is a promotion, flip whose turn it is after selecting which
                        // piece to promote to. Otherwise, flip whose turn it is now.
                        $scope.currentPlayer = getOtherColor($scope.currentPlayer);

                    // If the move was a castle, move the rook
                    if (comments === "castle-king")
                        makeMove(getNeighboringSquare(squareName, [1, 0]), getNeighboringSquare(squareName, [-1, 0]));
                    else if (comments === "castle-queen")
                        makeMove(getNeighboringSquare(squareName, [-2, 0]), getNeighboringSquare(squareName, [1, 0]));
                    // If the move was en passant, delete the captured pawn
                    else if (comments === "enpassant-white") {
                        delete $scope.pieces[getNeighboringSquare(squareName, [0, -1])];
                    }
                    else if (comments === "enpassant-black") {
                        delete $scope.pieces[getNeighboringSquare(squareName, [0, 1])];
                    }
                }
                else {
                    [errorType, errorDetails] = comments;
                    if (errorType === "check") {
                        [fromSquare, toSquare] = errorDetails;
                        $("#" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#" + toSquare).addClass("warning");}, 400)
                        setTimeout(function(){$("#" + fromSquare).removeClass("warning");}, 400)
                        setTimeout(function(){$("#" + toSquare).removeClass("warning");}, 800)
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $scope.firstClick = null;
            }
        };

        $scope.promote = function(pieceName) {
            // AJK TODO prevent the player from doing anything else in the meanwhile
            $scope.pieces[$scope.promotablePawn] = $scope.currentPlayer + " " + pieceName;
            $scope.currentPlayer = getOtherColor($scope.currentPlayer);
            $scope.promotablePawn = "";
        }
    }]);
}());
