function contains(array, object) {
    // Return true if array exists and is indexable and contains object
    return Boolean(array && array.indexOf && array.indexOf(object) !== -1);
}

function getNeighboringSquare(startSquare, directions) {
    var oldColumn, oldRow;
    [oldColumn, oldRow] = startSquare;
    var newColumn = String.fromCharCode(oldColumn.charCodeAt(0) + directions[0]);
    var newRow = parseInt(oldRow) + directions[1];
    if (!contains("ABCDEFGH", newColumn)) {
        // If the column is not a properly named column
        return undefined;
    }
    else if (!contains([1, 2, 3, 4, 5, 6, 7, 8], newRow)) {
        // If the row is not a properly named row
        return undefined;
    }
    else {
        return newColumn + newRow;
    }
}

function getSquareDistance(startSquare, endSquare) {
    [startColumn, startRow] = startSquare;
    [endColumn, endRow] = endSquare;
    var numColumns = endColumn.charCodeAt(0) - startColumn.charCodeAt(0);
    var numRows = endRow.charCodeAt(0) - startRow.charCodeAt(0);
    return [numColumns, numRows];
}

function findPiece(boardState, pieceType) {
    // This returns a list, regardless of whether the piece is unique or not
    var squareList = [];
    for (var square in boardState) {
        if (boardState.hasOwnProperty(square)) {
            var piece = boardState[square];
            if (piece === pieceType)
                squareList.push(square);
        }
    }
    return squareList;
}

function getOtherColor(color) {
    if (color === "white")
        return "black";
    if (color === "black")
        return "white";
}

