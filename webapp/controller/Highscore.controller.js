sap.ui.define([
    "./BaseController",
    "sap/ui/model/Sorter"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 * @param {typeof sap.ui.model.Sorter} Sorter
 */
function(Controller, Sorter) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Highscore", {
        onInit: function(){
            let variable = this.byId("hsSfLabel1");
            console.log(variable);
        },

        sortPlayers: function(){
            let coinSorter = new Sorter("AbatCoin");
            let sorters = [];
            sorters.push(coinSorter);

            this.byId("highscoreTable").getBinding("items").sort(sorters);
        },

        onRefreshBalance: function(){
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject().then(this._bindContextToSimpleForm.bind(this));
        },
        _bindContextToSimpleForm: function(oData) {
            this.getView().byId("hsSFLabel2").setText(oData.AbatCoin + " abatCoins");
            this.getView().byId("hsSFLabel3").setText(oData.Bonus + " Bonus");
        }

        
    });
});