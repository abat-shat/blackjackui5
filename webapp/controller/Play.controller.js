sap.ui.define([
    "sap/ui/core/mvc/Controller"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 */
function(Controller) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        onUsername: function(){
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                sap.m.MessageBox.show(userId);
              });
            
        }
    });
});