/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.tnt.NavigationList
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Popover', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/InvisibleText'],
	function(jQuery, library, Control, Popover, ItemNavigation, InvisibleText) {
		"use strict";

		/**
		 * Constructor for a new NavigationList.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NavigationList control is an interactive control, which provides a choice of
		 * different items, ordered as a list.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version 1.44.12
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.NavigationList
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NavigationList = Control.extend("sap.tnt.NavigationList", /** @lends sap.tnt.NavigationList.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {
					/**
					 * Specifies the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Specifies if the control is in expanded or collapsed mode.
					 */
					expanded: {type: "boolean", group: "Misc", defaultValue: true}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * The items displayed in the list.
					 */
					items: {type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item"}
				},
				associations : {
					/**
					 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

					/**
					 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
				},
				events: {
					/**
					 * Fired when an item is selected.
					 */
					itemSelect: {
						parameters: {
							/**
							 * The selected item.
							 */
							item: {type: "sap.ui.core.Item"}
						}
					}
				}
			}
		});

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		NavigationList.prototype.init = function () {
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);

			this._itemNavigation.setPageSize(10);

			this._resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");

			if (sap.ui.getCore().getConfiguration().getAccessibility() && !NavigationList._sAriaPopupLabelId) {
				NavigationList._sAriaPopupLabelId = new InvisibleText({
					text: '' // add empty string in order to prevent the redundant speech output
				}).toStatic().getId();
			}
		};

		/**
		 * Called after the control is rendered.
		 */
		NavigationList.prototype.onAfterRendering = function() {
			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(this._getDomRefs());

			if (this._selectedItem) {
				this._selectedItem._select();
			}
		};

		NavigationList.prototype._updateNavItems = function() {
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		/**
		 * Gets DOM references of the navigation items.
		 * @private
		 */
		NavigationList.prototype._getDomRefs = function() {
			var domRefs = [];

			var items = this.getItems();

			for (var i = 0; i < items.length; i++) {
				jQuery.merge(domRefs, items[i]._getDomRefs());
			}

			return domRefs;
		};

		/**
		 * Adapts popover position.
		 * @private
		 */
		NavigationList.prototype._adaptPopoverPositionParams = function () {
			if (this.getShowArrow()) {
				this._marginLeft = 10;
				this._marginRight = 10;
				this._marginBottom = 10;

				this._arrowOffset = 18;
				this._offsets = ["0 -18", "18 0", "0 18", "-18 0"];

				this._myPositions = ["center bottom", "begin top", "center top", "end top"];
				this._atPositions = ["center top", "end top", "center bottom", "begin top"];
			} else {
				this._marginTop = 0;
				this._marginLeft = 0;
				this._marginRight = 0;
				this._marginBottom = 0;

				this._arrowOffset = 0;
				this._offsets = ["0 0", "0 0", "0 0", "0 0"];

				this._myPositions = ["begin bottom", "begin top", "begin top", "end top"];
				this._atPositions = ["begin top", "end top", "begin bottom", "begin top"];
			}
		};

		/**
		 * Clears the control dependencies.
		 * @private
		 */
		NavigationList.prototype.exit = function () {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
			}
		};

		/**
		 * Selects an item.
		 * @private
		 */
		NavigationList.prototype._selectItem = function (params) {
			this.fireItemSelect(params);

			var item = params.item;

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			item._select();

			this._selectedItem = item;
		};

		/**
		 * Gets the currently selected item.
		 */
		NavigationList.prototype.getSelectedItem = function() {
			return this._selectedItem;
		};

		/**
		 * Sets the currently selected item. Set <code>null</code> to deselect.
		 */
		NavigationList.prototype.setSelectedItem = function(item) {

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			if (item) {
				item._select();
			}

			this._selectedItem = item;
		};

		/**
		 * Opens a popover.
		 * @private
		 */
		NavigationList.prototype._openPopover = function (source, list) {

			var that = this;
			var selectedItem = list.getSelectedItem();
			if (selectedItem && list.isGroupSelected) {
				selectedItem = null;
			}

			var popover = this._popover = new Popover({
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: true,
				initialFocus: selectedItem,
				afterClose: function () {
					that._popover = null;
				},
				content: list,
				ariaLabelledBy: [NavigationList._sAriaPopupLabelId]
			}).addStyleClass('sapContrast sapContrastPlus');

			popover._adaptPositionParams = this._adaptPopoverPositionParams;

			popover.openBy(source);
		};

		NavigationList.prototype._closePopover = function () {
			if (this._popover) {
				this._popover.close();
			}
		};

		return NavigationList;

	}, /* bExport= */ true);
