sap.ui.define([], function(){
    class Hand {
        static LIMIT_BEFORE_BUSTED = 21;
        /** @type {int} */
        #totalValue;
        /** @type {Array} */
        #cards;


        constructor() {
            this.#totalValue = 0;
            this.#cards = [];
        }

        set totalValue(value){
            this.#totalValue = value;
        }

        get totalValue() {
            return this.#totalValue;
        }

        get cards() {
            return this.#cards;
        }

        isBusted() {
            return this.#totalValue > Hand.LIMIT_BEFORE_BUSTED;
        }
    }

    return Hand;
});