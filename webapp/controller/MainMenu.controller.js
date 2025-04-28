sap.ui.define([
    "sap/ui/core/mvc/Controller"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 */
function(Controller) {
    "use strict";

    return Controller.extend("abat.intern.shat.blackjackui5.controller.MainMenu", {
        onInit() {
        },

        getRouter: function() {
            // return this.getOwnerComponent().getRouter();
            debugger;
            return sap.ui.core.UIComponent.getRouterFor(this);
          },

        onPressPlayButton: function() {
            let router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("play");
            console.log("This is executing");
            debugger;

            //this.getRouter().navTo("play");
        },

        onPressHighscoreButton: function() {

        }
    });
});