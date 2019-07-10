/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','./NotificationListBase'],function(q,l,C,N){'use strict';var a=N.extend('sap.m.NotificationListGroup',{metadata:{library:'sap.m',properties:{collapsed:{type:'boolean',group:'Behavior',defaultValue:false},autoPriority:{type:'boolean',group:'Behavior',defaultValue:true},showEmptyGroup:{type:'boolean',group:'Behavior',defaultValue:false}},defaultAggregation:"items",aggregations:{items:{type:'sap.m.NotificationListItem',multiple:true,singularName:'item'}},events:{onCollapse:{parameters:{collapsed:{type:"boolean"}}}}}});a.prototype.init=function(){sap.m.NotificationListBase.prototype.init.call(this);var r=sap.ui.getCore().getLibraryResourceBundle('sap.m');this._closeText=r.getText('NOTIFICATION_LIST_BASE_CLOSE');var _=new sap.m.Button(this.getId()+'-closeButton',{type:sap.m.ButtonType.Transparent,icon:sap.ui.core.IconPool.getIconURI('decline'),tooltip:this._closeText,press:function(){this.close();}.bind(this)});this.setAggregation("_closeButton",_,true);var b=new sap.m.Button({type:sap.m.ButtonType.Transparent,press:function(){this.setCollapsed(!this.getCollapsed());}.bind(this)});this.setAggregation("_collapseButton",b,true);};a.prototype.setCollapsed=function(b){this._toggleCollapsed();this.setProperty('collapsed',b,true);this.fireOnCollapse({collapsed:b});return this;};a.prototype.getPriority=function(){if(!this.getAutoPriority()){return this.getProperty('priority');}var n=this.getAggregation('items');var p=sap.ui.core.Priority.None;if(n){n.forEach(function(i){p=c(p,i.getPriority());});}else{p=this.getProperty('priority');}return p;};a.prototype.getUnread=function(){var n=this.getAggregation('items');if(n){return n.some(function(i){return i.getUnread();});}return this.getProperty('unread');};a.prototype.onBeforeRendering=function(){var r=sap.ui.getCore().getLibraryResourceBundle('sap.m');var e=r.getText('NOTIFICATION_LIST_GROUP_EXPAND');var b=r.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');var d=this.getShowEmptyGroup()&&(this._getVisibleItemsCount()===0);this.getAggregation('_collapseButton').setText(this.getCollapsed()?e:b).setEnabled(!d);};a.prototype.clone=function(){return N.prototype.clone.apply(this,arguments);};a.prototype._getHeaderTitle=function(){var t=sap.m.NotificationListBase.prototype._getHeaderTitle.call(this);t.addStyleClass('sapMNLG-Title');if(this.getUnread()){t.addStyleClass('sapMNLGTitleUnread');}return t;};a.prototype._getDateTimeText=function(){var d=sap.m.NotificationListBase.prototype._getDateTimeText.call(this);d.setTextAlign('End');return d;};a.prototype._toggleCollapsed=function(){var n=!this.getCollapsed();var r=sap.ui.getCore().getLibraryResourceBundle('sap.m');var e=r.getText('NOTIFICATION_LIST_GROUP_EXPAND');var b=r.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');this.getAggregation('_collapseButton').setText(n?e:b,true);this.$().toggleClass('sapMNLG-Collapsed',n);};function c(f,s){if(f==s){return f;}if((f=='None')){return s;}if((f=='Low')&&(s!='None')){return s;}if((f=='Medium')&&(s!='None'&&s!='Low')){return s;}return f;}a.prototype._getVisibleItemsCount=function(){var i=this.getItems(),r=0;i.forEach(function(b){if(b.getVisible()){r++;}});return r;};return a;},true);
