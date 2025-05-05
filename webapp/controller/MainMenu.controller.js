sap.ui.define([
    "sap/ui/core/mvc/Controller"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @returns 
 */
function(Controller) {
    "use strict";

    return Controller.extend("de.abatgroup.blackjackui5.controller.MainMenu", {
        onInit() {
        },

        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
          },

        onPressPlayButton: function() {
            this.getRouter().navTo("play");
        },

        onPressHighscoreButton: function() {
            this.getRouter().navTo("highscore");
        }
    });
});