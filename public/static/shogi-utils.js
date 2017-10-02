function newShogiGame(gameState) {
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
    gameState.promotablePiece = "";
    gameState.lastMove = ["", ""];
    gameState.currentPlayer = "black";
}
