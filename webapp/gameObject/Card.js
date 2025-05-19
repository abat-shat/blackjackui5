sap.ui.define([], function(){
    class Card {
        static ACE_VALUE_11 = 11;
        static ACE_VALUE_1 = 1;
        static JQK_VALUE = 10;
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
        }

        toString() {
            return this.#faceValue + this.#faceSuit;
        }
        
        get faceValue() {
            return this.#faceValue;
        }
    }
    return Card;

});