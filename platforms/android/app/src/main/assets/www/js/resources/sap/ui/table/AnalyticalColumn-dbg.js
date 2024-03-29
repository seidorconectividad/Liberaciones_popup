/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.AnalyticalColumn.
sap.ui.define(['jquery.sap.global', './Column', './library', 'sap/ui/core/Element',
		'sap/ui/model/type/Boolean', 'sap/ui/model/type/DateTime', 'sap/ui/model/type/Float',
		'sap/ui/model/type/Integer', 'sap/ui/model/type/Time', './TableUtils', './AnalyticalColumnMenu'
	],
	function(jQuery, Column, library, Element, BooleanType, DateTime, Float, Integer, Time, TableUtils, AnalyticalColumnMenu) {
	"use strict";

	function isInstanceOfAnalyticalTable(oControl) {
		return TableUtils.isInstanceOf(oControl, "sap/ui/table/AnalyticalTable");
	}

	/**
	 * Constructor for a new AnalyticalColumn.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This column adds additional properties to the table column which are needed for the analytical binding and table
	 * @extends sap.ui.table.Column
	 *
	 * @author SAP SE
	 * @version 1.44.12
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.21.
	 * The AnalyticalColumn will be productized soon. Some attributes will be added to Column.
	 * @alias sap.ui.table.AnalyticalColumn
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalyticalColumn = Column.extend("sap.ui.table.AnalyticalColumn", /** @lends sap.ui.table.AnalyticalColumn.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Defines the primary model property which is used inside the Column. In case of the analytical extension this means the property which is grouped by for dimensions or the property which is summed for measures.
			 */
			leadingProperty : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If defined a sum for this column is calculated
			 */
			summed : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies that the dimension referred to by the column shall be included in the granularity of the data result. It allows a finer distinction between a visible/grouped/(included)inResult column.
			 */
			inResult : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies whether the column is displayed within the table even if it is grouped or not. A grouped column has the same value for every rows within the group.
			 */
			showIfGrouped : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If the column is grouped, this formatter is used to format the value in the group header
			 */
			groupHeaderFormatter : {type : "any", group : "Behavior", defaultValue : null}
		}
	}});

	AnalyticalColumn.prototype.init = function() {
		Column.prototype.init.apply(this, arguments);
		this._bSkipUpdateAI = false;
	};

	/**
	 * map of filtertypes for re-use in getFilterType
	 * @private
	 */
	AnalyticalColumn._DEFAULT_FILTERTYPES = {
		"Time": new Time({UTC: true}),
		"DateTime": new DateTime({UTC: true}),
		"Float": new Float(),
		"Integer": new Integer(),
		"Boolean": new Boolean()
	};

	/*
	 * Factory method. Creates the column menu.
	 *
	 * @return {sap.ui.table.AnalyticalColumnMenu} The created column menu.
	 */
	AnalyticalColumn.prototype._createMenu = function() {
		return new AnalyticalColumnMenu(this.getId() + "-menu");
	};

	AnalyticalColumn.prototype.setGrouped = function(bGrouped, bSuppressInvalidate) {
		var oParent = this.getParent();
		var that = this;
		if (isInstanceOfAnalyticalTable(oParent)) {
			if (bGrouped) {
				oParent._addGroupedColumn(this.getId());
			} else {
				oParent._aGroupedColumns = jQuery.grep(oParent._aGroupedColumns, function(value) {
					return value != that.getId();
				});
			}
		}

		var bReturn = this.setProperty("grouped", bGrouped, bSuppressInvalidate);
		this._updateColumns(true);
		return bReturn;
	};

	AnalyticalColumn.prototype.setSummed = function(bSummed) {
		var bReturn = this.setProperty("summed", bSummed, true);
		this._updateTableAnalyticalInfo();
		return bReturn;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalColumn.prototype.setVisible = function(bVisible, bSuppressInvalidate) {
		this.setProperty("visible", bVisible, bSuppressInvalidate);
		this._updateColumns();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalColumn.prototype.getLabel = function() {
		var oLabel = this.getAggregation("label");
		if (!oLabel) {
			if (!this._oBindingLabel) {
				var oParent = this.getParent();
				if (isInstanceOfAnalyticalTable(oParent)) {
					var oBinding = oParent.getBinding("rows");
					if (oBinding) {
						this._oBindingLabel = library.TableHelper.createLabel();
						var oModel = oBinding.getModel();
						// if the metadata of the underlying odatamodel is not yet loaded -> the setting of the text of the label must be delayed
						if (oModel.oMetadata && oModel.oMetadata.isLoaded()) {
							this._oBindingLabel.setText(oBinding.getPropertyLabel(this.getLeadingProperty()));
						} else {
							var that = this;
							oModel.attachMetadataLoaded(function () {
								that._oBindingLabel.setText(oBinding.getPropertyLabel(that.getLeadingProperty()));
							});
						}
					}
				}
			}
			oLabel = this._oBindingLabel;
		}
		return oLabel;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalColumn.prototype.getFilterProperty = function() {
		var sProperty = this.getProperty("filterProperty");
		if (!sProperty) {
			var oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				var oBinding = oParent.getBinding("rows");
				var sLeadingProperty = this.getLeadingProperty();
				if (oBinding && jQuery.inArray(sLeadingProperty, oBinding.getFilterablePropertyNames()) > -1) {
					sProperty = sLeadingProperty;
				}
			}
		}
		return sProperty;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalColumn.prototype.getSortProperty = function() {
		var sProperty = this.getProperty("sortProperty");
		if (!sProperty) {
			var oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				var oBinding = oParent.getBinding("rows");
				var sLeadingProperty = this.getLeadingProperty();
				if (oBinding && jQuery.inArray(sLeadingProperty, oBinding.getSortablePropertyNames()) > -1) {
					sProperty = sLeadingProperty;
				}
			}
		}
		return sProperty;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	AnalyticalColumn.prototype.getFilterType = function() {
		var vFilterType = this.getProperty("filterType");
		if (!vFilterType) {
			var oParent = this.getParent();
			if (isInstanceOfAnalyticalTable(oParent)) {
				var oBinding = oParent.getBinding("rows");
				var sLeadingProperty = this.getLeadingProperty(),
				    oProperty = oBinding && oBinding.getProperty(sLeadingProperty);
				if (oProperty) {
					switch (oProperty.type) {
						case "Edm.Time":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Time"];
							break;
						case "Edm.DateTime":
						case "Edm.DateTimeOffset":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["DateTime"];
							break;
						case "Edm.Single":
						case "Edm.Double":
						case "Edm.Decimal":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Float"];
							break;
						case "Edm.SByte":
						case "Edm.Int16":
						case "Edm.Int32":
						case "Edm.Int64":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Integer"];
							break;
						case "Edm.Boolean":
							vFilterType = AnalyticalColumn._DEFAULT_FILTERTYPES["Boolean"];
							break;
					}
				}
			}
		}
		return vFilterType;
	};

	AnalyticalColumn.prototype._afterSort = function() {
		this._updateTableAnalyticalInfo();
	};

	AnalyticalColumn.prototype._updateColumns = function(bSupressRefresh, bForceChange) {
		if (this._bSkipUpdateAI) {
			return;
		}

		var oParent = this.getParent();
		if (isInstanceOfAnalyticalTable(oParent)) {
			oParent._updateColumns(bSupressRefresh, bForceChange);
		}
	};

	AnalyticalColumn.prototype._updateTableAnalyticalInfo = function(bSupressRefresh) {
		if (this._bSkipUpdateAI) {
			return;
		}

		var oParent = this.getParent();
		if (oParent && isInstanceOfAnalyticalTable(oParent) && !oParent._bSuspendUpdateAnalyticalInfo) {
			oParent.updateAnalyticalInfo(bSupressRefresh);
		}
	};

	AnalyticalColumn.prototype._updateTableColumnDetails = function() {
		if (this._bSkipUpdateAI) {
			return;
		}

		var oParent = this.getParent();
		if (oParent && isInstanceOfAnalyticalTable(oParent) && !oParent._bSuspendUpdateAnalyticalInfo) {
			oParent._updateTableColumnDetails();
		}
	};

	AnalyticalColumn.prototype.shouldRender = function() {
		if (!this.getVisible()) {
			return false;
		}
		return (!this.getGrouped() || this._bLastGroupAndGrouped || this.getShowIfGrouped()) && (!this._bDependendGrouped || this._bLastGroupAndGrouped);
	};

	AnalyticalColumn.prototype.getTooltip_AsString = function() {
		var sTooltip = Element.prototype.getTooltip_AsString.apply(this);
		var oParent = this.getParent();
		if (!sTooltip && isInstanceOfAnalyticalTable(oParent)) {
			var oBinding = oParent.getBinding("rows");
			if (oBinding && this.getLeadingProperty()) {
				sTooltip = oBinding.getPropertyQuickInfo(this.getLeadingProperty());
			}
		}
		return sTooltip;
	};

	/**
	 * Checks whether or not the menu has items
	 * @return {Boolean} True if the menu has or could have items.
	 */
	AnalyticalColumn.prototype._menuHasItems = function() {
		var fnMenuHasItems = function() {
			var oTable = this.getParent();
			var oBinding = oTable.getBinding("rows");
			var oResultSet = oBinding && oBinding.getAnalyticalQueryResult();
			return  (oTable && oResultSet && oResultSet.findMeasureByPropertyName(this.getLeadingProperty())); // totals menu entry
		}.bind(this);

		return Column.prototype._menuHasItems.apply(this) || fnMenuHasItems();
	};

	/**
	 * This function checks whether a filter column menu item will be created. This function considers
	 * several column properties and evaluates metadata to determine whether filtering for a column is applicable.
	 * Since for the AnalyticalBinding metadata is very important to determine whether the column can be filtered it
	 * is required to have a binding. If there is no binding, this function will return false.
	 *
	 * For Analytical Columns the following applies:
	 * - filterProperty must be defined or it must be possible to derive it from the leadingProperty + filterable = true in the metadata
	 * - showFilterMenuEntry must be true (which is the default)
	 * - The filter property must be a property of the bound collection however it may differ from the leading property
	 * - With OData v1 and v2 the filter property must not be a measure
	 * - The analytical column must be a child of an AnalyticalTable
	 *
	 * @returns {boolean}
	 */
	AnalyticalColumn.prototype.isFilterableByMenu = function() {
		var sFilterProperty = this.getFilterProperty();
		if (!sFilterProperty || !this.getShowFilterMenuEntry()) {
			// not required to get binding and do addtional checks if there is no filterProperty set or derived
			// or if the filter menu entry shall not be displayed at all
			return false;
		}

		var oParent = this.getParent();
		if (isInstanceOfAnalyticalTable(oParent)) {
			var oBinding = oParent.getBinding("rows");
			// metadata must be evaluated which can only be done when the collection is known and the metadata is loaded
			// this is usually the case when a binding exists.
			if (oBinding) {
				// OData v2 does not allow to proper filter for measures
				if (jQuery.inArray(sFilterProperty, oBinding.getFilterablePropertyNames()) > -1 &&
					!oBinding.isMeasure(sFilterProperty) &&
					oBinding.getProperty(sFilterProperty)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * This function checks whether a grouping column menu item will be created.
	 *
	 * Since a property of the table must be checked, this function will return false when the column is not a child of a table.
	 *
	 * For Columns the following applies:
	 * - table must be bound
	 * - column must be child of an AnalyticalTable
	 * - metadata must be loaded
	 * - leadingProperty must be sortable
	 * - leadingProperty must be filterable
	 *
	 * @returns {boolean}
	 */
	AnalyticalColumn.prototype.isGroupableByMenu = function() {
		var oParent = this.getParent();
		if (isInstanceOfAnalyticalTable(oParent)) {
			var oBinding = oParent.getBinding("rows");
			if (oBinding) {
				var oResultSet = oBinding.getAnalyticalQueryResult();
				if (oResultSet && oResultSet.findDimensionByPropertyName(this.getLeadingProperty())
					&& jQuery.inArray(this.getLeadingProperty(), oBinding.getSortablePropertyNames()) > -1
					&& jQuery.inArray(this.getLeadingProperty(), oBinding.getFilterablePropertyNames()) > -1) {
					return true;
				}
			}
		}

		return false;
	};

	return AnalyticalColumn;

});
