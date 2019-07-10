sap.ui.define([
	"com/prodac/liberacion/notacreditoProdacLiberacionNotaCredito/controller/BaseController"
], function(Controller) {
	"use strict";
	var IDListArticle = '';
	return Controller.extend("com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.controller.Detail", {
		ongetIDListArticle: function() {
			return IDListArticle;
		},
		onInit: function() {
			var data = {
				short: 'short',
				large: 'large',
				add: 'add',
				subtract: 'subtract',
				equal: 'equal'
			};
		    var oModel = new sap.ui.model.json.JSONModel();
		    oModel.setData(data);
		    this.getView().setModel(oModel, "formatdate");
			IDListArticle = this.createId('ListArticle');
		}
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.view.Detail
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.view.Detail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.view.Detail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.view.Detail
		 */
		//	onExit: function() {
		//
		//	}

	});

});