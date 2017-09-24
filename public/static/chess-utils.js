pieceNameList = ["pawn", "rook", "knight", "bishop", "queen", "king"];

function contains(array, object){
    // Return true if array exists and is indexable and contains object
    return Boolean(array && array.indexOf && array.indexOf(object) !== -1);
}

function getNeighboringSquare(startSquare, directions) {
    [oldColumn, oldRow] = startSquare;
    newColumn = String.fromCharCode(oldColumn.charCodeAt() + directions[0]);
    newRow = parseInt(oldRow) + directions[1];
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
    numColumns = endColumn.charCodeAt() - startColumn.charCodeAt();
    numRows = endRow - startRow;  // this is an Int
    return [numColumns, numRows];
}

function findPiece(boardState, pieceType) {
    // This returns a list, regardless of whether the piece is unique or not
    squareList = [];
    for (let [square, piece] of Object.entries(boardState)) {
        if (piece === pieceType)
            squareList.push(square);
    }
    return squareList;
}

function getOtherColor(color) {
    if (color === "white")
        return "black";
    if (color === "black")
        return "white";
}

function isPieceMovable(boardState, startSquare, endSquare, castleLegality) {
    pieceType = boardState[startSquare];
    pieceColor = pieceType.split(" ")[0];
    moveDistance = getSquareDistance(startSquare, endSquare);

    switch (pieceType) {
    case "white pawn":
        switch (moveDistance.join(",")) {
        case "0,1":
            return !Boolean(boardState[endSquare]);
        case "0,2":
            return contains(startSquare, 2) && !boardState[endSquare] && !boardState[getNeighboringSquare(startSquare, [0, 1])];
        case "1,1":
        case "-1,1":
            return contains(boardState[endSquare], "black");
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
            return contains(boardState[endSquare], "white");
        // AJK TODO need to include en passant (requires holding on to the previous move)
        default:
            return false;
        }
    case "white rook":
    case "black rook":
        if (moveDistance[0] === 0) {
            moveDirection = [0, Math.sign(moveDistance[1])]
            moveLength = Math.abs(moveDistance[1])
            if (moveDistance[1] === 0)
                // The rook can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            moveDirection = [Math.sign(moveDistance[0]), 0]
            moveLength = Math.abs(moveDistance[0])
        }
        else
            // The rook can only move along a rank or a file
            return false;

        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
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
        moveLength = Math.abs(moveDistance[0])
        if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
            // The bishop can only move along a perfect diagonal
            return false;

        moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])]
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
            if (boardState[getNeighboringSquare(startSquare, checkDistance)])
                // The bishop cannot move through other pieces
                return false;
        }
        // The bishop cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white queen":
    case "black queen":
        if (moveDistance[0] === 0) {
            moveDirection = [0, Math.sign(moveDistance[1])]
            moveLength = Math.abs(moveDistance[1])
            if (moveDistance[1] === 0)
                // The queen can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            moveDirection = [Math.sign(moveDistance[0]), 0]
            moveLength = Math.abs(moveDistance[0])
        }
        else {
            moveLength = Math.abs(moveDistance[0])
            if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
                // The queen can only move along a rank, file or perfect diagonal
                return false;
        }

        moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])]
        for (i = 1; i < moveLength; i ++) {
            checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
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
            if (contains(boardState[endSquare], pieceColor))
                return false;
            else {
                return true;
            }
        case "2,0":
            if (!castleLegality.H)
                return false;
            // Make sure there are no squares between the king and the rook
            else if (boardState[getNeighboringSquare(startSquare, [1, 0])]
                    || boardState[getNeighboringSquare(startSquare, [2, 0])])
                return false;
            else {
                threatColor = getOtherColor(pieceType.split(" ")[0]);
                // Check that there are no threats to the king, the rook, or the square the rook is moving to
                // Don't look at the square the king is moving to, that gets looked at later
                for (let moveDistance of [[0, 0], [1, 0], [3, 0]]) {
                    squareToCheck = getNeighboringSquare(startSquare, moveDistance)
                    threatSquare = checkThreat(boardState, squareToCheck, threatColor);
                    if (threatSquare)
                        return [false, ["check", [threatSquare, squareToCheck]]];
                }
            }
            return [true, "castle-queen"];
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
                // Check that there are no threats to the king, the rook, or the square the rook is moving to
                // Don't look at the square the king is moving to, that gets looked at later
                for (let moveDistance of [[0, 0], [-1, 0], [-4, 0]]) {
                    squareToCheck = getNeighboringSquare(startSquare, moveDistance)
                    threatSquare = checkThreat(boardState, squareToCheck, threatColor);
                    if (threatSquare)
                        return [false, ["check", [threatSquare, squareToCheck]]];
                }
            }
            return [true, "castle-queen"];
        default:
            return false;
        }
    default:
        return true;
    }
}

