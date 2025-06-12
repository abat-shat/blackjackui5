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

            manipulateBlackjack(){
                const ace = new Card("A", "S");
                const two = new Card("2", "S");
                const ten = new Card("K", "S");
                const nine = new Card("9", "D");

                this.#cards.unshift(ace, two, ace, ten, ten, nine);
            }

            manipulatePush(){
                const queen = new Card("Q", "H");

                this.#cards.unshift(queen, queen, queen, queen);
            }

            manipulateCharlie(){
                const two = new Card("2", "C");
                this.#cards.unshift(two, two, two, two, two, two, two);
            }

            manipulateSplitBlackjack(){
                const king = new Card("K", "C");
                const ace = new Card("A", "S");
                const two = new Card("2", "C");

                this.#cards.unshift(king, two, king, two, ace, ace);
            }

            manipulateMainWinSplitLose() {
                const king = new Card("K", "C");
                const seven = new Card("7", "D");
                const six = new Card("6", "H");

                this.#cards.unshift(king, king, king, seven, king, six);
            }
        }
        return Deck;
});

