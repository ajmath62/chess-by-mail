(function(){
    xiangqi.newGame = function(gameState){
        gameState.pieces = {A0: "red rook", B0: "red horse", C0: "red elephant",
            D0: "red advisor", E0: "red general", F0: "red advisor", G0: "red elephant",
            H0: "red horse", I0: "red rook", B2: "red cannon", H2: "red cannon",
            A3: "red soldier", C3: "red soldier", E3: "red soldier", G3: "red soldier",
            I3: "red soldier", A6: "black soldier", C6: "black soldier",
            E6: "black soldier", G6: "black soldier", I6: "black soldier",
            B7: "black cannon", H7: "black cannon", A9: "black rook", B9: "black horse",
            C9: "black elephant", D9: "black advisor", E9: "black general",
            F9: "black advisor", G9: "black elephant", H9: "black horse", I9: "black rook"};
        gameState.currentPlayer = "red";
    };
}());
