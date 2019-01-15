/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/mkt/demo/visitor-registration-ui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});