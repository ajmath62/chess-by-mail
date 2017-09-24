gameNameList = ["chess"];
// AJK TODO move these to a constants.js file
pieceNameCounter = [["pawn", 8], ["rook", 2], ["knight", 2], ["bishop", 2], ["queen", 1], ["king", 1]];
promotablePieceList = ["knight", "bishop", "rook", "queen"]
pieceStyleList = ["letter", "symbol"];
colorList = ["white", "black"];
$(document).ready(function(){
    metaScope = window.angular.element($("#game-controller")).scope();
    chessScope = window.angular.element($("#chessboard-controller")).scope();
})


function integerToBits(integer, outputLength) {
    // Convert the number to binary, remove extra bits if it's too long and add extra 0s if it's too short
    return integer.toString(2).substr(0, outputLength).padStart(outputLength, "0");
}

function squareToBits(square) {
    var columnBits = integerToBits("ABCDEFGH".indexOf(square[0]), 3);
    var rowBits = integerToBits((square[1]-1), 3);
    return columnBits + rowBits;
}

function pieceTypeToBits(pieceType) {
    [pieceColor, pieceName] = pieceType.split(" ");
    var colorBits = integerToBits(colorList.indexOf(pieceColor), 1);
    var nameBits = integerToBits(promotablePieceList.indexOf(pieceName), 2);
    return colorBits + nameBits;
}

function pieceListToBits(pieceList){
    // AJK TODO optimize this, e.g. commonly occupied spaces take fewer bits to record (like UTF-8/Morse code)
    // AJK TODO if this is slow, speed it up, but I don't think it will be
    var pieceToSquareMapping = {};
    for (let [square, pieceType] of Object.entries(pieceList)) {
        if (pieceToSquareMapping[pieceType])
            pieceToSquareMapping[pieceType].push(square);
        else
            pieceToSquareMapping[pieceType] = [square];
    }

    // AJK TODO look up how JS for-[let-]of syntax actually works
    var pieceBits = []
    for (let pieceColor of colorList) {
        for (let [pieceName, count] of pieceNameCounter) {
            var pieceType = pieceColor + " " + pieceName;
            var pieceTypeSquareList = pieceToSquareMapping[pieceType] || [];
            for (var i = 0; i < count; i ++) {
                var pieceSquare = pieceTypeSquareList.pop();
                if (pieceSquare === undefined)
                    pieceBits.push("10")
                else
                    pieceBits.push("0" + squareToBits(pieceSquare));
            }
            while (pieceTypeSquareList.length) {
                // There is a promoted piece of type pieceType
                var pieceSquare = pieceTypeSquareList.pop();
                pieceBits.push("11" + pieceTypeToBits(pieceType) + squareToBits(pieceSquare));
            }
        }
    }
    return pieceBits.join("");
}

function gameToString() {
    var gameName = gameNameList.indexOf(metaScope.gameName);  // length 4
    var pieceList = chessScope.pieces;
    var pieceStyle = pieceStyleList.indexOf(chessScope.pieceStyle);  // length 4
    var lastMove = chessScope.lastMove[0] ? chessScope.lastMove : ["A1", "A1"];
    var currentPlayer = colorList.indexOf(chessScope.currentPlayer);
    var castleLegality = [chessScope.castleLegality.white.A, chessScope.castleLegality.white.H,
                          chessScope.castleLegality.black.A, chessScope.castleLegality.black.H];

    gameNameBits = gameName.toString(2).substr(0, 4).padStart(4, "0");  // length 4
    pieceBits = pieceListToBits(pieceList);  // length around 100-200
    pieceStyleBits = pieceStyle.toString(2).substr(0, 4).padStart(4, "0");  // length 4
    // AJK TODO optimize this, e.g. nearby spaces take fewer bits to record
    lastMoveBits = lastMove.map(squareToBits).join("");  // length 12
    currentPlayerBits = currentPlayer.toString(2).substr(0, 1).padStart(1, "0");  // length 1
    castleLegalityBits = castleLegality.map(function(bool){return bool ? 1 : 0}).join("");  // length 4

    // AJK TODO add a few random bits/scramble things to make it hard to edit
    finalBitString = gameNameBits + pieceBits + pieceStyleBits + lastMoveBits + currentPlayerBits + castleLegalityBits;
    finalByteArray = [];
    for (var i = 0; i < finalBitString.length; i += 8) {
        finalByteArray.push(String.fromCharCode(parseInt(finalBitString.substr(i, 8), 2)))
    }
    base64String = btoa(finalByteArray.join(""))  // length around 40
    return base64String;
}

function stringToGame(inputString) {

}
