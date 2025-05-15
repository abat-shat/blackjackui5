sap.ui.define(["./Card"],
    function(Card){
        class Deck {
            static SUITS = ["S", "C", "D", "H"];
            static VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

            #cards = [];


            constructor() {
                for (const value of Deck.VALUES) {
                    for (const suit of Deck.SUITS) {
                        this.#cards.push(new Card(value, suit));
                    }
                }
            }

            get cards(){
                return this.#cards;
            }
        }
        return Deck;
});