function checkThreat(boardState, square, color) {
    // Check if there is a threat to the given square from the given color

    // A king can't threaten from two spaces away
    castleLegality = {"A": false, "H": false}

    for (let pieceName of pieceNameList) {
        pieceType = color + " " + pieceName;
        for (let pieceLoc of findPiece(boardState, pieceType)) {
            // If any piece is threatening the square, return its location
            if (isPieceMovable(boardState, pieceLoc, square, castleLegality))
                return pieceLoc;
        }
    }

    // If there is no threat
    return "";
}

function checkCheck(boardState, color) {
    [kingLoc] = findPiece(boardState, color + " king");
    otherColor = getOtherColor(color)
    return checkThreat(boardState, kingLoc, otherColor);
}

function checkMoveValidity(boardInfo, endSquare) {
    // AJK TODO make this stuff more global
    boardState = boardInfo.pieces;
    startSquare = boardInfo.firstClick;
    currentPlayer = boardInfo.currentPlayer;
    castleLegality = boardInfo.castleLegality[currentPlayer];

    if (boardState[startSquare].split(" ")[0] !== currentPlayer)
        // A player can only move their own pieces
        return [false, ["turn", null]];

    // Make sure a piece can actually make the move specified
    moveLegality = isPieceMovable(boardState, startSquare, endSquare, castleLegality)
    if (!moveLegality)
        return [false, ["illegal", null]];
    else if (moveLegality[0] === false)
        // Pass along any comments from isPieceMovable
        return [false, moveLegality[1]];

    // Test out the move before actually making it to see if any issues arise
    boardCopy = {};
    for (let [square, pieceType] of Object.entries(boardState))
        boardCopy[square] = pieceType;
    makeMove(boardCopy, startSquare, endSquare);
    checkingSquare = checkCheck(boardCopy, currentPlayer);
    kingSquare = findPiece(boardCopy, currentPlayer + " king")
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", [checkingSquare, kingSquare]]];

    // If any kings were moved, don't allow future castling for that player
    // If any rooks were moved or captured, don't allow future castling on that side
    // AJK TODO make this a subroutine, please
    if (startSquare === "A1" || endSquare === "A1")
        boardInfo.castleLegality.white.A = false;
    if (startSquare === "H1" || endSquare === "H1")
        boardInfo.castleLegality.white.H = false;
    if (startSquare === "A8" || endSquare === "A8")
        boardInfo.castleLegality.black.A = false;
    if (startSquare === "H8" || endSquare === "H8")
        boardInfo.castleLegality.black.H = false;
    if (boardState[startSquare] === "white king") {
        boardInfo.castleLegality.white.A = false;
        boardInfo.castleLegality.white.H = false;
    }
    if (boardState[startSquare] === "black king") {
        boardInfo.castleLegality.black.A = false;
        boardInfo.castleLegality.black.H = false;
    }
    // Allow the move to be made and pass along any comments from isPieceMovable
    return [true, moveLegality[1]];
}

function makeMove(boardState, startSquare, endSquare) {
    // Move the piece, capturing if necessary
    pieceType = boardState[startSquare];
    delete boardState[startSquare];
    boardState[endSquare] = pieceType;
}

function checkPromotion(boardState, square) {
    // Return true if the piece is a pawn on its last rank and false otherwise
    [pieceColor, pieceName] = boardState[square].split(" ");
    if (((pieceColor === "white" && square[1] == 8) || (pieceColor === "black" && square[1] == 1)) && pieceName === "pawn")
        return true;
    else
        return false;
}
