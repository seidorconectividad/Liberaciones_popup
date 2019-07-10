/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
if(window.jQuery&&window.jQuery.sap&&window.jQuery.sap.declare){window.jQuery.sap.declare("sap.ui.Device",false);}if(typeof window.sap!=="object"&&typeof window.sap!=="function"){window.sap={};}if(typeof window.sap.ui!=="object"){window.sap.ui={};}(function(){"use strict";if(typeof window.sap.ui.Device==="object"||typeof window.sap.ui.Device==="function"){var c="1.44.12";window.sap.ui.Device._checkAPIVersion(c);return;}var d={};function p(i,w){return("000"+String(i)).slice(-w);}var F=0,E=1,W=2,I=3,D=4,T=5;var g=function(){this.defaultComponent='DEVICE';this.sWindowName=(window.top==window)?"":"["+window.location.pathname.split('/').slice(-1)[0]+"] ";this.log=function(i,s,a){a=a||this.defaultComponent||'';var b=new Date(),e={time:p(b.getHours(),2)+":"+p(b.getMinutes(),2)+":"+p(b.getSeconds(),2),date:p(b.getFullYear(),4)+"-"+p(b.getMonth()+1,2)+"-"+p(b.getDate(),2),timestamp:b.getTime(),level:i,message:s||"",component:a||""};if(window.console){var f=e.date+" "+e.time+" "+this.sWindowName+e.message+" - "+e.component;switch(i){case F:case E:console.error(f);break;case W:console.warn(f);break;case I:console.info?console.info(f):console.log(f);break;case D:console.debug?console.debug(f):console.log(f);break;case T:console.trace?console.trace(f):console.log(f);break;}}return e;};};var l=new g();l.log(I,"Device API logging initialized");d._checkAPIVersion=function(s){var v="1.44.12";if(v!=s){l.log(W,"Device API version differs: "+v+" <-> "+s);}};var h={};function j(e,f,a){if(!h[e]){h[e]=[];}h[e].push({oListener:a,fFunction:f});}function k(e,f,a){var b=h[e];if(!b){return this;}for(var i=0,q=b.length;i<q;i++){if(b[i].fFunction===f&&b[i].oListener===a){b.splice(i,1);break;}}if(b.length==0){delete h[e];}}function n(e,a){var b=h[e],f;if(b){b=b.slice();for(var i=0,q=b.length;i<q;i++){f=b[i];f.fFunction.call(f.oListener||window,a);}}}var O={"WINDOWS":"win","MACINTOSH":"mac","LINUX":"linux","IOS":"iOS","ANDROID":"Android","BLACKBERRY":"bb","WINDOWS_PHONE":"winphone"};function o(a){a=a||navigator.userAgent;var b,e;function f(){var s=navigator.platform;if(s.indexOf("Win")!=-1){var t=/Windows NT (\d+).(\d)/i;var v=a.match(t);var w="";if(v[1]=="6"){if(v[2]==1){w="7";}else if(v[2]>1){w="8";}}else{w=v[1];}return{"name":O.WINDOWS,"versionStr":w};}else if(s.indexOf("Mac")!=-1){return{"name":O.MACINTOSH,"versionStr":""};}else if(s.indexOf("Linux")!=-1){return{"name":O.LINUX,"versionStr":""};}l.log(I,"OS detection returned no result");return null;}b=/Windows Phone (?:OS )?([\d.]*)/;e=a.match(b);if(e){return({"name":O.WINDOWS_PHONE,"versionStr":e[1]});}if(a.indexOf("(BB10;")>0){b=/\sVersion\/([\d.]+)\s/;e=a.match(b);if(e){return{"name":O.BLACKBERRY,"versionStr":e[1]};}else{return{"name":O.BLACKBERRY,"versionStr":'10'};}}b=/\(([a-zA-Z ]+);\s(?:[U]?[;]?)([\D]+)((?:[\d._]*))(?:.*[\)][^\d]*)([\d.]*)\s/;e=a.match(b);if(e){var i=/iPhone|iPad|iPod/;var q=/PlayBook|BlackBerry/;if(e[0].match(i)){e[3]=e[3].replace(/_/g,".");return({"name":O.IOS,"versionStr":e[3]});}else if(e[2].match(/Android/)){e[2]=e[2].replace(/\s/g,"");return({"name":O.ANDROID,"versionStr":e[3]});}else if(e[0].match(q)){return({"name":O.BLACKBERRY,"versionStr":e[4]});}}b=/\((Android)[\s]?([\d][.\d]*)?;.*Firefox\/[\d][.\d]*/;e=a.match(b);if(e){return({"name":O.ANDROID,"versionStr":e.length==3?e[2]:""});}return f();}function r(a){d.os=o(a)||{};d.os.OS=O;d.os.version=d.os.versionStr?parseFloat(d.os.versionStr):-1;if(d.os.name){for(var b in O){if(O[b]===d.os.name){d.os[b.toLowerCase()]=true;}}}}r();d._setOS=r;var B={"INTERNET_EXPLORER":"ie","EDGE":"ed","FIREFOX":"ff","CHROME":"cr","SAFARI":"sf","ANDROID":"an"};var u=navigator.userAgent;
/*!
	 * Taken from jQuery JavaScript Library v1.7.1
	 * http://jquery.com/
	 *
	 * Copyright 2011, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 * Copyright 2011, The Dojo Foundation
	 * Released under the MIT, BSD, and GPL Licenses.
	 *
	 * Date: Mon Nov 21 21:11:03 2011 -0500
	 */
function y(a){var b=(a||u).toLowerCase();var e=/(webkit)[ \/]([\w.]+)/;var f=/(opera)(?:.*version)?[ \/]([\w.]+)/;var i=/(msie) ([\w.]+)/;var q=/(trident)\/[\w.]+;.*rv:([\w.]+)/;var s=/(edge)[ \/]([\w.]+)/;var t=/(mozilla)(?:.*? rv:([\w.]+))?/;var v=s.exec(b)||q.exec(b)||e.exec(b)||f.exec(b)||i.exec(b)||b.indexOf("compatible")<0&&t.exec(b)||[];var w={browser:v[1]||"",version:v[2]||"0"};w[w.browser]=true;return w;}function z(a,e){var b=y(a);var f=a||u;var i=e||window.navigator;var q;if(b.mozilla){q=/Mobile/;if(f.match(/Firefox\/(\d+\.\d+)/)){var v=parseFloat(RegExp.$1);return{name:B.FIREFOX,versionStr:""+v,version:v,mozilla:true,mobile:q.test(f)};}else{return{mobile:q.test(f),mozilla:true,version:-1};}}else if(b.webkit){var s=f.toLowerCase().match(/webkit[\/]([\d.]+)/);var w;if(s){w=s[1];}q=/Mobile/;if(f.match(/(Chrome|CriOS)\/(\d+\.\d+).\d+/)){var v=parseFloat(RegExp.$2);return{name:B.CHROME,versionStr:""+v,version:v,mobile:q.test(f),webkit:true,webkitVersion:w};}else if(f.match(/FxiOS\/(\d+\.\d+)/)){var v=parseFloat(RegExp.$1);return{name:B.FIREFOX,versionStr:""+v,version:v,mobile:true,webkit:true,webkitVersion:w};}else if(f.match(/Android .+ Version\/(\d+\.\d+)/)){var v=parseFloat(RegExp.$1);return{name:B.ANDROID,versionStr:""+v,version:v,mobile:q.test(f),webkit:true,webkitVersion:w};}else{var t=/(Version|PhantomJS)\/(\d+\.\d+).*Safari/;var x=i.standalone;if(t.test(f)){var v1=t.exec(f);var v=parseFloat(v1[2]);return{name:B.SAFARI,versionStr:""+v,fullscreen:false,webview:false,version:v,mobile:q.test(f),webkit:true,webkitVersion:w,phantomJS:v1[1]==="PhantomJS"};}else if(/iPhone|iPad|iPod/.test(f)&&!(/CriOS/.test(f))&&!(/FxiOS/.test(f))&&(x===true||x===false)){return{name:B.SAFARI,version:-1,fullscreen:x,webview:!x,mobile:q.test(f),webkit:true,webkitVersion:w};}else{return{mobile:q.test(f),webkit:true,webkitVersion:w,version:-1};}}}else if(b.msie||b.trident){var v;if(document.documentMode&&!a){if(document.documentMode===7){v=8.0;}else{v=parseFloat(document.documentMode);}}else{v=parseFloat(b.version);}return{name:B.INTERNET_EXPLORER,versionStr:""+v,version:v,msie:true,mobile:false};}else if(b.edge){var v=v=parseFloat(b.version);return{name:B.EDGE,versionStr:""+v,version:v,edge:true};}return{name:"",versionStr:"",version:-1,mobile:false};}d._testUserAgent=z;function A(){d.browser=z();d.browser.BROWSER=B;if(d.browser.name){for(var b in B){if(B[b]===d.browser.name){d.browser[b.toLowerCase()]=true;}}}}A();d.support={};d.support.touch=!!(('ontouchstart'in window)||window.DocumentTouch&&document instanceof window.DocumentTouch);if(d.browser.phantomJS){d.support.touch=false;}d.support.pointer=!!window.PointerEvent;if(d.browser.name==B.CHROME&&d.browser.version>=55){d.support.pointer=false;}d.support.matchmedia=!!window.matchMedia;var m=d.support.matchmedia?window.matchMedia("all and (max-width:0px)"):null;d.support.matchmedialistener=!!(m&&m.addListener);if(d.browser.safari&&d.browser.version<6&&!d.browser.fullscreen&&!d.browser.webview){d.support.matchmedialistener=false;}d.support.orientation=!!("orientation"in window&&"onorientationchange"in window);d.support.retina=(window.retina||window.devicePixelRatio>=2);d.support.websocket=('WebSocket'in window);d.support.input={};d.support.input.placeholder=('placeholder'in document.createElement("input"));d.media={};var R={"SAP_3STEPS":"3Step","SAP_4STEPS":"4Step","SAP_6STEPS":"6Step","SAP_STANDARD":"Std","SAP_STANDARD_EXTENDED":"StdExt"};d.media.RANGESETS=R;d.media._predefinedRangeSets={};d.media._predefinedRangeSets[R.SAP_3STEPS]={points:[520,960],unit:"px",name:R.SAP_3STEPS,names:["S","M","L"]};d.media._predefinedRangeSets[R.SAP_4STEPS]={points:[520,760,960],unit:"px",name:R.SAP_4STEPS,names:["S","M","L","XL"]};d.media._predefinedRangeSets[R.SAP_6STEPS]={points:[241,400,541,768,960],unit:"px",name:R.SAP_6STEPS,names:["XS","S","M","L","XL","XXL"]};d.media._predefinedRangeSets[R.SAP_STANDARD]={points:[600,1024],unit:"px",name:R.SAP_STANDARD,names:["Phone","Tablet","Desktop"]};d.media._predefinedRangeSets[R.SAP_STANDARD_EXTENDED]={points:[600,1024,1440],unit:"px",name:R.SAP_STANDARD_EXTENDED,names:["Phone","Tablet","Desktop","LargeDesktop"]};var _=R.SAP_STANDARD;var C=d.support.matchmedialistener?0:100;var G={};var H=null;function J(f,t,a){a=a||"px";var q="all";if(f>0){q=q+" and (min-width:"+f+a+")";}if(t>0){q=q+" and (max-width:"+t+a+")";}return q;}function K(a){if(!d.support.matchmedialistener&&H==Q()[0]){return;}if(G[a].timer){clearTimeout(G[a].timer);G[a].timer=null;}G[a].timer=setTimeout(function(){var b=M(a,false);if(b){n("media_"+a,b);}},C);}function L(s,i){var q=G[s].queries[i];var a={from:q.from,unit:G[s].unit};if(q.to>=0){a.to=q.to;}if(G[s].names){a.name=G[s].names[i];}return a;}function M(a,b){if(G[a]){var e=G[a].queries;var f=null;for(var i=0,s=e.length;i<s;i++){var q=e[i];if((q!=G[a].currentquery||b)&&d.media.matches(q.from,q.to,G[a].unit)){if(!b){G[a].currentquery=q;}if(!G[a].noClasses&&G[a].names&&!b){N(a,G[a].names[i]);}f=L(a,i);}}return f;}l.log(W,"No queryset with name "+a+" found",'DEVICE.MEDIA');return null;}function N(s,a,b){var e="sapUiMedia-"+s+"-";P(e+a,b,e);}function P(s,b,a){var e=document.documentElement;if(e.className.length==0){if(!b){e.className=s;}}else{var f=e.className.split(" ");var q="";for(var i=0;i<f.length;i++){if((a&&f[i].indexOf(a)!=0)||(!a&&f[i]!=s)){q=q+f[i]+" ";}}if(!b){q=q+s;}e.className=q;}}function Q(){return[window.innerWidth,window.innerHeight];}function S(v,a){if(a==="em"||a==="rem"){var s=window.getComputedStyle||function(e){return e.currentStyle;};var x=s(document.documentElement).fontSize;var f=(x&&x.indexOf("px")>=0)?parseFloat(x,10):16;return v*f;}return v;}function U(f,t,e){f=S(f,e);t=S(t,e);var w=Q()[0];var a=f<0||f<=w;var b=t<0||w<=t;return a&&b;}function V(f,t,a){var q=J(f,t,a);var b=window.matchMedia(q);return b&&b.matches;}d.media.matches=d.support.matchmedia?V:U;d.media.attachHandler=function(f,a,s){var b=s||_;j("media_"+b,f,a);};d.media.detachHandler=function(f,a,s){var b=s||_;k("media_"+b,f,a);};d.media.initRangeSet=function(s,a,b,e,f){var t;if(!s){t=d.media._predefinedRangeSets[_];}else if(s&&d.media._predefinedRangeSets[s]){t=d.media._predefinedRangeSets[s];}else{t={name:s,unit:(b||"px").toLowerCase(),points:a||[],names:e,noClasses:!!f};}if(d.media.hasRangeSet(t.name)){l.log(I,"Range set "+t.name+" hase already been initialized",'DEVICE.MEDIA');return;}s=t.name;t.queries=[];t.timer=null;t.currentquery=null;t.listener=function(){return K(s);};var v,w,x;var v1=t.points;for(var i=0,w1=v1.length;i<=w1;i++){v=(i==0)?0:v1[i-1];w=(i==v1.length)?-1:v1[i];x=J(v,w,t.unit);t.queries.push({query:x,from:v,to:w});}if(t.names&&t.names.length!=t.queries.length){t.names=null;}G[t.name]=t;if(d.support.matchmedialistener){var x1=t.queries;for(var i=0;i<x1.length;i++){var q=x1[i];q.media=window.matchMedia(q.query);q.media.addListener(t.listener);}}else{if(window.addEventListener){window.addEventListener("resize",t.listener,false);window.addEventListener("orientationchange",t.listener,false);}else{window.attachEvent("onresize",t.listener);}}t.listener();};d.media.getCurrentRange=function(s){if(!d.media.hasRangeSet(s)){return null;}return M(s,true);};d.media.hasRangeSet=function(s){return s&&!!G[s];};d.media.removeRangeSet=function(s){if(!d.media.hasRangeSet(s)){l.log(I,"RangeSet "+s+" not found, thus could not be removed.",'DEVICE.MEDIA');return;}for(var x in R){if(s===R[x]){l.log(W,"Cannot remove default rangeset - no action taken.",'DEVICE.MEDIA');return;}}var a=G[s];if(d.support.matchmedialistener){var q=a.queries;for(var i=0;i<q.length;i++){q[i].media.removeListener(a.listener);}}else{if(window.removeEventListener){window.removeEventListener("resize",a.listener,false);window.removeEventListener("orientationchange",a.listener,false);}else{window.detachEvent("onresize",a.listener);}}N(s,"",true);delete h["media_"+s];delete G[s];};var X={"TABLET":"tablet","PHONE":"phone","DESKTOP":"desktop","COMBI":"combi"};d.system={};function Y(a,b){var t=Z(b);var i=d.os.windows&&d.os.version>=8;var e=d.os.windows&&d.os.version===7;var s={};s.tablet=!!(((d.support.touch&&!e)||i||!!a)&&t);s.phone=!!(d.os.windows_phone||((d.support.touch&&!e)||!!a)&&!t);s.desktop=!!((!s.tablet&&!s.phone)||i||e);s.combi=!!(s.desktop&&s.tablet);s.SYSTEMTYPE=X;for(var f in X){P("sap-"+X[f],!s[X[f]]);}return s;}function Z(a){var u=a||navigator.userAgent;var i=d.os.windows&&d.os.version>=8;if(d.os.name===d.os.OS.IOS){return/ipad/i.test(u);}else{if(d.support.touch){if(i){return true;}if(d.browser.chrome&&d.os.android&&d.os.version>=4.4){return!/Mobile Safari\/[.0-9]+/.test(u);}else{var b=window.devicePixelRatio?window.devicePixelRatio:1;if(d.os.android&&d.browser.webkit&&(parseFloat(d.browser.webkitVersion)>537.10)){b=1;}var t=(Math.min(window.screen.width/b,window.screen.height/b)>=600);if(r1()&&(window.screen.height===552||window.screen.height===553)&&(/Nexus 7/i.test(u))){t=true;}return t;}}else{var e=(/(?=android)(?=.*mobile)/i.test(u));return(d.browser.msie&&u.indexOf("Touch")!==-1)||(d.os.android&&!e);}}}function $(a,b){d.system=Y(a,b);if(d.system.tablet||d.system.phone){d.browser.mobile=true;}}$();d._getSystem=Y;d.orientation={};d.resize={};d.orientation.attachHandler=function(f,a){j("orientation",f,a);};d.resize.attachHandler=function(f,a){j("resize",f,a);};d.orientation.detachHandler=function(f,a){k("orientation",f,a);};d.resize.detachHandler=function(f,a){k("resize",f,a);};function a1(i){i.landscape=r1(true);i.portrait=!i.landscape;}function b1(){a1(d.orientation);n("orientation",{landscape:d.orientation.landscape});}function c1(){d1(d.resize);n("resize",{height:d.resize.height,width:d.resize.width});}function d1(i){i.width=Q()[0];i.height=Q()[1];}function e1(){var w=d.orientation.landscape;var i=r1();if(w!=i){b1();}if(!j1){j1=window.setTimeout(f1,150);}}function f1(){c1();j1=null;}var g1=false;var h1=false;var i1;var j1;var k1;var l1=Q()[1];var m1=Q()[0];var n1=false;var o1;var p1=/INPUT|TEXTAREA|SELECT/;var q1=d.os.ios&&d.browser.name==="sf"&&((d.system.phone&&d.os.version>=7&&d.os.version<7.1)||(d.system.tablet&&d.os.version>=7));function r1(f){if(d.support.touch&&d.support.orientation&&d.os.android){if(n1&&f){return!d.orientation.landscape;}if(n1){return d.orientation.landscape;}}else if(d.support.matchmedia&&d.support.orientation){return!!window.matchMedia("(orientation: landscape)").matches;}var s=Q();return s[0]>s[1];}function s1(e){if(e.type=="resize"){if(q1&&p1.test(document.activeElement.tagName)&&!g1){return;}var w=Q()[1];var i=Q()[0];var t=new Date().getTime();if(w===l1&&i===m1){return;}h1=true;if((l1!=w)&&(m1==i)){if(!o1||(t-o1>300)){n1=(w<l1);}c1();}else{m1=i;}o1=t;l1=w;if(k1){window.clearTimeout(k1);k1=null;}k1=window.setTimeout(u1,1200);}else if(e.type=="orientationchange"){g1=true;}if(i1){clearTimeout(i1);i1=null;}i1=window.setTimeout(t1,50);}function t1(){if(h1&&(g1||(d.system.tablet&&d.os.ios&&d.os.version>=9))){b1();c1();g1=false;h1=false;if(k1){window.clearTimeout(k1);k1=null;}}i1=null;}function u1(){g1=false;h1=false;k1=null;}d._update=function(a){u=navigator.userAgent;l.log(W,"Device API values manipulated: NOT PRODUCTIVE FEATURE!!! This should be only used for test purposes. Only use if you know what you are doing.");A();r();$(a);};d1(d.resize);a1(d.orientation);window.sap.ui.Device=d;if(d.support.touch&&d.support.orientation){window.addEventListener("resize",s1,false);window.addEventListener("orientationchange",s1,false);}else{if(window.addEventListener){window.addEventListener("resize",e1,false);}else{window.attachEvent("onresize",e1);}}d.media.initRangeSet();d.media.initRangeSet(R["SAP_STANDARD_EXTENDED"]);if(sap.ui.define){sap.ui.define("sap/ui/Device",[],function(){return d;});}}());
