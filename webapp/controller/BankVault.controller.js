sap.ui.define([
    "./BaseController"
],
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @returns 
 */
function(Controller) {
    "use strict";

    return Controller.extend("de.abatgroup.blackjackui5.controller.BankVault", {
        onInit: function() {
        },

        onSubmit: function() {
            let username = this.getView().byId("bankUsernameInput").getValue();
            let coin = this.getView().byId("bankCoinInput").getValue();

            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + username + "')", null, {
                $$updateGroupId: "addCoin"
            });
            oContext.requestObject("Bonus")
                .then((bonus) => this._addToBonus(oDataModel, oContext, bonus, coin))
                .catch();
            this._setBusy(true);
        },
        /**
         * 
         * @param {sap.ui.model.odata.v4.ODataModel} oDataModel 
         * @param {sap.ui.model.odata.v4.ODataContextBinding} oContext 
         * @param oldBonus 
         * @param moreBonus 
         */
        _addToBonus: function(oDataModel, oContext, oldBonus, moreBonus) {
            let bonusBalance = Number(oldBonus) + Number(moreBonus);
            oContext.getBoundContext().setProperty("Bonus", bonusBalance.toString());
            oDataModel.submitBatch("addCoin")
                .then(() => {
                    let msg = this.i18n().getText("topUpSuccessful", [bonusBalance]);
                    this.getView().byId("bankResult").setText(msg);
                    this._setBusy(false);
                })
                .catch((error) => {
                    this.getView().byId("bankResult").setText(error);
                    this._setBusy(false);        
                });
            
            

        }
    });
});