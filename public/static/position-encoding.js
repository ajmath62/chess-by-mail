gameNameList = ["chess"];
// AJK TODO move these to a constants.js file
pieceNameCounter = {"pawn": 8, "rook": 2, "knight": 2, "bishop": 2, "queen": 1, "king": 1};
pieceStyleList = ["letter", "symbol"];
colorList = ["white", "black"];
shiftBitLength = 11;


function integerToBits(integer, outputLength) {
    // Convert the number to binary, remove extra bits if it's too long and add extra 0s if it's too short
    return integer.toString(2).substr(0, outputLength).padStart(outputLength, "0");
}

function squareToBits(square) {
    var columnBits = integerToBits("ABCDEFGH".indexOf(square[0]), 3);
    var rowBits = integerToBits((square[1]-1), 3);
    return columnBits + rowBits;
}

function pieceListToBits(pieceList) {
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
    for (var i = 0; i < colorList.length; i ++) {
        pieceColor = colorList[i];
        for (var pieceName in pieceNameCounter) {
            if (pieceNameCounter.hasOwnProperty(pieceName)) {
                count = pieceNameCounter[pieceName];
                pieceType = pieceColor + " " + pieceName;
                var pieceTypeSquareList = pieceToSquareMapping[pieceType] || [];
                for (var j = 0; j < count; j++) {
                    pieceSquare = pieceTypeSquareList.pop();
                    if (pieceSquare === undefined)
                        pieceBits.push("10");
                    else
                        pieceBits.push("0" + squareToBits(pieceSquare));
                }
                while (pieceTypeSquareList.length) {
                    // There is a promoted piece of type pieceType
                    pieceSquare = pieceTypeSquareList.pop();
                    pieceBits.push("11" + squareToBits(pieceSquare));
                }
            }
        }
    }
    return pieceBits.join("");
}

function gameToString(gameName, gameState) {
    var gameNameIndex = gameNameList.indexOf(gameName);  // length 4
    var pieceList = gameState.pieces;
    var pieceStyle = pieceStyleList.indexOf(gameState.pieceStyle);  // length 4
    var lastMove = gameState.lastMove[0] ? gameState.lastMove : ["A1", "A1"];
    var currentPlayer = colorList.indexOf(gameState.currentPlayer);
    var castleLegality = [gameState.castleLegality.white.A, gameState.castleLegality.white.H,
                          gameState.castleLegality.black.A, gameState.castleLegality.black.H];

    var gameNameBits = integerToBits(gameNameIndex, 4);  // length 4
    var pieceBits = pieceListToBits(pieceList);  // length around 100-200
    var pieceStyleBits = integerToBits(pieceStyle, 4);  // length 4
    // AJK TODO optimize this, e.g. nearby spaces take fewer bits to record
    var lastMoveBits = lastMove.map(squareToBits).join("");  // length 12
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
}

function bitsToSquare(squareBits) {
    var column = "ABCDEFGH".charAt(parseInt(squareBits.substr(0, 3), 2));
    var row = parseInt(squareBits.substr(3, 3), 2) + 1;
    return column + row;
}

function bitsToPieceMapping(bitString) {
    var squareToPieceMapping = {};
    var currentBit = 0;
    var pieceType = "";
    var count, pieceColor, previousPieceType, square;

    for (var i = 0; i < colorList.length; i ++) {
        pieceColor = colorList[i];
        for (var pieceName in pieceNameCounter) {
            if (pieceNameCounter.hasOwnProperty(pieceName)) {
                count = pieceNameCounter[pieceName];
                previousPieceType = pieceType;
                pieceType = pieceColor + " " + pieceName;
                for (var j = 0; j < count; j++) {
                    var firstMarkerBit = bitString.charAt(currentBit++);
                    if (firstMarkerBit === "0") {
                        // This is a normal piece. The next six bits are the square it is on, and after that is the next piece.
                        square = bitsToSquare(bitString.substr(currentBit, 6));
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
                            square = bitsToSquare(bitString.substr(currentBit, 6));
                            squareToPieceMapping[square] = previousPieceType;
                            currentBit += 6;
                            i--;
                        }
                    }
                }
            }
        }
    }
    return [squareToPieceMapping, currentBit];
}

function stringToGame(inputString) {
    var rawBitString = atob(inputString).split("").map(function(byte){return byte.charCodeAt(0).toString(2).padStart(8, "0");}).join("");

    var shiftBits = rawBitString.substr(0, 11);
    var trimmedRawBitString = rawBitString.substr(11);
    var shift = parseInt(shiftBits, 2);
    var reverseShift = trimmedRawBitString.length - shift;
    var bitString = trimmedRawBitString.substr(reverseShift) + trimmedRawBitString.substr(0, reverseShift);

    var gameName = gameNameList[parseInt(bitString.substr(0, 4), 2)];
    var currentBit = 4;
    var gameState = {};

    if (gameName === "chess") {
        [gameState.pieces, numberOfBitsUsed] = bitsToPieceMapping(bitString.substr(4));
        currentBit += numberOfBitsUsed;

        gameState.pieceStyle = pieceStyleList[parseInt(bitString.substr(currentBit, 4), 2)];
        currentBit += 4;

        var lastMoveStart = bitsToSquare(bitString.substr(currentBit, 6));
        var lastMoveEnd = bitsToSquare(bitString.substr(currentBit+6, 6));
        if (lastMoveStart === lastMoveEnd)
            gameState.lastMove = ["", ""];
        else
            gameState.lastMove = [lastMoveStart, lastMoveEnd];
        currentBit += 12;

        gameState.currentPlayer = colorList[parseInt(bitString.substr(currentBit, 1), 2)];
        currentBit += 1;

        // parseInt doesn't work for some reason so I'm using parseFloat
        var castleLegalityBits = bitString.substr(currentBit, 4).split("").map(parseFloat).map(Boolean);
        gameState.castleLegality = {"white": {"A": castleLegalityBits[0], "H": castleLegalityBits[1]},
                              "black": {"A": castleLegalityBits[2], "H": castleLegalityBits[3]}};

        return [gameName, gameState];
    }
}
