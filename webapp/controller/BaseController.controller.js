sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 */
function(Controller) {
    "use strict";

    
    return Controller.extend("abat.intern.shat.blackjackui5.controller.BaseController", {
        getRouter: function(){
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
    });
});