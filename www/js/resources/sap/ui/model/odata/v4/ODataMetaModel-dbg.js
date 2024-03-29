/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/PropertyBinding",
	"./_ODataHelper",
	"./lib/_SyncPromise"
], function (jQuery, BindingMode, ContextBinding, BaseContext, FilterProcessor, JSONListBinding,
		MetaModel, PropertyBinding, _ODataHelper, _SyncPromise) {
	"use strict";

	var DEBUG = jQuery.sap.log.Level.DEBUG,
		ODataMetaContextBinding,
		ODataMetaListBinding,
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		ODataMetaPropertyBinding,
		// rest of segment after opening ( and segments that consist only of digits
		rNotMetaContext = /\([^/]*|\/-?\d+/g,
		rNumber = /^-?\d+$/,
		mUi5TypeForEdmType = {
			"Edm.Boolean" : {type : "sap.ui.model.odata.type.Boolean"},
			"Edm.Byte" : {type : "sap.ui.model.odata.type.Byte"},
			"Edm.Date" : {type : "sap.ui.model.odata.type.Date"},
			"Edm.DateTimeOffset" : {
				constraints : {
					"$Precision" : "precision"
				},
				type : "sap.ui.model.odata.type.DateTimeOffset"
			},
			"Edm.Decimal" : {
				constraints : {
					"$Precision" : "precision",
					"$Scale" : "scale"
				},
				type : "sap.ui.model.odata.type.Decimal"
			},
			"Edm.Double" : {type : "sap.ui.model.odata.type.Double"},
			"Edm.Guid" : {type : "sap.ui.model.odata.type.Guid"},
			"Edm.Int16" : {type : "sap.ui.model.odata.type.Int16"},
			"Edm.Int32" : {type : "sap.ui.model.odata.type.Int32"},
			"Edm.Int64" : {type : "sap.ui.model.odata.type.Int64"},
			"Edm.SByte" : {type : "sap.ui.model.odata.type.SByte"},
			"Edm.Single" : {type : "sap.ui.model.odata.type.Single"},
			"Edm.String" : {
				constraints : {
					"@com.sap.vocabularies.Common.v1.IsDigitSequence" : "isDigitSequence",
					"$MaxLength" : "maxLength"
				},
				type : "sap.ui.model.odata.type.String"
			},
			"Edm.TimeOfDay" : {
				constraints : {
					"$Precision" : "precision"
				},
				type : "sap.ui.model.odata.type.TimeOfDay"
			}
		},
		mSupportedEvents = {
			messageChange : true
		},
		WARNING = jQuery.sap.log.Level.WARNING;

	/**
	 * @class Context binding implementation for the OData metadata model.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @private
	 */
	ODataMetaContextBinding
		= ContextBinding.extend("sap.ui.model.odata.v4.ODataMetaContextBinding", {
			constructor : function (oModel, sPath, oContext) {
				jQuery.sap.assert(!oContext || oContext.getModel() === oModel,
					"oContext must belong to this model");
				ContextBinding.call(this, oModel, sPath, oContext);
			},
			// @override
			// @see sap.ui.model.Binding#initialize
			initialize : function () {
				var oElementContext = this.oModel.createBindingContext(this.sPath, this.oContext);
				this.bInitial = false; // initialize() has been called
				if (oElementContext !== this.oElementContext) {
					this.oElementContext = oElementContext;
					this._fireChange();
				}
			},
			// @override
			// @see sap.ui.model.Binding#setContext
			setContext : function (oContext) {
				jQuery.sap.assert(!oContext || oContext.getModel() === this.oModel,
					"oContext must belong to this model");
				if (oContext !== this.oContext) {
					this.oContext = oContext;
					if (!this.bInitial) {
						this.initialize();
					} // else: do not cause implicit 1st initialize(), avoid _fireChange!
				}
			}
		});

	/**
	 * @class List binding implementation for the OData metadata model which supports filtering on
	 * the virtual property "@sapui.name" (which refers back to the name of the object in
	 * question).
	 *
	 * Example:
	 * <pre>
	 * &lt;template:repeat list="{path : 'entityType>', filters : {path : '@sapui.name', operator : 'StartsWith', value1 : 'com.sap.vocabularies.UI.v1.FieldGroup'}}" var="fieldGroup">
	 * </pre>
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 * @private
	 */
	ODataMetaListBinding = JSONListBinding.extend("sap.ui.model.odata.v4.ODataMetaListBinding", {
		// @override
		// @see sap.ui.model.ClientListBinding#applyFilter
		applyFilter : function () {
			var that = this;

			this.aIndices = FilterProcessor.apply(this.aIndices,
				this.aFilters.concat(this.aApplicationFilters), function (vRef, sPath) {
				return sPath === "@sapui.name"
					? vRef
					: that.oModel.getProperty(sPath, that.oList[vRef]);
			});
			this.iLength = this.aIndices.length;
		},
		constructor : function () {
			JSONListBinding.apply(this, arguments);
		},
		// @override
		// @see sap.ui.model.ListBinding#enableExtendedChangeDetection
		enableExtendedChangeDetection : function () {
			throw new Error("Unsupported operation");
		}
	});

	/**
	 * @class Property binding implementation for the OData metadata model.
	 *
	 * @extends sap.ui.model.PropertyBinding
	 * @private
	 */
	ODataMetaPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding", {
			constructor : function () {
				PropertyBinding.apply(this, arguments);
				this.vValue = this.oModel.getProperty(this.sPath, this.oContext, this.mParameters);
			},
			// @see sap.ui.model.PropertyBinding#getValue
			getValue : function () {
				return this.vValue;
			},
			// @see sap.ui.model.PropertyBinding#setValue
			setValue : function () {
				throw new Error("Unsupported operation: ODataMetaPropertyBinding#setValue");
			}
		});

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#getMetaModel} instead.
	 *
	 * @param {object} oRequestor
	 *   The metadata requestor
	 * @param {string} sUrl
	 *   The URL to the $metadata document of the service
	 * @param {string|string[]} [vAnnotationUri]
	 *   The URL (or an array of URLs) from which the annotation metadata are loaded
	 *   Supported since 1.41.0
	 *
	 * @alias sap.ui.model.odata.v4.ODataMetaModel
	 * @author SAP SE
	 * @class Implementation of an OData metadata model which offers access to OData V4 metadata.
	 *   The meta model does not support any public events; attaching an event handler leads to an
	 *   error.
	 *
	 *   This model is read-only.
	 *
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.37.0
	 * @version 1.44.12
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v4.ODataMetaModel", {
		/*
		 * @param {sap.ui.model.odata.v4.lib._MetadataRequestor} oRequestor
		 */
		constructor : function (oRequestor, sUrl, vAnnotationUri) {
			MetaModel.call(this);
			this.aAnnotationUris = vAnnotationUri && !Array.isArray(vAnnotationUri)
				? [vAnnotationUri] : vAnnotationUri;
			this.sDefaultBindingMode = BindingMode.OneTime;
			this.oMetadataPromise = null;
			this.oRequestor = oRequestor;
			this.mSupportedBindingModes = {"OneTime" : true};
			this.sUrl = sUrl;
		}
	});

	/**
	 * Returns the value of the object or property inside this model's metadata which can be
	 * reached, starting at the given context, by following the given path. The resulting value is
	 * suitable for a list binding, for example
	 * <code>&lt;template:repeat list="{context>path}" ...></code>.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   The value of the object or property or <code>null</code> in case a relative path without
	 *   a context is given
	 *
	 * @private
	 */
	ODataMetaModel.prototype._getObject = function (sPath, oContext) {
		var bIsCloned = false,
			bIterateAnnotations = sPath === "@"
				|| sPath === "" && oContext.getPath().slice(-2) === "/@"
				|| sPath.slice(-2) === "/@",
			sKey,
			sPathIntoObject,
			vResult;

		if (bIterateAnnotations || sPath === "/") {
			sPathIntoObject = sPath; // no trailing slash needed
		} else if (sPath) {
			sPathIntoObject = sPath + "/";
		} else {
			sPathIntoObject = "./";
		}
		vResult = this.getObject(sPathIntoObject, oContext);

		for (sKey in vResult) {
			// always filter technical properties; filter annotations iff. not iterating them
			if (sKey[0] === "$" || bIterateAnnotations === (sKey[0] !== "@")) {
				if (!bIsCloned) { // copy on write
					vResult = jQuery.extend({}, vResult);
					bIsCloned = true;
				}
				delete vResult[sKey];
			}
		}

		return vResult;
	};

	/**
	 * Merges the given metadata and <code>$Annotations</code> from schemas at the root element.
	 * The content of the first metadata object is modified and enriched with the content of the
	 * other metadata objects.
	 *
	 * @param {object[]} aMetadata
	 *   The metadata objects to be merged
	 * @returns {object}
	 *   The merged metadata
	 * @throws {Error}
	 *   If metadata cannot be merged
	 *
	 * @private
	 */
	ODataMetaModel.prototype._mergeMetadata = function (aMetadata) {
		var oResult = aMetadata[0],
			that = this;

		function moveAnnotations(oElement) {
			if (oElement.$kind === "Schema" && oElement.$Annotations) {
				Object.keys(oElement.$Annotations).forEach(function (sTerm) {
					if (!oResult.$Annotations[sTerm]) {
						oResult.$Annotations[sTerm] = oElement.$Annotations[sTerm];
					} else {
						jQuery.extend(oResult.$Annotations[sTerm],
							oElement.$Annotations[sTerm]);
					}
				});
				delete oElement.$Annotations;
			}
		}

		// shift $annotations from schema to root
		oResult.$Annotations = oResult.$Annotations || {};
		Object.keys(oResult).forEach(function (sElement) {
			moveAnnotations(oResult[sElement]);
		});

		// enrich metadata with annotations
		aMetadata.slice(1).forEach(function (oAnnotationMetadata, i) {
			Object.keys(oAnnotationMetadata).forEach(function (sKey) {
				var oElement = oAnnotationMetadata[sKey];

				if (oElement.$kind !== undefined
						|| Array.isArray(oElement) /*Actions or Functions*/) {
					if (oResult[sKey]) {
						throw new Error("Overwriting '" + sKey + "' with the value defined in '"
							+ that.aAnnotationUris[i] + "' is not supported");
					}
					oResult[sKey] = oElement;
					moveAnnotations(oElement);
				}
			});
		});
		return oResult;
	};

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataMetaModel.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataMetaModel#attachEvent");
		}
		return MetaModel.prototype.attachEvent.apply(this, arguments);
	};

	// @public
	// @see sap.ui.model.Model#bindContext
	// @since 1.37.0
	ODataMetaModel.prototype.bindContext = function (sPath, oContext) {
		return new ODataMetaContextBinding(this, sPath, oContext);
	};

	/**
	 * Creates a list binding for this metadata model which iterates content from the given path
	 * (relative to the given context), sorted and filtered as indicated.
	 *
	 * By default, OData names are iterated and a trailing slash is implicitly added to the path
	 * (see {@link #requestObject} for the effects this has); technical properties and inline
	 * annotations are filtered out.
	 *
	 * A path which ends with an "@" segment can be used to iterate all inline or external
	 * targeting annotations; no trailing slash is added implicitly; technical properties and OData
	 * names are filtered out.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model, for example "/EMPLOYEES"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters]
	 *   Initial sort order, see {@link sap.ui.model.ListBinding#sort}
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters]
	 *   Initial application filter(s), see {@link sap.ui.model.ListBinding#filter}
	 * @returns {sap.ui.model.ListBinding}
	 *   A list binding for this metadata model
	 *
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters);
	};

	/**
	 * Creates a property binding for this meta data model which refers to the content from the
	 * given path (relative to the given context).
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional binding parameters that are passed to {@link #getObject} to compute the binding's
	 *   value; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {sap.ui.model.PropertyBinding}
	 *   A property binding for this meta data model
	 *
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataMetaPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindTree = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#bindTree");
	};

	/**
	 * Returns a promise for an absolute data binding path of a "4.3.1 Canonical URL" for the given
	 * context.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   OData V4 context object for which the canonical path is requested; it must point to an
	 *   entity
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the canonical path (for example "/EMPLOYEES('1')") in
	 *   case of success, or rejected with an instance of <code>Error</code> in case of failure
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchCanonicalPath = function (oContext) {

		return this.fetchEntityContainer().then(function (mScope) {
			var sCandidate, // the encoded candidate for the canonical path in case it's composed
				oEntityContainer = mScope[mScope.$EntityContainer],
				sEntitySetName, // the current encoded entity set name (only valid if not contained)
				oEntitySet, // the current entity set of the instance (undefined if contained)
				oEntityType, // the current entity type
				iPredicateIndex,
				aSegments = oContext.getPath().split("/");

			/*
			 * Logs and throws an error.
			 * @param {string} sMessage The message
			 * @param {string} [sErrorPath] An optional path for error messages
			 */
			function error(sMessage, sErrorPath) {
				var sPath = oContext.getPath();

				if (sErrorPath && sErrorPath !== sPath) {
					sMessage = sMessage + " at " + sErrorPath;
				}
				jQuery.sap.log.error(sMessage, sPath, sODataMetaModel);
				throw new Error(sPath + ": " + sMessage);
			}

			/*
			 * Fetches the canonical path of the containing entity
			 * @param {number} iLength The path length
			 * @returns {SyncPromise} A promise on the canonical path
			 */
			function fetchCanonicalPathOfContainingEntity(iLength) {
				if (oEntitySet.$kind === "Singleton") {
					return _SyncPromise.resolve(sEntitySetName);
				}
				return fetchKeyPredicate(iLength).then(function (sKeyPredicate) {
					return sEntitySetName + sKeyPredicate;
				});
			}

			/*
			 * Fetches the key predicate for the absolute path from aSegments[0..iLength] using the
			 * context.
			 * @param {number} iLength The path length
			 * @returns {SyncPromise} a Promise on the key predicate for that path
			 */
			function fetchKeyPredicate(iLength) {
				var sSubPath = aSegments.slice(0, iLength).join("/");

				return oContext.fetchAbsoluteValue(sSubPath).then(function (oEntityInstance) {
					return keyPredicate(oEntityInstance, sSubPath);
				});
			}

			/*
			 * Calculates the key predicate using oEntityType and the given entity instance. Logs
			 * an error if calculating the key predicate failed.
			 * @param {object} oEntityInstance the entity instance
			 * @param {string} [sPath] An optional path for error messages
			 * @returns {string} the key predicate
			 */
			function keyPredicate(oEntityInstance, sPath) {
				try {
					return _ODataHelper.getKeyPredicate(oEntityType, oEntityInstance);
				} catch (e) {
					error(e.message, sPath);
				}
			}

			/*
			 * Recursively processes the segments with navigation properties.
			 * @param {number} i The segment to process next
			 * @returns {String|SyncPromise} The canonical path or a promise on it
			 */
			function processSegment(i) {
				var oNavigationProperty,
					sNavigationPropertyName,
					sSegment;

				// recursion end
				if (i === aSegments.length) {
					if (sCandidate) {
						return "/" + sCandidate;
					}
					if (oEntitySet.$kind === "Singleton") {
						return "/" + sEntitySetName;
					}
					return oContext.fetchValue("").then(function (oEntityInstance) {
						return "/" + sEntitySetName + keyPredicate(oEntityInstance);
					});
				}

				sSegment = aSegments[i];
				if (rNumber.test(sSegment)) {
					// an index: if there is no entity set, it is a path to a contained entity;
					// add the contained entity's key predicate
					if (!oEntitySet) {
						return fetchKeyPredicate(i + 1).then(function (sKeyPredicate) {
							sCandidate += sKeyPredicate;
							return processSegment(i + 1);
						});
					}
					// ignore the index otherwise
					return processSegment(i + 1);
				}
				iPredicateIndex = sSegment.indexOf("(");
				sNavigationPropertyName = decodeURIComponent(
					iPredicateIndex > 0 ? sSegment.slice(0, iPredicateIndex) : sSegment
				);
				oNavigationProperty = oEntityType[sNavigationPropertyName];
				if (!oNavigationProperty || oNavigationProperty.$kind !== "NavigationProperty") {
					error("Not a navigation property: " + sNavigationPropertyName);
				}
				if (!oEntitySet || (sCandidate && oNavigationProperty.$ContainsTarget)) {
					// We're already processing contained entities or we start it and already have
					// a candidate: simply append the segment
					sCandidate += "/" + sSegment;
					oEntityType = mScope[oNavigationProperty.$Type];
					oEntitySet = undefined;
					return processSegment(i + 1);
				}
				if (oNavigationProperty.$ContainsTarget) {
					// a navigation property containing the target: calculate the canonical path of
					// the containing entity, append the navigation property and remember it as
					// candidate
					return fetchCanonicalPathOfContainingEntity(i).then(function (sPath) {
						sCandidate = sPath + "/" + sSegment;
						oEntitySet = undefined;
						oEntityType = mScope[oNavigationProperty.$Type];
						return processSegment(i + 1);
					});
				}
				// a navigation to an entity set
				sEntitySetName = oEntitySet.$NavigationPropertyBinding[sNavigationPropertyName];
				// remember the target's set name, set and type
				oEntitySet = oEntityContainer[sEntitySetName];
				oEntityType = mScope[oNavigationProperty.$Type];
				sEntitySetName = encodeURIComponent(sEntitySetName);
				// We have a candidate exactly if there is a predicate
				sCandidate = iPredicateIndex > 0
					? sEntitySetName + sSegment.slice(iPredicateIndex)
					: undefined;
				return processSegment(i + 1);
			}

			// Here we start: aSegments[0] is empty, aSegments[1] is an entity set or an entity
			// instance (with key predicate), the other segments are navigation properties (poss.
			// with key predicate) or indexes
			iPredicateIndex = aSegments[1].indexOf("(");
			if (iPredicateIndex > 0) {
				sCandidate = aSegments[1];
				sEntitySetName = sCandidate.slice(0, iPredicateIndex);
			} else {
				sEntitySetName = aSegments[1];
			}
			oEntitySet = oEntityContainer[decodeURIComponent(sEntitySetName)];
			oEntityType = mScope[oEntitySet.$Type];

			// now iterate over the navigation segments
			return processSegment(2);
		});
	};

	/**
	 * Requests the single entity container for this metadata model's service by reading the
	 * $metadata document via the metadata requestor. The resulting $metadata JSON object is a map
	 * of qualified names to their corresponding metadata, with the special key "$EntityContainer"
	 * mapped to the entity container's qualified name as a starting point.
	 *
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the $metadata JSON object as soon as the entity container
	 *   is fully available, or rejected with an error.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchEntityContainer = function () {
		var aPromises,
			that = this;

		if (!this.oMetadataPromise) {
			aPromises = [_SyncPromise.resolve(this.oRequestor.read(this.sUrl))];

			if (this.aAnnotationUris) {
				this.aAnnotationUris.forEach(function (sAnnotationUri) {
					aPromises.push(_SyncPromise.resolve(that.oRequestor.read(sAnnotationUri,
						true)));
				});
			}
			this.oMetadataPromise = _SyncPromise.all(aPromises).then(function (aMetadata) {
				return that._mergeMetadata(aMetadata);
			});
		}
		return this.oMetadataPromise;
	};

	/**
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the requested metadata object as soon as it is available
	 *
	 * @private
	 * @see #requestObject
	 */
	ODataMetaModel.prototype.fetchObject = function (sPath, oContext, mParameters) {
		var sResolvedPath = this.resolve(sPath, oContext),
			that = this;

		if (!sResolvedPath) {
			jQuery.sap.log.error("Invalid relative path w/o context", sPath, sODataMetaModel);
			return _SyncPromise.resolve(null);
		}

		return this.fetchEntityContainer().then(function (mScope) {
			var vLocation, // {string[]|string} location of indirection
				sName, // what "@sapui.name" refers to: OData or annotation name
				bODataMode = true, // OData navigation mode with scope lookup etc.
				// parent for next "17.2 SimpleIdentifier"...
				// (normally the schema child containing the current object)
				oSchemaChild, // ...as object
				sSchemaChildName, // ...as qualified name
				// annotation target pointing to current object, or undefined
				// (schema child's qualified name plus optional segments)
				sTarget,
				vResult = mScope; // current object

			/*
			 * Calls a computed annotation according to the given segment which was found at the
			 * given path; changes <code>vResult</code> accordingly.
			 *
			 * @param {string} sSegment
			 *   Contains the name of the computed annotation as "@@..."
			 * @param {string} sPath
			 *   Path where the segment was found
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function computedAnnotation(sSegment, sPath) {
				var fnAnnotation,
					iThirdAt = sSegment.indexOf("@", 2);

				if (iThirdAt > -1) {
					return log(WARNING, "Unsupported path after ", sSegment.slice(0, iThirdAt));
				}

				sSegment = sSegment.slice(2);
				fnAnnotation = sSegment[0] === "."
					? jQuery.sap.getObject(sSegment.slice(1), undefined, mParameters.scope)
					: jQuery.sap.getObject(sSegment);
				if (typeof fnAnnotation !== "function") {
					// Note: "varargs" syntax does not help because Array#join ignores undefined
					return log(WARNING, sSegment, " is not a function but: " + fnAnnotation);
				}

				try {
					vResult = fnAnnotation(vResult, {
						context : new BaseContext(that, sPath),
						schemaChildName : sSchemaChildName
					});
				} catch (e) {
					log(WARNING, "Error calling ", sSegment, ": ", e);
				}

				return false;
			}

			/*
			 * Outputs a log message for the given level. Leads to an <code>undefined</code> result.
			 *
			 * @param {jQuery.sap.log.Level} iLevel
			 *   A log level, either DEBUG or WARNING
			 * @param {...string} aTexts
			 *   The main text of the message is constructed from the rest of the arguments by
			 *   joining them
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function log(iLevel) {
				var sLocation;

				if (jQuery.sap.log.isLoggable(iLevel, sODataMetaModel)) {
					sLocation = Array.isArray(vLocation)
						? vLocation.join("/")
						: vLocation;
					jQuery.sap.log[iLevel === DEBUG ? "debug" : "warning"](
						Array.prototype.slice.call(arguments, 1).join("")
						+ (sLocation ? " at /" + sLocation : ""),
						sResolvedPath, sODataMetaModel);
				}
				vResult = undefined;
				return false;
			}

			/*
			 * Looks up the given qualified name in the global scope.
			 *
			 * @param {string} sQualifiedName
			 *   A qualified name
			 * @param {string} [sPropertyName]
			 *   Where the qualified name was found
			 * @returns {boolean}
			 *   Whether to continue after scope lookup
			 */
			function scopeLookup(sQualifiedName, sPropertyName) {
				if (!(sQualifiedName in mScope)) {
					vLocation = vLocation || sTarget && sTarget + "/" + sPropertyName;
					return log(WARNING, "Unknown qualified name '", sQualifiedName, "'");
				}
				sTarget = sName = sSchemaChildName = sQualifiedName;
				vResult = oSchemaChild = mScope[sSchemaChildName];
				return true;
			}

			/*
			 * Takes one step according to the given segment, starting at the current
			 * <code>vResult</code> and changing that.
			 *
			 * @param {string} sSegment
			 *   Current segment
			 * @param {number} i
			 *   Current segment's index
			 * @param {string[]} aSegments
			 *   All segments
			 * @returns {boolean}
			 *   Whether to continue after this step
			 */
			function step(sSegment, i, aSegments) {
				var iIndexOfAt,
					sSchemaName,
					bSplitSegment;

				if (sSegment === "$Annotations") {
					return log(WARNING, "Invalid segment: $Annotations");
				}

				if (vResult !== mScope && typeof vResult === "object" && sSegment in vResult) {
					// fast path for pure "JSON" drill-down, but this cannot replace scopeLookup()!
					if (sSegment[0] === "$" || rNumber.test(sSegment)) {
						bODataMode = false; // technical property, switch to pure "JSON" drill-down
					}
				} else {
					if (sSegment.length > 11 && sSegment.slice(-11) === "@sapui.name") {
						// split trailing @sapui.name first
						iIndexOfAt = sSegment.length - 11;
					} else {
						iIndexOfAt = sSegment.indexOf("@");
					}
					if (iIndexOfAt > 0) {
						// <17.2 SimpleIdentifier|17.3 QualifiedName>@<annotation[@annotation]>
						// Note: only the 1st annotation may use external targeting, the rest is
						// pure "JSON" drill-down (except for "@sapui.name")!
						if (!step(sSegment.slice(0, iIndexOfAt), i, aSegments)) {
							return false;
						}
						sSegment = sSegment.slice(iIndexOfAt);
						bSplitSegment = true;
					}

					if (typeof vResult === "string"
						&& !(bSplitSegment && sSegment[0] === "@"
							&& (sSegment === "@sapui.name" || sSegment[1] === "@"))
						// indirection: treat string content as a meta model path unless followed by
						// a computed annotation
						&& !steps(vResult, aSegments.slice(0, i))) {
						return false;
					}

					if (bODataMode) {
						if (sSegment[0] === "$" || rNumber.test(sSegment)) {
							// technical property, switch to pure "JSON" drill-down
							bODataMode = false;
						} else if (!bSplitSegment) {
							if (sSegment[0] !== "@" && sSegment.indexOf(".") > 0) {
								// "17.3 QualifiedName": scope lookup
								return scopeLookup(sSegment);
							} else if (vResult && "$Type" in vResult) {
								// implicit $Type insertion, e.g. at (navigation) property
								if (!scopeLookup(vResult.$Type, "$Type")) {
									return false;
								}
							} else if (vResult && "$Action" in vResult) {
								// implicit $Action insertion at action import
								if (!scopeLookup(vResult.$Action, "$Action")) {
									return false;
								}
							} else if (vResult && "$Function" in vResult) {
								// implicit $Function insertion at function import
								if (!scopeLookup(vResult.$Function, "$Function")) {
									return false;
								}
							} else if (i === 0) {
								// "17.2 SimpleIdentifier" (or placeholder):
								// lookup inside schema child (which is determined lazily)
								sTarget = sName = sSchemaChildName
									= sSchemaChildName || mScope.$EntityContainer;
								vResult = oSchemaChild = oSchemaChild || mScope[sSchemaChildName];
								if (sSegment && sSegment[0] !== "@"
									&& !(sSegment in oSchemaChild)) {
									return log(WARNING, "Unknown child '", sSegment,
										"' of '", sSchemaChildName, "'");
								}
							}
							if (Array.isArray(vResult)) { // overloads of Action or Function
								if (vResult.length !== 1) {
									return log(WARNING, "Unsupported overloads");
								}
								vResult = vResult[0].$ReturnType;
								sTarget = sTarget + "/0/$ReturnType";
								if (vResult) {
									if (sSegment === "value"
										&& !(mScope[vResult.$Type] && mScope[vResult.$Type].value)) {
										// symbolic name "value" points to primitive return type
										sName = undefined; // block "@sapui.name"
										return true;
									}
									if (!scopeLookup(vResult.$Type, "$Type")) {
										return false;
									}
								}
							}
						}
					}

					// Note: trailing slash is useful to force implicit lookup or $Type insertion
					if (!sSegment) { // empty segment is at end or else...
						return i + 1 >= aSegments.length || log(WARNING, "Invalid empty segment");
					}
					if (sSegment[0] === "@") {
						if (sSegment === "@sapui.name") {
							vResult = sName;
							if (vResult === undefined) {
								log(WARNING, "Unsupported path before @sapui.name");
							} else if (i + 1 < aSegments.length) {
								log(WARNING, "Unsupported path after @sapui.name");
							}
							return false;
						}
						if (sSegment[1] === "@") {
							// computed annotation
							if (i + 1 < aSegments.length) {
								return log(WARNING, "Unsupported path after ", sSegment);
							}
							return computedAnnotation(sSegment, "/"
								+ aSegments.slice(0, i).join("/") + "/"
								+ aSegments[i].slice(0, iIndexOfAt));
						}
					}
					if (!vResult || typeof vResult !== "object") {
						// Note: even an OData path cannot continue here (e.g. by type cast)
						return log(DEBUG, "Invalid segment: ", sSegment);
					}
					if (bODataMode && sSegment[0] === "@") {
						// annotation(s) via external targeting
						// Note: inline annotations can only be reached via pure "JSON" drill-down,
						//       e.g. ".../$ReturnType/@..."
						sSchemaName
							= sSchemaChildName.slice(0, sSchemaChildName.lastIndexOf(".") + 1);
						vResult = sSchemaName === sSchemaChildName
							? oSchemaChild // annotations at schema are inline
							: (mScope.$Annotations || {})[sTarget] || {};
						bODataMode = false; // switch to pure "JSON" drill-down
					}
				}

				if (sSegment !== "@") {
					sName = bODataMode || sSegment[0] === "@" ? sSegment : undefined;
					sTarget = bODataMode ? sTarget + "/" + sSegment : undefined;
					vResult = vResult[sSegment];
				}
				return true;
			}

			/*
			 * Takes multiple steps according to the given relative path, starting at the global
			 * scope and changing <code>vResult</code>.
			 *
			 * @param {string} sRelativePath
			 *   Some relative path (semantically, it is absolute as we start at the global scope,
			 *   but it does not begin with a slash!)
			 * @param {string[]} [vNewLocation]
			 *   List of segments up to the point where the relative path has been found (in case
			 *   of indirection)
			 * @returns {boolean}
			 *   Whether to continue after all steps
			 */
			function steps(sRelativePath, vNewLocation) {
				var bContinue;

				if (vLocation) {
					return log(WARNING, "Invalid recursion");
				}
				vLocation = vNewLocation;

				bODataMode = true;
				vResult = mScope;
				bContinue = sRelativePath.split("/").every(step);

				vLocation = undefined;
				return bContinue;
			}

			steps(sResolvedPath.slice(1));

			return vResult;
		});
	};

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {SyncPromise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   {@link sap.ui.model.odata.type} or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 *
	 * @private
	 * @see #requestUI5Type
	 */
	ODataMetaModel.prototype.fetchUI5Type = function (sPath) {
		var oMetaContext = this.getMetaContext(sPath),
			that = this;

		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, oMetaContext).then(function (oProperty) {
			var mConstraints,
				sName,
				oType = oProperty["$ui5.type"],
				oTypeInfo,
				sTypeName = "sap.ui.model.odata.type.Raw";

			function setConstraint(sKey, vValue) {
				if (vValue !== undefined) {
					mConstraints = mConstraints || {};
					mConstraints[sKey] = vValue;
				}
			}

			if (oType) {
				return oType;
			}

			if (oProperty.$isCollection) {
				jQuery.sap.log.warning("Unsupported collection type, using " + sTypeName,
					sPath, sODataMetaModel);
			} else {
				oTypeInfo = mUi5TypeForEdmType[oProperty.$Type];
				if (oTypeInfo) {
					sTypeName = oTypeInfo.type;
					for (sName in oTypeInfo.constraints) {
						setConstraint(oTypeInfo.constraints[sName], sName[0] === "@"
							? that.getObject(sName, oMetaContext)
							: oProperty[sName]);
					}
					if (oProperty.$Nullable === false) {
						setConstraint("nullable", false);
					}
				} else {
					jQuery.sap.log.warning("Unsupported type '" + oProperty.$Type + "', using "
						+ sTypeName, sPath, sODataMetaModel);
				}
			}

			oType = new (jQuery.sap.getObject(sTypeName, 0))(undefined, mConstraints);
			oProperty["$ui5.type"] = oType;

			return oType;
		});
	};

	/**
	 * Returns the OData metadata model context corresponding to the given OData data model path.
	 *
	 * @param {string} sPath
	 *   An absolute data path within the OData data model, for example
	 *   "/EMPLOYEES/0/ENTRYDATE"
	 * @returns {sap.ui.model.Context}
	 *   The corresponding metadata context within the OData metadata model, for example with
	 *   metadata path "/EMPLOYEES/ENTRYDATE"
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		return new BaseContext(this, sPath.replace(rNotMetaContext, ""));
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getOriginalProperty
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.getOriginalProperty = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#getOriginalProperty");
	};

	/**
	 * Returns the metadata object for the given path relative to the given context. Returns
	 * <code>undefined</code> in case the metadata is not (yet) available. Use
	 * {@link #requestObject} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {any}
	 *   The requested metadata object if it is already available, or <code>undefined</code>
	 *
	 * @function
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#getObject
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.getObject = _SyncPromise.createGetMethod("fetchObject");

	/**
	 * @deprecated Use {@link #getObject}.
	 * @function
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getProperty = ODataMetaModel.prototype.getObject;

	/**
	 * Returns the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #requestUI5Type} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.model.odata.type.ODataType}
	 *   The corresponding UI5 type from {@link sap.ui.model.odata.type}, if all required
	 *   metadata to calculate this type is already available; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 * @throws {Error}
	 *   If the UI5 type cannot be determined synchronously (due to a pending metadata request) or
	 *   cannot be determined at all (due to a wrong data path)
	 *
	 * @function
	 * @public
	 * @see #requestUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getUI5Type = _SyncPromise.createGetMethod("fetchUI5Type", true);

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#isList
	 */
	ODataMetaModel.prototype.isList = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#isList");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#refresh");
	};

	/**
	 * Requests the metadata value for the given path relative to the given context. Returns a
	 * <code>Promise</code> which is resolved with the requested metadata value or rejected with
	 * an error (only in case metadata cannot be loaded). An invalid path leads to an
	 * <code>undefined</code> result and a warning is logged. Use {@link #getObject} for
	 * synchronous access.
	 *
	 * A relative path is appended to the context's path separated by a forward slash("/").
	 * A relative path starting with "@" (that is, an annotation) is appended without a separator.
	 * Use "./" as a prefix for such a relative path to enforce a separator.
	 *
	 * Example:
	 * <pre>
	 * &lt;template:with path="/EMPLOYEES/ENTRYDATE" var="property">
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE/$Type -->
	 *   "{property>$Type}"
	 *
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE@com.sap.vocabularies.Common.v1.Text -->
	 *   "{property>@com.sap.vocabularies.Common.v1.Text}"
	 *
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE/@com.sap.vocabularies.Common.v1.Text -->
	 *   "{property>./@com.sap.vocabularies.Common.v1.Text}"
	 * &lt;/template:with>
	 * </pre>
	 *
	 * The basic idea is that every path described in "14.2.1 Attribute Target" in specification
	 * "OData Version 4.0 Part 3: Common Schema Definition Language" is a valid absolute path
	 * within the metadata model if a leading slash is added; for example
	 * "/" + "MySchema.MyEntityContainer/MyEntitySet/MyComplexProperty/MyNavigationProperty". Also,
	 * every path described in "14.5.2 Expression edm:AnnotationPath",
	 * "14.5.11 Expression edm:NavigationPropertyPath", "14.5.12 Expression edm:Path", and
	 * "14.5.13 Expression edm:PropertyPath" is a valid relative path within the metadata model
	 * if a suitable prefix is added which addresses an entity container, entity set, singleton,
	 * complex type, entity type, or property; for example
	 * "/MySchema.MyEntityType/MyProperty" + "@vCard.Address#work/FullName".
	 *
	 * The absolute path is split into segments and followed step-by-step, starting at the global
	 * scope of all known qualified OData names. There are two technical properties there:
	 * "$Version" (typically "4.0") and "$EntityContainer" with the name of the single entity
	 * container for this metadata model's service.
	 *
	 * An empty segment in between is invalid. An empty segment at the end caused by a trailing
	 * slash differentiates between a name and the object it refers to. This way,
	 * "/$EntityContainer" refers to the name of the single entity container and
	 * "/$EntityContainer/" refers to the single entity container as an object.
	 *
	 * The segment "@sapui.name" refers back to the last OData name (simple identifier or qualified
	 * name) or annotation name encountered during path traversal immediately before "@sapui.name":
	 * <ul>
	 * <li> "/EMPLOYEES@sapui.name" results in "EMPLOYEES" and "/EMPLOYEES/@sapui.name"
	 * results in the same as "/EMPLOYEES/$Type", that is, the qualified name of the entity set's
	 * type (see below how "$Type" is inserted implicitly). Note how the separating slash again
	 * makes a difference here.
	 * <li> "/EMPLOYEES/@com.sap.vocabularies.Common.v1.Label@sapui.name" results in
	 * "@com.sap.vocabularies.Common.v1.Label" and a slash does not make any difference as long as
	 * the annotation does not have a "$Type" property.
	 * <li> A technical property (that is, a numerical segment or one starting with a "$")
	 * immediately before "@sapui.name" is invalid, for example "/$EntityContainer@sapui.name".
	 * </ul>
	 * The path must not continue after "@sapui.name".
	 *
	 * If the current object is a string value, that string value is treated as a relative path and
	 * followed step-by-step before the next segment is processed. Except for this, a path must
	 * not continue if it comes across a non-object value. Such a string value can be a qualified
	 * name (example path "/$EntityContainer/..."), a simple identifier (example path
	 * "/TEAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/...") or even a path according to
	 * "14.5.12 Expression edm:Path" etc. (example path
	 * "/TEAMS/$Type/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path/...").
	 *
	 * Segments starting with an "@" character, for example "@com.sap.vocabularies.Common.v1.Label",
	 * address annotations at the current object. As the first segment, they refer to the single
	 * entity container. For objects which can only be annotated inline (see "14.3 Element
	 * edm:Annotation" minus "14.2.1 Attribute Target"), the object already contains the
	 * annotations as a property. For objects which can (only or also) be annotated via external
	 * targeting, the object does not contain any annotation as a property. Such annotations MUST
	 * be accessed via a path. BEWARE of a special case: Actions, functions and their parameters
	 * can be annotated inline for a single overload or via external targeting for all overloads at
	 * the same time. In this case, the object contains all annotations for the single overload as
	 * a property, but annotations MUST nevertheless be accessed via a path in order to include
	 * also annotations for all overloads at the same time.
	 *
	 * Segments starting with an OData name followed by an "@" character, for example
	 * "/TEAMS@Org.OData.Capabilities.V1.TopSupported", address annotations at an entity set,
	 * singleton, or property, not at the corresponding type. In contrast,
	 * "/TEAMS/@com.sap.vocabularies.Common.v1.Deletable" (note the separating slash) addresses an
	 * annotation at the entity set's type. This is in line with the special rule of
	 * "14.5.12 Expression edm:Path" regarding annotations at a navigation property itself.
	 *
	 * "@" can be used as a segment to address a map of all annotations of the current object. This
	 * is useful for iteration, for example via
	 * <code>&lt;template:repeat list="{entityType>@}" ...></code>.
	 *
	 * Annotations of an annotation are addressed not by two separate segments, but by a single
	 * segment like
	 * "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.Common.v1.TextArrangement". Each
	 * annotation can have a qualifier, for example "@first#foo@second#bar". Note: If the first
	 * annotation's value is a record, a separate segment addresses an annotation of that record,
	 * not an annotation of the first annotation itself.
	 * In a similar way, annotations of "7.2 Element edm:ReferentialConstraint",
	 * "7.3 Element edm:OnDelete", "10.2 Element edm:Member" and
	 * "14.5.14.2 Element edm:PropertyValue" are addressed by segments like
	 * "&lt;7.2.1 Attribute Property>@...", "$OnDelete@...", "&lt;10.2.1 Attribute Name>@..." and
	 * "&lt;14.5.14.2.1 Attribute Property>@..." (where angle brackets denote a variable part and
	 * sections refer to specification "OData Version 4.0 Part 3: Common Schema Definition
	 * Language").
	 *
	 * Annotations starting with "@@", for example
	 * "@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple" or "@@.AH.isMultiple" or
	 * "@@.isMultiple", represent computed annotations. Their name without the "@@" prefix must
	 * refer to a function either in the global namespace (in case of an absolute name) or in
	 * <code>mParameters.scope</code> (in case of a relative name starting with a dot, which is
	 * stripped before lookup; see the <code>&lt;template:alias></code> instruction for XML
	 * Templating). This function is called with the current object (or primitive value) and
	 * additional details and returns the result of this {@link #requestObject} call. The additional
	 * details are given as an object with the following properties:
	 * <ul>
	 * <li><code>{@link sap.ui.model.Context} context</code> Points to the current object
	 * <li><code>{string} schemaChildName</code> The qualified name of the schema child where the
	 *   computed annotation has been found
	 * </ul>
	 * Computed annotations cannot be iterated by "@". The path must not continue after a computed
	 * annotation.
	 *
	 * A segment which represents an OData qualified name is looked up in the global scope ("scope
	 * lookup") and thus determines a schema child which is used later on. Unknown qualified names
	 * are invalid. This way, "/acme.DefaultContainer/EMPLOYEES" addresses the "EMPLOYEES" child of
	 * the schema child named "acme.DefaultContainer". This also works indirectly
	 * ("/$EntityContainer/EMPLOYEES") and implicitly ("/EMPLOYEES", see below).
	 *
	 * A segment which represents an OData simple identifier needs special preparations. The same
	 * applies to the empty segment after a trailing slash.
	 * <ol>
	 * <li> If the current object has a "$Action", "$Function" or "$Type" property, it is used for
	 *    scope lookup first. This way, "/EMPLOYEES/ENTRYDATE" addresses the same object as
	 *    "/EMPLOYEES/$Type/ENTRYDATE", namely the "ENTRYDATE" child of the entity type
	 *    corresponding to the "EMPLOYEES" child of the entity container. The other cases jump from
	 *    an action or function import to the corresponding action or function overloads.
	 * <li> Else if the segment is the first one within its path, the last schema child addressed
	 *    via scope lookup is used instead of the current object. This can only happen indirectly as
	 *    in "/TEAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/..." where the schema child is the
	 *    entity container and the navigation property binding can contain the simple identifier of
	 *    another entity set within the same container.
	 *
	 *    If the segment is the first one overall, "$EntityContainer" is inserted into the path
	 *    implicitly. In other words, the entity container is used as the initial schema child.
	 *    This way, "/EMPLOYEES" addresses the same object as "/$EntityContainer/EMPLOYEES", namely
	 *    the "EMPLOYEES" child of the entity container.
	 * <li> Afterwards, if the current object is an array, it represents overloads for an action or
	 *    function. Multiple overloads are invalid. The overload's "$ReturnType/$Type" is used for
	 *    scope lookup. This way, "/GetOldestWorker/AGE" addresses the same object as
	 *    "/GetOldestWorker/0/$ReturnType/$Type/AGE". For primitive return types, the special
	 *    segment "value" can be used to refer to the return type itself (see
	 *    {@link sap.ui.model.odata.v4.ODataContextBinding#execute}). This way,
	 *    "/GetOldestAge/value" addresses the same object as "/GetOldestAge/0/$ReturnType" (which
	 *    is needed for automatic type determination, see {@link #requestUI5Type}).
	 * </ol>
	 *
	 * A trailing slash can be used to continue a path and thus force scope lookup or OData simple
	 * identifier preparations, but then stay at the current object. This way, "/EMPLOYEES/$Type/"
	 * addresses the entity type itself corresponding to the "EMPLOYEES" child of the entity
	 * container. Although the empty segment is not an OData simple identifier, it can be used as a
	 * placeholder for one. In this way, "/EMPLOYEES/" addresses the same entity type as
	 * "/EMPLOYEES/$Type/". That entity type in turn is a map of all its OData children (that is,
	 * structural and navigation properties) and determines the set of possible child names that
	 * might be used after the trailing slash.
	 *
	 * Any other segment, including an OData simple identifier, is looked up as a property of the
	 * current object.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {Promise}
	 *   A promise which is resolved with the requested metadata value as soon as it is
	 *   available
	 *
	 * @function
	 * @public
	 * @see #getObject
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestObject = _SyncPromise.createRequestMethod("fetchObject");

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #getUI5Type} for synchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   {@link sap.ui.model.odata.type} or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 *
	 * @function
	 * @public
	 * @see #getUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestUI5Type
		= _SyncPromise.createRequestMethod("fetchUI5Type");

	/**
	 * Resolves the given path relative to the given context. Without a context, a relative path
	 * cannot be resolved and <code>undefined</code> is returned. An absolute path is returned
	 * unchanged. A relative path is appended to the context's path separated by a forward slash
	 * ("/"). A relative path starting with "@" (that is, an annotation) is appended without a
	 * separator. Use "./" as a prefix for such a relative path to enforce a separator.
	 *
	 * Example:
	 * <pre>
	 * &lt;template:with path="/EMPLOYEES/ENTRYDATE" var="property">
	 * &lt;!-- /EMPLOYEES/ENTRYDATE/$Type -->
	 * "{property>$Type}"
	 * &lt;!-- /EMPLOYEES/ENTRYDATE@com.sap.vocabularies.Common.v1.Text -->
	 * "{property>@com.sap.vocabularies.Common.v1.Text}"
	 * &lt;!-- /EMPLOYEES/ENTRYDATE/@com.sap.vocabularies.Common.v1.Text -->
	 * "{property>./@com.sap.vocabularies.Common.v1.Text}"
	 * </pre>
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {string}
	 *   Resolved path or <code>undefined</code>
	 * @throws {Error}
	 *   If relative path starts with a dot which is not followed by a forward slash
	 *
	 * @private
	 * @see sap.ui.model.Model#resolve
	 */
	// @override
	ODataMetaModel.prototype.resolve = function (sPath, oContext) {
		var sContextPath,
			sPathFirst;

		if (!sPath) {
			return oContext ? oContext.getPath() : undefined;
		}
		sPathFirst = sPath[0];
		if (sPathFirst === "/") {
			return sPath;
		}
		if (!oContext) {
			return undefined;
		}
		if (sPathFirst === ".") {
			if (sPath[1] !== "/") {
				throw new Error("Unsupported relative path: " + sPath);
			}
			sPath = sPath.slice(2); // BEWARE: sPathFirst !== sPath[0] intentionally now
		}
		sContextPath = oContext.getPath();
		return sPathFirst === "@" || sContextPath.slice(-1) === "/"
			? sContextPath + sPath
			: sContextPath + "/" + sPath;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#setLegacySyntax
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.setLegacySyntax = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#setLegacySyntax");
	};

	/**
	 * Returns a string representation of this object including the URL to the $metadata document of
	 * the service.
	 *
	 * @return {string} A string description of this model
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.toString = function () {
		return sODataMetaModel + ": " + this.sUrl;
	};

	return ODataMetaModel;
}, /* bExport= */ true);
