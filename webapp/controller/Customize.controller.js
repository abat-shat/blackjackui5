sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 */
function (Controller, JSONModel) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Customize", {
        onInit: function() {
            let deckModel = new JSONModel({
                "decks" : []
            });
            this.getView().setModel(deckModel, "deck");

            /** @type {sap.ui.model.odata.v4.ODataModel} */
            const oDataModel = this.getOwnerComponent().getModel();
            /** @type {sap.ui.model.odata.v4.ODataListBinding} */
            const oContext = oDataModel.bindList("/Coin('" + this.username() + "')/_Deck");
            oContext.requestContexts().then((contexts) => {
                contexts.map(this._requestDeckName.bind(this)).forEach(this._addDeckNameToDeckModel.bind(this));
            });
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
        }
    });
});