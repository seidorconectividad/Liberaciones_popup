jQuery.sap.require("sap.ui.core.format.DateFormat");
sap.ui.define([], function () {
	"use strict";
	return {
		removeZero: function(sValue) {
			if(sValue==='' || typeof sValue === 'undefined') {
				return '';
			}
			return parseInt(sValue, 10);
		},
		dateReal: function(sDate, sOperation) {
			var _date = new Date(sDate);
			
			if(sOperation==='add') {
				_date.setHours(_date.getHours()+(_date.getTimezoneOffset()/60));
			} else if(sOperation==='subtract'){
				_date.setHours(_date.getHours()-(_date.getTimezoneOffset()/60));
			}
			return _date;
		},
		date_full: function(sDate, sOperation) {
			var _date = new Date(sDate);
			
			if(sOperation==='add') {
				_date.setHours(_date.getHours()+(_date.getTimezoneOffset()/60));
			} else if(sOperation==='subtract'){
				_date.setHours(_date.getHours()-(_date.getTimezoneOffset()/60));
			}
			
			return _date.getFullYear()+'-'+(_date.getMonth()+1)+'-'+_date.getDate()+' '+_date.getHours()+':'+_date.getMinutes()+':'+_date.getSeconds();
		},
		date: function (sDate, sFormat, sOperation) {
			var _date = new Date(sDate);
			if(sOperation==='add') {
				_date.setHours(_date.getHours()+(_date.getTimezoneOffset()/60));
			} else if(sOperation==='subtract'){
				_date.setHours(_date.getHours()-(_date.getTimezoneOffset()/60));
			}
			
			var _format = '';
			switch(sFormat){
				case 'short':
					_format = 'dd-MM-YY';
					break;
				case 'large':
					_format = 'dd-MM-YYYY';
					break;
				default:
					_format = 'dd-MM-YYYY';
					break;
			}
			
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : _format });
			var dateFormatted = dateFormat.format(_date);  
			return dateFormatted;
		},
		time: function (sTime, sFormat, sOperation) {
			var _date = new Date(sTime);
			if(sOperation==='add') {
				_date.setHours(_date.getHours()+(_date.getTimezoneOffset()/60));
			} else if(sOperation==='subtract'){
				_date.setHours(_date.getHours()-(_date.getTimezoneOffset()/60));
			}
			
			var _format = '';
			switch(sFormat){
				case 'short':
					_format = 'KK:mm';
					break;
				case 'large':
					_format = 'kk:mm:ss';
					break;
				default:
					_format = 'KK:mm:ss a';
					break;
			}

            var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: _format});
			return oDateFormat.format(_date);
		},
		datetime: function (sDateTime) {
			var _date = new Date(sDateTime);
			_date.setHours(_date.getHours()+(_date.getTimezoneOffset()/60));
			
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd-MM-YYYY" });
			var dateFormatted = dateFormat.format(_date);  
			var dateFormat2 = sap.ui.core.format.DateFormat.getDateInstance({pattern : "KK:mm:ss a" });
			var dateFormatted2 = dateFormat2.format(_date);  
			return dateFormatted + ' ' + dateFormatted2;
		},
		dateString: function (sDate) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd-MM-YYYY" });
			var dateFormatted = dateFormat.format(sDate);  
			return dateFormatted;
		},
		timeString: function (sTime) {
            var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "KK:mm:ss a"});
			return oDateFormat.format(new Date(sTime.ms));
		},
		nullToNumber: function (sNull) {
            if(sNull == null) {
            	sNull = 0;
            }
			return sNull;
		},
		money: function (sValue) {
			return numeral(sValue).format('0.00');
		},
		currencyValue : function (sValue) {
			if (!sValue) {
				sValue = 0;
			}
			//Ajusta a 2 decimales y agrega comas separadoras de miles
			return parseFloat(sValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	}
});