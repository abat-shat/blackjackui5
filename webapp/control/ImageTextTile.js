sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Image",
    "sap/m/Text",
    "sap/ui/events/KeyCodes"
],
/**
 * 
 * @param {typeof sap.ui.core.Control} Control
 * @param {typeof sap.m.Image} Image
 * @param {typeof sap.m.Text} Text
 * @returns 
 */
function(Control, Image, Text, KeyCodes) {
    "use strict";

    return Control.extend("de.abatgroup.blackjackui5.control.ImageTextTile", {
        originalText2 : null,
        metadata: {
            properties: {
                "src": { type: "string", defaultValue: "" },
                "text1": { type: "string", defaultValue: "" },
                "text2": { type: "string", defaultValue: "" },
                "enabled": {type : "boolean", defaultValue: true},
                "width": { type: "sap.ui.core.CSSSize", defaultValue: "auto" },
                "height": { type: "sap.ui.core.CSSSize", defaultValue: "auto" }
            },
            aggregations: {
                "_image": { type: "sap.m.Image", multiple: false, visibility: "hidden" },
                "_text1": { type: "sap.m.Text", multiple: false, visibility: "hidden" },
                "_text2": { type: "sap.m.Text", multiple: false, visibility: "hidden" }
            },
            events: {
                "press": {
                    allowPreventDefault: true,
                    parameters: {
                        "text1": { type: "string" },
                        "text2": { type: "string" },
                    }
                }
            },
            defaultAggregation: "_image"
        },

        init: function() {
            this.setAggregation("_image", new Image({
                densityAware: false,
                decorative: false
            }));
            
            this.setAggregation("_text1", new Text());
            this.setAggregation("_text2", new Text());
        },

        setSrc: function(sSrc) {
            this.setProperty("src", sSrc, true);
            this.getAggregation("_image").setSrc(sSrc);
            return this;
        },

        setText1: function(sText) {
            this.setProperty("text1", sText, true);
            this.getAggregation("_text1").setText(sText);
            return this;
        },

        setText2: function(sText) {
            this.setProperty("text2", sText, true);
            this.getAggregation("_text2").setText(sText);
            return this;
        },

        getText1 : function() {
            return this.getProperty("text1");
        },

        getText2 : function() {
            return this.getProperty("text2");
        },

        setEnabled: function(isEnabled) {
            this.setProperty("enabled", isEnabled, true);
            if (!isEnabled) {
                if (!this.originalText2) {
                    this.originalText2 = this.getText2();
                }
                
                this.setText2(this.getModel("i18n").getResourceBundle().getText("deckSold"));
            } else {
                this.setText2(this.originalText2);
            }
            return this;
        },

        getEnabled: function() {
            return this.getProperty("enabled");
        },

        onkeydown: function(oEvent) {
            if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
                this._handlePress(oEvent);
                oEvent.preventDefault();
            }
        },

        onclick: function(oEvent) {
            this._handlePress(oEvent);
        },

        onsaptouchstart: function(oEvent) {
            // Mark the event for touch support
            this._bTouch = true;
        },

        _handlePress: function(oEvent) {
            if (this.getEnabled()) {
                // For touch devices, prevent the click event that follows touch
                if (this._bTouch) {
                    oEvent.preventDefault();
                    this._bTouch = false;
                }
                
                this.firePress({
                    "text1" : this.getText1(),
                    "text2" : this.getText2()
                }); 
            }
            
        },

        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("div", oControl)
                    .class("myImageTextTile")
                    .class("sapUiTinyMargin")
                    .attr("tabindex", oControl.getEnabled() ? "0" : null)
                    .attr("role", "button")
                    .style("width", oControl.getWidth())
                    .style("height", oControl.getHeight())
                    .style("display", "flex")
                    .style("flex-direction", "column")
                    .style("align-items", "center")
                    .style("cursor", "pointer")
                    .openEnd();
                
                // Render image
                oRm.openStart("div")
                    .class("myImageContainer")
                    .style("flex", "1")
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("justify-content", "center")
                    .openEnd();
                oRm.renderControl(oControl.getAggregation("_image"));
                oRm.close("div");
                
                // Render text container
                oRm.openStart("div")
                    .class("myTextContainer")
                    .style("width", "100%")
                    .style("text-align", "center")
                    .style("padding", "0.5rem")
                    .openEnd();
                
                oRm.renderControl(oControl.getAggregation("_text1"));
                
                oRm.close("div");

                oRm.openStart("div")
                    .class("myTextContainer")
                    .style("width", "100%")
                    .style("text-align", "center")
                    .style("padding", "0.5rem")
                    .openEnd();
                
                oRm.renderControl(oControl.getAggregation("_text2"));
                oRm.close("div");
                
                oRm.close("div");
            }
        }
    });
});