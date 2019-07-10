/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Object','sap/ui/base/EventProvider'],function(q,O,E){"use strict";var e=new E(),a,c;var H=O.extend("HeaderAdapter",{constructor:function(h,A){if(!h||!A){q.sap.log.error("Cannot initialize: Invalid arguments.");return;}this._oHeader=h;this._oStyledPage=null;this._oTitleInfo=null;this._oSubTitleInfo=null;this._oBackButton=null;this._oAdaptOptions=A;}});H.prototype.adapt=function(){var s=this._oAdaptOptions.bStylePage,C=this._oAdaptOptions.bCollapseHeader;if(s){this._adaptStyle("sapF2Adapted");}this._adaptTitle();this._adaptBackButton();if(C){this._collapseHeader();}return this.getAdaptedContent();};H.prototype.getAdaptedContent=function(){return{oTitleInfo:this._oTitleInfo,oSubTitleInfo:this._oSubTitleInfo,oBackButton:this._oBackButton,oStyledPage:this._oStyledPage};};H.prototype._adaptTitle=function(){if(!H._isAdaptableHeader(this._oHeader)||this._oAdaptOptions.bMoveTitle!==true){return false;}this._oTitleInfo=this._detectTitle();this._oSubTitleInfo=this._detectSubTitle();var s=!!this._oTitleInfo||!!this._oSubTitleInfo;if(this._oTitleInfo){this._oTitleInfo.oControl.addStyleClass("sapF2AdaptedTitle");}return s;};H.prototype._adaptBackButton=function(){if(!H._isAdaptableHeader(this._oHeader)||this._oAdaptOptions.bHideBackButton!==true){return false;}var B=false;this._oBackButton=this._detectBackButton();if(this._oBackButton){this._oBackButton.addStyleClass("sapF2AdaptedNavigation");B=true;}return B;};H.prototype._adaptStyle=function(C){var p=this._oHeader.getParent();if(p){p.addStyleClass(C,true);this._oStyledPage=p;}};H._isAdaptableHeader=function(h){if(!h||!f(h,"sap/m/Bar")){return false;}var p=h.getParent();return p&&(f(p,"sap/m/Page")||f(p,"sap/uxap/ObjectPageHeader"));};H.prototype._detectTitle=function(){var t;if(H._isAdaptableHeader(this._oHeader)){var m=this._oHeader.getContentMiddle();if(m.length===1&&i(m[0])){var T=m[0];t={id:T.getId(),text:T.getText(),oControl:T,sChangeEventId:"_change"};}}return t;};H.prototype._detectSubTitle=function(p){if(f(p,"sap/uxap/ObjectPageHeader")){var h=p.getHeaderTitle();if(h){return{id:h.getId(),text:h.getObjectTitle(),oControl:h,sChangeEventId:"_titleChange"};}}};H.prototype._detectBackButton=function(){if(H._isAdaptableHeader(this._oHeader)){var B=this._oHeader.getContentLeft();if(B.length>0&&f(B[0],"sap/m/Button")&&(B[0].getVisible()===true)&&(B[0].getType()==="Back"||B[0].getType()==="Up"||B[0].getIcon()==="sap-icon://nav-back")){return B[0];}}};H.prototype._collapseHeader=function(){var t=this._oTitleInfo,B=this._oBackButton;if(H._isAdaptableHeader(this._oHeader)){var h=this._oHeader.getContentLeft();var m=this._oHeader.getContentMiddle();var j=this._oHeader.getContentRight();if((h.length===0||(h.length===1&&B))&&(m.length===0||(m.length===1&&t))&&(j.length===0)){this._adaptStyle("sapF2CollapsedHeader");}}};var F=O.extend("sap.m.Fiori20Adapter",{});F.attachViewChange=function(l,L){e.attachEvent("adaptedViewChange",l,L);};F.detachViewChange=function(l,L){e.detachEvent("adaptedViewChange",l,L);};F.traverse=function(C,A){a={aViewTitles:{},aViewSubTitles:{},aViewBackButtons:{},aChangeListeners:{}};c=[];this._doBFS([{oNode:C,oAdaptOptions:A}]);};F._doBFS=function(Q){var n=Q.shift();if(!n){return;}var N=n.oNode,A=n.oAdaptOptions,s=A.iSearchDepth;A=this._applyRules(A,N);if(!this._isAdaptationRequired(N,A)||(s<=0)){return;}var I=N.getParent()&&f(N.getParent(),"sap/m/NavContainer");if(I){c.push(N.getId());}var o=this._processNode(N,A);var C=this._getNodeChildren(N),h=q.extend({},A,{iSearchDepth:this._updateSearchDepth(s,N)});if(o){var t=!!o.oTitleInfo,B=!!o.oBackButton,p=!!o.oStyledPage;h=q.extend(h,{bMoveTitle:A.bMoveTitle&&!t,bHideBackButton:A.bHideBackButton&&!B,bStylePage:A.bStylePage&&!p});}C.forEach(function(j){if(j){Q.push({oNode:j,oAdaptOptions:h});}});this._doBFS(Q);if(I){c.pop();if(c.length===0){this._fireViewChange(N.getId(),A);}}};F._processNode=function(C,A){this._attachDefferedAdaptationListeners(C,A);if(H._isAdaptableHeader(C)){return this._adaptHeader(C,A);}if(C.getParent()&&f(C.getParent(),"sap/m/NavContainer")){return this._getCachedAdaptationResult(C.getId());}};F._attachDefferedAdaptationListeners=function(C,A){this._attachAdaptableContentChange(C,A);this._attachNavigablePageChange(C,A);if(f(C,"sap/m/Page")){this._attachModifyAggregation(C,"content",A);}if((A.bLateAdaptation===true)&&f(C,"sap/m/Bar")){this._attachModifyAggregation(C,"contentLeft",A,C);this._attachModifyAggregation(C,"contentMiddle",A,C);this._attachModifyAggregation(C,"contentRight",A,C);}if(f(C,"sap/ui/core/ComponentContainer")){var o=C.getComponentInstance();if(!o&&C.getName()&&!C.getDomRef()){var t=this;var D={onBeforeRendering:function(){C.removeEventDelegate(D);t._doBFS([{oNode:C.getComponentInstance(),oAdaptOptions:A}]);}};C.addEventDelegate(D,this);}}};F._checkHasListener=function(k){return a.aChangeListeners[k];};F._setHasListener=function(k,v){a.aChangeListeners[k]=v;};F._attachAdaptableContentChange=function(C,A){if(!C._getAdaptableContent||!q.isFunction(C._getAdaptableContent)){return;}var k=C.getId()+"_adaptableContentChange";if(this._checkHasListener(k)){return;}var o=this._getCurrentTopViewId();var h=function(j){var l=j.getParameter("adaptableContent");var I=(this._getCurrentTopViewId()===undefined);if(I){c.push(o);this._doBFS([{oNode:l,oAdaptOptions:A}]);c.pop();this._fireViewChange(o,A);}}.bind(this);C.attachEvent("_adaptableContentChange",h);this._setHasListener(k);};F._attachNavigablePageChange=function(C,A){if(!f(C,"sap/m/NavContainer")){return;}var k=C.getId()+"navigate";if(this._checkHasListener(k)){return;}C.attachNavigate(function(o){this._doBFS([{oNode:o.getParameter("to"),oAdaptOptions:A}]);}.bind(this));this._setHasListener(k);};F._attachModifyAggregation=function(C,A,o,h){if(!C._attachModifyAggregation||!q.isFunction(C._attachModifyAggregation)){return;}var k=C.getId()+A;if(this._checkHasListener(k)){return;}var j=this._getCurrentTopViewId();var l=function(m){var t=m.getParameter("type"),n=m.getParameter("object");if((t==="add")||(t==="insert")){var I=(this._getCurrentTopViewId()===undefined);if(I){c.push(j);this._doBFS([{oNode:h?h:n,oAdaptOptions:o}]);c.pop();this._fireViewChange(j,o);}}}.bind(this);C._attachModifyAggregation(A,o,l);this._setHasListener(k,l);};F._getNodeChildren=function(C){if(C._getAdaptableContent&&q.isFunction(C._getAdaptableContent)){var h=[C._getAdaptableContent()];if(f(C,"sap/m/Page")){h=h.concat(C.getContent());}return h;}if(f(C,"sap/m/SplitContainer")){return[].concat(C.getAggregation("_navMaster"),C.getAggregation("_navDetail"));}if(f(C,"sap/uxap/ObjectPageLayout")){return[C.getHeaderTitle()];}if(f(C,"sap/ui/core/ComponentContainer")){return[C.getComponentInstance()];}if(f(C,"sap/ui/core/Component")){return[C.getAggregation("rootControl")];}return C.findAggregatedObjects(false,g);};F._updateSearchDepth=function(s,C){if(f(C,"sap/ui/core/mvc/View")||f(C,"sap/ui/core/Component")||f(C,"sap/ui/core/ComponentContainer")){return s;}return s-1;};F._getCachedAdaptationResult=function(v){return{oTitleInfo:a.aViewTitles[v],oSubTitleInfo:a.aViewSubTitles[v],oBackButton:a.aViewBackButtons[v]};};F._applyRules=function(A,C){var p=C.getParent();if(f(p,"sap/m/SplitContainer")){var I=sap.ui.Device.system.phone,m=A.bMoveTitle,h=A.bHideBackButton;if(m){m=I;}if(h&&!sap.ui.Device.system.phone){h='initialPage';}return q.extend({},A,{bMoveTitle:m,bHideBackButton:h});}if(f(p,"sap/m/NavContainer")){if(A.bHideBackButton==='initialPage'){var j=p._getActualInitialPage()&&(p._getActualInitialPage().getId()===C.getId());return q.extend({},A,{bHideBackButton:j});}}if((A.bMoveTitle===false)||(A.bHideBackButton===false)){return q.extend({},A,{bCollapseHeader:false});}return A;};F._getCurrentTopViewId=function(){if(c&&(c.length>0)){return c[0];}};F._adaptHeader=function(h,A){if(!h||!A){return;}var o=new H(h,A),j=o.adapt();var t=this._getCurrentTopViewId();if(j.oTitleInfo){a.aViewTitles[t]=j.oTitleInfo;this._registerChangeListener(a.aViewTitles,t,A);}if(j.oSubTitleInfo){a.aViewSubTitles[t]=j.oSubTitleInfo;this._registerChangeListener(a.aViewSubTitles,t,A);}if(j.oBackButton){a.aViewBackButtons[t]=j.oBackButton;}return j;};F._registerChangeListener=function(t,v,A){var T=t[v];if(T&&T.oControl&&T.sChangeEventId&&!a.aChangeListeners[T.id]){var C=function(o){var T=t[v];T.text=o.getParameter("newValue");this._fireViewChange(v,A);}.bind(this);T.oControl.attachEvent(T.sChangeEventId,C);a.aChangeListeners[T.id]=C;}};F._fireViewChange=function(v,A){var a=this._getCachedAdaptationResult(v);a.sViewId=v;a.oAdaptOptions=A;e.fireEvent("adaptedViewChange",a);};F._isAdaptationRequired=function(n,A){if(!n||this._isNonAdaptableControl(n)){return false;}for(var o in A){if(A.hasOwnProperty(o)&&((A[o]===true)||(A[o]==="initialPage"))){return true;}}return false;};F._isNonAdaptableControl=function(C){return b(C);};function i(C){return d(C,["sap/m/Label","sap/m/Text","sap/m/Title"]);}function b(C){return d(C,["sap/m/List","sap/m/Table","sap/ui/table/Table","sap/ui/table/TreeTable"]);}function d(C,t){if(!C||!t){return;}return t.some(function(T){return f(C,T);});}function f(C,t){var T=sap.ui.require(t);return T&&(C instanceof T);}function g(o){return o&&(o.sParentAggregationName!=="dependents");}return F;},false);
