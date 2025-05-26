sap.ui.define([
    "./HandService"
], function (HandService) {
    "use strict";

    class DealerHandService extends HandService {
        static HIT_REQUIRED = 16;
        static DealerAction = {
            DEALER_HIT : "Hit",
            DEALER_STAY : "Stay",
            DEALER_BUSTED : "Busted",
            DEALER_CHARLIE : "Charlie"
        }

        determineDealerAction() {
            //check busted
            if (this.isBusted()) {
                return DealerHandService.DealerAction.DEALER_BUSTED;
            }
            //check charlie
            if (this.isCharlie()) {
                return DealerHandService.DealerAction.DEALER_CHARLIE;
            }
            //check hit
            if (this._hand.totalValue <= DealerHandService.HIT_REQUIRED) {
                return DealerHandService.DealerAction.DEALER_HIT;
            }
            return DealerHandService.DealerAction.DEALER_STAY;
        }

        getSecondCardAndTotalValue() {
            let secondCard = this._hand.cards[1];
            let totalValue = this._hand.totalValue;
            let result = [];
            result.push(secondCard, totalValue);
            return result;
        }
    }

    return DealerHandService;
});