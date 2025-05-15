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
        }
    };

});