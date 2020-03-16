/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Renderer','sap/ui/core/ValueStateSupport','sap/ui/core/IconPool'],function(q,R,V,I){"use strict";var S={};S.CSS_CLASS="sapMSlt";S.render=function(r,s){var t=V.enrichTooltip(s,s.getTooltip_AsString()),T=s.getType(),a=s.getAutoAdjustWidth(),e=s.getEnabled(),C=S.CSS_CLASS;r.write("<div");this.addClass(r,s);r.addClass(C);r.addClass(C+s.getType());if(!e){r.addClass(C+"Disabled");}if(a){r.addClass(C+"AutoAdjustedWidth");}else{r.addStyle("width",s.getWidth());}if(s.getIcon()){r.addClass(C+"WithIcon");}if(e&&sap.ui.Device.system.desktop){r.addClass(C+"Hoverable");}r.addClass(C+"WithArrow");if(s.getValueState()!==sap.ui.core.ValueState.None){this.addValueStateClasses(r,s);}r.addStyle("max-width",s.getMaxWidth());r.writeControlData(s);r.writeStyles();r.writeClasses();this.writeAccessibilityState(r,s);if(t){r.writeAttributeEscaped("title",t);}else if(T===sap.m.SelectType.IconOnly){var i=I.getIconInfo(s.getIcon());if(i){r.writeAttributeEscaped("title",i.text);}}if(e){r.writeAttribute("tabindex","0");}r.write(">");this.renderLabel(r,s);switch(T){case sap.m.SelectType.Default:this.renderArrow(r,s);break;case sap.m.SelectType.IconOnly:this.renderIcon(r,s);break;}var l=s.getList();if(s._isShadowListRequired()&&l){this.renderShadowList(r,l);}if(s.getName()){this.renderInput(r,s);}r.write("</div>");};S.renderLabel=function(r,s){var o=s.getSelectedItem(),t=s.getTextDirection(),T=R.getTextAlign(s.getTextAlign(),t),C=S.CSS_CLASS;r.write("<label");r.writeAttribute("id",s.getId()+"-label");r.writeAttribute("for",s.getId());r.addClass(C+"Label");if(s.getValueState()!==sap.ui.core.ValueState.None){r.addClass(C+"LabelState");r.addClass(C+"Label"+s.getValueState());}if(s.getType()===sap.m.SelectType.IconOnly){r.addClass("sapUiPseudoInvisibleText");}if(t!==sap.ui.core.TextDirection.Inherit){r.writeAttribute("dir",t.toLowerCase());}if(T){r.addStyle("text-align",T);}r.writeStyles();r.writeClasses();r.write(">");r.writeEscaped((o&&o.getParent())?o.getText():"");r.write("</label>");};S.renderArrow=function(r,s){var C=S.CSS_CLASS;r.write("<span");r.addClass(C+"Arrow");if(s.getValueState()!==sap.ui.core.ValueState.None){r.addClass(C+"ArrowState");}r.writeAttribute("id",s.getId()+"-arrow");r.writeClasses();r.write("></span>");};S.renderIcon=function(r,s){r.writeIcon(s.getIcon(),S.CSS_CLASS+"Icon",{id:s.getId()+"-icon",title:null});};S.renderInput=function(r,s){r.write("<input hidden");r.writeAttribute("id",s.getId()+"-input");r.addClass(S.CSS_CLASS+"Input");r.writeAttribute("aria-hidden","true");r.writeAttribute("tabindex","-1");if(!s.getEnabled()){r.write("disabled");}r.writeClasses();r.writeAttributeEscaped("name",s.getName());r.writeAttributeEscaped("value",s.getSelectedKey());r.write("/>");};S.renderShadowList=function(r,l){var L=l.getRenderer();L.writeOpenListTag(r,l);this.renderShadowItems(r,l);L.writeCloseListTag(r,l);};S.renderShadowItems=function(r,l){var L=l.getRenderer(),s=l.getItems().length,o=l.getSelectedItem();for(var i=0,a=l.getItems();i<a.length;i++){L.renderItem(r,l,a[i],{selected:o===a[i],setsize:s,posinset:i+1,elementData:false});}};S.addClass=function(r,s){};S.addValueStateClasses=function(r,s){r.addClass(S.CSS_CLASS+"State");r.addClass(S.CSS_CLASS+s.getValueState());};S.getAriaRole=function(s){switch(s.getType()){case sap.m.SelectType.Default:return"combobox";case sap.m.SelectType.IconOnly:return"button";}};S.writeAccessibilityState=function(r,s){r.writeAccessibilityState(s,{role:this.getAriaRole(s),expanded:s.isOpen(),live:"polite",invalid:(s.getValueState()===sap.ui.core.ValueState.Error)?true:undefined,labelledby:{value:s.getId()+"-label",append:true},haspopup:(s.getType()===sap.m.SelectType.IconOnly)?true:undefined});};return S;},true);