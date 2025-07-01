sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageToast} MessageToast
 */
function (Controller, JSONModel, MessageToast) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Customize", {
        onInit: function() {
            let deckModel = new JSONModel({
                "decks" : []
            });
            this.getView().setModel(deckModel, "deck");

            this.getRouter().getRoute("customize").attachMatched(this._onRouteMatched, this);
        },
        onDealerDeckChange: function(event) {
            let deckName = event.getParameter("selectedItem").getProperty("key");
            this._saveDeckSelection("DealerDeck", deckName);
            this._setDeckImgSrc(deckName.toLowerCase(), "dealer");
        },
        onPlayerDeckChange: function(event) {
            let deckName = event.getParameter("selectedItem").getProperty("key");
            this._saveDeckSelection("PlayerDeck", deckName);
            this._setDeckImgSrc(deckName.toLowerCase(), "player");
        },
        onPlayerSplitDeckChange: function(event) {
            let deckName = event.getParameter("selectedItem").getProperty("key");
            this._saveDeckSelection("PlayerSplitDeck", deckName);
            this._setDeckImgSrc(deckName.toLowerCase(), "playerSplit");
        },
        _onRouteMatched: function() {
            this._loadSelectionList();
            this._loadDefaultSelection();
        },
        _loadSelectionList: function() {
            /** @type {sap.ui.model.odata.v4.ODataModel} */
            const oDataModel = this.getOwnerComponent().getModel();
            /** @type {sap.ui.model.odata.v4.ODataListBinding} */
            const oContext = oDataModel.bindList("/Coin('" + this.username() + "')/_Deck");
            oContext.requestContexts().then((contexts) => {
                this.deck().setProperty("/decks", []);
                contexts.map(this._requestDeckName.bind(this)).forEach(this._addDeckNameToDeckModel.bind(this));
            });
        },
        _loadDefaultSelection: function(){
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject().then((oData) => {
                let dealerDeck = this.uppercaseToCapitalize(oData.DealerDeck);
                let playerDeck = this.uppercaseToCapitalize(oData.PlayerDeck);
                let playerSplitDeck = this.uppercaseToCapitalize(oData.PlayerSplitDeck);
                this.getView().byId("dealerSelect").setSelectedKey(dealerDeck);
                this.getView().byId("playerSelect").setSelectedKey(playerDeck);
                this.getView().byId("playerSplitSelect").setSelectedKey(playerSplitDeck);
                this._setDeckImgSrc(dealerDeck.toLowerCase(), "dealer");
                this._setDeckImgSrc(playerDeck.toLowerCase(), "player");
                this._setDeckImgSrc(playerSplitDeck.toLowerCase(), "playerSplit");

            });
            
        },
        _saveDeckSelection: function(deckCustomizing, deckName) {
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')", null, {
                $$updateGroupId: "deckChange"
            });
            oContext.getBoundContext().setProperty(deckCustomizing, deckName);
            oDataModel.submitBatch("deckChange")
            .then(() => {
                MessageToast.show(this.i18n().getText("changeDeckSuccess", [deckCustomizing, deckName]));
                this._setBusy(false);
            })
            .catch(() => {
                MessageToast.show(this.i18n().getText("changeDeckFailed", [deckCustomizing]));
                this._setBusy(false);
            });
            this._setBusy(true);
        },
        /**
         * 
         * @param {sap.ui.model.odata.v4.Context} context
         * @returns {Promise<string>}
         */
        _requestDeckName: async function(context) {
            let deckName = await context.requestObject("Deck");
            return this.uppercaseToCapitalize(deckName);
        },
        /**
         * 
         * @param {Promise<string>} promise 
         */
        _addDeckNameToDeckModel: function(promise) {
            promise.then((deckName) => {
                let decks = this.deck().getProperty("/decks");
                decks.push(deckName);
                this.deck().setProperty("/decks", decks);
            });
        },
        /**
         * 
         * @returns {sap.ui.model.json.JSONModel}
         */
        deck: function() {
            return this.getView().getModel("deck");
        },
        _setDeckImgSrc: function(deckName, imagePrefix) {
            let qualifiedDeckSrc = this.getDeckImgSrc(deckName);
            this.getView().byId(imagePrefix + "SelectImage")
                .setSrc(qualifiedDeckSrc);
        }
        
    });
});