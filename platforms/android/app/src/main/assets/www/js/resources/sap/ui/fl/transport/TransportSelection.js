/*
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/fl/Utils","sap/ui/fl/transport/Transports","sap/ui/fl/transport/TransportDialog","sap/ui/fl/registry/Settings"],function(q,U,T,a,F){"use strict";var b=function(){this.oTransports=new sap.ui.fl.transport.Transports();};b.prototype.selectTransport=function(o,O,e,c,C){var s,p;var t=this;if(o){var l=U.getCurrentLayer(false);if(C){s=U.getComponentClassName(C);p={appDescriptor:U.getAppDescriptor(C),siteId:U.getSiteId(C)};}if(s&&l&&l==='CUSTOMER'){F.getInstance(s,p).then(function(S){if(S.isAtoEnabled()){var d={transportId:"ATO_NOTIFICATION"};O(t._createEventObject(o,d));}else{t._selectTransport(o,O,e,c);}});}else{t._selectTransport(o,O,e,c);}}};b.prototype._selectTransport=function(o,O,e,c){var t=this;if(o){this.oTransports.getTransports(o).then(function(g){var d;if(t._checkDialog(g)){t._openDialog({hidePackage:!U.doesSharedVariantRequirePackage(),pkg:o.package,transports:g.transports,lrepObject:t._toLREPObject(o)},O,e,c);}else{d=t._getTransport(g);O(t._createEventObject(o,d));}},function(r){e(r);});}};b.prototype._createEventObject=function(o,t){return{mParameters:{selectedTransport:t.transportId,selectedPackage:o["package"],dialog:false},getParameters:function(){return this.mParameters;},getParameter:function(n){return this.mParameters[n];}};};b.prototype._toLREPObject=function(o){var O={};if(o.namespace){O.namespace=o.namespace;}if(o.name){O.name=o.name;}if(o.type){O.type=o.type;}return O;};b.prototype._openDialog=function(c,o,e,C){var d=new a(c);d.attachOk(o);d.attachCancel(e);if(C){d.addStyleClass("sapUiSizeCompact");}else{d.removeStyleClass("sapUiSizeCompact");}d.open();return d;};b.prototype._getTransport=function(t){var o;if(!t.localonly){o=this._hasLock(t.transports);}else{o={transportId:""};}return o;};b.prototype._checkDialog=function(t){if(t){if(t.localonly||this._hasLock(t.transports)){return false;}}return true;};b.prototype._hasLock=function(t){var l=t.length;while(l--){var o=t[l];if(o.locked){return o;}}return false;};b.prototype.setTransports=function(c,C){var i=c.length-1;var t=this;var s=function(c,i,C,d,f){if(i>=0){var o=c[i];if(f===true){if(o.getDefinition().packageName!=="$TMP"){o.setRequest(d);}i--;return s(c,i,C,d,f);}else{if(o.getDefinition().packageName!=="$TMP"){return t.openTransportSelection(o,C).then(function(e){o.setRequest(e.transport);if(e.fromDialog===true){d=e.transport;f=true;}i--;return s(c,i,C,d,f);},function(){return null;});}else{i--;return s(c,i,C,d,f);}}}else{return Promise.resolve();}};return s(c,i,C);};b.prototype.openTransportSelection=function(c,C){var t=this;return new Promise(function(r,d){var o=function(R){if(R&&R.getParameters){var s=R.getParameters().selectedTransport;var p=R.getParameters().selectedPackage;var f=R.getParameters().dialog;var g={transport:s,packageName:p,fromDialog:f};r(g);}else{r({});}};var e=function(E){if(E.sId==='cancel'){r();}else{d(E);}};var O={};if(c){O["package"]=c.getPackage();O.namespace=c.getNamespace();O.name=c.getId();O.type=c.getDefinition().fileType;}t.selectTransport(O,o,e,false,C);});};return b;},true);
