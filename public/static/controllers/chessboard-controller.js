(function(){
    angular
    .module("app", [])
    .controller("ChessboardController", function(){
        var chessboard = this;

        chessboard.rows = [8, 7, 6, 5, 4, 3, 2, 1];
        chessboard.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
        chessboard.pieces = {"A1": "white rook", "B1": "white knight", "C1": "white bishop",
        "D1": "white queen", "E1": "white king", "F1": "white bishop", "G1": "white knight",
        "H1": "white rook", "A2": "white pawn", "B2": "white pawn", "C2": "white pawn",
        "D2": "white pawn", "E2": "white pawn", "F2": "white pawn", "G2": "white pawn",
        "H2": "white pawn", "A7": "black pawn", "B7": "black pawn", "C7": "black pawn",
        "D7": "black pawn", "E7": "black pawn", "F7": "black pawn", "G7": "black pawn",
        "H7": "black pawn", "A8": "black rook", "B8": "black knight", "C8": "black bishop",
        "D8": "black queen", "E8": "black king", "F8": "black bishop", "G8": "black knight",
        "H8": "black rook"};  // Starting position
        chessboard.pieceStyle = "symbol";
        chessboard.currentPlayer = "white";

        chessboard.switchPieceStyles = function() {
            if (chessboard.pieceStyle == "letter") {
                chessboard.pieceStyle = "symbol";
                $("#switch-piece-styles").text("Switch to piece letter abbreviations");
            }
            else if (chessboard.pieceStyle == "symbol") {
                chessboard.pieceStyle = "letter";
                $("#switch-piece-styles").text("Switch to piece symbols");
            }
        };

        chessboard.firstClick = null;
        chessboard.clickSquare = function(squareName) {
            if (chessboard.firstClick === null) {
                // If there is a piece on the chosen square, mark the square as selected
                if (chessboard.pieces[squareName]) {
                    chessboard.firstClick = squareName;
                    $("#" + squareName).addClass("selected");
                }
            }
            else {
                // Attempt to move the previously selected piece to the newly chosen square
                pieceType = chessboard.pieces[chessboard.firstClick];
                [moveValidity, error] = checkMoveValidity(chessboard.pieces, chessboard.firstClick, squareName, chessboard.currentPlayer);
                if (moveValidity) {
                    makeMove(chessboard.pieces, chessboard.firstClick, squareName);
                    if (checkPromotion(chessboard.pieces, squareName)) {
                    chessboard.promotablePawn = squareName;
                    $("#promotion-prompt").show();
                    }
                    else
                        // If there is a promotion, flip whose turn it is after selecting which
                        // piece to promote to. Otherwise, flip whose turn it is now.
                        chessboard.currentPlayer = getOtherColor(chessboard.currentPlayer);
                }
                else {
                    [errorType, errorDetails] = error;
                    if (errorType === "check") {
                        fromSquare = errorDetails;
                        $("#" + fromSquare).addClass("warning");
                        setTimeout(function(){$("#" + fromSquare).removeClass("warning");}, 400)
                    }
                }
                // Whether the move is valid or not, deselect the piece.
                $("#" + chessboard.firstClick).removeClass("selected");
                chessboard.firstClick = null;
            }
        };

        chessboard.promote = function(pieceName) {
            // AJK TODO prevent the player from doing anything else in the meanwhile
            chessboard.pieces[chessboard.promotablePawn] = chessboard.currentPlayer + " " + pieceName;
            chessboard.currentPlayer = getOtherColor(chessboard.currentPlayer);
            $("#promotion-prompt").hide();
        }
    });
}());
