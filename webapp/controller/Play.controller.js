sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../service/DeckService"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageBox} MessageBox
 * @param {*} DeckService
 * 
 */
function(Controller, JSONModel, MessageBox, DeckService) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        /**
         * @type {number}
         */
        _availableCoin: undefined,
        NUMBER_OF_CARDS_IN_A_HAND : 5,

        onInit: function(){    
            const coinsData = {
                "bet" : {
                    "amount" : 0
                }
            };
            const coinsModel = new JSONModel(coinsData);
            this.getView().setModel(coinsModel, "coins");
        },

        onUsername: function(){
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                // @ts-ignore
                sap.m.MessageBox.show(userId);
              });
            
        },
        
        onConfirmBetCoinsAmount: function(event){
            const coinsModel = this.getView().getModel("coins");
            const amount = coinsModel.getProperty("/bet/amount");
            if (Number(amount) <= 0) {
                const exMsg = this.getOwnerComponent().getModel("i18n").getProperty("exceptionSmallerThanZero")
                MessageBox.error(exMsg);
                return;
            }

            MessageBox.information(amount.toString());
            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "default"
            });
                if (amount > this._availableCoin) {
                    
                    const exMsg = this.getOwnerComponent().getModel("i18n").getProperty("exceptionNotEnoughCoin");
                    MessageBox.show(exMsg);
                    return;
                }
                const newCoinBalance =  this._availableCoin - amount;
                console.log(newCoinBalance.toString());

                oContext.getBoundContext().setProperty("AbatCoin", newCoinBalance.toString());
                let self = this;
                oDataModel.submitBatch("default").then(
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
         * 
         * @param {typeof sap.ui.base.Event} event 
         */
        onCoinAmountInput: function(event){
            let _oInput = event.getSource();
            let val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },
        onNewRound: function(){
            this._resetResources();
        },
        /**
         * 
         * @param {boolean} isBusy 
         */
        _setBusy: function(isBusy){
            this.getView().setBusy(isBusy);
        },

        _requestAvailableCoin() {
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')");
            oContext.requestObject("AbatCoin").then((availableCoin) => {
                this._availableCoin = availableCoin;
            })
        },

        _resetResources: function() {
            this._requestAvailableCoin();
            this._resetPlayerAndDealerHand();

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

        onTest: function() {
            let deck = new DeckService();
            deck.shuffle();
            console.log(deck.deck);
        }
    });
});

