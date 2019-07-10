sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "appmenuliberaciones/controller/jquery.soap",
    "appmenuliberaciones/controller/xml2json"
], function(Controller, Soap, xml2json) {
    "use strict";

    return Controller.extend("appmenuliberaciones.controller.App", {
        onInit: function() {
            //this.getView().byId("frame").setContent('<iframe class="frame_app" src="../../../APP/Solpeds/webapp/index.html"></iframe>');
            //this.getView().byId("dlg_liberacion_solped").open();

        },

        onAfterRendering: function() {
            var sUsuario = localStorage.userApp;
            if (sUsuario == undefined) {
                sUsuario = "";
            }

            console.log("sUsuario = ", sUsuario);

            if (sUsuario === '') {
                this.onLoginDialog();
            } else {
                window.userApp = sUsuario;
                this.getView().byId("shellUsuario").setUsername(sUsuario);
                this.getView().byId("shellUsuario2").setUsername(sUsuario);
                this.loadKpi();
                var self = this;
                setTimeout(function() {
                    setInterval(function() {
                        self.loadKpi();
                    }, 120000)
                }, 120000);
            }

            window.AppController = this;
        },
        loadKpi: function(val) {

            var self = this;
            self.getView().byId("tile_sp").setNumber("0");
            self.getView().byId("tile_oc").setNumber("0");
            self.getView().byId("tile_pv").setNumber("0");
            self.getView().byId("tile_nc").setNumber("0");
            self.getView().byId("tile_sp").setBusy(true);
            self.getView().byId("tile_oc").setBusy(true);
            self.getView().byId("tile_pv").setBusy(true);
            self.getView().byId("tile_nc").setBusy(true);
            self.getView().byId("tile_sp").setBusyIndicatorDelay(0);
            self.getView().byId("tile_oc").setBusyIndicatorDelay(0);
            self.getView().byId("tile_pv").setBusyIndicatorDelay(0);
            self.getView().byId("tile_nc").setBusyIndicatorDelay(0);
            self.getView().byId("tile_sp").setNumber(0);
            //busyIndicatorDelay
            var oModel = new sap.ui.model.odata.ODataModel("https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/Prodac/.xsodata");
            oModel.read("/VKPI?$filter=USUARIO eq '" + window.userApp + "'", {
                method: "GET",
                success: function(data) {
                    console.warn("SUCCES *********");
                    console.log("\n");
                    console.info("REPONSE");
                    console.log(data.results);

                    var dataOut = data.results;
                    var sum = 0;
                    for (var i = 0; i < dataOut.length; i++) {
                        var item = dataOut[i];

                        if (item.GRUPO === "03") {
                            sum = sum + item.NUMDOCS;
                            self.getView().byId("tile_sp").setNumber(item.NUMDOCS);
                        }

                        if (item.GRUPO === "04") {
                            sum = sum + item.NUMDOCS;
                            self.getView().byId("tile_oc").setNumber(item.NUMDOCS);
                        }

                        if (item.GRUPO === "05") {
                            sum = sum + item.NUMDOCS;
                            self.getView().byId("tile_pv").setNumber(item.NUMDOCS);
                        }

                    }

                    var cantidad = self.loadDataLiberacionesNC();
                    if(cantidad<0) {
                      cantidad = 0;
                    }
                    self.getView().byId("tile_nc").setNumber(cantidad);

                    self.getView().byId("tile_sp").setBusy(false);
                    self.getView().byId("tile_oc").setBusy(false);
                    self.getView().byId("tile_pv").setBusy(false);
                    self.getView().byId("tile_nc").setBusy(false);

                    //cordova.plugins.notification.badge.set(sum + cantidad);
                },
                error: function(err) {

                    self.getView().byId("tile_sp").setBusy(false);
                    self.getView().byId("tile_oc").setBusy(false);
                    self.getView().byId("tile_pv").setBusy(false);

                    console.error("ERROR *********");
                    console.log("\n");
                    console.info("REPONSE");
                    console.log(err);
                }
            });



            oModel.refresh();
        },
        notificacion: function(mensaje) {},
        utilNotfi: function(mensaje) {},
        goHome: function() {
            this.getView().byId("dlg_liberacion_solped").close();
            this.loadKpi();
        },
        goSolpeds: function() {
            this.getView().byId("frame").setContent('<iframe class="frame_app" src="../../Solpeds/webapp/index.html?usuario=' + window.userApp + '"></iframe>');
            this.getView().byId("dlg_liberacion_solped").open();
        },
        goOC: function() {
            this.getView().byId("frame").setContent('<iframe class="frame_app" src="../../OC/webapp/index.html?usuario=' + window.userApp + '"></iframe>');
            this.getView().byId("dlg_liberacion_solped").open();
        },
        goPV: function() {
            this.getView().byId("frame").setContent('<iframe class="frame_app" src="../../PV/webapp/index.html?usuario=' + window.userApp + '"></iframe>');
            this.getView().byId("dlg_liberacion_solped").open();
        },
        goNC: function() {
            this.getView().byId("frame").setContent('<iframe class="frame_app" src="../../NC1/webapp/index.html?usuario=' + window.userApp + '"></iframe>');
            this.getView().byId("dlg_liberacion_solped").open();
        },
        logout: function() {
            localStorage.userApp = "";
            this.getView().byId("shellUsuario").setUsername("");
            this.getView().byId("shellUsuario2").setUsername("");
            //cordova.plugins.notification.badge.set(0);
            //cordova.plugins.notification.local.cancel([1, 2, 3, 4]);
            location.reload();
        },
        // Para desloguear de la app
  			onLogoutDialog: function() {
          /*eslint-disable*/
          console.error("OnLogoutDialog - Inicio");
  				var that = this;
  				var dialog = new sap.m.Dialog({
  					title: 'Salir app',
  					type: 'Message',
            stretch: false,
  					content: [
  						new sap.m.Label({ text: '¿Esta seguro de querer salir de la app de liberaciones?', labelFor: 'submitDialogInputUser'}),
  					],
  					beginButton: new sap.m.Button({
  						text: 'Si',
  						enabled: true,
  						press: function () {
                localStorage.userApp = "";
                that.getView().byId("shellUsuario").setUsername("");
                that.getView().byId("shellUsuario2").setUsername("");
                //cordova.plugins.notification.badge.set(0);
                //cordova.plugins.notification.local.cancel([1, 2, 3, 4]);
                location.reload();
  						}
  					}),
  	 				endButton: new sap.m.Button({
  						text: 'No',
  						press: function () {
  							dialog.close();
  						}
  					}),
  					afterClose: function() {
  						dialog.destroy();
  					}
  				});

  				dialog.open();
  			},


        // Popup de logueo
        onLoginDialog: function() {
            /*eslint-disable*/
            console.log("onLoginDialog -- Inicio");
            var that = this;
            var inputPass;
            var submitButton;
            var dialog = new sap.m.Dialog({
                title: 'Login',
                type: 'Message',
                stretch: false,
                content: [
                    new sap.m.Label({ text: 'Usuario', labelFor: 'submitDialogInputUser' }),
                    new sap.m.Input('submitDialogInputUser', {
                        liveChange: function(oEvent) {
                            var sText = oEvent.getParameter('value');
                            var parent = oEvent.getSource().getParent();

                        },
                        width: '100%',
                        placeholder: ''
                    }),
                    new sap.m.Label({ text: 'Clave', labelFor: 'submitDialogInputPass' }),
                    inputPass = new sap.m.Input('submitDialogInputPass', {
                        liveChange: function(oEvent) {
                            var sText = oEvent.getParameter('value');
                            var parent = oEvent.getSource().getParent();
                        },
                        width: '100%',
                        placeholder: '',
                        type: 'Password'
                    })
                ],
                beginButton: submitButton = new sap.m.Button({
                    id: 'idButtonLogin',
                    text: 'Login',
                    enabled: true,
                    press: function() {

                        var inputUser = sap.ui.getCore().byId('submitDialogInputUser').getValue().toUpperCase().trim();
                        var inputPass = sap.ui.getCore().byId('submitDialogInputPass').getValue();
                        that.onLogin(inputUser, inputPass);
                        dialog.close();
                    }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });
            inputPass.onkeyup = function(e) {
                if (e.keyCode == 13) {
                    sap.ui.getCore().byId("idButtonLogin").firePress();
                }
            }
            dialog.open();
            console.log("onLoginDialog -- Final");
        },
        onLogin: function(inputUser, inputPass) {
            /*eslint-disable*/
            console.log("onLogin --- Inicio ");
            console.log("onLogin --- inputUser = ", inputUser);
            console.log("onLogin --- inputPass = ", inputPass);

            //var midata = this.getView().getModel("midata");
            //midata.setProperty("/usuario", inputUser);
            //console.log("midata", midata);


            // Crea el wdsl en formato XML
            var wdsl = ['<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">',
                '<soap:Header/>',
                '<soap:Body>',
                '<urn:Z_VALID_CREDENTIALS>',
                '<I_PASSWORD>' + inputPass + '</I_PASSWORD>',
                '<I_USUARIO>' + inputUser + '</I_USUARIO>',
                '</urn:Z_VALID_CREDENTIALS>',
                '</soap:Body>',
                '</soap:Envelope>'
            ];
            var self = this;
            console.log("WDSL OC = ", wdsl);
            $.soap({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_valid_credentials/100/zws_valid_credentials/zws_valid_credentials',
                data: wdsl.join(''),
                async: true,
                soap12: true,
                context: this,
                envAttributtes: {
                    "xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
                    "xmlns:urn": "urn:sap-com:document:sap:rfc:functions"
                },
                success: function(soapResponse) {
                    //sap.m.MessageToast.show("Login Usuario exito ", { duration: 3000 });
                    // do stuff with soapResponse
                    // if you want to have the response as JSON use soapResponse.toJSON();
                    // or soapResponse.toString() to get XML string
                    // or soapResponse.toXML() to get XML DOM
                    console.log("onAprobar - Exito al traer data SOAP ", soapResponse);
                    console.log("onAprobar = ", soapResponse.toString());
                    var json = soapResponse.toJSON();
                    console.log("json = ", json);

                    var sUser = json["#document"]["env:Envelope"]["env:Body"]["n0:Z_VALID_CREDENTIALSResponse"]["E_USERID"];
                    console.log("sUser = ", sUser);
                    //sUser = "MGALLOFREC"; //MCA para loguear sin validacion

                    if (sUser.length > 0) {
                        console.log("Usuario es válido");

                        //var odata = this.getView().getModel();
                        //odata.refresh(true);
                        window.userApp = sUser;
                        localStorage.userApp = sUser;
                        self.getView().byId("shellUsuario").setUsername(sUser);
                        self.getView().byId("shellUsuario2").setUsername(sUser);
                        self.loadKpi();
                        setTimeout(function() {
                            setInterval(function() {
                                self.loadKpi();
                            }, 120000)
                        }, 120000);
                        //this.getRouter().initialize();

                        // persiste el usuario

                        //$.cookie("usuario", sUser, { domain: ".ondemand.com", path: "/" });

                    } else {
                        console.log("Usuario no es válido");
                        window.userApp = "";
                        localStorage.userApp = "";
                        sap.m.MessageToast.show("Usuario o clave no es la correcta", { duration: 3000 });
                        self.onLoginDialog();
                    }
                },
                error: function(SOAPResponse) {
                    //sap.m.MessageToast.show("Login Usuario error "+SOAPResponse.toString(), { duration: 15000 });
                    // show error
                    console.log("onAprobar = Error al traer data SOAP", SOAPResponse);
                    self.alerta("Error de comunicación al loguear en liberación.");
                    self.onLoginDialog();
                }
            });

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

        },

        alerta: function(sMessage) {
            if (sMessage != undefined && sMessage !== "") {
                sap.ui.commons.MessageBox.alert(sMessage);
            }
        },
        mostrarusuario: function() {
            this.getView().byId("dlgusuario").open();
            this.getView().byId("txtusuario").setText(localStorage.userApp);
        },
        goCerrarDialogUsuario: function() {
            this.getView().byId("dlgusuario").close();
        },

        // cambio on demand
        goRefreshUsuario: function() {
            sap.ui.core.BusyIndicator.show(10);
            var dlgusuario = this.getView().byId("dlgusuario");
            var that = this;
            try {
              jQuery.ajax({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/ProdacJava/GetLiberaUsuario?mandante=QAP&usuario=' + localStorage.userApp,
                type: "GET",
                context: this,
                contentType: 'application/json',
                async: false,
                processData: false,
                dataType: 'JSONP',
                success: function(data, textStatus, jqXHR) {
                    //this.getView().byId("txtusuario").setText("Exito al sincronizar");
                },
                error: function(e, xhr, status) {
                    //this.getView().byId("txtusuario").setText("Error : " + e.responseText());
                },
                complete: function() {
                  dlgusuario.close();
				          this.loadKpi();
				          location.reload(true);
                }
            });
          } catch(e) {
            this.getView().byId("txtusuario").setText("Error en jquery - " + e);
          }

        },

    });
});
