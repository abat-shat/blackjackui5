sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox"
], function(Controller, MessageBox) {
    "use strict";

    return Controller.extend("de.abatgroup.blackjackui5.controller.Shop", {
        onInit: function() {
        },
        onTilePress: function() {
            MessageBox.show("hello");
        }
    });
});
