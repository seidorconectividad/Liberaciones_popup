/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Element','sap/ui/Device','./library'],function(q,E,D,l){"use strict";var T={TableUtils:null,initColumnUtils:function(t){if(!t._oColumnInfo){T.updateColumnInfo(t,T.collectColumnInfo(t));}},invalidateColumnUtils:function(t){t._oColumnInfo=null;},updateColumnInfo:function(t,c){t._oColumnInfo=c;},collectColumnInfo:function(t){return{columnCount:t.getColumns().length,visibleColumnCount:T.TableUtils.getVisibleColumnCount(t),columnMap:T._getColumnMap(t)};},_getColumnMap:function(t){var i;var c;var C={};var o={};var a=t.getColumns();var m=T.TableUtils.getHeaderRowCount(t);var p={};for(var b=0;b<a.length;b++){c=a[b];C={};C.id=c.getId();C.column=c;C.levelInfo=[];C.parents=[];for(var L=0;L<m;L++){C.levelInfo[L]={};C.levelInfo[L].spannedColumns=[];var h=T.getHeaderSpan(c,L);for(i=1;i<h;i++){var s=a[b+i];if(s){var P=s.getId();C.levelInfo[L].spannedColumns.push(a[b+i]);if(!p[P]){p[P]=[];}p[P].push({column:c,level:L});}}}o[C.id]=C;}var d=Object.keys(p);for(i=0;i<d.length;i++){var e=d[i];o[e].parents=p[e];}return o;},_getColumnMapItem:function(t,c){T.initColumnUtils(t);var s=t._oColumnInfo.columnMap[c];if(!s){q.sap.log.error("Column with ID '"+c+"' not found",t);}else{return s;}},getParentSpannedColumns:function(t,c,L){var C=T._getColumnMapItem(t,c);if(!C){return undefined;}var p=[];for(var i=0;i<C.parents.length;i++){var P=C.parents[i];if(L===undefined||P.level===L){p.push(P);}}return p;},getChildrenSpannedColumns:function(t,c,L){var C=T._getColumnMapItem(t,c);if(!C){return undefined;}var a=[];var e;if(L===undefined){e=C.levelInfo.length;}else{e=L+1;}for(var i=L||0;i<e;i++){var o=C.levelInfo[i];for(var j=0;j<o.spannedColumns.length;j++){a.push({column:o.spannedColumns[j],level:i});}}return a;},getHeaderSpan:function(c,L){var h=c.getHeaderSpan();var H;if(!h){return 1;}if(!Array.isArray(h)){h=(h+"").split(",");}function g(s){var r=parseInt(s,10);return isNaN(r)?1:r;}if(isNaN(L)){H=Math.max.apply(null,h.map(g));}else{H=g(h[L]);}return Math.max(H,1);},getMaxHeaderSpan:function(c){var m=1;var h=c.getHeaderSpan();if(!q.isArray(h)){h=[h];}for(var i=0;i<h.length;i++){m=Math.max(m,parseInt(h[i],10));}return m;},hasHeaderSpan:function(c){return T.getMaxHeaderSpan(c)>1;},getColumnBoundaries:function(t,c){var C=T._getColumnMapItem(t,c);if(!C){return undefined;}var m={};if(c){m[c]=C.column;}var f=function(m,n){var o;var i;var g=[];n=n||[];for(i=0;i<n.length;i++){o=m[n[i]];g=g.concat(T.getParentSpannedColumns(t,o.getId()));g=g.concat(T.getChildrenSpannedColumns(t,o.getId()));}n=[];for(i=0;i<g.length;i++){o=g[i].column;var c=o.getId();if(!m[c]){n.push(c);m[c]=o;}}if(n.length>0){return f(m,n);}else{return m;}};m=f(m,[c]);var a=t.indexOfColumn(C.column);var b={startColumn:C.column,startIndex:a,endColumn:C.column,endIndex:-1};var d=t.getColumns();var k=Object.getOwnPropertyNames(m);for(var i=0;i<k.length;i++){var o=m[k[i]];a=t.indexOfColumn(o);var h=T.getMaxHeaderSpan(o);if(a<b.startIndex){b.startIndex=a;b.startColumn=o;}var e=a+h-1;if(e>b.endIndex){b.endIndex=e;b.endColumn=d[e];}}return b;},isColumnMovable:function(c){var t=c.getParent();if(!t||!t.getEnableColumnReordering()){return false;}var C=t.indexOfColumn(c);if(C<t.getFixedColumnCount()||C<t._iFirstReorderableIndex){return false;}if(T.hasHeaderSpan(c)||T.getParentSpannedColumns(t,c.getId()).length!=0){return false;}return true;},_normalizeColumnMoveTargetIndex:function(c,n){var t=c.getParent(),C=t.indexOfColumn(c),a=t.getColumns();if(n>C){n--;}if(n<0){n=0;}else if(n>a.length){n=a.length;}return n;},isColumnMovableTo:function(c,n){var t=c.getParent();if(!t||n===undefined||!T.isColumnMovable(c)){return false;}n=T._normalizeColumnMoveTargetIndex(c,n);if(n<t.getFixedColumnCount()||n<t._iFirstReorderableIndex){return false;}var C=t.indexOfColumn(c),a=t.getColumns();if(n>C){var b=a[n>=a.length?a.length-1:n];var o=T.getColumnBoundaries(t,b.getId());if(T.hasHeaderSpan(b)||o.endIndex>n){return false;}}else{var A=a[n];if(T.getParentSpannedColumns(t,A.getId()).length!=0){return false;}}return true;},moveColumnTo:function(c,n){if(!T.isColumnMovableTo(c,n)){return false;}var t=c.getParent(),C=t.indexOfColumn(c);if(n===C){return false;}n=T._normalizeColumnMoveTargetIndex(c,n);var e=t.fireColumnMove({column:c,newPos:n});if(!e){return false;}t._bReorderInProcess=true;t.removeColumn(c);t.insertColumn(c,n);t._bReorderInProcess=false;return true;},getMinColumnWidth:function(){if(this._iColMinWidth){return this._iColMinWidth;}this._iColMinWidth=48;if(!D.system.desktop){this._iColMinWidth=88;}return this._iColMinWidth;},resizeColumn:function(t,c,w,f,C){if(t==null||c==null||c<0||w==null||w<=0){return false;}if(C==null||C<=0){C=1;}if(f==null){f=true;}var a=t.getColumns();if(c>=a.length||!a[c].getVisible()){return false;}var v=[];for(var i=c;i<a.length;i++){var o=a[i];if(o.getVisible()){v.push(o);if(v.length===C){break;}}}var r=[];for(var i=0;i<v.length;i++){var V=v[i];if(V.getResizable()){r.push(V);}}if(r.length===0){return false;}var s=0;for(var i=0;i<v.length;i++){var V=v[i];s+=T.getColumnWidth(t,V.getIndex());}var p=w-s;var S=Math.round(p/r.length);var R=false;var b=t.getDomRef();if(!T.TableUtils.isFixedColumn(t,c)){t._getVisibleColumns().forEach(function(m){var u=m.getWidth(),x;if(b&&r.indexOf(m)<0&&T.TableUtils.isVariableWidth(u)){x=b.querySelector('th[data-sap-ui-colid="'+m.getId()+'"]');if(x){m._minWidth=Math.max(x.offsetWidth,T.getMinColumnWidth());}}});}for(var i=0;i<r.length;i++){var d=r[i];var e=T.getColumnWidth(t,d.getIndex());var n=e+S;var g=T.getMinColumnWidth();if(n<g){n=g;}var W=n-e;if(Math.abs(W)<Math.abs(S)){var h=r.length-(i+1);p-=W;S=Math.round(p/h);}if(W!==0){var j=true;var k=n+"px";if(f){j=t.fireColumnResize({column:d,width:k});}if(j){d.setWidth(k);R=true;}}}return R;},getColumnWidth:function(t,c){if(t==null||c==null||c<0){return null;}var C=t.getColumns();if(c>=C.length){return null;}var o=C[c];var s=o.getWidth();if(s===""||s==="auto"||s.match(/%$/)){if(o.getVisible()){var a=o.getDomRef();return a!=null?a.offsetWidth:0;}else{return 0;}}else{return t._CSSSizeToPixel(s);}},getFixedColumnCount:function(t,c){var f=t.getFixedColumnCount();if(!c){return f;}if(f<=0||t._bIgnoreFixedColumnCount){return 0;}var C=t.getColumns();var v=0;f=Math.min(f,C.length);for(var i=0;i<f;i++){if(C[i].shouldRender()){v++;}}return v;}};return T;},true);
