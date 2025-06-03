sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Provides relative paths to the images.
         * @returns {sap.ui.model.json.JSONModel} The img model.
         */
        createImgModel: function() {
            const imgModel = new JSONModel(sap.ui.require.toUrl("de/abatgroup/blackjackui5/model/img.json"));
            imgModel.setDefaultBindingMode("OneWay");
            return imgModel;
        },
        /**
         * Fix to display Images on Fiori Launchpad.
         * Source {@link https://community.sap.com/t5/technology-q-a/images-not-showing-in-sapui5-application-after-deployed-in-fiori-launchpad/qaq-p/362913 SAP Community}
         */
        createModulePathModel: function() {
            let oRootPath = jQuery.sap.getModulePath("de.abatgroup.blackjackui5");
            let rootModel = new JSONModel({
                "path" : oRootPath
            });
            return rootModel;
        }
    };

});