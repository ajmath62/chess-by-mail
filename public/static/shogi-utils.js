shogi.promotionForcedRanks = {"white": {"pawn": "I", "lance": "I", "knight": "HI"}, "black": {"pawn": "A", "lance": "A", "knight": "AB"}};

shogi.getNeighboringSquare = function(startSquare, directions) {
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
};

shogi.isPieceMovable = function(boardState, startSquare, endSquare) {
    var pieceType = boardState[startSquare];
    var pieceColor = pieceType.split(" ")[0];
    var moveDistance = getSquareDistance(startSquare, endSquare);
    var i, checkDistance, moveDirection, moveLength;

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
            if (boardState[shogi.getNeighboringSquare(startSquare, checkDistance)])
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
            if (boardState[shogi.getNeighboringSquare(startSquare, checkDistance)])
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
    case "white pawn_":
    case "white lance_":
    case "white knight_":
    case "white silver_":
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
    case "black pawn_":
    case "black lance_":
    case "black knight_":
    case "black silver_":
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
    case "white bishop_":
    case "black bishop_":
        // A promoted bishop can make any move a king can
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
        }
        // As well as any move a normal bishop can
    case "white bishop":
    case "black bishop":
        moveLength = Math.abs(moveDistance[0]);
        if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
            // The bishop can only move along a perfect diagonal
            return false;

        moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])];
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i];
            if (boardState[shogi.getNeighboringSquare(startSquare, checkDistance)])
                // The bishop cannot move through other pieces
                return false;
        }
        // The bishop cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white rook_":
    case "black rook_":
        // A promoted rook can make any move a king can
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
        }
        // As well as any move a normal rook can
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
            if (boardState[shogi.getNeighboringSquare(startSquare, checkDistance)])
                // The rook cannot move through other pieces
                return false;
        }
        // The rook cannot land on a piece of its own color
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
        default:
            return false;
        }
    default:
        return false;
    }
};

shogi.makeTestMove = function(boardState, startSquare, endSquare, inHand) {
    var isDrop = startSquare.startsWith("*");
    var dropIndex, pieceColor, pieceName, pieceType;

    // Make a copy of the boardState
    var boardCopy = {};
    for (var square in boardState) {
        if (boardState.hasOwnProperty(square)) {
            pieceType = boardState[square];
            boardCopy[square] = pieceType;
        }
    }

    if (isDrop) {
        [pieceColor, dropIndex] = startSquare.substr(1).split(" ");
        pieceName = inHand[dropIndex];
        pieceType = pieceColor + " " + pieceName;
        boardCopy[endSquare] = pieceType;
    }
    else {
        // Move the piece, capturing if necessary
        pieceType = boardCopy[startSquare];
        delete boardCopy[startSquare];
        boardCopy[endSquare] = pieceType;
    }

    return boardCopy;
};

shogi.checkThreat = function(boardState, square, color) {
    // Check if there is a threat to the given square from the given color
    var pieceColor, threatSquare;

    for (threatSquare in boardState) {
        if (boardState.hasOwnProperty(threatSquare)) {
            pieceColor = boardState[threatSquare].split(" ")[0];
            if (pieceColor !== color)
                continue;
            if (shogi.isPieceMovable(boardState, threatSquare, square))
                return threatSquare;
        }
    }

    // If there is no threat
    return "";
};

shogi.checkCheck = function(boardState, color) {
    [kingLoc] = findPiece(boardState, color + " king");
    var otherColor = getOtherColor(color);
    return shogi.checkThreat(boardState, kingLoc, otherColor);
};

shogi.newGame = function(gameState) {
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
    gameState.promotable = "";
    gameState.lastMove = ["", ""];
    gameState.inHand = {"white": [], "black": []};
    gameState.currentPlayer = "black";
};

