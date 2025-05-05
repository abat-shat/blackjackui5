/*global QUnit*/

sap.ui.define([
	"de/abatgroup/blackjackui5/controller/MainMenu.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MainMenu Controller");

	QUnit.test("I should test the MainMenu controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
