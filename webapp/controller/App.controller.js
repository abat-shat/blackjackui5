sap.ui.define([
  "./BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
],
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.Filter} Filter
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @returns 
 */
function(Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("de.abatgroup.blackjackui5.controller.App", {
      onInit() {
        let adminModel = new JSONModel({
          "admin" : false
        });
        this.getOwnerComponent().setModel(adminModel, "admin");

        let model = this.getOwnerComponent().getModel();
        let filter = new Filter("Abbreviation", FilterOperator.EQ, this.username())
        let oListBinding = model.bindList("/Admin", undefined, undefined, [filter]);
        oListBinding.requestContexts(0, 1).then((aContexts) => {
            if (aContexts.length > 0) {
                // Value exists
                console.log("is admin");
                this.getOwnerComponent().getModel("admin").setProperty("/admin", true);
            }
        });
        
      }
  });
});