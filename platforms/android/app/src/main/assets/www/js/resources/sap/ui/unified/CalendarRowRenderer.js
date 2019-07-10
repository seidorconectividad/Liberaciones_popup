/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/date/UniversalDate','sap/ui/unified/CalendarAppointment','sap/ui/unified/CalendarRow'],function(q,U,C,a){"use strict";var b={};b.render=function(r,R){var t=R.getTooltip_AsString();var v=R.getAppointmentsVisualization();var l=R.getLegend();var T=[];if(l){var L=sap.ui.getCore().byId(l);if(L){T=L.getItems();}else{q.sap.log.warning("CalendarLegend "+l+" does not exist!",R);}}r.write("<div");r.writeControlData(R);r.addClass("sapUiCalendarRow");if(!sap.ui.Device.system.phone&&R.getAppointmentsReducedHeight()){r.addClass("sapUiCalendarRowAppsRedHeight");}if(v!=sap.ui.unified.CalendarAppointmentVisualization.Standard){r.addClass("sapUiCalendarRowVis"+v);}if(R._sFocusedAppointmentId){r.writeAttribute("tabindex","-1");}else{r.writeAttribute("tabindex","0");}if(t){r.writeAttributeEscaped("title",t);}var w=R.getWidth();if(w){r.addStyle("width",w);}var h=R.getHeight();if(h){r.addStyle("height",h);}r.writeAccessibilityState(R);r.writeClasses();r.writeStyles();r.write(">");this.renderAppointmentsRow(r,R,T);r.write("</div>");};b.renderAppointmentsRow=function(r,R,t){var i=R.getId();r.write("<div id=\""+i+"-Apps\" class=\"sapUiCalendarRowApps\">");this.renderAppointments(r,R,t);r.write("</div>");};b.renderAppointments=function(r,R,t){var A=R._getVisibleAppointments();var I=R._getVisibleIntervalHeaders();var s=R._getStartDate();var n=[];var S=0;var N=0;var c=[];var d=0;var e=0;var f=R.getIntervals();var g=R.getIntervalType();var w=100/f;var i=0;var o=new U(s);var F=false;var l=false;switch(g){case sap.ui.unified.CalendarIntervalType.Hour:n=R.getNonWorkingHours()||[];S=s.getUTCHours();N=24;break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:n=R._getNonWorkingDays();S=s.getUTCDay();N=7;c=R.getNonWorkingHours()||[];d=s.getUTCHours();e=24;break;case sap.ui.unified.CalendarIntervalType.Month:c=R._getNonWorkingDays();d=s.getUTCDay();e=7;break;default:break;}if(g===sap.ui.unified.CalendarIntervalType.OneMonth&&f===1){this.renderSingleDayInterval(r,R,A,t,I,n,S,N,c,d,e,true,true);}else{for(i=0;i<f;i++){if(l){F=true;}else{F=false;}l=false;switch(g){case sap.ui.unified.CalendarIntervalType.Hour:o.setUTCHours(o.getUTCHours()+1);if(o.getUTCHours()==0){l=true;}break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:o.setUTCDate(o.getUTCDate()+1);if(o.getUTCDate()==1){l=true;}break;case sap.ui.unified.CalendarIntervalType.Month:o.setUTCMonth(o.getUTCMonth()+1);if(o.getUTCMonth()==0){l=true;}break;default:break;}this.renderInterval(r,R,i,w,I,n,S,N,c,d,e,F,l);}this.renderIntervalHeaders(r,R,w,I,f);r.write("<div id=\""+R.getId()+"-Now\" class=\"sapUiCalendarRowNow\"></div>");for(i=0;i<A.length;i++){var h=A[i];this.renderAppointment(r,R,h,t);}r.write("<div id=\""+R.getId()+"-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppTitleOnly sapUiCalendarAppDummy\"></div>");}};b.renderInterval=function(r,R,I,w,c,n,s,N,d,S,e,f,l){var g=R.getId()+"-AppsInt"+I;var i;var h=R.getShowIntervalHeaders()&&(R.getShowEmptyIntervalHeaders()||c.length>0);var m=R.getStartDate().getMonth();var D=new Date(R.getStartDate().getFullYear(),m+1,0).getDate();r.write("<div id=\""+g+"\"");r.addClass("sapUiCalendarRowAppsInt");r.addStyle("width",w+"%");if(I>=D&&R.getIntervalType()===sap.ui.unified.CalendarIntervalType.OneMonth){r.addClass("sapUiCalItemOtherMonth");}for(i=0;i<n.length;i++){if((I+s)%N==n[i]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}if(!h){r.addClass("sapUiCalendarRowAppsIntNoHead");}if(f){r.addClass("sapUiCalendarRowAppsIntFirst");}if(l){r.addClass("sapUiCalendarRowAppsIntLast");}r.writeClasses();r.writeStyles();r.write(">");if(h){r.write("<div");r.addClass("sapUiCalendarRowAppsIntHead");r.writeClasses();r.write(">");r.write("</div>");}if(R.getShowSubIntervals()){var k=R.getIntervalType();var o=0;switch(k){case sap.ui.unified.CalendarIntervalType.Hour:o=4;break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:o=24;break;case sap.ui.unified.CalendarIntervalType.Month:var p=R._getStartDate();var t=new U(p);t.setUTCMonth(t.getUTCMonth()+I+1,0);o=t.getUTCDate();t.setUTCDate(1);s=t.getUTCDay();break;default:break;}var u=100/o;for(i=0;i<o;i++){r.write("<div");r.addClass("sapUiCalendarRowAppsSubInt");r.addStyle("width",u+"%");for(var j=0;j<d.length;j++){if((i+S)%e==d[j]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}r.writeStyles();r.writeClasses();r.write(">");r.write("</div>");}}r.write("</div>");};b.renderIntervalHeaders=function(r,R,w,I,c){var s=R.getShowIntervalHeaders()&&(R.getShowEmptyIntervalHeaders()||I.length>0);if(s){for(var i=0;i<I.length;i++){var o=I[i],l,d;if(R._bRTL){d=w*o.interval;l=w*(c-o.last-1);}else{l=w*o.interval;d=w*(c-o.last-1);}this.renderIntervalHeader(r,o,R._bRTL,l,d);}}};b.renderIntervalHeader=function(r,i,R,l,c){var I=i.appointment.getId();r.write("<div");r.addClass("sapUiCalendarRowAppsIntHead");if(l!==undefined){r.addStyle("left",l+"%");}if(c!==undefined){r.addStyle("right",c+"%");}r.writeElementData(i.appointment);r.addClass("sapUiCalendarRowAppsIntHeadFirst");if(i.appointment.getSelected()){r.addClass("sapUiCalendarRowAppsIntHeadSel");}if(i.appointment.getTentative()){r.addClass("sapUiCalendarRowAppsIntHeadTent");}var t=i.appointment.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}var T=i.appointment.getType();if(T&&T!=sap.ui.unified.CalendarDayType.None){r.addClass("sapUiCalendarRowAppsIntHead"+T);}r.writeStyles();r.writeClasses();r.write(">");r.write("<div");r.addClass("sapUiCalendarIntervalHeaderCont");r.writeClasses();r.write(">");var s=i.appointment.getIcon();if(s){var d=["sapUiCalendarRowAppsIntHeadIcon"];var A={};A["id"]=I+"-Icon";A["title"]=null;r.writeIcon(s,d,A);}var e=i.appointment.getTitle();if(e){r.write("<span");r.writeAttribute("id",I+"-Title");r.addClass("sapUiCalendarRowAppsIntHeadTitle");r.writeClasses();r.write(">");r.writeEscaped(e,true);r.write("</span>");}var f=i.appointment.getText();if(f){r.write("<span");r.writeAttribute("id",I+"-Text");r.addClass("sapUiCalendarRowAppsIntHeadText");r.writeClasses();r.write(">");r.writeEscaped(f,true);r.write("</span>");}r.write("</div>");r.write("</div>");};b.renderAppointment=function(r,R,A,t,c){var o=A.appointment;var T=o.getTooltip_AsString();var s=o.getType();var d=o.getTitle();var e=o.getText();var I=o.getIcon();var f=o.getId();var m={labelledby:{value:a._oStaticAppointmentText.getId()+" "+f+"-Descr",append:true}};var g=R.getAriaLabelledBy();if(g.length>0){m["labelledby"].value=m["labelledby"].value+" "+g.join(" ");}if(d){m["labelledby"].value=m["labelledby"].value+" "+f+"-Title";}if(e){m["labelledby"].value=m["labelledby"].value+" "+f+"-Text";}r.write("<div");r.writeElementData(o);r.addClass("sapUiCalendarApp");if(o.getSelected()){r.addClass("sapUiCalendarAppSel");m["selected"]=true;}if(o.getTentative()){r.addClass("sapUiCalendarAppTent");m["labelledby"].value=m["labelledby"].value+" "+a._oStaticTentativeText.getId();}if(!e){r.addClass("sapUiCalendarAppTitleOnly");}if(I){r.addClass("sapUiCalendarAppWithIcon");}if(!c){if(R._bRTL){r.addStyle("right",A.begin+"%");r.addStyle("left",A.end+"%");}else{r.addStyle("left",A.begin+"%");r.addStyle("right",A.end+"%");}}r.writeAttribute("data-sap-level",A.level);if(R._sFocusedAppointmentId==f){r.writeAttribute("tabindex","0");}else{r.writeAttribute("tabindex","-1");}if(T){r.writeAttributeEscaped("title",T);}if(s&&s!=sap.ui.unified.CalendarDayType.None){r.addClass("sapUiCalendarApp"+s);}r.writeAccessibilityState(o,m);r.writeClasses();r.writeStyles();r.write(">");r.write("<div");r.addClass("sapUiCalendarAppCont");r.writeClasses();r.write(">");if(I){var h=["sapUiCalendarAppIcon"];var j={};j["id"]=f+"-Icon";j["title"]=null;r.writeIcon(I,h,j);}if(d){r.write("<span");r.writeAttribute("id",f+"-Title");r.addClass("sapUiCalendarAppTitle");r.writeClasses();r.write(">");r.writeEscaped(d,true);r.write("</span>");}if(e){r.write("<span");r.writeAttribute("id",f+"-Text");r.addClass("sapUiCalendarAppText");r.writeClasses();r.write(">");r.writeEscaped(e,true);r.write("</span>");}var k=R._oRb.getText("CALENDAR_START_TIME")+": "+R._oFormatAria.format(o.getStartDate());k=k+"; "+R._oRb.getText("CALENDAR_END_TIME")+": "+R._oFormatAria.format(o.getEndDate());if(T){k=k+"; "+T;}if(s&&s!=sap.ui.unified.CalendarDayType.None){for(var i=0;i<t.length;i++){var l=t[i];if(l.getType()==s){k=k+"; "+l.getText();break;}}}r.write("<span id=\""+f+"-Descr\" class=\"sapUiInvisibleText\">"+k+"</span>");r.write("</div>");r.write("</div>");};b.renderSingleDayInterval=function(r,R,A,t,I,n,s,N,c,S,d,f,l){var e=1,w=100,g=R.getId()+"-AppsInt"+e,i,h=R.getShowIntervalHeaders()&&(R.getShowEmptyIntervalHeaders()||I.length>0),o=R.getStartDate(),m=o.getMonth(),D=new Date(o.getFullYear(),m+1,0).getDate(),k,p=A.concat(R.getIntervalHeaders().filter(function(B){var E=B.getStartDate().getTime(),F=B.getStartDate().getTime(),G=o.getTime(),H=G+1000*60*60*24;return(E>=G&&E<H)||(F>=G&&F<H);}).map(function(B){return{appointment:B,isHeader:true};})).sort(C._getComparer(o)),u;r.write("<div id=\""+g+"\"");r.addClass("sapUiCalendarRowAppsInt");r.addClass("sapUiCalendarMonthRowAppsS");r.addStyle("width",w+"%");if(e>=D&&R.getIntervalType()===sap.ui.unified.CalendarIntervalType.OneMonth){r.addClass("sapUiCalItemOtherMonth");}for(i=0;i<n.length;i++){if((e+s)%N==n[i]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}if(!h){r.addClass("sapUiCalendarRowAppsIntNoHead");}if(f){r.addClass("sapUiCalendarRowAppsIntFirst");}if(l){r.addClass("sapUiCalendarRowAppsIntLast");}r.writeClasses();r.writeStyles();r.write(">");if(h){r.write("<div");r.addClass("sapUiCalendarRowAppsIntHead");r.writeClasses();r.write(">");r.write("</div>");}for(i=0;i<p.length;i++){u=p[i];r.write("<div class=\"sapUiCalendarAppContainer\">");r.write("<div class=\"sapUiCalendarAppContainerLeft\">");r.write("<div>"+u.appointment._getDateRangeIntersectionText(o)+"</div>");r.write("</div>");r.write("<div class=\"sapUiCalendarAppContainerRight\">");if(u.isHeader){this.renderIntervalHeader(r,u);}else{this.renderAppointment(r,R,u,t,true);}r.write("</div>");r.write("</div>");}if(A.length===0){r.write("<div class=\"sapUiCalendarNoApps\">");k=sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PLANNINGCALENDAR_ROW_NO_APPOINTMENTS");r.write(k);r.write("</div>");}r.write("<div id=\""+R.getId()+"-Now\" class=\"sapUiCalendarRowNow\"></div>");r.write("<div id=\""+R.getId()+"-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppTitleOnly sapUiCalendarAppDummy\" style='margin:0; height:0px;'></div>");if(R.getShowSubIntervals()){var v=R.getIntervalType();var x=0;switch(v){case sap.ui.unified.CalendarIntervalType.Hour:x=4;break;case sap.ui.unified.CalendarIntervalType.Day:case sap.ui.unified.CalendarIntervalType.Week:case sap.ui.unified.CalendarIntervalType.OneMonth:x=24;break;case sap.ui.unified.CalendarIntervalType.Month:var y=new U(o);y.setUTCMonth(y.getUTCMonth()+e+1,0);x=y.getUTCDate();y.setUTCDate(1);s=y.getUTCDay();break;default:break;}var z=100/x;for(i=0;i<x;i++){r.write("<div");r.addClass("sapUiCalendarRowAppsSubInt");r.addStyle("width",z+"%");for(var j=0;j<c.length;j++){if((i+S)%d==c[j]){r.addClass("sapUiCalendarRowAppsNoWork");break;}}r.writeStyles();r.writeClasses();r.write(">");r.write("</div>");}}r.write("</div>");};return b;},true);
