sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../service/DeckService",
    "../service/PlayerHandService",
    "../service/DealerHandService"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageBox} MessageBox
 * @param {*} DeckService
 * 
 */
function(Controller, JSONModel, MessageBox,
         DeckService, PlayerHandService, DealerHandService) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        NUMBER_OF_CARDS_IN_A_HAND : 5,
        DEALER_HAND: -1,
        MAIN_HAND : 0,
        SPLIT_HAND : 1,
        _deckService : undefined,
        _playerServices : [],
        _playerServicesConcluded : [],
        _dealerService : undefined,
        /* ================================================================================
         * View initialization
         * ================================================================================
         */

        onInit: function(){    
            const coinsData = {
                "user" : {
                    "available" : 0,
                    "bonus" : 0
                },
                "bet" : {
                    "amount" : 0,
                    "split" : 0
                }
            };
            const coinsModel = new JSONModel(coinsData);
            this.getView().setModel(coinsModel, "coins");

            const tabletopData = {
                "draw" : {
                    "counter" : 0
                },
                "player" : {
                    "score" : 0,
                    "cardCount" : 0,
                    "split" : {
                        "score" : 0
                    }
                },
                "dealer" : {
                    "score" : 0,
                    "cardCount" : 0
                }
            };
            const tabletopModel = new JSONModel(tabletopData);
            this.getView().setModel(tabletopModel, "tabletop");
        },

        onUsername: function(){
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                // @ts-ignore
                sap.m.MessageBox.show(userId);
              });
            
        },

        /* ================================================================================
         * On new round
         * ================================================================================
         */

        onNewRound: function(){
            this._resetViewResources();
            this._resetServiceResources();
        },
        /**
         * Reset FE resources
         */
        _resetViewResources: function() {
            //TODO: maybe not needed
            this._requestAvailableAndBonusCoin();
            this._resetPlayerAndDealerHand();
            this._resetAllPlayButtons();
            this._enableBettingOptions(true);
            //TODO: reset json
        },
        /**
         * Reset BE resources
         */
        _resetServiceResources: function() {
            this._deckService = new DeckService();
            this._deckService.shuffle();
            this._dealerService = new DealerHandService();
            this._playerServices.push(new PlayerHandService());
        },

        _requestAvailableAndBonusCoin: function() {
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')");
            oContext.requestObject("AbatCoin").then((availableCoin) => {
                this.coins().setProperty("/user/available", availableCoin);
            });
            oContext.requestObject("Bonus").then((bonus) => {
                this.coins().setProperty("/user/bonus", bonus);
            });
        },

        _resetPlayerAndDealerHand: function() {

            let dealerFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/red");
            let playerFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/green");
            let playerSplitFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/green");
            for (let index = 1; index <= this.NUMBER_OF_CARDS_IN_A_HAND; index++) {
                this.getView().byId("dealerCard" + index).setSrc(dealerFacedownSrc);
                this.getView().byId("playerCard" + index).setSrc(playerFacedownSrc);
                this.getView().byId("playerSplitCard" + index).setSrc(playerSplitFacedownSrc);
                
            }
            this.getView().byId("dealerCard1").setSrc(dealerFacedownSrc);
            
        },

        _resetAllPlayButtons: function() {
            this._enableButton("draw", false);
            this._enableButton("surrender", false);
            this._enableButton("split", false);
            this._enableButton("doubleDown", false);
            this._enableButton("hit", false);
            this._enableButton("stay", false);
            this._enableButton("continue", false);
            this._enableButton("newRound", false);
        },

        /* ================================================================================
         * On inputting bet amount
         * ================================================================================
         */
        
        /**
         * On user confirming bet amount. Will be called repeatedly until the input is valid.
         */
        onConfirmBetCoinsAmount: function(){
            
            if (this._isBetSuccessful()) {
                this._enableBettingOptions(false);
                this._enableButton("draw", true);
            }
        },
        
        /**
         * 
         * @param {int} amount 
         */
        onAddToBetAmount: function(amount){
            const currentAmount = this.coins().getProperty("/bet/amount");
            const parsedCurrentAmount = Number(currentAmount) || 0;
            this.coins().setProperty("/bet/amount/", parsedCurrentAmount + amount);
            
        },
        /**
         * Prevents user from inputting anything other than a digit.
         * Source {@link https://community.sap.com/t5/technology-q-a/how-to-make-input-field-accept-only-numeric-values-in-sapui5-using-xml/qaq-p/337331 SAP Community}.
         * @param {typeof sap.ui.base.Event} event The {@link sap.m.Input Input} itself.
         *  
         */
        onCoinAmountInput: function(event){
            let _oInput = event.getSource();
            let val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },

        /**
         * Update the user AbatCoin and Bonus in the OData.
         * @returns Whether a Promise to the subtraction was made.
         * False if the user inputted a value <= 0
         * or user does not have enough coin.
         */
        _isBetSuccessful: function() {
            const amount = Number(this.coins().getProperty("/bet/amount"));
            if (amount <= 0) {
                const exMsg = this.i18n().getProperty("exceptionSmallerThanZero")
                MessageBox.error(exMsg);
                return false;
            }

            
            const availableCoin = Number(this.coins().getProperty("/user/available"));
            const bonusCoin = Number(this.coins().getProperty("/user/bonus"));
            if (amount > (availableCoin + bonusCoin)) {
                
                const exMsg = this.i18n().getProperty("exceptionNotEnoughCoin");
                MessageBox.error(exMsg);
                return false;
            }
            
            this._updateCoinsInOData(availableCoin, bonusCoin, amount);
            return true;
        },
        /* ================================================================================
         * on Drawing Phase.
         * ================================================================================
         */
        onDraw: function() {
            const view = this.getView();
            let drawCounter = this.tabletop().getProperty("/draw/counter");

            const playerService = this._playerServices[this.MAIN_HAND];
            const playerSplitService = this._playerServices[this.SPLIT_HAND];
            const playerCard = this._deckService.draw();
            let playerSrc = this._getCardImgSrc(playerCard.toString());
    
            let dealerCard;
            let playerValue; 
            let dealerValue;

            switch (drawCounter) {
                case 0:
                    dealerCard = this._deckService.draw();
                    playerValue = playerService.addCard(playerCard);
                    dealerValue = this._dealerService.addCard(dealerCard);
                    this.tabletop().setProperty("/player/cardCount", 1);
                    this.tabletop().setProperty("/dealer/cardCount", 1);
                    this.tabletop().setProperty("/player/score", playerValue);

                    this.tabletop().setProperty("/dealer/score", dealerValue);
                    
                    let dealerSrc = this._getCardImgSrc(dealerCard.toString());
                    view.byId("playerCard1").setSrc(playerSrc);
                    view.byId("dealerCard1").setSrc(dealerSrc);
                    
                    this._enableButton("surrender", true);
                    break;
                case 1:
                    dealerCard = this._deckService.draw();
                    playerValue = playerService.addCard(playerCard);
                    dealerValue = this._dealerService.addCard(dealerCard);
                    this.tabletop().setProperty("/player/cardCount", 2);
                    this.tabletop().setProperty("/dealer/cardCount", 2);
                    this.tabletop().setProperty("/player/score", playerValue);

                    const oldDealerValue = this.tabletop().getProperty("/dealer/score");
                    this.tabletop().setProperty("/dealer/score", oldDealerValue + " + ?");
                    view.byId("playerCard2").setSrc(playerSrc);

                    this._enableButton("surrender", false);
                    this._enableButton("draw", false);

                    this._enableButton("split", true);
                    this._enableButton("doubleDown", true);
                    this._enableButton("hit", true);
                    this._enableButton("stay", true);

                    this._checkPlayerAndDealerForBlackjack();
                    break;
                // For split
                case 2:
                case 3:

                    break;
                default:
                    MessageBox.error("How the hell did this happen");
                    break;
            }

            this.tabletop().setProperty("/draw/counter", drawCounter + 1);


        },

        onSurrender: function() {
            //TODO: Player surrendered.
        },

        _checkPlayerAndDealerForBlackjack: function() {
            let isDealerBj = this._dealerService.hasBlackjack();
            let isPlayerBj = this._playerServices[this.MAIN_HAND].hasBlackjack();

            if (isDealerBj && isPlayerBj) {
                //TODO: Push draw
            }
            else if (isDealerBj) {
                //TODO: Dealer BJ
            }
            else if (isPlayerBj) {
                //TODO: Player BJ
            }
        },

        /* ================================================================================
         * on Playing Phase.
         * ================================================================================
         */
        onHit: function() {
            const currentHand = this._playerServices[0];
            const card = this._deckService.draw();
            const cardSrc = this._getCardImgSrc(card.toString());
            let totalValue = currentHand.addCard(card);
            
            let cardCount = this.tabletop().getProperty("/player/cardCount") + 1;
            this.tabletop().setProperty("/player/cardCount", cardCount);

            // again due to bad design choices
            if (this._isCurrentHandMainHand()) {
                this.tabletop().setProperty("/player/score", totalValue);
                this.getView().byId("playerCard" + cardCount).setSrc(cardSrc);
            } else {
                this.tabletop().setProperty("/player/split/score", totalValue);
                this.getView().byId("playerSplitCard" + cardCount).setSrc(cardSrc);
            }
            let afterHit = currentHand.checkAfterHit();
            switch (afterHit) {
                case PlayerHandService.AfterHit.PLAYER_BUSTED:
                    console.log(afterHit)
                    // TODO: Player busted. Set Hand as concluded
                    break;
                case PlayerHandService.AfterHit.PLAYER_CHARLIE:
                    // TODO: player charlie. set hand as concluded
                    console.log(afterHit)
                    
                    break;
                default:
                    break;
            }

            this._enableButton("doubleDown", false);
            this._enableButton("split", false);

        },
        
        onStay: function() {
            const currentHand = this._playerServices.shift();
            this._playerServicesConcluded.push(currentHand);

            if (this._playerServices.length != 0) {
                this.tabletop().setProperty("/players/cardCount", 2);
                this._enableButton("doubleDown", true);
            }
            else {
                this._enableButton("hit", false);
                this._enableButton("stay", false);
                this._enableButton("doubleDown", false);
                this._enableButton("split", false);
            }

        },

        onDoubleDown: function() {
            if (this._isDoubleDownSuccessful()) {
                
            }
        },

        onSplit: function() {},

        _addCardToPlayerHand: function() {
            
        },

        _isDoubleDownSuccessful: function(){
            let amount;
            if (this._isCurrentHandMainHand()) {
                amount = Number(this.coins().getProperty("/bet/amount"));
            }
            else {
                amount = Number(this.coins().getProperty("/bet/split"));
            }
            
            const availableCoin = Number(this.coins().getProperty("/user/available"));
            const bonusCoin = Number(this.coins().getProperty("/user/bonus"));
            if (amount > (availableCoin + bonusCoin)) {
                
                const exMsg = this.i18n().getProperty("exceptionNotEnoughCoin");
                MessageBox.error(exMsg);
                return false;
            }
            
            this._updateCoinsInOData(availableCoin, bonusCoin, amount);
            return true;
        }

        /* ================================================================================
         * Helper functions.
         * ================================================================================
         */

        /**
         * 
         * @param {boolean} isBusy 
         */
        _setBusy: function(isBusy){
            this.getView().setBusy(isBusy);
        },
        /**
         * Helper function to en-/disable betting money. Enabled on start of new round and
         * disabled when user inputted an amount of money.
         * @param {boolean} isEnabled 
         */
        _enableBettingOptions: function(isEnabled) {
            let view = this.getView();
            view.byId("coinInput").setEnabled(isEnabled);
            view.byId("betButton").setEnabled(isEnabled);
            view.byId("add10Button").setEnabled(isEnabled);
            view.byId("add50Button").setEnabled(isEnabled);
            view.byId("add100Button").setEnabled(isEnabled);
        },
        /**
         * 
         * @param {string} buttonName 
         * @param {boolean} isEnabled 
         */
        _enableButton: function(buttonName ,isEnabled) {
            this.getView().byId(buttonName + "Button").setEnabled(isEnabled);
        },
        /**
         * 
         * @param {string} sCard Card representation in string. Ex: 2S is 2 of Spades
         * @returns Relative path to the corresponding card image.
         */
        _getCardImgSrc: function(sCard){
            return this.getOwnerComponent().getModel("img").getProperty("/cards/" + sCard);
        },
        /**
         * Update user's coin in the OData. The model coins will be automatically
         * updated if the update succeeded.
         * @param {int} availableCoin   from coins>/user/available.
         * @param {int} bonusCoin   from coins>/user/bonus.
         * @param {int} amount to be subtracted.
         */
        _updateCoinsInOData: function(availableCoin, bonusCoin, amount) {           
            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "availableCoin"
            });
 
            const newBonusBalance = bonusCoin - amount;
            if (newBonusBalance >= 0) {
                // bonus is enough
                oContext.getBoundContext().setProperty("Bonus", newBonusBalance.toString());
            } else {
                // subtract availableCoin as well
                oContext.getBoundContext().setProperty("Bonus", "0");
                const newCoinBalance = availableCoin + newBonusBalance;
                oContext.getBoundContext().setProperty("AbatCoin", newCoinBalance.toString());
            }
           
            let self = this;
            oDataModel.submitBatch("availableCoin").then(
                function success() {
                    console.log("Update successful");
                    self._setBusy(false);
                    self._requestAvailableAndBonusCoin();
                },
                function failed(err) {
                    console.error("Update failed", err);
                    self._setBusy(false);
                }
            );
            this._setBusy(true);
            return true;
        },
        /**
         * Check which hand is being worked on.
         * @returns True if Main Hand
         * 
         * False if Split Hand
         */
        _isCurrentHandMainHand: function(){
            return this._playerServicesConcluded.length == 0;
        },

        tabletop() {
            return this.getView().getModel("tabletop");
        },

        coins() {
            return this.getView().getModel("coins");
        },

        i18n() {
            return this.getOwnerComponent().getModel("i18n");
        },

        onTest: function() {
            this.getView().byId("playerHandTextOutput").setText("100");
        }
    });
});

