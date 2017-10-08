function shogiGetNeighboringSquare(startSquare, directions) {
    var oldColumn, oldRow, newColumn, newRow;
    [oldColumn, oldRow] = startSquare;
    newColumn = parseInt(oldColumn) + directions[0];
    newRow = String.fromCharCode(oldRow.charCodeAt(0) + directions[1]);
    if (!contains([1, 2, 3, 4, 5, 6, 7, 8, 9], newColumn)) {
        // If the column is not a properly named column
        return undefined;
    }
    else if (!contains("ABCDEFGHI", newRow)) {
        // If the row is not a properly named row
        return undefined;
    }
    else {
        return newColumn + newRow;
    }
}

function shogiPieceMovable(boardState, startSquare, endSquare) {
    var pieceType = boardState[startSquare];
    var pieceColor = pieceType.split(" ")[0];
    var moveDistance = getSquareDistance(startSquare, endSquare);
    var checkDistance, i, moveDirection, moveLength;

    switch (pieceType) {
    case "white pawn":
        return moveDistance[0] === 0 && moveDistance [1] === 1 && !contains(boardState[endSquare], "white");
    case "black pawn":
        return moveDistance[0] === 0 && moveDistance[1] === -1 && !contains(boardState[endSquare], "black");
    case "white lance":
        if (moveDistance[0] !== 0 || moveDistance[1] <= 0)
            // The lance can only move forward within a column
            return false;

        moveLength = moveDistance[1];
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [0, i];
            if (boardState[shogiGetNeighboringSquare(startSquare, checkDistance)])
                // The lance cannot move through other pieces
                return false;
        }
        // The lance cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "black lance":
        if (moveDistance[0] !== 0 || moveDistance[1] >= 0)
            // The lance can only move forward within a column
            return false;

        moveLength = -moveDistance[1];
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [0, -i];
            if (boardState[shogiGetNeighboringSquare(startSquare, checkDistance)])
                // The lance cannot move through other pieces
                return false;
        }
        // The lance cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white knight":
        return Math.abs(moveDistance[0]) === 1 && moveDistance[1] === 2 && !contains(boardState[endSquare], "white");
    case "black knight":
        return Math.abs(moveDistance[0]) === 1 && moveDistance[1] === -2 && !contains(boardState[endSquare], "black");
    case "white silver":
        switch (moveDistance.join(",")) {
        case "0,1":
        case "1,1":
        case "1,-1":
        case "-1,-1":
        case "-1,1":
            return !contains(boardState[endSquare], pieceColor);
        default:
            return false;
        }
    case "black silver":
        switch (moveDistance.join(",")) {
        case "1,1":
        case "1,-1":
        case "0,-1":
        case "-1,-1":
        case "-1,1":
            return !contains(boardState[endSquare], pieceColor);
        default:
            return false;
        }
    case "white gold":
    case "white pawn+":
    case "white lance+":
    case "white knight+":
    case "white silver+":
        switch (moveDistance.join(",")) {
        case "0,1":
        case "1,1":
        case "1,0":
        case "0,-1":
        case "-1,0":
        case "-1,1":
            return !contains(boardState[endSquare], pieceColor);
        default:
            return false;
        }
    case "black gold":
    case "black pawn+":
    case "black lance+":
    case "black knight+":
    case "black silver+":
        switch (moveDistance.join(",")) {
        case "0,1":
        case "1,0":
        case "1,-1":
        case "0,-1":
        case "-1,-1":
        case "-1,0":
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
            if (boardState[shogiGetNeighboringSquare(startSquare, checkDistance)])
                // The bishop cannot move through other pieces
                return false;
        }
        // The bishop cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white rook":
    case "black rook":
        if (moveDistance[0] === 0) {
            moveDirection = [0, Math.sign(moveDistance[1])];
            moveLength = Math.abs(moveDistance[1]);
            if (moveDistance[1] === 0)
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
            if (boardState[shogiGetNeighboringSquare(startSquare, checkDistance)])
                // The rook cannot move through other pieces
                return false;
        }
        // The rook cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white bishop+":
    case "black bishop+":
        // Like a bishop plus king
        return false;
    case "white rook+":
    case "black rook+":
        // Like a rook plus king
        return false;
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
        default:
            return false;
        }
    default:
        return false;
    }
}

function newShogiGame(gameState) {
    gameState.pieces = {"1A": "white lance", "2A": "white knight", "3A": "white silver",
    "4A": "white gold", "5A": "white king", "6A": "white gold", "7A": "white silver",
    "8A": "white knight", "9A": "white lance", "2B": "white bishop", "8B": "white rook",
    "1C": "white pawn", "2C": "white pawn", "3C": "white pawn", "4C": "white pawn",
    "5C": "white pawn", "6C": "white pawn", "7C": "white pawn", "8C": "white pawn",
    "9C": "white pawn", "1G": "black pawn", "2G": "black pawn", "3G": "black pawn",
    "4G": "black pawn", "5G": "black pawn", "6G": "black pawn", "7G": "black pawn",
    "8G": "black pawn", "9G": "black pawn", "2H": "black rook", "8H": "black bishop",
    "1I": "black lance", "2I": "black knight", "3I": "black silver", "4I": "black gold",
    "5I": "black king", "6I": "black gold", "7I": "black silver", "8I": "black knight",
    "9I": "black lance"};  // Starting position
    gameState.pieceStyle = "kanji";  // options are kanji or romaji
    gameState.promotablePiece = "";
    gameState.lastMove = ["", ""];
    gameState.currentPlayer = "black";
}

function shogiMoveValidity(gameState, startSquare, endSquare) {
    var currentPlayer = gameState.currentPlayer;

    if (gameState.pieces[startSquare].split(" ")[0] !== currentPlayer)
        // A player can only move their own pieces
        return [false, ["turn", null]];

    // Make sure a piece can actually make the move specified
    var moveLegality = shogiPieceMovable(gameState.pieces, startSquare, endSquare);
    if (!moveLegality)
        return [false, ["illegal", null]];
    else if (moveLegality[0] === false)
        // Pass along any comments from shogiPieceMovable
        return [false, moveLegality[1]];

    // Test out the move before actually making it to see if any issues arise
    // AJK TODO this needs debugging
    /*var boardCopy = makeTestMove(gameState.pieces, startSquare, endSquare);
    var checkingSquare = checkCheck(boardCopy, currentPlayer);
    var kingSquare = findPiece(boardCopy, currentPlayer + " king");
    // AJK TODO alert the user if there is checkmate
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", [checkingSquare, kingSquare]]];*/

    // Allow the move to be made and pass along any comments from shogiPieceMovable
    return [true, moveLegality[1]];
}