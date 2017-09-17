function switchPieceStyles(){
    if (pieceStyle == "letter") {
        $(".pc")
            .removeClass("pc-letter")
            .addClass("pc-symbol");
        pieceStyle = "symbol";
        $("#switch-piece-styles").text("Switch to piece letter abbreviations");
    }
    else if (pieceStyle == "symbol") {
        $(".pc")
            .removeClass("pc-symbol")
            .addClass("pc-letter");
        pieceStyle = "letter";
        $("#switch-piece-styles").text("Switch to piece symbols");
    }
}
