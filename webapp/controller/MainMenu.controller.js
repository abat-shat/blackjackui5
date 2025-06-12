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
        BASE_DAILY_BONUS : 500,
        BASE_DATE : "1970-01-01",
        onInit() {
            this._checkIsUserRegistered();
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
            let oBinding = oContext.create({
                "Abbreviation" : this.username(),
                "AbatCoin" : "0",
                "Bonus" : "1000",
                "LastLoginDate" : this._getTodaysDate(),
                "LoginStreak" : 1
            });
            oBinding.created()
                .then(this._userIsCreated.bind(this))
                .catch(this._userIsNotCreated.bind(this));
            this._setBusy(true);
        },
        onDailyLogin: function() {
            let oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')");
            oContext.requestObject()
                .then(this._addDailyBonusToUser.bind(this))
                .catch(() => {
                    let msg = this.i18n().getText("exceptionDailyLoginFailed");
                    MessageBox.error(msg);
                    this._setBusy(false);
                });
            this._setBusy(true);
        },
        onInviteFriend: function() {
            
        },
        onEnteringBankVault: function() {
            this.getRouter().navTo("bankVault");
        },
        onPressShopButton: function() {
            this.getRouter().navTo("shop");
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
            this._setBusy(false);
        },

        _userIsNotCreated: function(error) {
            let msg = this.i18n().getText("notCreatedUser", [error]);
            MessageBox.error(msg);
            this._setBusy(false);
        },
        _addDailyBonusToUser: function(oData) {
            let daysBetween = this._daysBetween(oData.LastLoginDate, this._getTodaysDate());
            let msg = "";
            let newStreakNumber = 0;
            let receivedBonus = 0;
            switch (daysBetween) {
                case 0:
                    msg = this.i18n().getText("zeroDaysBetween");
                    newStreakNumber = Number(oData.LoginStreak);
                    break;
                case 1:
                    newStreakNumber = Number(oData.LoginStreak) + 1;
                    receivedBonus = this.BASE_DAILY_BONUS * newStreakNumber
                    msg = this.i18n().getText("oneDayBetween", [newStreakNumber, receivedBonus, receivedBonus + this.BASE_DAILY_BONUS]);

                    break;
            
                default:
                    newStreakNumber = 1;
                    receivedBonus = this.BASE_DAILY_BONUS;
                    msg = this.i18n().getText("moreDaysBetween", [receivedBonus, receivedBonus + 500]);

                    break;
            }
            MessageBox.information(msg);
            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('" + this.username() + "')", null, {
                $$updateGroupId: "addDaily"
            });
            oContext.getBoundContext().setProperty("LoginStreak", newStreakNumber);
            oContext.getBoundContext().setProperty("LastLoginDate", this._getTodaysDate());
            let newBonus = Number(oData.Bonus) + receivedBonus;
            oContext.getBoundContext().setProperty("Bonus", newBonus.toString());
            oDataModel.submitBatch("addDaily")
                .then(() => this._setBusy(false))
                .catch(() => {
                    MessageBox.error("exceptionDailyLoginFailed");
                    this._setBusy(false);
                });

        },
        /**
         * Source: {@link https://stackoverflow.com/a/29774197 StackOverflow}
         * @returns Today's date in format YYYY-MM-DD
         */
        _getTodaysDate: function() {
            let date = new Date();
            const offset = date.getTimezoneOffset();
            date = new Date(date.getTime() - (offset*60*1000));
            return date.toISOString().split('T')[0];
        },
        /**
         * Source: {@link https://stackoverflow.com/a/47181114 StackOverflow}
         * @param {*} startDate Date in YYYY-MM-DD format
         * @param {*} endDate Date in YYYY-MM-DD format
         * @returns difference in days
         */
        _daysBetween: function(startDate, endDate){
            let startDateConverted;
            if (startDate == 'null') {
                startDateConverted = new Date(this.BASE_DATE);
            } else {
                startDateConverted = new Date(startDate);    
            }
            
            const endDateConverted = new Date(endDate);
            const diffInMs   = endDateConverted.getTime() - startDateConverted.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
            return diffInDays;
        }
    });
});