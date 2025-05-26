sap.ui.define([
    "./HandService"
], function (HandService) {
    "use strict";

    class PlayerHandService extends HandService {
        static AfterHit = {
            PLAYER_BUSTED : "busted",
            PLAYER_CHARLIE : "charlie",
            CONTINUE : "continue"
        }
        /**
         * check if player is busted,
         * 
         * or if the player has 5 cards
         */
        checkAfterHit() {
            if (this._hand.isBusted()) {
                return PlayerHandService.AfterHit.PLAYER_BUSTED;    
            }

            if (this._hand.cards.length == 5) {
                return PlayerHandService.AfterHit.PLAYER_CHARLIE;
            }
            
            return PlayerHandService.AfterHit.CONTINUE;
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
    }

    return PlayerHandService;
});
