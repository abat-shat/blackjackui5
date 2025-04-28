sap.ui.define([
    "sap/ui/core/UIComponent",
    "abat/intern/shat/blackjackui5/model/models"
], function(UIComponent, models) {
    "use strict";

    return UIComponent.extend("abat.intern.shat.blackjackui5.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});