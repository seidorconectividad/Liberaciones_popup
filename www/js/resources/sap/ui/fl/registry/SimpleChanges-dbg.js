/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/changeHandler/HideControl", "sap/ui/fl/changeHandler/UnhideControl", "sap/ui/fl/changeHandler/StashControl", "sap/ui/fl/changeHandler/UnstashControl", "sap/ui/fl/changeHandler/MoveElements", "sap/ui/fl/changeHandler/MoveControls", "sap/ui/fl/changeHandler/PropertyChange", "sap/ui/fl/changeHandler/PropertyBindingChange"
], function(jQuery, HideControl, UnhideControl, StashControl, UnstashControl, MoveElements, MoveControls, PropertyChange, PropertyBindingChange) {
	"use strict";

	/**
	 * Object containing standard changes like labelChange. Structure is like this: <code> { "labelChange":{"changeType":"labelChange", "changeHandler":sap.ui.fl.changeHandler.LabelChange}} </code>
	 * @constructor
	 * @alias sap.ui.fl.registry.SimpleChanges
	 *
	 * @author SAP SE
	 * @version 1.44.12
	 * @experimental Since 1.27.0
	 *
	 */
	var SimpleChanges = {
		hideControl: {
			changeType: "hideControl",
			changeHandler: HideControl
		},
		unhideControl: {
			changeType: "unhideControl",
			changeHandler: UnhideControl
		},
		stashControl: {
			changeType: "stashControl",
			changeHandler: StashControl
		},
		unstashControl: {
			changeType: "unstashControl",
			changeHandler: UnstashControl
		},
		moveElements: {
			changeType: "moveElements",
			changeHandler: MoveElements
		},
		moveControls: {
			changeType: "moveControls",
			changeHandler: MoveControls
		},
		propertyChange : {
			changeType: "propertyChange",
			changeHandler: PropertyChange
		},
		propertyBindingChange : {
			changeType: "propertyBindingChange",
			changeHandler: PropertyBindingChange
		}
	};

	return SimpleChanges;

}, true);
