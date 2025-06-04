sap.ui.define([
    "../gameObject/Hand",
    "../gameObject/Card"
], function(Hand, Card) {
    "use strict";

    class HandService {
        _hand;

        constructor (){
            this._hand = new Hand();
        }
        /**
         * Add a Card to this Hand.
         * @param {Card} card Card to be added.
         * @returns current total value of the Hand.
         */
        addCard(card){
            this._hand.cards.push(card);
            return this._calculateTotalValue();
        }

        /**
         * Check if the hand has Blackjack, i.e. an Ace and a 10-value Card.
         */
        hasBlackjack(){
            return this._hand.totalValue === Hand.LIMIT_BEFORE_BUSTED;
        }
        /**
         * Check if the hand is busted, i.e. over 21.
         */
        isBusted(){
            return this._hand.isBusted();
        }

        isCharlie(){
            return this._hand.cards.length == 5;
        }
        /**
         * Calculate and save the total value of this hand.
         * @returns current total value of this hand.
         */
        _calculateTotalValue() {
            const aces = this.#sumCardsInHandExceptAces();
            const totalValue = this.#sumCardsInHand(aces);
            this._hand.totalValue = totalValue;
            return totalValue;
        }
        /**
         * Calculate the total value of cards in Hand, except for Aces.
         * @returns An Array of Aces, except the last element which is the total value.
         */
        #sumCardsInHandExceptAces() {
            const aces = [];
            let totalValue = 0;
            for (const card of this._hand.cards) {
                if (card.faceValue === 'A') {
                    aces.push(card);
                    continue;
                }
                totalValue += card.currentValue;
            }
            aces.push(totalValue);
            return aces;
        }
        /**
         * Now calculate the real value of cards in Hand.
         * Aces are adjusted automatically.
         * @param {Array} aces Array of aces with an int as the last element.
         */
        #sumCardsInHand(aces) {
            let totalValue = aces.pop();
            for (const ace of aces){
                let tempValue = totalValue + Card.ACE_VALUE_11;
                if (tempValue > Hand.LIMIT_BEFORE_BUSTED) {
                    totalValue += Card.ACE_VALUE_1;
                }
                else {
                    totalValue = tempValue;
                }
            }
            return totalValue;
        }
    }
    return HandService;
});
