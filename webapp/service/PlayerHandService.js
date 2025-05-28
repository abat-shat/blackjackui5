sap.ui.define([
    "./HandService"
], function (HandService) {
    "use strict";

    class PlayerHandService extends HandService {
        /** @type {string} */
        #result;
        static Result = {
            PLAYER_BUSTED : "PLAYER_BUSTED",
            PLAYER_CHARLIE : "PLAYER_CHARLIE",
            PLAYER_BLACKJACK : "PLAYER_BLACKJACK"
        }
        static I18nText = {
            HAND_LOST : "HandLost",
            HAND_WON : "HandWon",
            HAND_PUSH : "HandPush"
        }
        static ResultText = {
            LOST : "LOST",
            WON : "WON",
            PUSH : "PUSH"
        }
        /**
         * check if player is busted,
         * 
         * or if the player has 5 cards
         */
        checkAfterHit() {
            if (this.isBusted()) {
                this.#result = PlayerHandService.Result.PLAYER_BUSTED;
                return true;    
            }

            if (this.isCharlie()) {
                this.#result = PlayerHandService.Result.PLAYER_CHARLIE;
                return true;
            }
            
            return false;
        }

        /**
         * Removes a card from this hand and adds it to the newly created split hand.
         * @param splitHand The new hand resulting from the split.
         * @returns An array of result:
         * `Index 0`: The card in question.
         * `Index 1`: value of main hand.
         * `Index 2`: value of split hand. (is always equal to Index 1, but in case the rules of the
         * game itself changes, Index 2 is still here.)
         */
        onSplit(splitHand) {

            let card = this._hand.cards.pop();
            splitHand._hand.cards.push(card);
            //recalculate
            let mainHandValue = this._calculateTotalValue();
            let splitHandValue = splitHand._calculateTotalValue();
            const result = [];
            result.push(card, mainHandValue, splitHandValue);
            console.log(result);
            return result;
        }

        checkEligibleForSplit() {
            let firstCard = this._hand.cards[0];
            let secondCard = this._hand.cards[1];
            // return firstCard.currentValue == secondCard.currentValue;
            //TODO: remove this
            return true;
        }

        get result() {
            return this.#result;
        }

        checkForBlackjack() {
            if (this.hasBlackjack()) {
                this.#result = PlayerHandService.Result.PLAYER_BLACKJACK;
                return true;
            }

            return false;
        }

        /**
         * Used when both hands score are checked to find the winner.
         * @param dealer The service to dealer's hand
         * @param betAmount Coins betted for this hand.
         * @returns An array of results:
         * 
         * `Index 0`: The according i18n Text, missing the prefix "main"/"split"
         * 
         * `Index 1`: The amount to be credited to the user.
         * 
         * `Index 2`: ResultText: PUSH, WON, LOST
         */
        calculateResult(dealer, betAmount) {
            let results = [];
            let resultI18nText;
            let amount = 0;
            let resultText;

            if (this._hand.totalValue < dealer._hand.totalValue) {
                resultI18nText = PlayerHandService.I18nText.HAND_LOST;
                resultText = PlayerHandService.ResultText.LOST;
            } 
            else if (this._hand.totalValue > dealer._hand.totalValue) {
                resultI18nText = PlayerHandService.I18nText.HAND_WON;
                amount = betAmount * 2;
                resultText = PlayerHandService.ResultText.WON;
            }
            else {
                resultI18nText = PlayerHandService.I18nText.HAND_PUSH;
                amount = betAmount;
                resultText = PlayerHandService.ResultText.PUSH
            }

            results.push(resultI18nText, amount, resultText);
            return results;
        }
    }

    return PlayerHandService;
});
