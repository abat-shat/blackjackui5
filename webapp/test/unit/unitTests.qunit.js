/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"abat/intern/shat/blackjackui5/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
