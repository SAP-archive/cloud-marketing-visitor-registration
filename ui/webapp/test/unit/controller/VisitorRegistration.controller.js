/*global QUnit*/

sap.ui.define([
	"sap/mkt/demo/visitor-registration-ui/controller/VisitorRegistration.controller"
], function (oController) {
	"use strict";

	QUnit.module("VisitorRegistration Controller");

	QUnit.test("I should test the VisitorRegistration controller", function (assert) {
		var oAppController = new oController();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});