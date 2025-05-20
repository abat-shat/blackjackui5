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
    }

    return PlayerHandService;
});
