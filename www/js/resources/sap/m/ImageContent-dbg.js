/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Image', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, Image, IconPool) {
	"use strict";

	/**
	 * Constructor for a new sap.m.ImageContent control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class This control can be displayed as image content in a tile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.12
	 * @since 1.38
	 *
	 * @public
	 * @alias sap.m.ImageContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ImageContent = Control.extend("sap.m.ImageContent", /** @lends sap.m.ImageContent.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {
				/**
				 * The image to be displayed as a graphical element within the imageContent. This can be an image or an icon from the icon font.
				 */
				"src" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
				/**
				 * Description of image. This text is used to provide ScreenReader information.
				 */
				"description" : {type : "string", group : "Accessibility", defaultValue : null}
			},
			defaultAggregation : "_content",
			aggregations : {
				/**
				 * The hidden aggregation for the image content.
				 */
				"_content" : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is fired when the user chooses the image content.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	ImageContent.prototype.onBeforeRendering = function() {
		var oImage, sUri, sDescription;
		oImage = this.getAggregation("_content");
		sUri = this.getSrc();
		sDescription = this.getDescription();

		if (!oImage || sUri !== oImage.getSrc() || sDescription !== oImage.getAlt()) {
			if (oImage) {
				oImage.destroy();
				oImage = null;
			}

			oImage = IconPool.createControlByURI({
				id : this.getId() + "-icon-image",
				src : sUri,
				alt : sDescription,
				decorative : false
			}, Image);
			this.setAggregation("_content", oImage, true);
			this._setPointerOnImage();
		}

		if (sDescription) {
			this.setTooltip(sDescription.trim());
		}
	};

	/**
	 * Sets CSS class 'sapMPointer' for the internal Icon if needed.
	 * @private
	 */
	ImageContent.prototype._setPointerOnImage = function() {
		var oImage = this.getAggregation("_content");
		if (oImage && this.hasListeners("press")) {
			oImage.addStyleClass("sapMPointer");
		} else if (oImage && oImage.hasStyleClass("sapMPointer")) {
			oImage.removeStyleClass("sapMPointer");
		}
	};

	/* --- Event Handling --- */
	/**
	 * Handler for user tap (click on desktop, tap on touch devices) event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	ImageContent.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	ImageContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	ImageContent.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
			this._setPointerOnImage();
		}
		return this;
	};

	ImageContent.prototype.detachEvent = function(eventId, functionToCall, listener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
			this._setPointerOnImage();
		}
		return this;
	};

	/**
	 * Returns the alternative text
	 *
	 * @returns {String} The alternative text
	 */
	ImageContent.prototype.getAltText = function () {
		var oContent = this.getAggregation("_content");
		if (oContent && oContent.getAlt() !== "") {
			return oContent.getAlt();
		} else if (oContent) {
			return oContent.getAccessibilityInfo().description;
		}
	};

	return ImageContent;
});