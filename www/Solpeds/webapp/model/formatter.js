sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},

			printMontoImporte : function(nMonto) {
				if (!nMonto) {
					return "";
				}
				var sResult = "";
				sResult = parseFloat(nMonto).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				return sResult;
			},

			printMontoImporte4 : function(nMonto) {
				if (!nMonto) {
					return "";
				}
				var sResult = "";
				sResult = Math.floor( parseFloat(nMonto)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (nMonto % 1).toFixed(4).toString().substring(1);
				return sResult;
			},

			printMontoImporteMoneda : function(nMonto, sMoneda) {
				if (!nMonto) {
					return "";
				}
				var sResult = "";
				sResult = parseFloat(nMonto).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "  " + sMoneda;
				return sResult;
			},

			mostrarFechaSAP : function(sFecha) {
				return sFecha;
			}
		};

	}
);
