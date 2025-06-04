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

    return Controller.extend("de.abatgroup.blackjackui5.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        i18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        user: function() {
            return this.getOwnerComponent().getModel("user");
        },
        username: function() {
            return this.user().getProperty("/name");
        },
        isAdmin: function() {
            return this.getOwnerComponent().getModel("admin").getProperty("/admin");
        },
        /**
         * 
         * @param {boolean} isBusy 
         */
        _setBusy: function(isBusy){
            this.getView().setBusy(isBusy);
        },
    });
});