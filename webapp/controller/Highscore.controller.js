sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageBox} MessageBox 
 */
function(Controller, JSONModel, MessageBox, Sorter) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Highscore", {
        onInit: function(){

        },

        onPresser: function() {
            const list = this.byId("highscoreTable").getBinding("items");
            debugger;
        },

        sortPlayers: function(){
            let coinSorter = new Sorter("AbatCoin");
            let sorters = [];
            sorters.push(coinSorter);

            this.byId("highscoreTable").getBinding("items").sort(sorters);
        }
    });
});