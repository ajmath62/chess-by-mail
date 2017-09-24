pieceNameList = ["pawn", "rook", "knight", "bishop", "queen", "king"];
$scope = {};

function contains(array, object){
    // Return true if array exists and is indexable and contains object
    return Boolean(array && array.indexOf && array.indexOf(object) !== -1);
}

function getNeighboringSquare(startSquare, directions) {
    [oldColumn, oldRow] = startSquare;
    var newColumn = String.fromCharCode(oldColumn.charCodeAt() + directions[0]);
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
    var numColumns = endColumn.charCodeAt() - startColumn.charCodeAt();
    var numRows = endRow - startRow;  // this is an Int
    return [numColumns, numRows];
}

function findPiece(boardState, pieceType) {
    // This returns a list, regardless of whether the piece is unique or not
    var squareList = [];
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
    var pieceType = boardState[startSquare];
    var pieceColor = pieceType.split(" ")[0];
    var moveDistance = getSquareDistance(startSquare, endSquare);

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
            else if ($scope.lastMove[0] === getNeighboringSquare(endSquare, [0, 1])
                && $scope.lastMove[1] === getNeighboringSquare(endSquare, [0, -1])
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
            else if ($scope.lastMove[0] === getNeighboringSquare(endSquare, [0, -1])
                && $scope.lastMove[1] === getNeighboringSquare(endSquare, [0, 1])
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
            var moveDirection = [0, Math.sign(moveDistance[1])]
            var moveLength = Math.abs(moveDistance[1])
            if (moveDistance[1] === 0)
                // The rook can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            var moveDirection = [Math.sign(moveDistance[0]), 0]
            var moveLength = Math.abs(moveDistance[0])
        }
        else
            // The rook can only move along a rank or a file
            return false;

        for (i = 1; i < moveLength; i ++) {
            var checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
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
        var moveLength = Math.abs(moveDistance[0])
        if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
            // The bishop can only move along a perfect diagonal
            return false;

        var moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])]
        for (i = 1; i < moveLength; i ++) {
            var checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
            if (boardState[getNeighboringSquare(startSquare, checkDistance)])
                // The bishop cannot move through other pieces
                return false;
        }
        // The bishop cannot land on a piece of its own color
        return !contains(boardState[endSquare], pieceColor);
    case "white queen":
    case "black queen":
        if (moveDistance[0] === 0) {
            var moveDirection = [0, Math.sign(moveDistance[1])]
            var moveLength = Math.abs(moveDistance[1])
            if (moveDistance[1] === 0)
                // The queen can't move to its own space
                return false;
        }
        else if (moveDistance[1] === 0) {
            var moveDirection = [Math.sign(moveDistance[0]), 0]
            var moveLength = Math.abs(moveDistance[0])
        }
        else {
            var moveLength = Math.abs(moveDistance[0])
            if (moveLength === 0 || moveLength !== Math.abs(moveDistance[1]))
                // The queen can only move along a rank, file or perfect diagonal
                return false;
        }

        var moveDirection = [Math.sign(moveDistance[0]), Math.sign(moveDistance[1])]
        for (i = 1; i < moveLength; i ++) {
            var checkDistance = [moveDirection[0]*i, moveDirection[1]*i]
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
                var threatColor = getOtherColor(pieceType.split(" ")[0]);
                // Check that there are no threats to the king, the rook, or the square the rook is moving to
                // Don't look at the square the king is moving to, that gets looked at later
                for (let moveDistance of [[0, 0], [1, 0], [3, 0]]) {
                    var squareToCheck = getNeighboringSquare(startSquare, moveDistance)
                    var threatSquare = checkThreat(boardState, squareToCheck, threatColor);
                    if (threatSquare)
                        return [false, ["check", [threatSquare, squareToCheck]]];
                }
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
                var threatColor = getOtherColor(pieceType.split(" ")[0]);
                // Check that there are no threats to the king, the rook, or the square the rook is moving to
                // Don't look at the square the king is moving to, that gets looked at later
                for (let moveDistance of [[0, 0], [-1, 0], [-4, 0]]) {
                    var squareToCheck = getNeighboringSquare(startSquare, moveDistance)
                    var threatSquare = checkThreat(boardState, squareToCheck, threatColor);
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

function makeTestMove(boardState, startSquare, endSquare) {
    // Move the piece, capturing if necessary
    var pieceType = boardState[startSquare];
    delete boardState[startSquare];
    boardState[endSquare] = pieceType;
}

function checkThreat(boardState, square, color) {
    // Check if there is a threat to the given square from the given color

    // A king can't threaten from two spaces away
    var castleLegality = {"A": false, "H": false}

    for (let pieceName of pieceNameList) {
        var pieceType = color + " " + pieceName;
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
    var otherColor = getOtherColor(color)
    return checkThreat(boardState, kingLoc, otherColor);
}

function checkMoveValidity(startSquare, endSquare) {
    $scope = window.angular.element($("#chessboard")).scope()
    var currentPlayer = $scope.currentPlayer;
    var castleLegality = $scope.castleLegality[currentPlayer];

    if ($scope.pieces[startSquare].split(" ")[0] !== currentPlayer)
        // A player can only move their own pieces
        return [false, ["turn", null]];

    // Make sure a piece can actually make the move specified
    var moveLegality = isPieceMovable($scope.pieces, startSquare, endSquare, castleLegality)
    if (!moveLegality)
        return [false, ["illegal", null]];
    else if (moveLegality[0] === false)
        // Pass along any comments from isPieceMovable
        return [false, moveLegality[1]];

    // Test out the move before actually making it to see if any issues arise
    var boardCopy = {};
    for (let [square, pieceType] of Object.entries($scope.pieces))
        boardCopy[square] = pieceType;
    makeTestMove(boardCopy, startSquare, endSquare);
    var checkingSquare = checkCheck(boardCopy, currentPlayer);
    var kingSquare = findPiece(boardCopy, currentPlayer + " king")
    if (checkingSquare)
        // Don't let a player make a move that will put them in check or leave them in check
        return [false, ["check", [checkingSquare, kingSquare]]];

    // If any kings were moved, don't allow future castling for that player
    // If any rooks were moved or captured, don't allow future castling on that side
    // AJK TODO make this a subroutine, please
    if (startSquare === "A1" || endSquare === "A1")
        $scope.castleLegality.white.A = false;
    if (startSquare === "H1" || endSquare === "H1")
        $scope.castleLegality.white.H = false;
    if (startSquare === "A8" || endSquare === "A8")
        $scope.castleLegality.black.A = false;
    if (startSquare === "H8" || endSquare === "H8")
        $scope.castleLegality.black.H = false;
    if ($scope.pieces[startSquare] === "white king") {
        $scope.castleLegality.white.A = false;
        $scope.castleLegality.white.H = false;
    }
    if ($scope.pieces[startSquare] === "black king") {
        $scope.castleLegality.black.A = false;
        $scope.castleLegality.black.H = false;
    }
    // Allow the move to be made and pass along any comments from isPieceMovable
    return [true, moveLegality[1]];
}

function makeMove(startSquare, endSquare) {
    // Move the piece, capturing if necessary
    var pieceType = $scope.pieces[startSquare];
    delete $scope.pieces[startSquare];
    $scope.pieces[endSquare] = pieceType;
}

function checkPromotion() {
    var boardState = $scope.pieces;
    var square = $scope.lastMove[1];
    // Return true if the piece is a pawn on its last rank and false otherwise
    [pieceColor, pieceName] = boardState[square].split(" ");
    if (((pieceColor === "white" && square[1] == 8) || (pieceColor === "black" && square[1] == 1)) && pieceName === "pawn")
        return true;
    else
        return false;
}
