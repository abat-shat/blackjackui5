sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageBox} MessageBox
 * 
 */
function(Controller, JSONModel, MessageBox) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        onInit: function(){
            const imgModel = new JSONModel(sap.ui.require.toUrl("de/abatgroup/blackjackui5/model/img.json"));
            this.getView().setModel(imgModel, "img");
            
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

            MessageBox.show(amount.toString());
            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "default"
            });
            const availableCoin = oContext.getBoundContext().getProperty("AbatCoin");

            if (amount > availableCoin) {
                const exMsg = this.getOwnerComponent().getModel("i18n").getProperty("exceptionNotEnoughCoin")
                return;
            }



            oContext.getBoundContext().setProperty("AbatCoin", availableCoin - amount);
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
         * @param {typeof sap.ui.base.Event} event 
         * @param {int} amount 
         */
        onAddToBetAmount: function(event, amount){
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
        /**
         * 
         * @param {boolean} isBusy 
         */
        _setBusy: function(isBusy){
            this.getView().setBusy(false);
        }
    });
});

