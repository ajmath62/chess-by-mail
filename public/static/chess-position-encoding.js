chess.pieceNameCounter = {"pawn": 8, "rook": 2, "knight": 2, "bishop": 2, "queen": 1, "king": 1};
chess.pieceStyleList = ["letter", "symbol"];
chess.colorList = ["white", "black"];


chess.squareToBits = function(square) {
    var columnBits = integerToBits("ABCDEFGH".indexOf(square[0]), 3);
    var rowBits = integerToBits((square[1]-1), 3);
    return columnBits + rowBits;
};

chess.pieceListToBits = function(pieceList) {
    // AJK TODO optimize this, e.g. commonly occupied spaces take fewer bits to record (like UTF-8/Morse code)
    var pieceToSquareMapping = {};
    var count, pieceColor, pieceSquare, pieceType;
    for (var square in pieceList) {
        if (pieceList.hasOwnProperty(square)) {
            pieceType = pieceList[square];
            if (pieceToSquareMapping[pieceType])
                pieceToSquareMapping[pieceType].push(square);
            else
                pieceToSquareMapping[pieceType] = [square];
        }
    }

    var pieceBits = [];
    for (var i = 0; i < chess.colorList.length; i ++) {
        pieceColor = chess.colorList[i];
        for (var pieceName in chess.pieceNameCounter) {
            if (chess.pieceNameCounter.hasOwnProperty(pieceName)) {
                count = chess.pieceNameCounter[pieceName];
                pieceType = pieceColor + " " + pieceName;
                var pieceTypeSquareList = pieceToSquareMapping[pieceType] || [];
                for (var j = 0; j < count; j++) {
                    pieceSquare = pieceTypeSquareList.pop();
                    if (pieceSquare === undefined)
                        pieceBits.push("10");
                    else
                        pieceBits.push("0" + chess.squareToBits(pieceSquare));
                }
                while (pieceTypeSquareList.length) {
                    // There is a promoted piece of type pieceType
                    pieceSquare = pieceTypeSquareList.pop();
                    pieceBits.push("11" + chess.squareToBits(pieceSquare));
                }
            }
        }
    }
    return pieceBits.join("");
};

chess.gameToString = function(gameNameIndex, gameState) {
    var pieceList = gameState.pieces;
    var pieceStyle = chess.pieceStyleList.indexOf(gameState.pieceStyle);  // length 4
    var lastMove = gameState.lastMove[0] ? gameState.lastMove : ["A1", "A1"];
    var currentPlayer = chess.colorList.indexOf(gameState.currentPlayer);
    var castleLegality = [gameState.castleLegality.white.A, gameState.castleLegality.white.H,
                          gameState.castleLegality.black.A, gameState.castleLegality.black.H];

    var gameNameBits = integerToBits(gameNameIndex, 4);  // length 4
    var pieceBits = chess.pieceListToBits(pieceList);  // length around 100-200
    var pieceStyleBits = integerToBits(pieceStyle, 4);  // length 4
    // AJK TODO optimize this, e.g. nearby spaces take fewer bits to record
    var lastMoveBits = lastMove.map(chess.squareToBits).join("");  // length 12
    var currentPlayerBits = integerToBits(currentPlayer, 1);  // length 1
    var castleLegalityBits = castleLegality.map(function(bool){return bool ? 1 : 0}).join("");  // length 4

    var combinedBitString = gameNameBits + pieceBits + pieceStyleBits + lastMoveBits + currentPlayerBits + castleLegalityBits;

    var shift = Math.floor(Math.random() * combinedBitString.length);
    var shiftBits = integerToBits(shift, shiftBitLength);  // Assumes combinedBitString.length < 2048
    var padBits = 8 - (combinedBitString.length + shiftBitLength) % 8;
    var paddedBitString = combinedBitString + "0".repeat(padBits);
    var shiftedBitString = paddedBitString.substr(shift) + paddedBitString.substr(0, shift);
    var finalBitString = shiftBits + shiftedBitString;

    var finalByteArray = [];
    for (var i = 0; i < finalBitString.length; i += 8) {
        finalByteArray.push(String.fromCharCode(parseInt(finalBitString.substr(i, 8), 2)))
    }
    return btoa(finalByteArray.join(""));  // length around 40
};

chess.bitsToSquare = function(squareBits) {
    var column = "ABCDEFGH".charAt(parseInt(squareBits.substr(0, 3), 2));
    var row = parseInt(squareBits.substr(3, 3), 2) + 1;
    return column + row;
};

chess.bitsToPieceMapping = function(bitString) {
    var squareToPieceMapping = {};
    var currentBit = 0;
    var pieceType = "";
    var count, pieceColor, previousPieceType, square;

    for (var i = 0; i < chess.colorList.length; i ++) {
        pieceColor = chess.colorList[i];
        for (var pieceName in chess.pieceNameCounter) {
            if (chess.pieceNameCounter.hasOwnProperty(pieceName)) {
                count = chess.pieceNameCounter[pieceName];
                previousPieceType = pieceType;
                pieceType = pieceColor + " " + pieceName;
                for (var j = 0; j < count; j++) {
                    var firstMarkerBit = bitString.charAt(currentBit++);
                    if (firstMarkerBit === "0") {
                        // This is a normal piece. The next six bits are the square it is on, and after that is the next piece.
                        square = chess.bitsToSquare(bitString.substr(currentBit, 6));
                        squareToPieceMapping[square] = pieceType;
                        currentBit += 6;
                    }
                    else {
                        var secondMarkerBit = bitString.charAt(currentBit++);
                        if (secondMarkerBit === "0") {
                            // This is a captured piece. It has no square, so the next piece follows immediately.
                        }
                        else {
                            // This is a promoted piece. The next six bits are the square it is on, and after
                            // that is the next piece. Note that this piece has the previous piece type, and
                            // that it doesn't count towards this piece type's count.
                            square = chess.bitsToSquare(bitString.substr(currentBit, 6));
                            squareToPieceMapping[square] = previousPieceType;
                            currentBit += 6;
                            j--;
                        }
                    }
                }
            }
        }
    }
    return [squareToPieceMapping, currentBit];
};

chess.stringToGame = function(bitString) {
    var currentBit = 0;
    var gameState = {};

    [gameState.pieces, numberOfBitsUsed] = chess.bitsToPieceMapping(bitString);
    currentBit += numberOfBitsUsed;

    gameState.pieceStyle = chess.pieceStyleList[parseInt(bitString.substr(currentBit, 4), 2)];
    currentBit += 4;

    var lastMoveStart = chess.bitsToSquare(bitString.substr(currentBit, 6));
    var lastMoveEnd = chess.bitsToSquare(bitString.substr(currentBit+6, 6));
    if (lastMoveStart === lastMoveEnd)
        gameState.lastMove = ["", ""];
    else
        gameState.lastMove = [lastMoveStart, lastMoveEnd];
    currentBit += 12;

    gameState.currentPlayer = chess.colorList[parseInt(bitString.substr(currentBit, 1), 2)];
    currentBit += 1;

    // parseInt doesn't work for some reason so I'm using parseFloat
    var castleLegalityBits = bitString.substr(currentBit, 4).split("").map(parseFloat).map(Boolean);
    gameState.castleLegality = {"white": {"A": castleLegalityBits[0], "H": castleLegalityBits[1]},
                          "black": {"A": castleLegalityBits[2], "H": castleLegalityBits[3]}};

    return gameState;
};
