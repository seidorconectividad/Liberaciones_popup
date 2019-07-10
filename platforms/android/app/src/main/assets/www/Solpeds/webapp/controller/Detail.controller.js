/*global location */
sap.ui.define([
    "com/prodac/libsolped/masterdetail/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/prodac/libsolped/masterdetail/model/formatter",
    "sap/ui/core/routing/History",
    "com/prodac/libsolped/masterdetail/controller/jquery.soap",
    "com/prodac/libsolped/masterdetail/controller/xml2json",
    "sap/ui/commons/MessageBox"
], function(BaseController, JSONModel, formatter, History, Soap, xml2json, MessageBox) {
    "use strict";

    return BaseController.extend("com.prodac.libsolped.masterdetail.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function() {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress: function() {
            var oViewModel = this.getModel("detailView");

            sap.m.URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },


        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */
        onListUpdateFinished: function(oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
            }
        },

        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
        onNavBack: function() {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("master", {}, true);
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function(oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel().metadataLoaded().then(function() {
                var sObjectPath = this.getModel().createKey("LibMM_Cabeceras", {
                    ID: sObjectId
                });
                this._bindView("/" + sObjectPath);
            }.bind(this));
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function(sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function() {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function() {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function() {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                //MCA this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the master list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.ID,
                sObjectName = oObject.NUMLIB,
                oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

            // Para que posiciones el TabBar en el icono de posiciones al cambio de master
            //var oTabBar = this.getView().byId("TabBar");
            //oTabBar.setSelectedKey("Detalles");
        },

        _onMetadataLoaded: function() {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("lineItemsList"),
                iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

            oLineItemTable.attachEventOnce("updateFinished", function() {
                // Restore original busy indicator delay for line item table
                oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            });

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        onSelectTabBarChanged: function(oEvent) {
            var midata = this.getView().getModel("midata");
            var key = oEvent.getParameters().key;
            if (key == 'Detalles') {
                midata.setProperty("/boton_aprobar", false);
                midata.setProperty("/boton_desaprobar", false);
            } else if (key == 'Aprobar') {
                midata.setProperty("/boton_aprobar", true);
                midata.setProperty("/boton_desaprobar", false);
            } else if (key == 'Desaprobar') {
                midata.setProperty("/boton_aprobar", false);
                midata.setProperty("/boton_desaprobar", true);
            }
        },



        onAprobarDialog: function(oEvent) {
            var that = this;
            var dialog = new sap.m.Dialog({
                title: 'Aprobación',
                type: 'Message',
                stretch: false,
                content: [
                    new sap.m.Label({ text: 'Comentario', labelFor: 'submitDialogTextarea' }),
                    new sap.m.TextArea('submitDialogTextarea', {
                        liveChange: function(oEvent) {
                            var sText = oEvent.getParameter('value');
                            var parent = oEvent.getSource().getParent();

                            //parent.getBeginButton().setEnabled(sText.length > 0);
                        },
                        width: '100%',
                        placeholder: ''
                    })
                ],
                beginButton: new sap.m.Button({
                    text: 'Aprobar',
                    enabled: true,
                    press: function() {

                        var sComentario = sap.ui.getCore().byId('submitDialogTextarea').getValue();
                        that.onAprobar(sComentario);
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: 'Cancelar',
                    press: function() {
                        dialog.close();
                    }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });

            dialog.open();
        },


        onDesaprobarDialog: function(oEvent) {
            var that = this;
            var dialog = new sap.m.Dialog({
                title: 'Desaprobación',
                type: 'Message',
                stretch: false,
                content: [
                    new sap.m.Label({ text: 'Motivo', labelFor: 'submitDialogTextarea' }),
                    new sap.m.TextArea('submitDialogTextarea', {
                        liveChange: function(oEvent) {
                            var sText = oEvent.getParameter('value');
                            var parent = oEvent.getSource().getParent();

                            //parent.getBeginButton().setEnabled(sText.length > 0);
                        },
                        width: '100%',
                        placeholder: ''
                    })
                ],
                beginButton: new sap.m.Button({
                    text: 'Desaprobar',
                    enabled: true,
                    press: function() {

                        var sComentario = sap.ui.getCore().byId('submitDialogTextarea').getValue();
                        that.onDesaprobar(sComentario);
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: 'Cancelar',
                    press: function() {
                        dialog.close();
                    }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });

            dialog.open();
        },



        onLogin: function(inputUser, inputPass) {
            /*eslint-disable*/
            console.log("onLogin --- Inicio ");
            console.log("onLogin --- inputUser = ", inputUser);
            console.log("onLogin --- inputPass = ", inputPass);
        },


        // Se ejecuta la aprobación de la liberación
        onAprobar: function(sComentario) {
            /*eslint-disable*/
            console.log("onAprobar --- Inicio ");

            sap.ui.core.BusyIndicator.show();

            var midata = this.getView().getModel("midata");
            var odata = this.getView().getModel("odata");
            //console.log("Comentario : ", midata.getProperty("/comentario") );
            console.log("Comentario : ", sComentario);

            var oView = this.getView();
            var sObjectId = oView.getModel().getObject(oView.getElementBinding().getPath()).ID;
            var sCodlib = oView.getModel().getObject(oView.getElementBinding().getPath()).CODLIB;
            var sNumlib = oView.getModel().getObject(oView.getElementBinding().getPath()).NUMLIB;
            console.log("ObjectId : ", sObjectId);
            console.log("NumLib : ", sNumlib);

            // Crea el wdsl en formato XML
            var wdsl = ['<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">',
                '<soap:Header/>',
                '<soap:Body>',
                '<urn:Z_MM_SET_SOLPED_APROB>',
                '<E_GTD_0001>',
                '<item>',
                '<SOLPED>' + '</SOLPED>',
                '<TYPE>' + '</TYPE>',
                '<TXTSAP>' + '</TXTSAP>',
                '</item>',
                '</E_GTD_0001>',
                '<I_COMENTARIO>' + sComentario + '</I_COMENTARIO>',
                '<I_NUMBER>' + sNumlib + '</I_NUMBER>',
                '<I_REL_COD>' + sCodlib + '</I_REL_COD>',
                '</urn:Z_MM_SET_SOLPED_APROB>',
                '</soap:Body>',
                '</soap:Envelope>'
            ];
            console.log("WDSL OC = ", wdsl);
            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_solped_aprob/130/zservice_zws_solped_aprob/zbinding_zws_solped_aprob',
            $.soap({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_solped_aprob/100/zws_solped_aprob/zws_solped_aprob',
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

                    var json2 = json["#document"]["env:Envelope"]["env:Body"]["n0:Z_MM_SET_SOLPED_APROBResponse"]["E_GTD_0001"];
                    console.log("onAprobar = ", json2);
                    console.log("Estado = ", json2["item"][1]["TYPE"]);

                    if (json2["item"][1]["TYPE"] == 'S') {
                        console.log("Se aprobó con éxito la liberación solped");

                        // MCA Enviar oData para marcar como anulado la liberacion
                        var oCabecera = {};
                        oCabecera.APROBADO = '1';
                        var sRequest = "/LibMM_Cabeceras('" + sObjectId + "')";
                        this.getView().getModel().update(sRequest, oCabecera, {
                            success: function(oData, oResponse) {
                                console.log("Se cambió el estado de la Liberación");
                                sap.ui.core.BusyIndicator.hide();
                                midata.refresh(true);
                                sap.m.MessageToast.show("Se aprobó con éxito la liberación solped", { duration: 6000 });
                            },
                            error: function(oError) {
                                console.log("No se pudo cambiar el estado de la Liberación", oError);
                                sap.ui.core.BusyIndicator.hide();
                                midata.refresh(true);
                                sap.m.MessageToast.show("Se aprobó con éxito la liberación solped", { duration: 6000 });
                            }
                        });


                        this.onNavBack(); // MCA para retroceder a cabecera
                    } else {
                        console.log("No se aprobó la liberación");
                        sap.ui.core.BusyIndicator.hide();
                        this.alerta("Error de aprobación SAP.\n" + json2["item"][1]["TXTSAP"]);
                    }
                },
                error: function(SOAPResponse) {
                    // show error
                    console.log("onAprobar = Error al traer data SOAP", SOAPResponse);
                    sap.ui.core.BusyIndicator.hide();
                    this.alerta("Error de comunicación al aprobar liberación.");
                }
            });
        },

        // se ejecuta la desaprobación de la liberación
        onDesaprobar: function(sComentario) {
            /*eslint-disable*/
            console.log("onDesaprobar --- Inicio ");

            sap.ui.core.BusyIndicator.show();

            var midata = this.getView().getModel("midata");
            var odata = this.getView().getModel("odata");
            console.log("Comentario : ", sComentario);

            var oView = this.getView();
            var sObjectId = oView.getModel().getObject(oView.getElementBinding().getPath()).ID;
            var sCodlib = oView.getModel().getObject(oView.getElementBinding().getPath()).CODLIB;
            var sNumlib = oView.getModel().getObject(oView.getElementBinding().getPath()).NUMLIB;
            console.log("ObjectId : ", sObjectId);
            console.log("NumLib : ", sNumlib);

            // MCA Enviar SOAP para aprobar la liberacion

            // Crea el wdsl en formato XML
            var wdsl = ['<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">',
                '<soap:Header/>',
                '<soap:Body>',
                '<urn:Z_MM_SET_SOLPED_DESAPR>',
                '<E_GTD_0001>',
                '<item>',
                '<SOLPED>' + '</SOLPED>',
                '<TYPE>' + '</TYPE>',
                '<TXTSAP>' + '</TXTSAP>',
                '</item>',
                '</E_GTD_0001>',
                '<I_MOTIVO>' + sComentario + '</I_MOTIVO>',
                '<I_NUMBER>' + sNumlib + '</I_NUMBER>',
                '<I_REL_COD>' + sCodlib + '</I_REL_COD>',
                '</urn:Z_MM_SET_SOLPED_DESAPR>',
                '</soap:Body>',
                '</soap:Envelope>'
            ];
            console.log("WDSL OC = ", wdsl);
            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_solped_desaprob/130/zservice_zws_solped_desaprob/zbinding_zws_solped_desaprob',
            $.soap({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_solped_desaprob/100/zws_solped_desaprob/zws_solped_desaprob',
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
                    console.log("onDesaprobar - Exito al traer data SOAP ", soapResponse);
                    console.log("onDesaprobar = ", soapResponse.toString());
                    var json = soapResponse.toJSON();
                    console.log("json = ", json);

                    var json2 = json["#document"]["env:Envelope"]["env:Body"]["n0:Z_MM_SET_SOLPED_DESAPRResponse"]["E_GTD_0001"];
                    console.log("onDesaprobar = ", json2);
                    console.log("Estado = ", json2["item"][1]["TYPE"]);

                    if (json2["item"][1]["TYPE"] == 'S') {
                        console.log("Se desaprobó con éxito la liberación solped");

                        // MCA Enviar oData para marcar como anulado la liberacion
                        var oCabecera = {};
                        oCabecera.APROBADO = '1';
                        var sRequest = "/LibMM_Cabeceras('" + sObjectId + "')";
                        this.getView().getModel().update(sRequest, oCabecera, {
                            success: function(oData, oResponse) {
                                console.log("Se cambió el estado de la Liberación");
                                sap.ui.core.BusyIndicator.hide();
                                midata.refresh(true);
                                sap.m.MessageToast.show("Se desaprobó con éxito la liberación solped", { duration: 6000 });
                            },
                            error: function(oError) {
                                console.log("No se pudo cambiar el estado de la Liberación", oError);
                                sap.ui.core.BusyIndicator.hide();
                                midata.refresh(true);
                                sap.m.MessageToast.show("Se desaprobó con éxito la liberación solped", { duration: 6000 });
                            }
                        });

                        this.onNavBack(); // MCA para retroceder a cabecera
                    } else {
                        console.log("No se desaprobó la liberación");
                        sap.ui.core.BusyIndicator.hide();
                        this.alerta("Error de desaprobación SAP.\n" + json2["item"][1]["TXTSAP"]);
                    }
                },
                error: function(SOAPResponse) {
                    // show error
                    console.log("onAprobar = Error al traer data SOAP", SOAPResponse);
                    sap.ui.core.BusyIndicator.hide();
                    this.alerta("Error de comunicación al desaprobar liberación.");
                }
            });

        },







        alerta: function(sMessage) {
            if (sMessage != undefined && sMessage !== "") {
                sap.ui.commons.MessageBox.alert(sMessage);
            }
        }

    });

});
