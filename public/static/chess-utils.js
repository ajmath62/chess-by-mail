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

function isPieceMovable(boardState, startSquare, endSquare) {
    pieceType = boardState[startSquare];
    pieceColor = pieceType.split(" ")[0];
    moveDistance = getSquareDistance(startSquare, endSquare);

    switch (pieceType) {
    case "white pawn":
        switch (moveDistance.join(",")) {
        // AJK TODO need to include promotion
        case "0,1":
            return !Boolean(boardState[endSquare]);
        case "0,2":
            return contains(startSquare, 2) && !boardState[endSquare] && !boardState[getNeighboringSquare(startSquare, [0, 1])];
        case "1,1":
        case "-1,1":
            return contains(boardState[endSquare], "black");
        // AJK TODO need to include en passant
        default:
            return false;
        }
    case "black pawn":
        switch (moveDistance.join(",")) {
        // AJK TODO need to include promotion (requires UI change)
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
        // AJK TODO look out for check (here and all places: a player can't be in check at the end of their move)
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
        // AJK TODO include castling---mark king and rook as pristine/dirty
        default:
            return false;
        }
    default:
        return true;
    }
}

function checkCheck(boardState, color) {
    [kingLoc] = findPiece(boardState, color + " king");
    if (color === "white")
        otherColor = "black ";
    else if (color === "black")
        otherColor = "white ";

    for (let pieceName of pieceNameList) {
        pieceType = otherColor + pieceName;
        for (let pieceLoc of findPiece(boardState, pieceType)) {
            // If any piece is attacking the king, return its location
            if (isPieceMovable(boardState, pieceLoc, kingLoc))
                return pieceLoc;
        }
    }

    // If there is no check
    return "";
}

function checkMoveValidity(boardState, startSquare, endSquare) {
    if (!isPieceMovable(boardState, startSquare, endSquare))
        // Make sure a piece can actually make the move specified
        return [false, ["illegal", null]];

    playerColor = boardState[startSquare].split(" ")[0];
    // Test out the move before actually making it to see if any issues arise
    boardCopy = {};
    for (let [square, pieceType] of Object.entries(boardState))
        boardCopy[square] = pieceType;
    makeMove(boardCopy, startSquare, endSquare);
    checkingSquare = checkCheck(boardCopy, playerColor);
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", checkingSquare]];

    // If the move is valid according to all the above tests
    return [true, null];
}

function makeMove(boardState, startSquare, endSquare) {
    // Move the piece, capturing if necessary
    pieceType = boardState[startSquare];
    delete boardState[startSquare];
    boardState[endSquare] = pieceType;
}