shogi.moveValidity = function(gameState, startSquare, endSquare, inHand) {
    var currentPlayer = gameState.currentPlayer;
    var isDrop = startSquare.startsWith("*");
    var dropIndex, pieceColor, pieceName;

    if (endSquare.startsWith("*"))
        // Can't move a piece to a player's hand
        return [false, ["illegal", null]];

    if (isDrop) {
        [pieceColor, dropIndex] = startSquare.substr(1).split(" ");
        if (pieceColor !== currentPlayer)
            // A player can only move their own pieces
            return [false, ["turn", null]];

        pieceName = inHand[dropIndex];
        if (gameState.pieces[endSquare])
            // A player cannot drop onto an occupied square
            return [false, ["illegal", null]];
        if (contains(shogi.promotionForcedRanks[pieceColor][pieceName], endSquare[1]))
            // A player cannot drop a piece somewhere it can't move (e.g. a black pawn on the ninth rank)
            return [false, ["illegal", null]];
        // AJK TODO don't permit dropping a pawn into checkmate
        // AJK TODO don't permit dropping a pawn on a file with a pawn in it already
    }
    else {
        if (gameState.pieces[startSquare].split(" ")[0] !== currentPlayer)
            // A player can only move their own pieces
            return [false, ["turn", null]];

        // Make sure a piece can actually make the move specified
        var moveLegality = shogi.isPieceMovable(gameState.pieces, startSquare, endSquare);
        if (!moveLegality)
            return [false, ["illegal", null]];
        else if (moveLegality[0] === false)
            // Pass along any comments from isPieceMovable
            return [false, moveLegality[1]];
    }

    // Test out the move before actually making it to see if any issues arise
    var boardCopy = shogi.makeTestMove(gameState.pieces, startSquare, endSquare, inHand);
    var checkingSquare = shogi.checkCheck(boardCopy, currentPlayer);
    var kingSquare = findPiece(boardCopy, currentPlayer + " king");
    // AJK TODO alert the player if there is checkmate
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", [checkingSquare, kingSquare]]];

    // If the move hasn't been rejected, allow it to be made
    return [true, isDrop ? "drop" : null];
};

shogi.makeMove = function(boardState, startSquare, endSquare, inHand) {
    var isDrop = startSquare.startsWith("*");
    var dropIndex, pieceColor, pieceName, pieceType;

    if (isDrop) {
        [pieceColor, dropIndex] = startSquare.substr(1).split(" ");
        pieceName = inHand[dropIndex];
        pieceType = pieceColor + " " + pieceName;
        boardState[endSquare] = pieceType;
        inHand.splice(dropIndex, 1);
    }
    else {
        // Move the piece, capturing if necessary
        pieceType = boardState[startSquare];
        if (boardState[endSquare]) {
            var pieceList = ["pawn", "lance", "knight", "silver", "gold", "bishop", "rook", "king"];
            // Add the name of the newly captured piece, stripped of its color and promotion status, to the list of pieces in hand
            inHand.push(boardState[endSquare].split(" ")[1].replace("_", ""));
            // Sort the list of pieces in hand from pawn to king
            inHand.sort(function (a, b) {
                return pieceList.indexOf(b) - pieceList.indexOf(a);
            });
        }
        delete boardState[startSquare];
        boardState[endSquare] = pieceType;
    }
};

shogi.checkPromotion = function(gameState) {
    var promotionRanks = {"white": "GHI", "black": "ABC"};
    var promotablePieces = ["pawn", "lance", "knight", "silver", "bishop", "rook"];

    var boardState = gameState.pieces;
    var square = gameState.lastMove[1];
    var pieceColor, pieceName;

    [pieceColor, pieceName] = boardState[square].split(" ");
    if (!contains(promotablePieces, pieceName))
        return "forbidden";
    else if (!contains(promotionRanks[pieceColor], square[1]))
        return "forbidden";
    else if (contains(shogi.promotionForcedRanks[pieceColor][pieceName], square[1]))
        return "forced";
    else return "permitted";
};
