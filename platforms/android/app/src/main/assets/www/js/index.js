/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
      /*
        cordova.plugins.notification.local.on("click", function(notification) {

            if (window.AppController) {
                if (notification.id == 1) {
                    window.AppController.goSolpeds();
                }

                if (notification.id == 2) {
                    window.AppController.goOC();
                }

                if (notification.id == 3) {
                    window.AppController.goPV();
                }

                if (notification.id == 4) {
                    window.AppController.goNC();
                }
            }


        });
        */
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        this.notificacion();
        console.log('Received Event: ' + id);
    },
    notificacion: function() {
        var self = this;

        setInterval(function() {
            if (!localStorage.userApp) {
                return;
            }
            var oModel = new sap.ui.model.odata.ODataModel("https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/Prodac/.xsodata");
            oModel.read("/VKPI?$filter=USUARIO eq '" + localStorage.userApp + "'", {
                method: "GET",
                success: function(data) {

                    var dataOut = data.results;
                    var sum = 0;
                    for (var i = 0; i < dataOut.length; i++) {
                        var item = dataOut[i];

                        if (item.GRUPO === "03") {
                            self.utilNotfi(1, "Hay " + item.NUMDOCS + " liberaciones de Solpeds");
                            sum = sum + item.NUMDOCS;
                        }

                        if (item.GRUPO === "04") {
                            self.utilNotfi(2, "Hay " + item.NUMDOCS + " liberaciones 0C");
                            sum = sum + item.NUMDOCS;
                        }

                        if (item.GRUPO === "05") {
                            self.utilNotfi(3, "Hay " + item.NUMDOCS + " liberaciones de pedido de venta");
                            sum = sum + item.NUMDOCS;
                        }

                    }

                    //cordova.plugins.notification.badge.set(sum);

                    var cantidad = self.loadDataLiberacionesNC();
                    if(cantidad<0) {
                      cantidad = 0;
                    }

                    if (cantidad > 0) {
                        self.utilNotfi(4, "Hay " + cantidad + " liberaciones de nota de credito");
                        //cordova.plugins.notification.badge.increase(cantidad);
                    }

                }
            });



        }, 60000);

    },
    utilNotfi: function(id, mensaje) {
        /*
        cordova.plugins.notification.local.schedule({
            id: id,
            title: "Prodac Liberaciones",
            message: mensaje,
            sound: "file://sounds/message.mp3",
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABLUlEQVQ4T6WSMU7DMBiF32+kCqlLuQFH6NQNZEYogzkB5QRtTtJwgpYT4IHCGEO3sKQ34AaUoagIkYccSKBqUBLhxZas9/z8/U/wzyVlem2ijrNHyzrehUEu8jvxGqXA5dz2p1UmmcGBmQ0UMBSoMyK9Jrh4sKcDfxfGbywzIXgf9HZ1keDQ3ExF5JzkVS72wvHjuy5NQS6DXivZYOCT1In927AUok9DKDu3J7Ymg1sDsONf//oKusK29pMYx2snwBYHQi2CXmuUJcjIy8qBeIZgLxdnDOK1K0+hksIgN0mxChXao7od8Lo/ijTr+ktn+0ktBtr8CPyZYJRCAs/Ej3GH2ww+wJdijFmRBCHBoRBhLm5UpG+TSUpcNOnCBgNt7vadPX6q+ndlkZoYfAKg0ZcRelPl9gAAAABJRU5ErkJggg=="
        });
        */
    },
    loadDataLiberacionesNC: function() {

        var cantidad = 0;
        var sUser = window.userApp;
        var ajaxRequest = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\
						   <soap:Header/>\
						   <soap:Body>\
						      <urn:ZSD_RFC_LIST_SNC_PEND>\
						         <GI_USER>' + sUser + '</GI_USER>\
						         <TE_ITAB>\
						            <item>\
						               <VBELN></VBELN>\
						               <AUART></AUART>\
						               <BEZEI></BEZEI>\
						               <ERDAT></ERDAT>\
						               <KUNNR></KUNNR>\
						               <RAZON_SOCIAL></RAZON_SOCIAL>\
						               <NETWR></NETWR>\
						               <MONEDA></MONEDA>\
						            </item>\
						         </TE_ITAB>\
						      </urn:ZSD_RFC_LIST_SNC_PEND>\
						   </soap:Body>\
						</soap:Envelope>';

        // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_list_snc_pend/130/zsd_rfc_list_snc_pend/zsd_rfc_list_snc_pend',
        jQuery.ajax({
            url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_list_snc_pend/100/zsd_rfc_list_snc_pend/zsd_rfc_list_snc_pend',
            async: false,
            type: "POST",
            processData: false,
            data: ajaxRequest,
            dataType: 'xml',
            contentType: 'application/soap+xml',
            success: function(data, textStatus, jqXHR) {
                var dataSoap = [];
                var sItems = jQuery(jqXHR.responseXML).find("TE_ITAB item");
                cantidad = sItems.length;
                var nDocsLength = jQuery(jqXHR.responseXML).find("TE_ITAB item VBELN").text().length;
                if( cantidad == 1 ) {
                  if( nDocsLength == 0 ) {
                    cantidad = 0;
                  }
                }
            },
            error: function(e, xhr, status) {
                cantidad = 0;
            }
        });

        return cantidad;

    }
};

app.initialize();
