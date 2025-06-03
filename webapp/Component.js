sap.ui.define([
    "sap/ui/core/UIComponent",
    "de/abatgroup/blackjackui5/model/models",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, models, JSONModel) {
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

            this.createUserModel();

            this.setModel(models.createModulePathModel(), "module");

            // enable routing
            this.getRouter().initialize();
        },

        createUserModel: function() {
            let self = this;
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                const usernameData = {
                    "name" : userId,
                    "isRegistered" : false
                };
                const usernameModel = new JSONModel(usernameData);
                usernameModel.setDefaultBindingMode("OneWay");
                self.setModel(usernameModel, "user");
            });
        }
    });
});