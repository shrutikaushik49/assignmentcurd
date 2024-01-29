/*global QUnit*/

sap.ui.define([
	"assignmentcurd/controller/assignmentcurd.controller"
], function (Controller) {
	"use strict";

	QUnit.module("assignmentcurd Controller");

	QUnit.test("I should test the assignmentcurd controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
