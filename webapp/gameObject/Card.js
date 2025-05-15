sap.ui.define([], function(){
    class Card {
        static ACE_VALUE_11 = 11;
        static ACE_VALUE_1 = 1;
        static JQK_VALUE = 10;
        /**
         * @type {int}
         * Current value of the card. Is the same as the face value, except for Ace, which can have either 1 or 11.
         */
        #currentValue;
        /**
         * @type {string}
         */
        #faceValue;
        /**
         * @type {string}
         */
        #faceSuit;


        /**
         * 
         * @param {string} faceValue 
         * @param {string} faceSuit 
         */
        constructor(faceValue, faceSuit) {
            this.#faceSuit = faceSuit;
            this.#faceValue = faceValue;
            switch (faceValue) {
                case "A":
                    this.#currentValue = Card.ACE_VALUE_11;
                    break;
                case "J":
                case "Q":
                case "K":
                    this.#currentValue = Card.JQK_VALUE;
                    break;
                default:
                    this.#currentValue = Number(faceValue);
                    break;
            }
        }

        toString() {
            return this.#faceValue + this.#faceSuit;
        }

        get currentValue() {
            return this.#currentValue;
        }

        set currentValue(value) {
            this.#currentValue = value;
        }
    }
    return Card;

});