sap.ui.define([
    "../gameObject/Deck",
    "../gameObject/RandomGenerator",
], function(Deck, RandomGenerator) {
    class DeckService {
        static LOWER_BOUND_SHUFFLE = 500;
        static UPPER_BOUND_SHUFFLE = 1000;
        #deck;

        constructor() {
            this.#deck = new Deck();
        }
        
        draw(){
            return this.#deck.cards.shift();
        }

        shuffle() {
            let numberOfTime = RandomGenerator.nextInt(DeckService.UPPER_BOUND_SHUFFLE, DeckService.LOWER_BOUND_SHUFFLE);
            for (let i = 0; i < numberOfTime; i++) {
                this.#cut();
            }
        }
        /**
         * stricly for testing.
         * remove this.
         */
        manipulateBlackjack(){
            this.#deck.manipulateBlackjack();
        }

        manipulatePush(){
            this.#deck.manipulatePush();
        }

        #cut(){
            let deckLength = this.#deck.cards.length;
            let cuttingPoint = RandomGenerator.nextInt(deckLength);
            this.#performCut(cuttingPoint);
        }
        /**
         * 
         * @param {int} topHalf
         */
        #performCut(topHalf) {
            const firstStack = this.#deck.cards;
            const secondStack = [];
            for (let i = 0; i < topHalf; i++) {
                secondStack.unshift(firstStack.shift());
            }
            while (secondStack.length > 0) {
                firstStack.push(secondStack.shift());
            }

        }

        get deck(){
            return this.#deck;
        }
    }

    return DeckService;
});