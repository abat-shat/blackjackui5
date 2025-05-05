sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 */
function(Controller, JSONModel) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        onInit: function(){
            let imgModel = new JSONModel(sap.ui.require.toUrl("de/abatgroup/blackjackui5/model/img.json"));
            this.getView().setModel(imgModel, "img");
        },

        onUsername: function(){
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                // @ts-ignore
                sap.m.MessageBox.show(userId);
              });
            
        }
    });
});