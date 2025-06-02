sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 * @param {typeof sap.m.MessageBox} MessageBox 
 * @returns 
 */
function(Controller, MessageBox) {
    "use strict";

    return Controller.extend("de.abatgroup.blackjackui5.controller.MainMenu", {
        onInit() {
            this._checkIsUserRegistered();
        },

        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
          },

        onPressPlayButton: function() {
            this.getRouter().navTo("play");
        },

        onPressHighscoreButton: function() {
            this.getRouter().navTo("highscore");
        },
        onPressRegister: function(){
            let oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindList("/Coin");
            let username = this.username();
            let oBinding = oContext.create({
                "Abbreviation" : username,
                "AbatCoin" : "0",
                "Bonus" : "1000"
            });
            oBinding.created()
                .then(this._userIsCreated.bind(this))
                .catch(this._userIsNotCreated.bind(this));
        },
        onDailyLogin: function() {
            
        },

        _checkIsUserRegistered: function() {
            let oDataModel = this.getOwnerComponent().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject()
                .then(this._userIsRegistered.bind(this))
                .catch(this._userIsNotRegistered.bind(this));
        },

        _userIsRegistered: function(oData) {
            this.user().setProperty("/isRegistered", true);
            let msg = this.i18n().getText("welcomeBackUser", [oData.Abbreviation, oData.AbatCoin, oData.Bonus]);
            MessageBox.information(msg);
        },

        _userIsNotRegistered: function() {
            let msg = this.i18n().getText("welcomeNewUser");
            MessageBox.information(msg);
        },

        _userIsCreated: function() {
            this.user().setProperty("/isRegistered", true);
            let msg = this.i18n().getText("createdUser");
            MessageBox.success(msg);
        },

        _userIsNotCreated: function() {
            let msg = this.i18n().getText("notCreatedUser");
            MessageBox.error(msg);
        }
    });
});