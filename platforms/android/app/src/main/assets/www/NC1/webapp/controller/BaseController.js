sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"com/prodac/liberacion/notacreditoProdacLiberacionNotaCredito/model/formatter",
	'sap/m/MessageBox'
], function(Controller, Device, formatter, MessageBox) {
	"use strict";
	return Controller.extend("com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.controller.Base", {
		formatter: formatter
	});
});