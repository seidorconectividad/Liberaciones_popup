/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the basic UI5 support functionality
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './Plugin', 'sap/ui/Device', 'jquery.sap.dom', 'jquery.sap.encoder', 'jquery.sap.script'],
	function(jQuery, EventProvider, Plugin, Device/* , jQuerySap, jQuerySap2, jQuerySap1 */) {
	"use strict";

	/**
	 * Constructor for sap.ui.core.support.Support - must not be used: To get the singleton instance, use
	 * sap.ui.core.support.Support.getStub.
	 *
	 * @class This class provides the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @version 1.44.12
	 * @constructor
	 * @private
	 * @alias sap.ui.core.support.Support
	 */
	var Support = EventProvider.extend("sap.ui.core.support.Support", {
		constructor: function(sType) {
			if (!_bPrivate) {
				throw Error();
			}
			EventProvider.apply(this);

			var that = this;

			this._sType = sType;
			this._sLocalOrigin = window.location.protocol + "//" + window.location.host;

			var fHandler = jQuery.proxy(this._receiveEvent, this);
			if (window.addEventListener) {
				window.addEventListener("message", fHandler, false);
			} else {
				window.attachEvent("onmessage", fHandler);
			}

			switch (sType) {
				case mTypes.APPLICATION:
					this._isOpen = false;
					this.attachEvent(mEvents.TEAR_DOWN, function(oEvent){
						that._isOpen = false;
						if ( Device.browser.msie ) {
							jQuery.sap.byId(ID_SUPPORT_AREA + "-frame").remove();
						} else {
							close(that._oRemoteWindow);
						}
						that._oRemoteWindow = null;
						Support.exitPlugins(that, false);
					});
					this.attachEvent(mEvents.SETUP, function(oEvent){
						that._isOpen = true;
						Support.initPlugins(that, false);
					});
					break;
				case mTypes.IFRAME:
					this._oRemoteWindow = window.parent;
					this._sRemoteOrigin = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");
					this.openSupportTool();
					jQuery(window).bind("unload", function(oEvent){
						close(that._oOpenedWindow);
					});
					break;
				case mTypes.TOOL:
					this._oRemoteWindow = window.opener;
					this._sRemoteOrigin = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");
					jQuery(window).bind("unload", function(oEvent){
						that.sendEvent(mEvents.TEAR_DOWN);
						Support.exitPlugins(that, true);
					});
					jQuery(function(){
						Support.initPlugins(that, true).then(function() {
							that.sendEvent(mEvents.SETUP);
						});
					});
					break;
			}

		}
	});


	var mTypes = {
		APPLICATION: "APPLICATION", //Application stub -> the "standard one"
		IFRAME: "IFRAME", //Used by the Internet Explorer iFrame bridge only
		TOOL: "TOOL" //Used by the support tool only
	};


	var mEvents = {
		SETUP: "sapUiSupportSetup", //Event when support tool is opened
		TEAR_DOWN: "sapUiSupportTeardown" //Event when support tool is closed
	};


	/**
	 * Enumeration providing the possible support stub types.
	 *
	 * @static
	 * @enum
	 * @private
	 */
	Support.StubType = mTypes;


	/**
	 * Enumeration providing the predefined support event ids.
	 *
	 * @static
	 * @enum
	 * @private
	 */
	Support.EventType = mEvents;

	/**
	 * Support plugin registration
	 * @private
	 */
	Support.TOOL_SIDE_PLUGINS = ["sap.ui.core.support.plugins.TechInfo", "sap.ui.core.support.plugins.ControlTree", "sap.ui.core.support.plugins.ViewInfo", "sap.ui.core.support.plugins.Debugging", "sap.ui.core.support.plugins.Trace", "sap.ui.core.support.plugins.Performance", "sap.ui.core.support.plugins.MessageTest", "sap.ui.core.support.plugins.Interaction"];
	Support.APP_SIDE_PLUGINS = ["sap.ui.core.support.plugins.TechInfo", "sap.ui.core.support.plugins.ControlTree", "sap.ui.core.support.plugins.Trace", "sap.ui.core.support.plugins.Performance", "sap.ui.core.support.plugins.Selector", "sap.ui.core.support.plugins.Breakpoint", "sap.ui.core.support.plugins.LocalStorage", "sap.ui.core.support.plugins.Interaction"];


	/**
	 * Returns the support stub instance. If an instance was not yet available a new one is
	 * with the given type is created.
	 *
	 * This function is internal and must not be called by an application.
	 *
	 * @param {string} [sType=sap.ui.core.support.Support.EventType.APPLICATION] the type
	 * @return {sap.ui.core.support.Support} the support stub
	 * @static
	 * @private
	 */
	Support.getStub = function(sType) {
		if (_oStubInstance) {
			return _oStubInstance;
		}

		if (sType != mTypes.APPLICATION && sType != mTypes.IFRAME && sType != mTypes.TOOL) {
			sType = mTypes.APPLICATION;
		}

		_bPrivate = true;
		_oStubInstance = new Support(sType);
		_bPrivate = false;

		return _oStubInstance;
	};


	/**
	 * Returns the type of this support stub.
	 *
	 * @see sap.ui.core.support.Support.StubType
	 * @return {string} the type of the support stub
	 * @private
	 */
	Support.prototype.getType = function() {
		return this._sType;
	};


	/**
	 * Receive event handler for postMessage communication.
	 *
	 * @param {object} oEvent the event
	 * @private
	 */
	Support.prototype._receiveEvent = function(oEvent) {
		var sData = oEvent.data;

		if (typeof sData === "string" && sData.indexOf("SAPUI5SupportTool*") === 0) {
			sData = sData.substr(18); // length of SAPUI5SupportTool*
		} else {
			return;
		}

		if (oEvent.source != this._oRemoteWindow) {
				return;
		}

		this._oRemoteOrigin = oEvent.origin;

		if (this._sType === mTypes.IFRAME) {
			var that = this;
			setTimeout(function(){
				that._oOpenedWindow.sap.ui.core.support.Support.getStub(mTypes.TOOL)._receiveEvent({source: window, data: oEvent.data, origin: that._sLocalOrigin});
			}, 0);
		} else {
			var oData = JSON.parse(sData);
			var sEventId = oData.eventId;
			var mParams = oData.params;
			this.fireEvent(sEventId, mParams);
		}
	};


	/**
	 * Sends an event to the remote window.
	 *
	 * @param {string} sEventId the event id
	 * @param {Object} [mParams] the parameter map (JSON)
	 * @private
	 */
	Support.prototype.sendEvent = function(sEventId, mParams) {
		if (!this._oRemoteWindow) {
			return;
		}

		mParams = mParams ? mParams : {};

		if ( Device.browser.msie && this._sType === mTypes.TOOL ) {
			this._oRemoteWindow.sap.ui.core.support.Support.getStub(mTypes.IFRAME).sendEvent(sEventId, mParams);
		} else {
			var mParamsLocal = mParams;
			if ( Device.browser.msie ) {
				//Attention mParams comes from an other window
				//-> (mParams instanceof Object == false)!
				mParamsLocal = {};
				jQuery.extend(true, mParamsLocal, mParams);
			}
			var oData = {"eventId": sEventId, "params": mParamsLocal};
			var sData = "SAPUI5SupportTool*" + JSON.stringify(oData);
			this._oRemoteWindow.postMessage(sData, this._sRemoteOrigin);
		}
	};


	/**
	 * Opens the support tool in an external browser window.
	 *
	 * @private
	 */
	Support.prototype.openSupportTool = function() {
		var sToolUrl = jQuery.sap.getModulePath("sap.ui.core.support", "/support.html");
		var sParams = "?sap-ui-xx-noless=true&sap-ui-xx-support-origin=" + jQuery.sap.encodeURL(this._sLocalOrigin);

		var sBootstrapScript;
		if (this._sType === mTypes.APPLICATION) {
			// get bootstrap script name from script tag
			var oBootstrap = jQuery.sap.domById("sap-ui-bootstrap");
			if (oBootstrap) {
				var sRootPath = jQuery.sap.getModulePath('./');
				var sBootstrapSrc = oBootstrap.getAttribute('src');
				if (typeof sBootstrapSrc === 'string' && sBootstrapSrc.indexOf(sRootPath) === 0) {
					sBootstrapScript = sBootstrapSrc.substr(sRootPath.length);
				}
			}
		} else if (this._sType === mTypes.IFRAME) {
			// use script name from URI parameter to hand it over to the tool
			sBootstrapScript = jQuery.sap.getUriParameters().get("sap-ui-xx-support-bootstrap");
		}

		// sap-ui-core.js is the default. no need for passing it to the support window
		// also ensure that the bootstrap script is in the root module path
		if (sBootstrapScript && sBootstrapScript !== 'sap-ui-core.js' && sBootstrapScript.indexOf('/') === -1) {
			sParams += "&sap-ui-xx-support-bootstrap=" + jQuery.sap.encodeURL(sBootstrapScript);
		}

		function checkLocalUrl(sUrl){
			//TODO find a proper check
			return (sUrl.indexOf(".") == 0 || sUrl.indexOf("/") == 0 || sUrl.indexOf("://") < 0);
		}

		if (this._sType === mTypes.APPLICATION) {
			if (!this._isOpen) {
				if ( Device.browser.msie ) {
					var sIFrameUrl = jQuery.sap.getModulePath("sap.ui.core.support", "/msiebridge.html");
					getSupportArea().html("").append("<iframe id=\"" + ID_SUPPORT_AREA + "-frame\" src=\"" + sIFrameUrl + sParams + "\" onload=\"sap.ui.core.support.Support._onSupportIFrameLoaded();\"></iframe>");
					this._sRemoteOrigin = checkLocalUrl(sIFrameUrl) ? this._sLocalOrigin : sIFrameUrl;
				} else {
					this._oRemoteWindow = openWindow(sToolUrl + sParams);
					this._sRemoteOrigin = checkLocalUrl(sToolUrl) ? this._sLocalOrigin : sToolUrl;
				}
			}
		} else if (this._sType === mTypes.IFRAME) {
			this._oOpenedWindow = openWindow(sToolUrl + sParams);
		}
	};


	/**
	 * Event Handler which is bound to the onload event of the Internet Explorer iFrame bridge.
	 *
	 * @static
	 * @private
	 */
	Support._onSupportIFrameLoaded = function(){
		_oStubInstance._oRemoteWindow = jQuery.sap.byId(ID_SUPPORT_AREA + "-frame")[0].contentWindow;
	};


	/**
	 * @see sap.ui.base.EventProvider.prototype.toString
	 *
	 * @private
	 */
	Support.prototype.toString = function() {
		return "sap.ui.core.support.Support";
	};


	/**
	 * @see sap.ui.base.EventProvider.prototype.fireEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.fireEvent
	 * @function
	 * @param {string} sEventId the event id
	 * @param {Object} [mParameters] the parameter map (JSON)
	 * @return {sap.ui.core.support.Support} Returns <code>this</code> to allow method chaining
	 * @private
	 */


	/**
	 * @see sap.ui.base.EventProvider.prototype.detachEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.detachEvent
	 * @function
	 * @private
	 */


	/**
	 * @see sap.ui.base.EventProvider.prototype.attachEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.attachEvent
	 * @function
	 * @private
	 */


	//*************** PRIVATE **************

	var _bPrivate = false; //Ensures that the constructor can not be called from outside
	var _oStubInstance; //The stub instance

	var ID_SUPPORT_AREA = "sap-ui-support";


	function getSupportArea() {
		var $support = jQuery.sap.byId(ID_SUPPORT_AREA);
		if ($support.length === 0) {
			$support = jQuery("<DIV/>", {id:ID_SUPPORT_AREA}).
				addClass("sapUiHidden").
				appendTo(document.body);
		}
		return $support;
	}


	function openWindow(sUrl) {
		return window.open(sUrl,
			"sapUiSupportTool",
			"width=800,height=700,status=no,toolbar=no,menubar=no,resizable=yes,location=no,directories=no,scrollbars=yes"
		);
	}


	function close(oWindow) {
		if (!oWindow) {
			return;
		}
		try {
			oWindow.close();
		} catch (e) {
			//escape eslint check for empty block
		}
	}

	/**
	 * Loads and initializes all plugins on app or tool side depending on
	 * the <code>bTool</code> parameter.
	 *
	 * @param {sap.ui.core.support.Support} oStub Support instance (app or tool side)
	 * @param {boolean} bTool Whether tool or app side plugins should be handled
	 * @return {Promise} Resolved once the plugins have been loaded and initialized
	 * @private
	 */
	Support.initPlugins = function(oStub, bTool) {

		return new Promise(function(resolve, reject) {

			var aPlugins = bTool ? Support.TOOL_SIDE_PLUGINS : Support.APP_SIDE_PLUGINS;

			// collect plugin modules
			var aPluginModules = [],
				aPluginModuleIndexes = [],
				i;

			for ( i = 0; i < aPlugins.length; i++ ) {
				if ( typeof aPlugins[i] === "string" ) {
					aPluginModules.push( jQuery.sap.getResourceName(aPlugins[i], '') );
					aPluginModuleIndexes.push(i);
				}
			}

			sap.ui.require(aPluginModules, function() {

				var i,j,FNPluginConstructor;

				// instantiate loaded plugins
				for ( var j = 0; j < arguments.length; j++ ) {
					FNPluginConstructor = arguments[j];
					i = aPluginModuleIndexes[j];
					aPlugins[i] = new FNPluginConstructor(oStub);
					if ( oStub.getType() === mTypes.TOOL ) {
						wrapPlugin(aPlugins[i]);
					}
				}

				for ( i = 0; i < aPlugins.length; i++ ) {
					if ( aPlugins[i] instanceof Plugin ) {
						aPlugins[i].init(oStub);
					}
				}

				resolve();

			});

		});

	};

	/**
	 * Unloads all plugins on app or tool side depending on
	 * the <code>bTool</code> parameter.
	 *
	 * @param {sap.ui.core.support.Support} oStub Support instance (app or tool side)
	 * @param {boolean} bTool Whether tool or app side plugins should be handled
	 * @private
	 */
	Support.exitPlugins = function(oStub, bTool) {
		var aPlugins = bTool ? Support.TOOL_SIDE_PLUGINS : Support.APP_SIDE_PLUGINS;
		for (var i = 0; i < aPlugins.length; i++) {
			if (aPlugins[i] instanceof Plugin) {
				aPlugins[i].exit(oStub, bTool);
			}
		}
	};


	function wrapPlugin(oPlugin) {
		oPlugin.$().replaceWith("<div  id='" + oPlugin.getId() + "-Panel' class='sapUiSupportPnl'><h2 id='" + oPlugin.getId() + "-PanelHeader' class='sapUiSupportPnlHdr'>" +
				oPlugin.getTitle() + "<div id='" + oPlugin.getId() + "-PanelHandle' class='sapUiSupportPnlHdrHdl sapUiSupportPnlHdrHdlClosed'></div></h2><div id='" +
				oPlugin.getId() + "-PanelContent' class='sapUiSupportPnlCntnt sapUiSupportHidden'><div id='" +
				oPlugin.getId() + "' class='sapUiSupportPlugin'></div></div></div>");

		oPlugin.$("PanelHeader").click(function(){
			var jHandleRef = oPlugin.$("PanelHandle");
			if (jHandleRef.hasClass("sapUiSupportPnlHdrHdlClosed")) {
				jHandleRef.removeClass("sapUiSupportPnlHdrHdlClosed");
				oPlugin.$("PanelContent").removeClass("sapUiSupportHidden");
			} else {
				jHandleRef.addClass("sapUiSupportPnlHdrHdlClosed");
				oPlugin.$("PanelContent").addClass("sapUiSupportHidden");
			}
		});
	}

	/**
	 * Initialize support mode based on configuration
	 */
	Support.initializeSupportMode = function(aSettings) {
		if (aSettings.indexOf("true") > -1 || aSettings.indexOf("viewinfo") > -1) {
			Support.initializeSupportInfo();
		}
	};

	/**
	 * Initialize Support Info Store This is only done if getSupportMode on configuration is true or viewinfo.
	 */
	Support.initializeSupportInfo = function() {
		var aSupportInfos = [],
			aSupportInfosBreakpoints = [],
			aSupportXMLModifications = [],
			sDOMNodeAttribute = "support:data",
			sDOMNodeXMLNS = "support",
			sDOMNodeNamespaceURI = "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1",
			mSupportInfos = {};

		// store breakpoints to local storage
		function _storeBreakpoints() {
			if (window.localStorage) {
				window.localStorage.setItem("sap-ui-support.aSupportInfosBreakpoints/" + window.document.location.href, JSON.stringify(aSupportInfosBreakpoints));
			}
		}

		//store xml modification to local storage
		function _storeXMLModifications() {
			if (window.localStorage) {
				window.localStorage.setItem("sap-ui-support.aSupportXMLModifications/" + window.document.location.href, JSON.stringify(aSupportXMLModifications));
			}
		}

		//read the stored data from the last run to enable modifications and breakpoints
		if (window.localStorage) {
			var sValue = window.localStorage.getItem("sap-ui-support.aSupportInfosBreakpoints/" + window.document.location.href);
			if (sValue) {
				aSupportInfosBreakpoints = JSON.parse(sValue);
			}
			var sValue = window.localStorage.getItem("sap-ui-support.aSupportXMLModifications/" + window.document.location.href);
			if (sValue) {
				aSupportXMLModifications = JSON.parse(sValue);
			}
		}

		/**
		 * Adds the given info object to the support info stack
		 * @param {object} oInfo
		 *    oInfo.context : the context of the info, is not set the info is added to the last known context
		 *    oInfo.env : { any environmental information that is needed by toold to be interpreted }
		 * @experimental
		 * @private
		 */
		Support.info = function(oInfo) {
			oInfo._idx = aSupportInfos.length;
			if (oInfo._idx > 0 && !oInfo.context) {
				oInfo.context = aSupportInfos[aSupportInfos.length - 1].context;
			}
			if (!oInfo.context) {
				jQuery.sap.log.debug("Support Info does not have a context and is ignored");
				return oInfo;
			}
			if (oInfo.context && oInfo.context.ownerDocument && oInfo.context.nodeType === 1) {
				var sValue = oInfo._idx + "";
				if (!oInfo.context.hasAttributeNS(sDOMNodeNamespaceURI, "data")) {
					oInfo.context.setAttribute("xmlns:" + sDOMNodeXMLNS, sDOMNodeNamespaceURI);
				} else {
					sValue =  oInfo.context.getAttributeNS(sDOMNodeNamespaceURI, "data") + "," + sValue;
				}
				oInfo.context.setAttributeNS(sDOMNodeNamespaceURI, sDOMNodeAttribute, sValue);
			}
			aSupportInfos.push(oInfo);

			if (aSupportInfosBreakpoints.indexOf(oInfo._idx) > -1) {
				jQuery.sap.log.info(oInfo);
				jQuery.sap.log.info("To remove this breakpoint execute:","\nsap.ui.core.support.Support.info.removeBreakpointAt(" + oInfo._idx + ")");
				/*eslint-disable no-debugger */
				debugger;
				/*eslint-enable no-debugger */
				//step out of this function to debug this support context
			}
			return oInfo._idx;
		};

		/**
		 * Returns all support informations optionally filtered by a caller name
		 * @experimental
		 * @private
		 */
		Support.info.getAll = function(sCaller) {
			if (sCaller === undefined) {
				return aSupportInfos;
			} else {
				return aSupportInfos.filter(function(o) {
					return (o.env && o.env.caller === sCaller);
				});
			}
		};

		/**
		 * Returns the support info for all given indices
		 * @experimental
		 * @private
		 */
		Support.info.getInfos = function(aIndices) {
			if (aIndices && typeof aIndices === "string") {
				aIndices = aIndices.split(",");
			} else {
				aIndices = [];
			}
			var aResults = [];
			for (var i = 0; i < aIndices.length; i++) {
				if (aSupportInfos[aIndices[i]]) {
					aResults.push(aSupportInfos[aIndices[i]]);
				}
			}
			return aResults;
		};

		/**
		 * Returns the support info by index
		 * @param {int} the index of the info
		 * @experimental
		 * @private
		 */
		Support.info.byIndex = function(iIndex) {
			return aSupportInfos[iIndex];
		};

		/**
		 * Returns all current breakpoints
		 * @experimental
		 * @private
		 */
		Support.info.getAllBreakpoints = function() {
			return aSupportInfosBreakpoints;
		};

		/**
		 * Checks whether there is a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.hasBreakpointAt = function(iIndex) {
			return aSupportInfosBreakpoints.indexOf(iIndex) > -1;
		};

		/**
		 * Adds a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.addBreakpointAt = function(iIndex) {
			if (aSupportInfosBreakpoints.indexOf(iIndex) > -1) {
				return;
			}
			aSupportInfosBreakpoints.push(iIndex);
			_storeBreakpoints();
		};

		/**
		 * Removes a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.removeBreakpointAt = function(iIndex) {
			var iPos = aSupportInfosBreakpoints.indexOf(iIndex);
			if (iPos > -1) {
				aSupportInfosBreakpoints.splice(iPos,1);
				_storeBreakpoints();
			}
		};

		/**
		 * Removes all breakpoints
		 * @experimental
		 * @private
		 */
		Support.info.removeAllBreakpoints = function() {
			aSupportInfosBreakpoints = [];
			_storeBreakpoints();
		};

		/**
		 * Adds control related support data by id of a control
		 * This is used in the support tools to identify a control based on the support data gathered before a control tree was even created
		 * @experimental
		 * @private
		 */
		Support.info.addSupportInfo = function(sId, sSupportData) {
			if (sId && sSupportData) {
				if (mSupportInfos[sId]) {
					mSupportInfos[sId] += "," + sSupportData;
				} else {
					mSupportInfos[sId] = sSupportData;
				}
			}
		};

		/**
		 * Returns the support data for a given id.
		 * @experimental
		 * @private
		 */
		Support.info.byId = function(sId) {
			return mSupportInfos[sId] || null;
		};

		/**
		 * Returns the id for given support data
		 * This is used in the support tools to identify a control based on the support data gathered before a control tree was even created
		 * @experimental
		 * @private
		 */
		Support.info.getIds = function(sSupportData) {
			var aIds = [];
			for (var n in mSupportInfos) {
				var oData = mSupportInfos[n];
				if (oData && oData.indexOf(sSupportData) > -1) {
					aIds.push(n);
				}
			}
			return aIds;
		};

		/**
		 * Returns the list of elements that reported the given support data.
		 * @param {string} Comma seperated list of indices that should be looked up
		 * @returns {sap.ui.core.Element[]} list of elements
		 * @experimental
		 * @private
		 */
		Support.info.getElements = function(sSupportData) {
			var aControls = [];
			for (var n in mSupportInfos) {
				var oData = mSupportInfos[n];
				if (oData && oData.indexOf(sSupportData) === 0) {
					var oInstance = sap.ui.getCore().byId(n);
					if (oInstance) {
						aControls.push(sap.ui.getCore().byId(n));
					}
				}
			}
			return aControls;
		};

		/**
		 * Returns the list of all XML modifications.
		 * @returns {object[]} the list of modifications
		 * @experimental
		 * @private
		 */
		Support.info.getAllXMLModifications = function() {
			return aSupportXMLModifications;
		};

		/**
		 * Returns whether there are XML modifications.
		 * @returns {boolean} the list of modifications
		 * @experimental
		 * @private
		 */
		Support.info.hasXMLModifications = function() {
			return aSupportXMLModifications.length > 0;
		};

		/**
		 * Adds an XML modification to the stack of modifications.
		 * @param {string} sId the id of that is used to identify the change after a reaload
		 * @param {int} iIdx the index of node within the XML document (can be determined by root.querySelectorAll('*')
		 * @param {object} containing the change as {setAttribute: [attributeName,newValue]}
		 * @experimental
		 * @private
		 */
		Support.info.addXMLModification = function(sId, iIdx, oChange) {
			aSupportXMLModifications.push({
				id : sId,
				idx : iIdx,
				change : oChange
			});
			_storeXMLModifications();
		};

		/**
		 * Removes the XML modification with the given index.
		 * @experimental
		 * @private
		 */
		Support.info.removeXMLModification = function(iIdx) {
			var iPos = aSupportXMLModifications.indexOf(iIdx);
			if (iPos > -1) {
				aSupportXMLModifications.splice(iPos,1);
				_storeXMLModifications();
			}
		};

		/**
		 * Removes all XML modification.
		 * @experimental
		 * @private
		 */
		Support.info.removeAllXMLModification = function() {
			aSupportXMLModifications = [];
			_storeXMLModifications();
		};

		/**
		 * Modifies the XML where the id matches the id used when the modification was added
		 * @see Support.info.addXMLModification
		 * @experimental
		 * @private
		 */
		Support.info.modifyXML = function(sId, oXML) {
			if (!Support.info.hasXMLModifications()) {
				return;
			}
			var oNode = oXML;
			if (!oNode || !oNode.nodeType || !(oNode.nodeType == 1 || oNode.nodeType == 9)) {
				return;
			}
			if (oNode.nodeType === 9) {
				oNode = oNode.firstChild;
			}

			var aNodeList = oNode.querySelectorAll("*");
			var aNodes = [oNode];
			for (var i = 0; i < aNodeList.length; i++) {
				aNodes.push(aNodeList[i]);
			}
			for (var i = 0; i < aSupportXMLModifications.length; i++) {
				var oModification = aSupportXMLModifications[i],
					oChange = oModification.change;
				if (oModification.id === sId) {
					var oModificationNode = aNodes[oModification.idx];
					if (oModificationNode.nodeType === 1 && oChange.setAttribute) {
						var sOldValue = oModificationNode.getAttribute(oChange.setAttribute[0]);
						oModificationNode.setAttribute(oChange.setAttribute[0], oChange.setAttribute[1]);
						if (!oModificationNode._modified) {
							oModificationNode._modified = [];
						}
						oModificationNode._modified.push(oChange.setAttribute[0]);
						if (!oModificationNode._oldValues) {
							oModificationNode._oldValues = [];
						}
						oModificationNode._oldValues.push(sOldValue);
					}
				}
			}
		};

		Support.info._breakAtProperty = function(sKey) {
			return function (oEvent) {
				if (oEvent.getParameter("name") === sKey) {
					/*eslint-disable no-debugger */
					debugger;
					/*eslint-enable no-debugger */
					//step up to method setProperty who rased this event
				}
			};
		};

		Support.info._breakAtMethod = function(fn) {
			return function () {
				/*eslint-disable no-debugger */
				debugger;
				/*eslint-enable no-debugger */
				//step into next method fn.apply
				return fn.apply(this, arguments);
			};
		};

		jQuery.sap.require("sap.ui.core.mvc.View");
		sap.ui.core.mvc.View._supportInfo = sap.ui.core.support.Support.info;

		jQuery.sap.require("sap.ui.base.ManagedObject");
		sap.ui.base.ManagedObject._supportInfo = sap.ui.core.support.Support.info;

		jQuery.sap.require("sap.ui.core.XMLTemplateProcessor");
		sap.ui.core.XMLTemplateProcessor._supportInfo = sap.ui.core.support.Support.info;

		jQuery.sap.require("sap.ui.thirdparty.datajs");
		if (window.datajs) {
			window.datajs._sap = {
				_supportInfo:  sap.ui.core.support.Support.info
			};
		}

		jQuery.sap.log.info("sap.ui.core.support.Support.info initialized.");
	};

	return Support;

});
