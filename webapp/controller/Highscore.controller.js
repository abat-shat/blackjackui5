sap.ui.define([
    "./BaseController",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 * @param {typeof sap.ui.model.Sorter} Sorter
 * @param {typeof sap.ui.model.Filter} Filter
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator
 * @param {typeof sap.m.MessageToast} MessageToast
 */
function(Controller, Sorter, Filter, FilterOperator, MessageToast) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Highscore", {
        onInit: function(){
        },
        onFilterChange: function(event){
            let msg = "";
            if (event.getSource().getState()) {
                this._sortPlayers("Highscore");
                msg = this.i18n().getText("sortByHighscore");
                
            } else {
                this._sortPlayers("AbatCoin");
                msg = this.i18n().getText("sortByAbatCoin");
            }
            MessageToast.show(msg);
        },

        _sortPlayers: function(sortCriteria){
            let coinSorter = new Sorter(sortCriteria, true);
            let sorters = [];
            sorters.push(coinSorter);

            this.byId("highscoreTable").getBinding("items").sort(sorters);
        },

        onRefreshBalance: function(){
            const oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject().then(this._bindContextToSimpleForm.bind(this));
        },
        onFilterPlayers: function(event) {
            let filters = [];
            let query = event.getParameter("query");
            if (query && query.length > 0) {
                filters.push(new Filter("Abbreviation", FilterOperator.Contains, query));
            }

            this.getView().byId("highscoreTable").getBinding("items").filter(filters);
        },
        _bindContextToSimpleForm: function(oData) {
            this.getView().byId("hsSFLabel2").setText(oData.AbatCoin + " abatCoins");
            this.getView().byId("hsSFLabel3").setText(oData.Bonus + " Bonus");
            this.getView().byId("hsSFLabel4").setText(oData.Highscore + " Highscore");
        }

        
    });
});