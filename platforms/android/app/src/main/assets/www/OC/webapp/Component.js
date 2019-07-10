sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"com/prodac/liboc/masterdetail/model/models",
		"com/prodac/liboc/masterdetail/controller/ListSelector",
		"com/prodac/liboc/masterdetail/controller/ErrorHandler",
		"sap/ui/model/json/JSONModel"
	], function (UIComponent, Device, models, ListSelector, ErrorHandler, JSONModel) {
		"use strict";

		return UIComponent.extend("com.prodac.liboc.masterdetail.Component", {

			metadata : {
				manifest : "json"
			},
			
			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this method, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {
				
				this.oListSelector = new ListSelector();
				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// create the views based on the url/hash MCA: comentado para que el login entre
				//this.getRouter().initialize();
				
				this.cargaInicial();
			},

			cargaInicial: function() {
				/*eslint-disable*/
				var midata = {
					comentario : "",
					motivo : "-1",
					boton_aprobar : false,
					boton_desaprobar : false,
					usuario : "",		//MCA debe ser vacio
					autologin : true,	//MCA indica si la app loguea con su propio mecanismo
					detallesVisible : false
				};
				
				var oModel_midata = new JSONModel( midata );
        		this.setModel( oModel_midata, "midata" );
        		
        		var oModel_odata = this.getModel();
				this.setModel(oModel_odata,"odata");

				//var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser"); 
		        //sap.ui.getCore().setModel(userModel, "userapi"); 
        		
        		console.log("Carga inicial midata", oModel_midata);
        		console.log("Carga inicial odata", oModel_odata);
				//console.log("Carga inicial userModel",	userModel);
			},


			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ListSelector and ErrorHandler are destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this.oListSelector.destroy();
				this._oErrorHandler.destroy();
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}

		});

	}
);