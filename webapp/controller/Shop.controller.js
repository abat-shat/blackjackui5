sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.m.MessageBox} MessageBox 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @returns 
 */
function(Controller, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("de.abatgroup.blackjackui5.controller.Shop", {
        onInit: function() {
            let shopCoinModel = new JSONModel({
                "available" : 0
            });
            this.getView().setModel(shopCoinModel, "shop");
            /** @type {sap.ui.core.routing.Router} */
            let router = this.getRouter();
            router.getRoute("shop").attachMatched(this._onRouteMatched, this);
        },
        
        onRefreshBalance: function() {
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject("AbatCoin").then(
                (coin) => 
                    this.getView().getModel("shop").setProperty("/available", Number(coin))
                );
        },

        onPurchasingDeck: function(event) {
            let deckName = event.getParameter("text1");
            let price = Number(event.getParameter("text2"));
            let msg = "";
            if (!this._checkEnoughBalance(price)) {
                msg = this.i18n().getText("exceptionNotEnoughCoin");
                MessageBox.error(msg);
            }
            else {
                msg = this.i18n().getText("confirmPurchasingDeck", [deckName]);
                let title = this.i18n().getText("confirmTitle");
                MessageBox.confirm(msg, {
                    title : title,
                    onClose : (action) => {
                        if (action === MessageBox.Action.OK) {
                            /** @type {sap.ui.model.odata.v4.ODataModel} */
                            const oDataModel = this.getOwnerComponent().getModel();
                            /** @type {sap.ui.model.odata.v4.ODataListBinding} */
                            const oContext = oDataModel.bindList("/Coin('" + this.username() + "')/_Deck");
                            let oBinding = oContext.create({
                                "Abbreviation" : this.username(),
                                "Deck" : deckName.toString()
                            });
                            oBinding.created()
                            .then(() => this._buyDeckSuccessful(price, deckName, event.getSource()))
                            .catch((this._buyDeckFailed.bind(this)));
                            this._setBusy(true);
                        }
                    }
                });
            }
            
        },

        _onRouteMatched: function(){
            this.onRefreshBalance();
            this._disableBoughtDecks();
            
        },

        _checkEnoughBalance: function(price) {
            let balance = this.shop().getProperty("/available");
            return balance >= price;
        },

        _buyDeckSuccessful: function(price, deckName, imageTextTile) {
            imageTextTile.setEnabled(false);
            let newBalance = this.shop().getProperty("/available") - price;
            const oDataModel = this.getView().getModel();
            const oContext = oDataModel
                .bindContext("/Coin('" + this.username() + "')", null, {
                    $$updateGroupId: "availableCoin"
                } );
            oContext.getBoundContext().setProperty("AbatCoin", newBalance.toString());
            oDataModel.submitBatch("availableCoin")
                .then(() => {
                    MessageBox.success(this.i18n().getText("buyDeckSuccessful", [deckName]));
                    this._setBusy(false);
                    this.onRefreshBalance();
                })
                .catch((error) => {
                    MessageBox.information(this.i18n().getText("exceptionFreeDeck", [error]));
                    this._setBusy(false);
                });
        },

        _buyDeckFailed: function(error) {
            let msg = this.i18n().getText("exceptionShopFailed", [error]);
            MessageBox.information(msg);
        },

        _disableBoughtDecks: function() {
            /** @type {sap.ui.model.odata.v4.ODataModel} */
            const oDataModel = this.getOwnerComponent().getModel();
            /** @type {sap.ui.model.odata.v4.ODataListBinding} */
            const oContext = oDataModel.bindList("/Coin('" + this.username() + "')/_Deck");
            oContext.requestContexts().then((contexts) => {
                contexts.forEach(this._requestDeck.bind(this));
            });
        },
        /**
         * 
         * @param {sap.ui.model.odata.v4.Context} context 
         */
        _requestDeck: function(context) {
            context.requestObject("Deck").then((deckName) => {
                let formatted = this.uppercaseToCapitalize(deckName);
                this.getView().byId("shop" + formatted + "Item").setEnabled(false);
            });
        },

        shop: function (){
            return this.getView().getModel("shop");
        },
        uppercaseToCapitalize: function(str) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        onTest: function() {
            
        }
        
    });
});
