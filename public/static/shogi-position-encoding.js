shogi.pieceNameCounter = {"pawn": 18, "lance": 4, "knight": 4, "silver": 4, "gold": 4, "bishop": 2, "rook": 2, "king": 2};
shogi.pieceStyleList = ["kanji", "romaji"];
shogi.colorList = ["white", "black"];


shogi.squareToBits = function(square) {
    switch (square) {
        case "*white":
            return "1010001";  // 81
        case "*black":
            return "1010010";  // 82
        case "":
            return "1010011";  // 83
        default:  // 0-80
            var column = square[0] - 1;
            var row = "ABCDEFGHI".indexOf(square[1]);
            var squareNumber = 9*column + row;
            return integerToBits(squareNumber, 7);
    }
};


shogi.pieceInfoToBits = function(pieceInfo) {
    var colorBits, promotionBits;
    var square = pieceInfo[0];
    if (square.substr(0, 1) === "*" || square === "") {
        colorBits = "";
        promotionBits = "";
    }
    else {
        colorBits = integerToBits(shogi.colorList.indexOf(pieceInfo[1]), 1);
        promotionBits = pieceInfo[2] ? "1" : "0";
    }
    var squareBits = shogi.squareToBits(square);
    return squareBits + colorBits + promotionBits;
};

shogi.pieceListToBits = function(pieceList, inHandList) {
    // AJK TODO optimize this; e.g. commonly occupied spaces take fewer bits to record (like UTF-8/Morse code); useless info (who owns a piece in a hand, whether a king is promoted) goes away; the remaining 40-ish bit-spaces are used for something (only 84 of 128 right now)

    var pieceToSquareMapping = {};
    var i, count, isPromoted, pieceColor, pieceInfo, pieceName;
    // Add the pieces on the board to the mapping
    for (var square in pieceList) {
        if (pieceList.hasOwnProperty(square)) {
            [pieceColor, pieceName] = pieceList[square].split(" ");
            isPromoted = pieceName.substr(-1) === "_";
            pieceName = pieceName.replace("_", "");
            pieceInfo = [square, pieceColor, isPromoted];
            if (pieceToSquareMapping[pieceName])
                pieceToSquareMapping[pieceName].push(pieceInfo);
            else
                pieceToSquareMapping[pieceName] = [pieceInfo];
        }
    }
    // Add the pieces in hands to the mapping
    for (i = 0; i < inHandList.white.length; i ++) {
        pieceName = inHandList.white[i];
        pieceInfo = ["*white"];
        if (pieceToSquareMapping[pieceName])
            pieceToSquareMapping[pieceName].push(pieceInfo);
        else
            pieceToSquareMapping[pieceName] = [pieceInfo];
    }
    for (i = 0; i < inHandList.black.length; i ++) {
        pieceName = inHandList.black[i];
        pieceInfo = ["*black"];
        if (pieceToSquareMapping[pieceName])
            pieceToSquareMapping[pieceName].push(pieceInfo);
        else
            pieceToSquareMapping[pieceName] = [pieceInfo];
    }

    var pieceBits = [];
    for (pieceName in shogi.pieceNameCounter) {
        if (shogi.pieceNameCounter.hasOwnProperty(pieceName)) {
            count = shogi.pieceNameCounter[pieceName];
            var pieceTypeSquareList = pieceToSquareMapping[pieceName] || [];
            for (var j = 0; j < count; j++) {
                pieceInfo = pieceTypeSquareList.pop() || [""];
                pieceBits.push(shogi.pieceInfoToBits(pieceInfo));
            }
        }
    }
    return pieceBits.join("");
};

shogi.gameToString = function(gameNameIndex, gameState) {
    var pieceList = gameState.pieces;
    var inHandList = gameState.inHand;
    var pieceStyle = shogi.pieceStyleList.indexOf(gameState.pieceStyle);  // length 4
    var lastMove = gameState.lastMove;
    var currentPlayer = shogi.colorList.indexOf(gameState.currentPlayer);

    var gameNameBits = integerToBits(gameNameIndex, 4);  // length 4
    var pieceBits = shogi.pieceListToBits(pieceList, inHandList);  // length around 340
    var pieceStyleBits = integerToBits(pieceStyle, 4);  // length 4
    // AJK TODO optimize this, e.g. nearby spaces take fewer bits to record
    var lastMoveBits = lastMove.map(shogi.squareToBits).join("");  // length 14
    var currentPlayerBits = integerToBits(currentPlayer, 1);  // length 1

    var combinedBitString = gameNameBits + pieceBits + pieceStyleBits + lastMoveBits + currentPlayerBits;

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
    return btoa(finalByteArray.join(""));  // length around 60
};

shogi.bitsToSquare = function(squareBits) {
    switch (squareBits) {
        case "1010001":
            return "*white";  // 81
        case "1010010":
            return "*black";  // 82
        case "1010011":
            return "";  // 83
        default:  // 0-80
            var squareNumber = parseInt(squareBits, 2);
            var column = Math.floor(squareNumber / 9) + 1;
            var row = "ABCDEFGHI".charAt(squareNumber % 9);
            return column + row;
    }
};

shogi.bitsToPieceMapping = function(bitString) {
    var squareToPieceMapping = {};
    var inHandList = {"white": [], "black": []};
    var currentBit = 0;
    var count, pieceType, square, squareBits;

    for (var pieceName in shogi.pieceNameCounter) {
        if (shogi.pieceNameCounter.hasOwnProperty(pieceName)) {
            count = shogi.pieceNameCounter[pieceName];
            for (var j = 0; j < count; j++) {
                // pieceInfo = [square, pieceColor, isPromoted];
                squareBits = bitString.substr(currentBit, 7);
                square = shogi.bitsToSquare(bitString.substr(currentBit, 7));
                switch (square) {
                case "*white":
                    inHandList.white.push(pieceName);
                    currentBit += 7;
                    break;
                case "*black":
                    inHandList.black.push(pieceName);
                    currentBit += 7;
                    break;
                case "":
                    currentBit += 7;
                    break;
                default:
                    var pieceColor = shogi.colorList[bitString.substr(currentBit + 7, 1)];
                    var isPromoted = Boolean(parseInt(bitString.substr(currentBit + 8, 1)));
                    pieceType = pieceColor + " " + pieceName + (isPromoted ? "_" : "");
                    squareToPieceMapping[square] = pieceType;
                    currentBit += 9;
                    break;
                }
            }
        }
    }
    return [squareToPieceMapping, inHandList, currentBit];
};

shogi.stringToGame = function(bitString) {
    var currentBit = 0;
    var gameState = {};

    [gameState.pieces, gameState.inHand, numberOfBitsUsed] = shogi.bitsToPieceMapping(bitString);
    currentBit += numberOfBitsUsed;

    gameState.pieceStyle = shogi.pieceStyleList[parseInt(bitString.substr(currentBit, 4), 2)];
    currentBit += 4;

    var lastMoveStart = shogi.bitsToSquare(bitString.substr(currentBit, 7));
    var lastMoveEnd = shogi.bitsToSquare(bitString.substr(currentBit + 7, 7));
    gameState.lastMove = [lastMoveStart, lastMoveEnd];
    currentBit += 14;

    gameState.currentPlayer = shogi.colorList[parseInt(bitString.substr(currentBit, 1), 2)];

    return gameState;
};
