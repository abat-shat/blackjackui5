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
        MAIN_HAND : 0,
        SPLIT_HAND : 1,
        _deckService : undefined,
        _playerServices : [],
        _dealerService : undefined,
        /* ================================================================================
         * View initialization
         * ================================================================================
         */

        onInit: function(){    
            const coinsData = {
                "bet" : {
                    "amount" : 0,
                    "available" : 0,
                    "bonus" : 0
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
                    "split" : {
                        "score" : 0
                    }
                },
                "dealer" : {
                    "score" : 0
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
            const coinModel = this.getView().getModel("coins");
            oContext.requestObject("AbatCoin").then((availableCoin) => {
                coinModel.setProperty("/bet/available", availableCoin);
            });
            oContext.requestObject("Bonus").then((bonus) => {
                coinModel.setProperty("/bet/bonus", bonus);
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
            
            if (this._subtractUserCoinInOData()) {
                this._enableBettingOptions(false);
                this._enableButton("draw", true);
            }
        },
        
        /**
         * 
         * @param {int} amount 
         */
        onAddToBetAmount: function(amount){
            const coinsModel = this.getView().getModel("coins");
            const currentAmount = coinsModel.getProperty("/bet/amount");
            const parsedCurrentAmount = Number(currentAmount) || 0;
            coinsModel.setProperty("/bet/amount/", parsedCurrentAmount + amount);
            
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
        _subtractUserCoinInOData: function() {
            const coinsModel = this.getView().getModel("coins");
            const amount = Number(coinsModel.getProperty("/bet/amount"));
            if (amount <= 0) {
                const exMsg = this.getOwnerComponent().getModel("i18n").getProperty("exceptionSmallerThanZero")
                MessageBox.error(exMsg);
                return false;
            }

            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "availableCoin"
            });
            const availableCoin = Number(coinsModel.getProperty("/bet/available"));
            const bonusCoin = Number(coinsModel.getProperty("/bet/bonus"));
            if (amount > (availableCoin + bonusCoin)) {
                
                const exMsg = this.getOwnerComponent().getModel("i18n").getProperty("exceptionNotEnoughCoin");
                MessageBox.error(exMsg);
                return false;
            }

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
                },
                function failed(err) {
                    console.error("Update failed", err);
                    self._setBusy(false);
                }
            );
            this._setBusy(true);
            return true;
        },
        /* ================================================================================
         * on Drawing Phase.
         * ================================================================================
         */
        onDraw: function() {
            const view = this.getView();
            const tabletop = view.getModel("tabletop");
            let drawCounter = tabletop.getProperty("/draw/counter");

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
                    tabletop.setProperty("/player/score", playerValue);

                    tabletop.setProperty("/dealer/score", dealerValue);
                    
                    let dealerSrc = this._getCardImgSrc(dealerCard.toString());
                    view.byId("playerCard1").setSrc(playerSrc);
                    view.byId("dealerCard1").setSrc(dealerSrc);
                    
                    this._enableButton("surrender", true);
                    break;
                case 1:
                    dealerCard = this._deckService.draw();
                    playerValue = playerService.addCard(playerCard);
                    dealerValue = this._dealerService.addCard(dealerCard);
                    tabletop.setProperty("/player/score", playerValue);

                    const oldDealerValue = tabletop.getProperty("/dealer/score");
                    tabletop.setProperty("/dealer/score", oldDealerValue + " + ?");
                    view.byId("playerCard2").setSrc(playerSrc);

                    this._enableButton("surrender", false);
                    this._enableButton("draw", false);

                    this._checkPlayerAndDealerForBlackjack();
                    break;
                // For split
                case 2:

                    break;
                default:
                    MessageBox.error("How the hell did this happen");
                    break;
            }

            tabletop.setProperty("/draw/counter", drawCounter + 1);


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

        onTest: function() {
            let playerHand = new PlayerHandService();
            playerHand.test();
        }
    });
});

