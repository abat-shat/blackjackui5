sap.ui.define([
    "sap/ui/core/UIComponent",
    "de/abatgroup/blackjackui5/model/models"
], function(UIComponent, models) {
    "use strict";

    return UIComponent.extend("de.abatgroup.blackjackui5.Component", {
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

            this.setModel(models.createImgModel(), "img");

            // enable routing
            this.getRouter().initialize();
        }
    });
});