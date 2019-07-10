sap.ui.define([
    "com/prodac/libsolped/masterdetail/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/prodac/libsolped/masterdetail/controller/jquery.soap",
    "com/prodac/libsolped/masterdetail/controller/xml2json",
    "sap/ui/commons/MessageBox",
    "com/prodac/libsolped/masterdetail/controller/jquery.cookie"
], function(BaseController, JSONModel, Soap, xml2json, MessageBox, Cookie) {
    "use strict";

    return BaseController.extend("com.prodac.libsolped.masterdetail.controller.App", {

        onInit: function() {

            var oViewModel,
                fnSetAppNotBusy,
                oListSelector = this.getOwnerComponent().oListSelector,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });

            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            this.getOwnerComponent().getModel().metadataLoaded()
                .then(fnSetAppNotBusy);

            // Makes sure that master view is hidden in split app
            // after a new list entry has been selected.
            oListSelector.attachListSelectionChange(function() {
                this.byId("idAppControl").hideMaster();
            }, this);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

        },

        onAfterRendering: function() {
            /*eslint-disable*/
            console.log("onAfterRendering -- Inicio");

            // console.log("onAfterRendering --- App --- Inicio");
            var midata = this.getView().getModel("midata");

            // recoge persistencia del usuario para no volver a loguear en un refresco
            midata.setProperty("/usuario", this.getParamValue("usuario"));

            //  var sUsuario = midata.getProperty("/usuario");
            //  if (sUsuario == undefined) {
            //      sUsuario = "";
            ///  }
            //  console.log("sUsuario = ", sUsuario);
            //  if (sUsuario == '' && midata.getProperty("/autologin")) {
            //      this.onLoginDialog();
            //  } else {
            var odata = this.getView().getModel();
            odata.refresh(true);
            this.getRouter().initialize();
            //   }

            //   console.log("onAfterRendering --- App --- Fin");
            $("#__component0---master--searchField-F").attr("tabindex", 99); //MCA
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

            var midata = this.getView().getModel("midata");
            midata.setProperty("/usuario", inputUser);
            console.log("midata", midata);


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
            console.log("WDSL OC = ", wdsl);
            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_valid_credentials/130/zservice_zws_valid_credentials/zbinding_zws_valid_credentials',
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

                    if (sUser.length > 0) {
                        console.log("Usuario es válido");

                        var odata = this.getView().getModel();
                        odata.refresh(true);

                        this.getRouter().initialize();

                        // persiste el usuario
                        $.cookie("usuario", sUser, { domain: ".ondemand.com", path: "/" });

                    } else {
                        console.log("Usuario no es válido");
                        sap.m.MessageToast.show("Usuario o clave no es la correcta", { duration: 3000 });
                        this.onLoginDialog();
                    }
                },
                error: function(SOAPResponse) {
                    // show error
                    console.log("onAprobar = Error al traer data SOAP", SOAPResponse);
                    this.alerta("Error de comunicación al loguear en liberación.");
                    this.onLoginDialog();
                }
            });

        },


        alerta: function(sMessage) {
            if (sMessage != undefined && sMessage !== "") {
                sap.ui.commons.MessageBox.alert(sMessage);
            }
        },
        getParamValue: function(paramName) {
            var url = window.location.search.substring(1); //get rid of "?" in querystring
            var qArray = url.split('&'); //get key-value pairs
            for (var i = 0; i < qArray.length; i++) {
                var pArr = qArray[i].split('='); //split key and value
                if (pArr[0] == paramName)
                    return pArr[1]; //return value
            }
        }

    });

});



/*eslint-disable*/
// Handler para refrescar el modelo cada cierto tiempo
/*
							var that = this;
							if( handler === null ) {
								handler = setInterval(function() {

									console.log("setInterval liberaciones lanzado... ************************************************************************");
						    		that.getView().getModel().refresh(true);
								}, 300000);
							}
							*/

/*
				that2 = this;
				if( handler === null ) {
					handler = setInterval(function() { */
/*eslint-disable*/
/*
						console.log("setInterval odata App... ************************************************************************");
			    		that2.getView().getModel().refresh(true);
					}, 120000);
				}
				console.log("onAfterRendering --- App --- Fin");
				*/
