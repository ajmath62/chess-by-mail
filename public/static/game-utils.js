function contains(array, object) {
    // Return true if array exists and is indexable and contains object
    return Boolean(array && array.indexOf && array.indexOf(object) !== -1);
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