function chessPieceMovable(boardState, startSquare, endSquare, lastMove, castleLegality) {
    var pieceType = boardState[startSquare];
    var pieceColor = pieceType.split(" ")[0];
    var moveDistance = getSquareDistance(startSquare, endSquare);
    var i, boardCopy, checkDistance, moveDirection, moveLength, moveThroughSquare, threatColor, threatSquare;

    switch (pieceType) {
    case "white pawn":
        switch (moveDistance.join(",")) {
        case "0,1":
            return !Boolean(boardState[endSquare]);
        case "0,2":
            return contains(startSquare, 2) && !boardState[endSquare] && !boardState[getNeighboringSquare(startSquare, [0, 1])];
        case "1,1":
        case "-1,1":
            if (contains(boardState[endSquare], "black"))
                return true;
            else if (lastMove[0] === getNeighboringSquare(endSquare, [0, 1])
                && lastMove[1] === getNeighboringSquare(endSquare, [0, -1])
                && boardState[getNeighboringSquare(endSquare, [0, -1])] === "black pawn")
                // The last move was a pawn move over the square where this pawn is moving
                return [true, "enpassant-white"];
            else
                return false;
        default:
            return false;
        }
    case "black pawn":
        switch (moveDistance.join(",")) {
        case "0,-1":
            return !Boolean(boardState[endSquare]);
        case "0,-2":
            return contains(startSquare, 7) && !boardState[endSquare] && !boardState[getNeighboringSquare(startSquare, [0, -1])];
        case "1,-1":
        case "-1,-1":
            if (contains(boardState[endSquare], "white"))
                return true;
            else if (lastMove[0] === getNeighboringSquare(endSquare, [0, -1])
                && lastMove[1] === getNeighboringSquare(endSquare, [0, 1])
                && boardState[getNeighboringSquare(endSquare, [0, 1])] === "white pawn")
                // The last move was a pawn move over the square where this pawn is moving
                return [true, "enpassant-black"];
            else
                return false;
        default:
            return false;
        }
    case "white rook":
    case "black rook":
        if (moveDistance[0] === 0) {
            moveDirection = [0, Math.sign(moveDistance[1])];
            moveLength = Math.abs(moveDistance[1]);
            if (moveLength === 0)
                // The rook can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            moveDirection = [Math.sign(moveDistance[0]), 0];
            moveLength = Math.abs(moveDistance[0])
        }
        else
            // The rook can only move along a rank or a file
            return false;

        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i];
            if (boardState[getNeighboringSquare(startSquare, checkDistance)])
                // The rook cannot move through other pieces
                return false;
        }
        // The rook cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white knight":
    case "black knight":
        switch (moveDistance.join(",")) {
        case "1,2":
        case "2,1":
        case "2,-1":
        case "1,-2":
        case "-1,-2":
        case "-2,-1":
        case "-2,1":
        case "-1,2":
            return !contains(boardState[endSquare], pieceColor);
        default:
            return false;
        }
    case "white bishop":
    case "black bishop":
        moveLength = Math.abs(moveDistance[0]);
        if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
            // The bishop can only move along a perfect diagonal
            return false;

        moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])];
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i];
            if (boardState[getNeighboringSquare(startSquare, checkDistance)])
                // The bishop cannot move through other pieces
                return false;
        }
        // The bishop cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white queen":
    case "black queen":
        if (moveDistance[0] === 0) {
            moveDirection = [0, Math.sign(moveDistance[1])];
            moveLength = Math.abs(moveDistance[1]);
            if (moveDistance[1] === 0)
                // The queen can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            moveDirection = [Math.sign(moveDistance[0]), 0];
            moveLength = Math.abs(moveDistance[0]);
        }
        else {
            moveLength = Math.abs(moveDistance[0]);
            if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
                // The queen can only move along a rank, file or perfect diagonal
                return false;
        }

        moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])];
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i];
            if (boardState[getNeighboringSquare(startSquare, checkDistance)])
                // The queen cannot move through other pieces
                return false;
        }
        // The queen cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white king":
    case "black king":
        switch (moveDistance.join(",")) {
        case "0,1":
        case "1,1":
        case "1,0":
        case "1,-1":
        case "0,-1":
        case "-1,-1":
        case "-1,0":
        case "-1,1":
            return !contains(boardState[endSquare], pieceColor);
        case "2,0":
            if (!castleLegality.H)
                return false;
            // Make sure there are no squares between the king and the rook
            else if (boardState[getNeighboringSquare(startSquare, [1, 0])]
                    || boardState[getNeighboringSquare(startSquare, [2, 0])])
                return false;
            else {
                threatColor = getOtherColor(pieceType.split(" ")[0]);
                // Check that there are no threats to the king or the square the king is
                // moving through. Don't look at the square the king is moving to, that
                // gets looked at later.
                threatSquare = checkThreat(boardState, startSquare, threatColor);
                if (threatSquare)
                    return [false, ["check", [threatSquare, startSquare]]];

                moveThroughSquare = getNeighboringSquare(startSquare, [1, 0]);
                boardCopy = makeTestMove(boardState, startSquare, moveThroughSquare);
                threatSquare = checkThreat(boardCopy, moveThroughSquare, threatColor);
                if (threatSquare)
                    return [false, ["check", [threatSquare, moveThroughSquare]]];
            }
            return [true, "castle-king"];
        case "-2,0":
            if (!castleLegality.A)
                return false;
            // Make sure there are no squares between the king and the rook
            else if (boardState[getNeighboringSquare(startSquare, [-1, 0])]
                    || boardState[getNeighboringSquare(startSquare, [-2, 0])]
                    || boardState[getNeighboringSquare(startSquare, [-3, 0])])
                return false;
            else {
                threatColor = getOtherColor(pieceType.split(" ")[0]);
                // Check that there are no threats to the king or the square the king is
                // moving through. Don't look at the square the king is moving to, that
                // gets looked at later.
                threatSquare = checkThreat(boardState, startSquare, threatColor);
                if (threatSquare)
                    return [false, ["check", [threatSquare, startSquare]]];

                moveThroughSquare = getNeighboringSquare(startSquare, [-1, 0]);
                boardCopy = makeTestMove(boardState, startSquare, moveThroughSquare);
                threatSquare = checkThreat(boardCopy, moveThroughSquare, threatColor);
                if (threatSquare)
                    return [false, ["check", [threatSquare, moveThroughSquare]]];
            }
            return [true, "castle-queen"];
        default:
            return false;
        }
    default:
        return false;
    }
}

function makeTestMove(boardState, startSquare, endSquare) {
    // Make a copy of the boardState
    var boardCopy = {};
    for (var square in boardState) {
        if (boardState.hasOwnProperty(square)) {
            pieceType = boardState[square];
            boardCopy[square] = pieceType;
        }
    }

    // Move the piece, capturing if necessary
    var pieceType = boardCopy[startSquare];
    delete boardCopy[startSquare];
    boardCopy[endSquare] = pieceType;
    return boardCopy;
}

function checkThreat(boardState, square, color) {
    // Check if there is a threat to the given square from the given color

    // A king can't threaten from two spaces away
    var lastMove = ["", ""];
    var castleLegality = {"A": false, "H": false};

    var pieceNameList = ["pawn", "rook", "knight", "bishop", "queen", "king"];
    for (var i = 0; i < pieceNameList.length; i ++) {
        var pieceName = pieceNameList[i];
        var pieceType = color + " " + pieceName;
        var pieceLocList = findPiece(boardState, pieceType);
        for (var j = 0; j < pieceLocList.length; j ++) {
            var pieceLoc = pieceLocList[j];
            // If any piece is threatening the square, return its location
            if (chessPieceMovable(boardState, pieceLoc, square, lastMove, castleLegality))
                return pieceLoc;
        }
    }

    // If there is no threat
    return "";
}

