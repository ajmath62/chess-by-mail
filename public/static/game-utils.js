// AJK TODO this may be replaceable with String.prototype.includes
function contains(array, object) {
    // Return true if array exists and is indexable and contains object
    return Boolean(array && array.indexOf && array.indexOf(object) !== -1);
}

function getSquareDistance(startSquare, endSquare) {
    var startColumn, startRow, endColumn, endRow;
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

function integerToBits (integer, outputLength) {
    // Convert the number to binary, remove extra bits if it's too long and add extra 0s if it's too short
    return integer.toString(2).substr(0, outputLength).padStart(outputLength, "0");
}

// Global scope variables to be used across the codebase
chess = {};
shogi = {};
shiftBitLength = 11;
gameNameList = ["chess", "shogi"];

function gameToString(scope) {
    var chessIndex = gameNameList.indexOf("chess");
    var shogiIndex = gameNameList.indexOf("shogi");
    switch (scope.gameName) {
    case "chess":
        return chess.gameToString(chessIndex, scope.gameState);
    case "shogi":
        return shogi.gameToString(shogiIndex, scope.gameState);
    default:
        return "";
    }
}

function stringToGame(inputString) {
    var rawBitString = atob(inputString).split("").map(function(byte){return byte.charCodeAt(0).toString(2).padStart(8, "0");}).join("");

    var shiftBits = rawBitString.substr(0, 11);
    var trimmedRawBitString = rawBitString.substr(11);
    var shift = parseInt(shiftBits, 2);
    var reverseShift = trimmedRawBitString.length - shift;
    var bitString = trimmedRawBitString.substr(reverseShift) + trimmedRawBitString.substr(0, reverseShift);

    var gameName = gameNameList[parseInt(bitString.substr(0, 4), 2)];
    switch (gameName) {
    case "chess":
        return [gameName, chess.stringToGame(bitString.substr(4))];
    case "shogi":
        return [gameName, shogi.stringToGame(bitString.substr(4))];
    default:
        throw null;
    }
}
