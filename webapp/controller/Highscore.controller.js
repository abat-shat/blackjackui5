sap.ui.define([
    "./BaseController",
    "sap/ui/model/Sorter"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function(Controller, Sorter) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Highscore", {
        onInit: function(){

        },

        sortPlayers: function(){
            let coinSorter = new Sorter("AbatCoin");
            let sorters = [];
            sorters.push(coinSorter);

            this.byId("highscoreTable").getBinding("items").sort(sorters);
        }
    });
});