function checkCheck(boardState, color) {
    [kingLoc] = findPiece(boardState, color + " king");
    var otherColor = getOtherColor(color);
    return checkThreat(boardState, kingLoc, otherColor);
}

function newChessGame(gameState) {
    gameState.pieces = {"A1": "white rook", "B1": "white knight", "C1": "white bishop",
    "D1": "white queen", "E1": "white king", "F1": "white bishop", "G1": "white knight",
    "H1": "white rook", "A2": "white pawn", "B2": "white pawn", "C2": "white pawn",
    "D2": "white pawn", "E2": "white pawn", "F2": "white pawn", "G2": "white pawn",
    "H2": "white pawn", "A7": "black pawn", "B7": "black pawn", "C7": "black pawn",
    "D7": "black pawn", "E7": "black pawn", "F7": "black pawn", "G7": "black pawn",
    "H7": "black pawn", "A8": "black rook", "B8": "black knight", "C8": "black bishop",
    "D8": "black queen", "E8": "black king", "F8": "black bishop", "G8": "black knight",
    "H8": "black rook"};  // Starting position
    gameState.pieceStyle = "symbol";  // options are symbol or letter
    gameState.promotablePawn = "";
    gameState.lastMove = ["", ""];
    gameState.currentPlayer = "white";
    gameState.castleLegality = {"white": {"A": true, "H": true}, "black": {"A": true, "H": true}};
}

function chessMoveValidity(gameState, startSquare, endSquare) {
    var currentPlayer = gameState.currentPlayer;
    var castleLegality = gameState.castleLegality[currentPlayer];

    if (gameState.pieces[startSquare].split(" ")[0] !== currentPlayer)
        // A player can only move their own pieces
        return [false, ["turn", null]];

    // Make sure a piece can actually make the move specified
    var moveLegality = chessPieceMovable(gameState.pieces, startSquare, endSquare, gameState.lastMove, castleLegality);
    if (!moveLegality)
        return [false, ["illegal", null]];
    else if (moveLegality[0] === false)
        // Pass along any comments from chessPieceMovable
        return [false, moveLegality[1]];

    // Test out the move before actually making it to see if any issues arise
    var boardCopy = makeTestMove(gameState.pieces, startSquare, endSquare);
    var checkingSquare = checkCheck(boardCopy, currentPlayer);
    var kingSquare = findPiece(boardCopy, currentPlayer + " king");
    // AJK TODO alert the user if there is checkmate
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", [checkingSquare, kingSquare]]];

    // If any kings were moved, don't allow future castling for that player
    // If any rooks were moved or captured, don't allow future castling on that side
    // AJK TODO make this a subroutine, please
    if (startSquare === "A1" || endSquare === "A1")
        gameState.castleLegality.white.A = false;
    if (startSquare === "H1" || endSquare === "H1")
        gameState.castleLegality.white.H = false;
    if (startSquare === "A8" || endSquare === "A8")
        gameState.castleLegality.black.A = false;
    if (startSquare === "H8" || endSquare === "H8")
        gameState.castleLegality.black.H = false;
    if (gameState.pieces[startSquare] === "white king") {
        gameState.castleLegality.white.A = false;
        gameState.castleLegality.white.H = false;
    }
    if (gameState.pieces[startSquare] === "black king") {
        gameState.castleLegality.black.A = false;
        gameState.castleLegality.black.H = false;
    }
    // Allow the move to be made and pass along any comments from chessPieceMovable
    return [true, moveLegality[1]];
}

function makeMove(boardState, startSquare, endSquare) {
    // Move the piece, capturing if necessary
    var pieceType = boardState[startSquare];
    delete boardState[startSquare];
    boardState[endSquare] = pieceType;
}

function checkPromotion(gameState) {
    var boardState = gameState.pieces;
    var square = gameState.lastMove[1];
    var pieceColor, pieceName;

    // Return true if the piece is a pawn on its last rank and false otherwise
    [pieceColor, pieceName] = boardState[square].split(" ");
    return ((pieceColor === "white" && square[1] === "8") || (pieceColor === "black" && square[1] === "1")) && pieceName === "pawn";
}
