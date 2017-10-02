function newShogiGame(gameState) {
    gameState.pieceStyle = "kanji";  // options are kanji or romaji
    gameState.promotablePiece = "";
    gameState.lastMove = ["", ""];
    gameState.currentPlayer = "black";
}
