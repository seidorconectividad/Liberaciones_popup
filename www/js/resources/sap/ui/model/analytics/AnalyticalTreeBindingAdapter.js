/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/model/TreeBinding','./AnalyticalBinding','sap/ui/model/TreeAutoExpandMode','sap/ui/model/ChangeReason','sap/ui/model/odata/ODataTreeBindingAdapter','sap/ui/model/TreeBindingAdapter','sap/ui/model/TreeBindingUtils'],function(q,T,A,a,C,O,b,c){"use strict";var d=function(){if(!(this instanceof T)||this._bIsAdapted){return;}O.apply(this);for(var f in d.prototype){if(d.prototype.hasOwnProperty(f)){this[f]=d.prototype[f];}}this.setAutoExpandMode(this.mParameters.autoExpandMode||a.Bundled);};d.prototype.getGrandTotalContext=function(){if(this._oRootNode){return this._oRootNode.context;}};d.prototype.getGrandTotalNode=function(){if(this._oRootNode){return this._oRootNode;}};d.prototype.getGrandTotalContextInfo=function(){return this._oRootNode;};d.prototype.getLength=function(){if(!this._oRootNode){return 0;}if(this._oRootNode&&this._oWatermark&&this._isRunningInAutoExpand(a.Bundled)){if(this._oWatermark.groupID===this._oRootNode.groupID){return this._oRootNode.magnitude+this._oRootNode.numberOfTotals;}return this._oWatermark.absoluteNodeIndex+this._oRootNode.numberOfTotals+1;}return this._oRootNode.magnitude+this._oRootNode.numberOfTotals;};d.prototype.getContextByIndex=function(i){if(this._oRootNode&&i===(this.getLength()-1)&&this.providesGrandTotal()&&this.hasTotaledMeasures()){return this._oRootNode.context;}var n=this.findNode(i);if(!n||!n.context){n={context:this.getContexts(i,1,0)[0]};}return n?n.context:undefined;};d.prototype.getNodeByIndex=function(i){if(i===(this.getLength()-1)&&this.providesGrandTotal()&&this.hasTotaledMeasures()){return this._oRootNode;}if(i>=this.getLength()){return undefined;}return this.findNode(i);};d.prototype._isNodeSelectable=function(n){if(!n){return false;}return n.isLeaf&&!n.isArtificial;};d.prototype.getContexts=function(s,l,t,r){if(!l){l=this.oModel.iSizeLimit;}if(!t){t=0;}this._iPageSize=l;this._iThreshold=Math.max(this._iThreshold,t);this._aRowIndexMap=[];this._buildTree(s,l);var n=[];if(this._oRootNode){n=this._retrieveNodeSection(this._oRootNode,s,l);}this._updateRowIndexMap(n,s);var e=[];var m;for(var i=0;i<n.length;i++){var N=n[i];if(this._isRunningInAutoExpand(a.Bundled)&&this._oWatermark){if(N.groupID===this._oWatermark.groupID||(this._oWatermark.groupID===this._oRootNode.groupID&&(s+i+1)==this.getLength()-1)){this._autoExpandPaging();}}if(!N.context){m=m||{};var p=N.parent;m[p.groupID]=p;this._updateNodeSections(p.groupID,{startIndex:N.positionInParent,length:1});}e.push(N.context);}if(m){var f=this;q.each(m,function(g,N){N.magnitude=0;N.numberOfTotals=0;f._loadChildContexts(N,{absoluteNodeIndex:N.absoluteNodeIndex});});e=[];for(var j=0;j<n.length;j++){var N=n[j];e.push(N.context);}}if(r){return n;}else{return e;}};d.prototype._autoExpandPaging=function(){var e=this.getNodeContexts(this._oWatermark.context,{startIndex:this._oWatermark.startIndex,length:this._iPageSize,threshold:this._iThreshold,level:this._oWatermark.level,numberOfExpandedLevels:this._oWatermark.autoExpand});return e;};d.prototype._afterMatchHook=function(n,r,m,M,p,P){if(n.sumNode&&n!==this._oRootNode){if(r.length===m){return true;}var N=M.call(this,n.sumNode,n.sumNode.positionInParent,P);if(N){r.push(n.sumNode);}}};d.prototype._afterMapHook=function(n,m){if(n.sumNode&&n!==this._oRootNode){m.call(this,n.sumNode);}};d.prototype._createSumNode=function(n){var s;if(this.bProvideGrandTotals&&!this.mParameters.sumOnTop&&this.hasTotaledMeasures()&&n.children.length>1){s=this._createNode({parent:n.parent,positionInParent:n.children.length,context:n.context,level:n.level});s.nodeState=this._createNodeState({groupID:s.groupID,sum:true,expanded:false});}return s;};d.prototype._buildTree=function(s,l){this._oRootNode=undefined;this._oWatermark=undefined;var n=this.mParameters&&this.getNumberOfExpandedLevels();var r=this.getRootContexts({startIndex:0,length:this._iPageSize,threshold:this._iThreshold,numberOfExpandedLevels:this._autoExpandMode===a.Bundled?n:undefined});var R;if(r==null){q.sap.log.warning("AnalyticalTreeBindingAdapter: No Dimensions given. An artificial rootContext has be created. Please check your Table/Service definition for dimension columns!");}else{R=r[0];}if(!R){return;}var o=this._getNodeState("/");if(!o){o=this._updateTreeState({groupID:"/",expanded:true,sum:true});this._updateNodeSections("/",{startIndex:0,length:l});}this._oRootNode=this._createNode({context:R,parent:null,level:0,nodeState:o,isLeaf:false,autoExpand:n,absoluteNodeIndex:-1});this._oRootNode.isArtificial=true;this._loadChildContexts(this._oRootNode,{absoluteNodeIndex:-1});};d.prototype._loadChildContexts=function(n,r){var N=n.nodeState;var m=this.getGroupSize(n.context,n.level);if(m>=0){if(!n.children[m-1]){n.children[m-1]=undefined;}if(n.level===this.aAggregationLevel.length){N.leafCount=m;}n.sumNode=this._createSumNode(n);}for(var i=0;i<N.sections.length;i++){var o=N.sections[i];if(o.startIndex>n.children.length){continue;}var R;if(m===-1){R=o.length;}else{R=Math.min(o.length,m-o.startIndex);}var s=false;if(n.autoExpand>=0&&this._isRunningInAutoExpand(a.Bundled)){s=true;R=Math.max(0,m);}var e=this.getNodeContexts(n.context,{startIndex:o.startIndex,length:R,threshold:s?0:this._iThreshold,level:n.level,supressRequest:s});for(var j=0;j<e.length;j++){var f=e[j];var g=j+o.startIndex;var h=n.children[g];var u={context:e[j],parent:n,level:n.level+1,positionInParent:g,autoExpand:Math.max(n.autoExpand-1,-1),absoluteNodeIndex:(++r.absoluteNodeIndex)};if(h){h.context=u.context;h.parent=u.parent;h.level=u.level;h.positionInParent=u.positionInParent;h.magnitude=0;h.numberOfTotals=0;h.totalNumberOfLeafs=0;h.autoExpand=u.autoExpand;h.absoluteNodeIndex=u.absoluteNodeIndex;var G;if(f){G=this._calculateGroupID(h);}h.groupID=G;}else{h=this._createNode(u);}h.nodeState=this._getNodeState(h.groupID);if(!h.nodeState){h.nodeState=this._createNodeState({groupID:h.groupID,expanded:false});}h.nodeState.parentGroupID=n.groupID;h.isLeaf=!this.nodeHasChildren(h);n.children[g]=h;if(h.isLeaf){n.numberOfLeafs+=1;}if(h.parent.nodeState.selectAllMode&&!this._mTreeState.deselected[h.groupID]&&h.isLeaf){this.setNodeSelection(h.nodeState,true);}if((h.autoExpand>=0||h.nodeState.expanded)&&this.isGrouped()){if(!this._mTreeState.collapsed[h.groupID]){if(h.autoExpand>=0&&h.parent.nodeState.selectAllMode&&!this._mTreeState.deselected[h.groupID]){if(h.nodeState.selectAllMode===undefined){h.nodeState.selectAllMode=true;}}this._updateTreeState({groupID:h.nodeState.groupID,fallbackNodeState:h.nodeState,expanded:true});this._loadChildContexts(h,r);}n.magnitude+=h.magnitude;n.numberOfTotals+=h.numberOfTotals;n.numberOfLeafs+=h.numberOfLeafs;}if(h&&h.isLeaf){n.totalNumberOfLeafs=m;}else{n.totalNumberOfLeafs+=h.totalNumberOfLeafs;}}}m=this._isRunningInAutoExpand(a.Bundled)?n.children.length:m;n.magnitude+=Math.max(m||0,0);if(!m&&!this._isRunningInAutoExpand(a.Bundled)){q.sap.log.warning("AnalyticalTreeBindingAdapter: iMaxGroupSize("+m+") is undefined for node '"+n.groupID+"'!");}if(n.sumNode||(n===this._oRootNode&&this.providesGrandTotal()&&this.hasTotaledMeasures())){n.numberOfTotals+=1;}if(this._isRunningInAutoExpand(a.Bundled)&&n.autoExpand!=-1){if(!this._oWatermark&&!n.isLeaf&&!this.mFinalLength[n.groupID]){this._oWatermark={groupID:n.groupID,context:n.context,absoluteNodeIndex:n.absoluteNodeIndex,startIndex:n.children.length,level:n.level,autoExpand:n.autoExpand};}}};d.prototype._calculateGroupID=function(n){var g;var m=this.aAggregationLevel.length;if(!this.isGrouped()&&n&&n.positionInParent){g="/"+n.positionInParent+"/";}else{if(n.level>m){g=this._getGroupIdFromContext(n.context,m);g+=n.positionInParent+"/";}else{g=this._getGroupIdFromContext(n.context,n.level);}}return g;};d.prototype.collapse=function(p){var n,N;if(typeof p==="object"){n=p;}else if(typeof p==="number"){N=this.findNode(p);if(!N){return;}n=N.nodeState;}this._updateTreeState({groupID:n.groupID,expanded:false});n.selectAllMode=false;var e=false;if(this.bCollapseRecursive||this._isRunningInAutoExpand(a.Bundled)){var g=n.groupID;if(this._isRunningInAutoExpand(a.Bundled)&&this._oWatermark&&q.sap.startsWith(this._oWatermark.groupID,g)){if(N&&N.parent){this._oWatermark={groupID:N.parent.groupID,context:N.parent.context,absoluteNodeIndex:N.parent.absoluteNodeIndex,startIndex:N.positionInParent+1,level:N.parent.level,autoExpand:N.parent.autoExpand};}this._autoExpandPaging();e=true;}var t=this;q.each(this._mTreeState.expanded,function(G,o){if(q.sap.startsWith(G,g)){t._updateTreeState({groupID:G,expanded:false});}});q.each(this._mTreeState.selected,function(G,o){if(q.sap.startsWith(G,g)){o.selectAllMode=false;t.setNodeSelection(o,false);}});}if(!e){this._fireChange({reason:C.Collapse});}};d.prototype.collapseToLevel=function(l){this.setNumberOfExpandedLevels(l,true);b.prototype.collapseToLevel.call(this,l);};d.prototype.nodeHasChildren=function(n){if(!n||!n.parent||n.nodeState.sum){return false;}else if(n.isArtificial){return true;}else{return A.prototype.hasChildren.call(this,n.context,{level:n.level});}};d.prototype.resetData=function(o,p){var r=A.prototype.resetData.call(this,o,p);this._aRowIndexMap=[];this._oRootNode=undefined;this._oWatermark=undefined;this._iPageSize=0;this._iThreshold=0;if(!p||p.reason!==C.Sort){this.clearSelection();this._createTreeState(true);}return r;};d.prototype.hasTotaledMeasures=function(){var h=false;q.each(this.getMeasureDetails()||[],function(i,m){if(m.analyticalInfo.total){h=true;return false;}});return h;};d.prototype.isGrouped=function(){return(this.aAggregationLevel.length>0);};d.prototype._isRunningInAutoExpand=function(s){if(this.getNumberOfExpandedLevels()>0&&this._autoExpandMode===s){return true;}else{return false;}};d.prototype.setNumberOfExpandedLevels=function(l,s){l=l||0;if(l<0){q.sap.log.warning("AnalyticalTreeBindingAdapter: numberOfExpanded levels was set to 0. Negative values are prohibited.");l=0;}if(!s){this.resetData();}this.mParameters.numberOfExpandedLevels=l;};d.prototype.getNumberOfExpandedLevels=function(){return this.mParameters.numberOfExpandedLevels;};d.prototype._getSelectableNodesCount=function(n){if(n){return n.totalNumberOfLeafs;}else{return 0;}};return d;},true);
