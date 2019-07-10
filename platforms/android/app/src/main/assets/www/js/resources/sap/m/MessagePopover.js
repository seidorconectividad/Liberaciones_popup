/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","./ResponsivePopover","./Button","./Toolbar","./ToolbarSpacer","./Bar","./List","./StandardListItem","./ListType","./library","sap/ui/core/Control","./PlacementType","sap/ui/core/IconPool","sap/ui/core/HTML","./Text","sap/ui/core/Icon","./SegmentedButton","./Page","./NavContainer","./semantic/SemanticPage","./Link","./Popover","./MessagePopoverItem","jquery.sap.dom"],function(q,R,B,T,a,b,L,S,c,l,C,P,I,H,d,e,f,g,N,h,j,k,M){"use strict";var m=C.extend("sap.m.MessagePopover",{metadata:{library:"sap.m",properties:{asyncDescriptionHandler:{type:"any",group:"Behavior",defaultValue:null},asyncURLHandler:{type:"any",group:"Behavior",defaultValue:null},placement:{type:"sap.m.VerticalPlacementType",group:"Behavior",defaultValue:"Vertical"},initiallyExpanded:{type:"boolean",group:"Behavior",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.m.MessagePopoverItem",multiple:true,singularName:"item"},headerButton:{type:"sap.m.Button",multiple:false}},events:{afterOpen:{parameters:{openBy:{type:"sap.ui.core.Control"}}},afterClose:{parameters:{openBy:{type:"sap.ui.core.Control"}}},beforeOpen:{parameters:{openBy:{type:"sap.ui.core.Control"}}},beforeClose:{parameters:{openBy:{type:"sap.ui.core.Control"}}},itemSelect:{parameters:{item:{type:"sap.m.MessagePopoverItem"},messageTypeFilter:{type:"sap.ui.core.MessageType"}}},listSelect:{parameters:{messageTypeFilter:{type:"sap.ui.core.MessageType"}}},longtextLoaded:{},urlValidated:{}}}});var n="sapMMsgPopover",o={back:I.getIconURI("nav-back"),close:I.getIconURI("decline"),information:I.getIconURI("message-information"),warning:I.getIconURI("message-warning"),error:I.getIconURI("message-error"),success:I.getIconURI("message-success")},p=["all","error","warning","success","information"],A=["asyncDescriptionHandler","asyncURLHandler"],D={asyncDescriptionHandler:function(i){var s=i.item.getLongtextUrl();if(s){q.ajax({type:"GET",url:s,success:function(r){i.item.setDescription(r);i.promise.resolve();},error:function(){var E="A request has failed for long text data. URL: "+s;q.sap.log.error(E);i.promise.reject(E);}});}}};m.setDefaultHandlers=function(i){A.forEach(function(F){if(i.hasOwnProperty(F)){D[F]=i[F];}});};m.prototype.init=function(){var t=this;var i;this._oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.m");this._oPopover=new R(this.getId()+"-messagePopover",{showHeader:false,contentWidth:"440px",placement:this.getPlacement(),showCloseButton:false,modal:false,afterOpen:function(E){t.fireAfterOpen({openBy:E.getParameter("openBy")});},afterClose:function(E){t._navContainer.backToTop();t.fireAfterClose({openBy:E.getParameter("openBy")});},beforeOpen:function(E){t.fireBeforeOpen({openBy:E.getParameter("openBy")});},beforeClose:function(E){t.fireBeforeClose({openBy:E.getParameter("openBy")});}}).addStyleClass(n);this._createNavigationPages();this._createLists();i=this._oPopover.getAggregation("_popup");i.oPopup.setAutoClose(false);i.addEventDelegate({onBeforeRendering:this.onBeforeRenderingPopover,onkeypress:this._onkeypress},this);if(sap.ui.Device.system.phone){this._oPopover.setBeginButton(new B({text:this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE"),press:this.close.bind(this)}));}A.forEach(function(F){if(D.hasOwnProperty(F)){t.setProperty(F,D[F]);}});};m.prototype.exit=function(){this._oResourceBundle=null;this._oListHeader=null;this._oDetailsHeader=null;this._oSegmentedButton=null;this._oBackButton=null;this._navContainer=null;this._listPage=null;this._detailsPage=null;this._sCurrentList=null;if(this._oLists){this._destroyLists();}if(this._oPopover){this._oPopover.destroy();this._oPopover=null;}};m.prototype.onBeforeRenderingPopover=function(){var i=this.getHeaderButton();if(i){this._oListHeader.insertContent(i,2);}if(!this.getBindingInfo("items")&&!this.getItems().length){this._makeAutomaticBinding();}if(this._bItemsChanged){this._clearLists();this._fillLists(this.getItems());this._clearSegmentedButton();this._fillSegmentedButton();this._bItemsChanged=false;}this._setInitialFocus();};m.prototype._makeAutomaticBinding=function(){this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"message");this.bindAggregation("items",{path:"message>/",template:new M({type:"{message>type}",title:"{message>message}",description:"{message>description}",longtextUrl:"{message>longtextUrl}"})});};m.prototype._onkeypress=function(E){if(E.shiftKey&&E.keyCode==q.sap.KeyCodes.ENTER){this._fnHandleBackPress();}};m.prototype._getListHeader=function(){return this._oListHeader||this._createListHeader();};m.prototype._getDetailsHeader=function(){return this._oDetailsHeader||this._createDetailsHeader();};m.prototype._createListHeader=function(){var s=this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE");var i=this.getId()+"-CloseBtnDescr";var r=new H(i,{content:"<span id=\""+i+"\" style=\"display: none;\">"+s+"</span>"});var t=this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_HEADING");var u=this.getId()+"-HeadingDescr";var v=new H(u,{content:"<span id=\""+u+"\" style=\"display: none;\" role=\"heading\">"+t+"</span>"});this._oPopover.addAssociation("ariaLabelledBy",u,true);var w=new B({icon:o["close"],visible:!sap.ui.Device.system.phone,ariaLabelledBy:r,tooltip:s,press:this.close.bind(this)}).addStyleClass(n+"CloseBtn");this._oSegmentedButton=new f(this.getId()+"-segmented",{}).addStyleClass("sapMSegmentedButtonNoAutoWidth");this._oListHeader=new T({content:[this._oSegmentedButton,new a(),w,r,v]});return this._oListHeader;};m.prototype._createDetailsHeader=function(){var s=this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE");var i=this.getId()+"-CloseBtnDetDescr";var r=new H(i,{content:"<span id=\""+i+"\" style=\"display: none;\">"+s+"</span>"});var t=this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_BACK_BUTTON_TOOLTIP");var u=this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_BACK_BUTTON");var v=this.getId()+"-BackBtnDetDescr";var w=new H(v,{content:"<span id=\""+v+"\" style=\"display: none;\">"+u+"</span>"});var x=new B({icon:o["close"],visible:!sap.ui.Device.system.phone,ariaLabelledBy:r,tooltip:s,press:this.close.bind(this)}).addStyleClass(n+"CloseBtn");this._oBackButton=new B({icon:o["back"],press:this._fnHandleBackPress.bind(this),ariaLabelledBy:w,tooltip:t}).addStyleClass(n+"BackBtn");this._oDetailsHeader=new T({content:[this._oBackButton,new a(),x,r,w]});return this._oDetailsHeader;};m.prototype._createNavigationPages=function(){this._listPage=new g(this.getId()+"listPage",{customHeader:this._getListHeader()});this._detailsPage=new g(this.getId()+"-detailsPage",{customHeader:this._getDetailsHeader()});this._detailsPage.addEventDelegate({onclick:function(E){var t=E.target;if(t.nodeName.toUpperCase()==='A'&&(t.className.indexOf('sapMMsgPopoverItemDisabledLink')!==-1||t.className.indexOf('sapMMsgPopoverItemPendingLink')!==-1)){E.preventDefault();}}});this._navContainer=new N(this.getId()+"-navContainer",{initialPage:this.getId()+"listPage",pages:[this._listPage,this._detailsPage],navigate:this._navigate.bind(this),afterNavigate:this._afterNavigate.bind(this)});this._oPopover.addContent(this._navContainer);return this;};m.prototype._createLists=function(){this._oLists={};p.forEach(function(s){this._oLists[s]=new L({itemPress:this._fnHandleItemPress.bind(this),visible:false});this._listPage.addAggregation("content",this._oLists[s],true);},this);return this;};m.prototype._clearLists=function(){p.forEach(function(s){if(this._oLists[s]){this._oLists[s].destroyAggregation("items",true);}},this);return this;};m.prototype._destroyLists=function(){p.forEach(function(s){this._oLists[s]=null;},this);this._oLists=null;};m.prototype._fillLists=function(i){i.forEach(function(r){var s=this._mapItemToListItem(r),t=this._mapItemToListItem(r);this._oLists["all"].addAggregation("items",s,true);this._oLists[r.getType().toLowerCase()].addAggregation("items",t,true);},this);};m.prototype._mapItemToListItem=function(i){if(!i){return null;}var t=i.getType(),r=this._getItemType(i),s=new S({title:i.getTitle(),description:i.getSubtitle(),counter:i.getCounter(),icon:this._mapIcon(t),infoState:this._mapInfoState(t),info:"\r",type:r}).addStyleClass(n+"Item").addStyleClass(n+"Item"+t);if(r!==c.Navigation){s.addEventDelegate({onAfterRendering:function(){var u=this.getDomRef().querySelector(".sapMSLITitleDiv > div");if(u.offsetWidth<u.scrollWidth){this.setType(c.Navigation);}}},s);}s._oMessagePopoverItem=i;return s;};m.prototype._mapInfoState=function(t){if(!t){return null;}var i=sap.ui.core.MessageType,V=sap.ui.core.ValueState;switch(t){case i.Warning:return V.Warning;case i.Error:return V.Error;case i.Success:return V.Success;case i.Information:case i.None:return V.None;default:q.sap.log.warning("The provided MessageType is not mapped to a specific ValueState",t);return null;}};m.prototype._mapIcon=function(i){if(!i){return null;}return o[i.toLowerCase()];};m.prototype._getItemType=function(i){return(i.getDescription()||i.getMarkupDescription()||i.getLongtextUrl())?c.Navigation:c.Inactive;};m.prototype._clearSegmentedButton=function(){if(this._oSegmentedButton){this._oSegmentedButton.destroyAggregation("buttons",true);}return this;};m.prototype._fillSegmentedButton=function(){var t=this;var i=function(s){return function(){t._fnFilterList(s);};};p.forEach(function(s){var r=this._oLists[s],u=r.getItems().length,v;if(u>0){v=new B(this.getId()+"-"+s,{text:s=="all"?this._oResourceBundle.getText("MESSAGEPOPOVER_ALL"):u,icon:o[s],press:i(s)}).addStyleClass(n+"Btn"+s.charAt(0).toUpperCase()+s.slice(1));this._oSegmentedButton.addButton(v,true);}},this);return this;};m.prototype._setIcon=function(i,r){this._previousIconTypeClass=n+"DescIcon"+i.getType();this._oMessageIcon=new e({src:r.getIcon()}).addStyleClass(n+"DescIcon").addStyleClass(this._previousIconTypeClass);this._detailsPage.addContent(this._oMessageIcon);};m.prototype._setTitle=function(i){this._oMessageTitleText=new d(this.getId()+'MessageTitleText',{text:i.getTitle()}).addStyleClass('sapMMsgPopoverTitleText');this._detailsPage.addAggregation("content",this._oMessageTitleText);};m.prototype._setDescription=function(i){var r=i.getLink();this._oLastSelectedItem=i;if(i.getMarkupDescription()){this._oMessageDescriptionText=new H(this.getId()+'MarkupDescription',{content:"<div class='sapMMsgPopoverDescriptionText'>"+i.getDescription()+"</div>"});}else{this._oMessageDescriptionText=new d(this.getId()+'MessageDescriptionText',{text:i.getDescription()}).addStyleClass('sapMMsgPopoverDescriptionText');}this._detailsPage.addContent(this._oMessageDescriptionText);if(r){this._detailsPage.addContent(r);r.addStyleClass("sapMMsgPopoverDescriptionLink");}};m.prototype._iNextValidationTaskId=0;m.prototype._validateURL=function(u){if(q.sap.validateUrl(u)){return u;}q.sap.log.warning("You have entered invalid URL");return'';};m.prototype._queueValidation=function(i){var r=this.getAsyncURLHandler();var v=++this._iNextValidationTaskId;var s={};var t=new window.Promise(function(u,w){s.resolve=u;s.reject=w;var x={url:i,id:v,promise:s};r(x);});t.id=v;return t;};m.prototype._getTagPolicy=function(){var t=this,i;var r=html.makeTagPolicy(this._validateURL());return function customTagPolicy(s,u){var v,w=false;if(s.toUpperCase()==="A"){for(i=0;i<u.length;){if(u[i]==="href"){w=true;v=u[i+1];u.splice(0,2);continue;}i+=2;}}u=r(s,u);if(w&&typeof t.getAsyncURLHandler()==="function"){u=u||[];var x=false;for(i=0;i<u.length;i+=2){if(u[i]==="class"){u[i+1]+="sapMMsgPopoverItemDisabledLink sapMMsgPopoverItemPendingLink";x=true;break;}}var y=u.indexOf("id");if(y>-1){u.splice(y+1,1);u.splice(y,1);}if(!x){u.unshift("sapMMsgPopoverItemDisabledLink sapMMsgPopoverItemPendingLink");u.unshift("class");}var V=t._queueValidation(v);u.push("href");u.push(v);u.push("target");u.push("_blank");u.push("id");u.push("sap-ui-"+t.getId()+"-link-under-validation-"+V.id);V.then(function(z){var $=q.sap.byId("sap-ui-"+t.getId()+"-link-under-validation-"+z.id);if(z.allowed){q.sap.log.info("Allow link "+v);}else{q.sap.log.info("Disallow link "+v);}$.removeClass('sapMMsgPopoverItemPendingLink');$.toggleClass('sapMMsgPopoverItemDisabledLink',!z.allowed);t.fireUrlValidated();}).catch(function(){q.sap.log.warning("Async URL validation could not be performed.");});}return u;};};m.prototype._sanitizeDescription=function(i){q.sap.require("jquery.sap.encoder");q.sap.require("sap.ui.thirdparty.caja-html-sanitizer");var s=i.getDescription();if(i.getMarkupDescription()){var t=this._getTagPolicy();s=html.sanitizeWithPolicy(s,t);}i.setDescription(s);this._setDescription(i);};m.prototype._fnHandleItemPress=function(E){var i=E.getParameter("listItem"),r=i._oMessagePopoverItem,s=this._detailsPage.getContent()||[];var t=this.getAsyncDescriptionHandler();var u=function(y){this._setTitle(r);this._sanitizeDescription(r);this._setIcon(r,i);this.fireLongtextLoaded();if(!y){this._navContainer.to(this._detailsPage);}}.bind(this);this._previousIconTypeClass=this._previousIconTypeClass||'';this.fireItemSelect({item:r,messageTypeFilter:this._getCurrentMessageTypeFilter()});s.forEach(function(y){if(y instanceof j){this._oLastSelectedItem.setLink(y);y.removeAllAriaLabelledBy();}else{y.destroy();}},this);if(typeof t==="function"&&!!r.getLongtextUrl()){r.setMarkupDescription(true);var v={};var w=new window.Promise(function(y,z){v.resolve=y;v.reject=z;});var x=function(){this._detailsPage.setBusy(false);u(true);}.bind(this);w.then(function(){x();}).catch(function(){q.sap.log.warning("Async description loading could not be performed.");x();});this._navContainer.to(this._detailsPage);this._detailsPage.setBusy(true);t({promise:v,item:r});}else{u();}this._listPage.$().attr("aria-hidden","true");};m.prototype._fnHandleBackPress=function(){this._listPage.$().removeAttr("aria-hidden");this._navContainer.back();};m.prototype._fnFilterList=function(s){p.forEach(function(i){if(i!=s&&this._oLists[i].getVisible()){this._oLists[i].setVisible(false);}},this);this._sCurrentList=s;this._oLists[s].setVisible(true);this._expandMsgPopover();this.fireListSelect({messageTypeFilter:this._getCurrentMessageTypeFilter()});};m.prototype._getCurrentMessageTypeFilter=function(){return this._sCurrentList=="all"?"":this._sCurrentList;};m.prototype._navigate=function(){if(this._isListPage()){this._oRestoreFocus=q(document.activeElement);}};m.prototype._afterNavigate=function(){q.sap.delayedCall(0,this,this._restoreFocus);};m.prototype._isListPage=function(){return(this._navContainer.getCurrentPage()==this._listPage);};m.prototype._setInitialFocus=function(){if(this._isListPage()){this._oPopover.setInitialFocus(this._oLists[this._sCurrentList]);}};m.prototype._restoreFocus=function(){if(this._isListPage()){var r=this._oRestoreFocus&&this._oRestoreFocus.control(0);if(r){r.focus();}}else{this._oBackButton.focus();}};m.prototype._restoreExpansionDefaults=function(){if(this.getInitiallyExpanded()){this._fnFilterList("all");this._oSegmentedButton.setSelectedButton(null);}else{this._collapseMsgPopover();}};m.prototype._expandMsgPopover=function(){var s,i=this._oPopover.getContentWidth();if(this.getInitiallyExpanded()){s=this._oPopover.$("cont").css("height");i=parseFloat(s)?s:i;}this._oPopover.setContentHeight(i).removeStyleClass(n+"-init");};m.prototype._collapseMsgPopover=function(){p.forEach(function(s){this._oLists[s].setVisible(false);},this);this._oPopover.addStyleClass(n+"-init").setContentHeight("auto");this._oSegmentedButton.setSelectedButton("none");};m.prototype.openBy=function(i){var r=this._oPopover.getAggregation("_popup"),s=i.getParent();if(r instanceof k){if((s instanceof T||s instanceof b||s instanceof h)){r.setShowArrow(false);r.setResizable(true);}else{r.setShowArrow(true);}}if(this._oPopover){this._restoreExpansionDefaults();this._oPopover.openBy(i);}return this;};m.prototype.close=function(){if(this._oPopover){this._oPopover.close();}return this;};m.prototype.isOpen=function(){return this._oPopover.isOpen();};m.prototype.toggle=function(i){if(this.isOpen()){this.close();}else{this.openBy(i);}return this;};m.prototype.setPlacement=function(s){this.setProperty("placement",s,true);this._oPopover.setPlacement(s);return this;};m.prototype.getDomRef=function(s){return this._oPopover&&this._oPopover.getAggregation("_popup").getDomRef(s);};m.prototype.invalidate=function(){if(this._oPopover&&this._oPopover.isOpen()){C.prototype.invalidate.apply(this,arguments);}};["addStyleClass","removeStyleClass","toggleStyleClass","hasStyleClass","getBusyIndicatorDelay","setBusyIndicatorDelay","getVisible","setVisible","getBusy","setBusy"].forEach(function(s){m.prototype[s]=function(){if(this._oPopover&&this._oPopover[s]){var i=this._oPopover;var r=i[s].apply(i,arguments);return r===i?this:r;}};});["setModel","bindAggregation","setAggregation","insertAggregation","addAggregation","removeAggregation","removeAllAggregation","destroyAggregation"].forEach(function(F){m.prototype["_"+F+"Old"]=m.prototype[F];m.prototype[F]=function(){var r=m.prototype["_"+F+"Old"].apply(this,arguments);this._bItemsChanged=true;if(this._oPopover){this._oPopover.invalidate();}if(["removeAggregation","removeAllAggregation"].indexOf(F)!==-1){return r;}return this;};});return m;},true);
