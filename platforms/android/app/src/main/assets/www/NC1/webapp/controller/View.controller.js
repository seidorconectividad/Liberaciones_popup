sap.ui.define([
    "com/prodac/liberacion/notacreditoProdacLiberacionNotaCredito/controller/BaseController"
], function(Controller) {
    "use strict";
    var BolList = true;
    return Controller.extend("com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.controller.View", {
        onLogout: function() {
            var dataSoap = [];
            var oModelSoap = new sap.ui.model.json.JSONModel();
            oModelSoap.setData(dataSoap);
            this.getView().setModel(oModelSoap, "dataSoap");

            var dataSoapDetail = [];
            var oModelSoapDetail = new sap.ui.model.json.JSONModel();
            oModelSoapDetail.setData(dataSoapDetail);
            this.getView().setModel(oModelSoapDetail, "dataSoapDetail");

            this.getView().byId('SplitCont').addStyleClass('hide');
            this.onLoginDialog();
        },
        onSearch: function() {
            var aFilter = [];
            var SearchField = this.getView().byId("SearchField");
            if (jQuery.trim(SearchField.getValue()) !== '') {
                //aFilterOr.push(new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, SearchField.getValue()));
                aFilter.push(new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, SearchField.getValue()));
            }
            var oList = this.getView().byId("ListMenu");
            var oBinding = oList.getBinding("items");
            oBinding.aApplicationFilters = Array();
            if (aFilter.length > 0) {
                oBinding.filter(new sap.ui.model.Filter(aFilter, true));
            } else {
                oBinding.filter(aFilter);
            }
        },
        onApprove: function() {
            if (typeof this.getView().getModel('dataSoapDetail') === 'undefined') {
                sap.m.MessageBox.information('Seleccione Nota de Crédito');
            } else {
                var DOC_NUMBER = this.getView().getModel('dataSoapDetail').getData().DOC_NUMBER
                if (DOC_NUMBER === '') {
                    sap.m.MessageBox.information('Nota de Crédito incorrecta');
                } else {
                    var sItems = [];
                    sItems.push({ DOC_NUMBER: DOC_NUMBER });
                    this.onApproveProcess(sap.ui.getCore().getModel('UserSAP').User, sItems);
                }
            }
        },
        onApproveMasive: function() {
            var sItems = [];
            var ListMenu = this.getView().byId('ListMenu');
            if (ListMenu.getSelectedItems().length > 0) {
                for (var IntIndex = 0; IntIndex < ListMenu.getSelectedItems().length; IntIndex++) {
                    sItems.push({ DOC_NUMBER: ListMenu.getSelectedItems()[IntIndex].data('Numero') });
                }
                this.onApproveProcess(sap.ui.getCore().getModel('UserSAP').User, sItems);
            } else {
                sap.m.MessageBox.information('Seleccione Nota de Crédito');
            }
        },
        onApproveProcess: function(sUser, sItems) {
            var that = this;
            var oSplitCont = this.getSplitContObj();
            oSplitCont.setBusy(true);
            var sItem = '';
            for (var IntIndex = 0; IntIndex < sItems.length; IntIndex++) {
                sItem += '<item>\
			               <VBELN>' + sItems[IntIndex].DOC_NUMBER + '</VBELN>\
			            </item>';
            }

            var ajaxRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\
							   <soapenv:Header/>\
							   <soapenv:Body>\
							      <urn:ZSD_RFC_LIBERACION_MASIVA>\
                      <TE_LOG>\
            <item>\
               <VBELN></VBELN>\
               <MESSAGE></MESSAGE>\
            </item>\
         </TE_LOG>\
							         <TI_PEDIDOS>\
							         ' + sItem + '\
							         </TI_PEDIDOS>\
							         <USUARIO>' + sUser + '</USUARIO>\
							      </urn:ZSD_RFC_LIBERACION_MASIVA>\
							   </soapenv:Body>\
							</soapenv:Envelope>';

              // Antes: zsd_rfc_liberacion_masiva

              //var ajaxRequest = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions"><soap:Header/><soap:Body><urn:ZSD_RFC_LIBERACION_MASIVA><TE_LOG><item><VBELN>?</VBELN><MESSAGE>?</MESSAGE></item></TE_LOG><TI_PEDIDOS><item><VBELN>0060007840</VBELN></item></TI_PEDIDOS><USUARIO>FBALBUENAT</USUARIO></urn:ZSD_RFC_LIBERACION_MASIVA></soap:Body></soap:Envelope>';

              // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_liberacion_masiva/130/zsd_rfc_liberacion_masiva/zbinding_liberacion_masiva',
            jQuery.ajax({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_liberacion_masiva/100/zsd_rfc_liberacion_masiva/zsd_rfc_liberacion_masiva',
                async: true,
                type: "POST",
                processData: false,
                data: ajaxRequest,
                dataType: 'xml',
                contentType: "text/xml; charset=\"utf-8\"",
                success: function(data, textStatus, jqXHR) {
                    oSplitCont.setBusy(false);

                    //MCA : agregado para agregar mostrar error al aprobar
                    var sError = jQuery(jqXHR.responseXML).find("MESSAGE");
                    if (sError.text().trim() !== '') {
                        sap.m.MessageBox.information(sError.text().trim());
                    } else {
                    //MCA fin

                      var sMensaje = 'Notas de Créditos Aprobadas';
                      if (sItems.length === 1) {
                          sMensaje = 'Nota de Crédito Aprobada';
                      }
                      if (sap.ui.Device.system.phone) {
                          that.handleNavButtonPress();
                      }
                      that.onLoadData();
                      sap.m.MessageBox.success(sMensaje); // + " " + jqXHR.responseText );

                   } //MCA
                },
                error: function(e, xhr, status) {
                    sap.m.MessageBox.error('No se puede conectar al sistema, actualiza la aplicación.', {
                        details: e.statusCode().status + ' ' + e.statusText
                    });
                    oSplitCont.setBusy(false);
                },
                complete: function(xhr, status) {
                    oSplitCont.setBusy(false);
                }
            });
        },
        onRejectDialog: function() {
            var that = this;
            var dialog = new sap.m.Dialog({
                title: 'Rechazar',
                type: 'Message',
                stretch: false,
                content: [
                    new sap.m.Label({ text: 'Comentario', labelFor: 'submitDialogInputComment' }),
                    new sap.m.TextArea('submitDialogInputComment', {
                        width: '100%',
                        placeholder: '',
                        maxLength: 255
                    })
                ],
                beginButton: new sap.m.Button({
                    id: 'idButton',
                    text: 'Rechazar',
                    enabled: true,
                    press: function() {
                        var DOC_NUMBER = that.getView().getModel('dataSoapDetail').getData().DOC_NUMBER;
                        var sComment = sap.ui.getCore().byId('submitDialogInputComment').getValue();
                        var sItems = [];
                        sItems.push({ DOC_NUMBER: DOC_NUMBER });
                        //sItems.push({DOC_NUMBER: 'X'});
                        that.onRejectProcess(sap.ui.getCore().getModel('UserSAP').User, sItems, sComment);
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
        onReject: function() {
            if (typeof this.getView().getModel('dataSoapDetail') === 'undefined') {
                sap.m.MessageBox.information('Seleccione Nota de Crédito');
            } else {
                var DOC_NUMBER = this.getView().getModel('dataSoapDetail').getData().DOC_NUMBER
                if (DOC_NUMBER === '') {
                    sap.m.MessageBox.information('Nota de Crédito incorrecta');
                } else {
                    this.onRejectDialog();
                }
            }
        },
        onRejectProcess: function(sUser, sItems, sComment) {
            var that = this;
            var oSplitCont = this.getSplitContObj();
            oSplitCont.setBusy(true);
            var sItem = '';
            for (var IntIndex = 0; IntIndex < sItems.length; IntIndex++) {
                sItem += '<GI_VBELN>' + sItems[IntIndex].DOC_NUMBER + '</GI_VBELN>';
            }
            var ajaxRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\
							   <soapenv:Header/>\
							   <soapenv:Body>\
							      <urn:ZSD_RFC_RECHAZO_LIBERACION>\
							    	<GI_TEXTO>' + sComment + '</GI_TEXTO>\
							         ' + sItem + '\
							         <USUARIO>' + sUser + '</USUARIO>\
							      </urn:ZSD_RFC_RECHAZO_LIBERACION>\
							   </soapenv:Body>\
							</soapenv:Envelope>';

            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_rechazo_liberacion/130/zservice_zsd_rfc_rechazo_liberac/zbinding_zsd_rfc_rechazo_liberacion',
            jQuery.ajax({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_rechazo_liberacion/100/zsd_rfc_rechazo_liberacion/zsd_rfc_rechazo_liberacion',
                async: true,
                type: "POST",
                processData: false,
                data: ajaxRequest,
                dataType: 'xml',
                contentType: "text/xml; charset=\"utf-8\"",
                success: function(data, textStatus, jqXHR) {
                    oSplitCont.setBusy(false);
                    var sError = jQuery(jqXHR.responseXML).find("GE_ERROR");
                    if (sError.text().trim() !== '') {
                        sap.m.MessageBox.information(sError.text().trim());
                    } else {
                        var sMensaje = 'Notas de Créditos Rechazadas';
                        if (sItems.length === 1) {
                            sMensaje = 'Nota de Crédito Rechazada';
                        }
                        if (sap.ui.Device.system.phone) {
                            that.handleNavButtonPress();
                        }
                        that.onLoadData();
                        sap.m.MessageBox.success(sMensaje);
                    }
                },
                error: function(e, xhr, status) {
                    sap.m.MessageBox.error('No se puede conectar al sistema, actualiza la aplicación.', {
                        details: e.statusCode().status + ' ' + e.statusText
                    });
                    oSplitCont.setBusy(false);
                },
                complete: function(xhr, status) {
                    oSplitCont.setBusy(false);
                }
            });
        },
        onSelectionMultiple: function(evt) {
            var ListMenu = this.getView().byId('ListMenu');
            var ApproveMasive = this.getView().byId('buttonApproveMasive');
            if (evt.getSource().getPressed()) {
                ListMenu.setMode('MultiSelect');
                ApproveMasive.setVisible(true);
            } else {
                ListMenu.setMode('SingleSelectMaster');
                ApproveMasive.setVisible(false);
            };
        },
        handleNavButtonPress: function() {
            var oSplitApp = this.getView().byId("SplitCont");
            var oMaster = oSplitApp.getMasterPages()[0];
            oSplitApp.toMaster(oMaster, "flip");
        },

        onInit: function() {
            var data = {
                short: 'short',
                large: 'large',
                add: 'add',
                subtract: 'subtract',
                equal: 'equal'
            };
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(data);
            this.getView().setModel(oModel, "formatdate");

            var deviceModel = new sap.ui.model.json.JSONModel({
                isPhone: sap.ui.Device.system.phone
            });
            this.getView().setModel(deviceModel, "device");
        },
        onRefresh: function() {
            this.onLoadData();
        },
        onUpdateFinished: function() {
            if (!sap.ui.Device.system.phone) {
                var ListMenu = this.getView().byId('ListMenu');
                if (ListMenu.getItems().length > 0) {
                    ListMenu.setSelectedItem(ListMenu.getItems()[0], true);
                    this.onLoadItem(ListMenu.getItems()[0].data('Numero'));
                }
            }
        },
        onLoadItem: function(sNumero) {
            var that = this;
            var ajaxRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">   <soapenv:Header/>   <soapenv:Body>      <urn:ZSD_RFC_GET_DETAIL>         <!--Optional:-->         <GI_VBELN>' + sNumero + '</GI_VBELN>         <!--Optional:-->         <TE_NIVEL_LIBERACION>            <!--Zero or more repetitions:-->            <item>               <MANDT></MANDT>               <CODESTRA></CODESTRA>               <NIVELLIB></NIVELLIB>               <USUARIO></USUARIO>               <NOMUSR></NOMUSR>               <NIVINF></NIVINF>               <NIVSUP></NIVSUP>               <VALDEF></VALDEF>               <VALFIN></VALFIN>            </item>         </TE_NIVEL_LIBERACION>         <!--Optional:-->         <TE_ORDER_ADDRESS>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <DOC_NUMBER></DOC_NUMBER>               <ADDRESS></ADDRESS>               <FORMOFADDR></FORMOFADDR>               <NAME></NAME>               <NAME_2></NAME_2>               <NAME_3></NAME_3>               <NAME_4></NAME_4>               <STREET></STREET>               <COUNTRY></COUNTRY>               <COUNTRYISO></COUNTRYISO>               <POSTL_CODE></POSTL_CODE>               <POBX_PCD></POBX_PCD>               <POBX_CTY></POBX_CTY>               <CITY></CITY>               <DISTRICT></DISTRICT>               <REGION></REGION>               <CITY_CODE></CITY_CODE>               <COUNTY_CDE></COUNTY_CDE>               <PO_BOX></PO_BOX>               <TELEPHONE></TELEPHONE>               <TELEPHONE2></TELEPHONE2>               <TELEBOX></TELEBOX>               <FAX_NUMBER></FAX_NUMBER>               <TELETEX></TELETEX>               <TELEX></TELEX>               <LANGU></LANGU>               <LANGU_ISO></LANGU_ISO>               <TRANSPZONE></TRANSPZONE>               <HOUSE_NO></HOUSE_NO>               <GENDER></GENDER>               <NAME_LIST></NAME_LIST>               <TAXJURCODE></TAXJURCODE>               <PERS_NO></PERS_NO>               <ADDR_TYPE></ADDR_TYPE>               <NRELSTAT></NRELSTAT>               <INDIUPDATE></INDIUPDATE>               <STREETNA></STREETNA>               <HOUSE_NO_LONG></HOUSE_NO_LONG>            </item>         </TE_ORDER_ADDRESS>         <!--Optional:-->         <TE_ORDER_HEADERS>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <DOC_NUMBER></DOC_NUMBER>               <REC_DATE></REC_DATE>               <REC_TIME></REC_TIME>               <CREATED_BY></CREATED_BY>               <QT_VALID_F></QT_VALID_F>               <QT_VALID_T></QT_VALID_T>               <DOC_DATE></DOC_DATE>               <SD_DOC_CAT></SD_DOC_CAT>               <TRAN_GROUP></TRAN_GROUP>               <DOC_TYPE></DOC_TYPE>               <ORD_REASON></ORD_REASON>               <WAR_DATE></WAR_DATE>               <SD_COL_NUM></SD_COL_NUM>               <DLV_BLOCK></DLV_BLOCK>               <BILL_BLOCK></BILL_BLOCK>               <NET_VAL_HD></NET_VAL_HD>               <CURRENCY></CURRENCY>               <CURREN_ISO></CURREN_ISO>               <SALES_ORG></SALES_ORG>               <DISTR_CHAN></DISTR_CHAN>               <DIVISION></DIVISION>               <SALES_GRP></SALES_GRP>               <SALES_OFF></SALES_OFF>               <BUS_AREA></BUS_AREA>               <CT_AREA></CT_AREA>               <CT_VALID_F></CT_VALID_F>               <CT_VALID_T></CT_VALID_T>               <CONDITIONS></CONDITIONS>               <REQ_DATE_H></REQ_DATE_H>               <DATE_TYPE></DATE_TYPE>               <COMPL_DLV></COMPL_DLV>               <DOC_CLASS></DOC_CLASS>               <DOC_INDIC></DOC_INDIC>               <SD_PRIC_PR></SD_PRIC_PR>               <SHIP_COND></SHIP_COND>               <ORDBILLTYP></ORDBILLTYP>               <ORD_PROBAB></ORD_PROBAB>               <SEAR_PRPR></SEAR_PRPR>               <PURCH_NO></PURCH_NO>               <PO_METHOD></PO_METHOD>               <PURCH_DATE></PURCH_DATE>               <PO_SUPPLEM></PO_SUPPLEM>               <REF_1></REF_1>               <ORDERER_NA></ORDERER_NA>               <TELEPHONE></TELEPHONE>               <DUN_COUNT></DUN_COUNT>               <DUN_DATE></DUN_DATE>               <SOLD_TO></SOLD_TO>               <COSTCENTER></COSTCENTER>               <UPDATE_GRP></UPDATE_GRP>               <STAT_CURR></STAT_CURR>               <ISOSTATCUR></ISOSTATCUR>               <CH_ON></CH_ON>               <CUST_GRP1></CUST_GRP1>               <CUST_GRP2></CUST_GRP2>               <CUST_GRP3></CUST_GRP3>               <CUST_GRP4></CUST_GRP4>               <CUST_GRP5></CUST_GRP5>               <AGREE_COND></AGREE_COND>               <CO_AREA></CO_AREA>               <WBS_ELEM></WBS_ELEM>               <EXCHG_RATE></EXCHG_RATE>               <C_CTR_AREA></C_CTR_AREA>               <CRED_ACCNT></CRED_ACCNT>               <CRED_GROUP></CRED_GROUP>               <REPR_GROUP></REPR_GROUP>               <RISK_CATEG></RISK_CATEG>               <CURR_CRED></CURR_CRED>               <ISOCURRCRE></ISOCURRCRE>               <REL_DAT_DD></REL_DAT_DD>               <NEXT_CHDAT></NEXT_CHDAT>               <NEXT_DATE></NEXT_DATE>               <REL_CREDIT></REL_CREDIT>               <HI_TYPE_PR></HI_TYPE_PR>               <DLVSCHEDUS></DLVSCHEDUS>               <PLAN_DLV></PLAN_DLV>               <REF_DOC></REF_DOC>               <OB_JNR_HD></OB_JNR_HD>               <COMP_CODE></COMP_CODE>               <ALT_TAX_CL></ALT_TAX_CL>               <TAX_CLASS2></TAX_CLASS2>               <TAX_CLASS3></TAX_CLASS3>               <TAX_CLASS4></TAX_CLASS4>               <TAX_CLASS5></TAX_CLASS5>               <TAX_CLASS6></TAX_CLASS6>               <TAX_CLASS7></TAX_CLASS7>               <TAX_CLASS8></TAX_CLASS8>               <TAX_CLASS9></TAX_CLASS9>               <REF_DOC_L></REF_DOC_L>               <ASS_NUMBER></ASS_NUMBER>               <DOC_CAT_SD></DOC_CAT_SD>               <KALSM_CH></KALSM_CH>               <ACC_PERIOD></ACC_PERIOD>               <ORDERID></ORDERID>               <NOTIF_NO></NOTIF_NO>               <MASTER_CON></MASTER_CON>               <REF_PROC></REF_PROC>               <CHECK_PART></CHECK_PART>               <PICK_UP_DA></PICK_UP_DA>               <PICK_UP_T1></PICK_UP_T1>               <PICK_UP_T2></PICK_UP_T2>               <NUM_PAY_CA></NUM_PAY_CA>               <LINE_TIME></LINE_TIME>               <TAX_DEST_CT></TAX_DEST_CT>               <ISOTAXDEST></ISOTAXDEST>               <TAX_DEPART></TAX_DEPART>               <ISOTAXDEPA></ISOTAXDEPA>               <EU_TRIANG></EU_TRIANG>               <MAST_CONTR></MAST_CONTR>               <CML_QTY_DA></CML_QTY_DA>               <MS_DATE></MS_DATE>               <VERSION></VERSION>               <REF_DOC_L_LONG></REF_DOC_L_LONG>               <CRM_GUID></CRM_GUID>               <LAND1></LAND1>               <NAME1></NAME1>               <NAME2></NAME2>               <ORT01></ORT01>               <PSTLZ></PSTLZ>               <REGIO></REGIO>               <SORTL></SORTL>               <STRAS></STRAS>               <TELF1></TELF1>               <TELFX></TELFX>               <NAME3></NAME3>               <NAME4></NAME4>               <ORT02></ORT02>               <PSTL2></PSTL2>               <SPRAS></SPRAS>               <STCD1></STCD1>               <STCD2></STCD2>            </item>         </TE_ORDER_HEADERS>         <!--Optional:-->         <TE_ORDER_ITEMS>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <DOC_NUMBER></DOC_NUMBER>               <ITM_NUMBER></ITM_NUMBER>               <MATERIAL></MATERIAL>               <MAT_ENTRD></MAT_ENTRD>               <PR_REF_MAT></PR_REF_MAT>               <BATCH></BATCH>               <MATL_GROUP></MATL_GROUP>               <SHORT_TEXT></SHORT_TEXT>               <ITEM_CATEG></ITEM_CATEG>               <ITEM_TYPE></ITEM_TYPE>               <REL_FOR_DE></REL_FOR_DE>               <REL_FOR_BI></REL_FOR_BI>               <HG_LV_ITEM></HG_LV_ITEM>               <ALTERN_ITM></ALTERN_ITM>               <REA_FOR_RE></REA_FOR_RE>               <PROD_HIER></PROD_HIER>               <OUT_AGR_TA></OUT_AGR_TA>               <TARGET_QTY></TARGET_QTY>               <TARGET_QU></TARGET_QU>               <T_UNIT_ISO></T_UNIT_ISO>               <TARG_QTY_N></TARG_QTY_N>               <TARG_QTY_D></TARG_QTY_D>               <BASE_UOM></BASE_UOM>               <T_BAS_UNIT></T_BAS_UNIT>               <SCALE_QUAN></SCALE_QUAN>               <ROUND_DLV></ROUND_DLV>               <RECON_DATE></RECON_DATE>               <MAX_DEVIAT></MAX_DEVIAT>               <PO_ITM_NO></PO_ITM_NO>               <CUST_MAT22></CUST_MAT22>               <MAX_DEV_PE></MAX_DEV_PE>               <MAX_DEV_DA></MAX_DEV_DA>               <REPAIR_PRO></REPAIR_PRO>               <DLVSCHEDUS></DLVSCHEDUS>               <DLV_GROUP></DLV_GROUP>               <FIXED_QUAN></FIXED_QUAN>               <DELI_UNLIM></DELI_UNLIM>               <OVER_DLV_T></OVER_DLV_T>               <UNDER_DLV></UNDER_DLV>               <BILL_BLOCK></BILL_BLOCK>               <REPLACE_PT></REPLACE_PT>               <METH_BILL></METH_BILL>               <DIVISION></DIVISION>               <BUS_AREA></BUS_AREA>               <NET_VALUE></NET_VALUE>               <CURRENCY></CURRENCY>               <CURREN_ISO></CURREN_ISO>               <MAX_PL_DLV></MAX_PL_DLV>               <PART_DLV></PART_DLV>               <BTCH_SPLIT></BTCH_SPLIT>               <REQ_QTY></REQ_QTY>               <CUM_REQ_DE></CUM_REQ_DE>               <CUM_CF_QTY></CUM_CF_QTY>               <CUM_CON_QU></CUM_CON_QU>               <SALES_UNIT></SALES_UNIT>               <ISOCODUNIT></ISOCODUNIT>               <SALES_QTY1></SALES_QTY1>               <SALES_QTY2></SALES_QTY2>               <GROSS_WEIG></GROSS_WEIG>               <NET_WEIGHT></NET_WEIGHT>               <UNIT_OF_WT></UNIT_OF_WT>               <UNIT_WTISO></UNIT_WTISO>               <VOLUME></VOLUME>               <VOLUMEUNIT></VOLUMEUNIT>               <VOLUNITISO></VOLUNITISO>               <CAU_VBELN></CAU_VBELN>               <CAU_POSNR></CAU_POSNR>               <REF_DOC></REF_DOC>               <POSNR_VOR></POSNR_VOR>               <OBJ_COPY></OBJ_COPY>               <UPDAT_FLAG></UPDAT_FLAG>               <END_RULE></END_RULE>               <DLV_PRIO></DLV_PRIO>               <PLANT></PLANT>               <STGE_LOC></STGE_LOC>               <SHIP_POINT></SHIP_POINT>               <ROUTE></ROUTE>               <KEY_ST></KEY_ST>               <DATE_ST></DATE_ST>               <NBR_ST></NBR_ST>               <STPOS_VBAP></STPOS_VBAP>               <ORDER_PROB></ORDER_PROB>               <CREAT_DATE></CREAT_DATE>               <CREATED_BY></CREATED_BY>               <REC_TIME></REC_TIME>               <TAX_CLASS1></TAX_CLASS1>               <TAX_CLASS2></TAX_CLASS2>               <TAX_CLASS3></TAX_CLASS3>               <TAX_CLASS4></TAX_CLASS4>               <TAX_CLASS5></TAX_CLASS5>               <TAX_CLASS6></TAX_CLASS6>               <TAX_CLASS7></TAX_CLASS7>               <TAX_CLASS8></TAX_CLASS8>               <TAX_CLASS9></TAX_CLASS9>               <FIX_SP_DAY></FIX_SP_DAY>               <VAR_SP_DAY></VAR_SP_DAY>               <PREC_DOC></PREC_DOC>               <NET_PRICE></NET_PRICE>               <COND_P_UNT></COND_P_UNT>               <COND_UNIT></COND_UNIT>               <CONISOUNIT></CONISOUNIT>               <RETOURE></RETOURE>               <CASH_DISC></CASH_DISC>               <AVAILCHECK></AVAILCHECK>               <SUM_REQUIR></SUM_REQUIR>               <MAT_PR_GRP></MAT_PR_GRP>               <ACCT_ASSGT></ACCT_ASSGT>               <REBATE_GRP></REBATE_GRP>               <COMM_GROUP></COMM_GROUP>               <EUR_ART_NR></EUR_ART_NR>               <PRICE_OK></PRICE_OK>               <VAL_TYPE></VAL_TYPE>               <SEP_VALUAT></SEP_VALUAT>               <BATCH_MGMT></BATCH_MGMT>               <IND_BTCH></IND_BTCH>               <MIN_DELY></MIN_DELY>               <UPDATE_GRP></UPDATE_GRP>               <COST_DOC_C></COST_DOC_C>               <SUBTOT_PP1></SUBTOT_PP1>               <SUBTOT_PP2></SUBTOT_PP2>               <SUBTOT_PP3></SUBTOT_PP3>               <SUBTOT_PP4></SUBTOT_PP4>               <SUBTOT_PP5></SUBTOT_PP5>               <SUBTOT_PP6></SUBTOT_PP6>               <EXCH_RATE></EXCH_RATE>               <CH_ON></CH_ON>               <EAN_UPC></EAN_UPC>               <FIX_DATE></FIX_DATE>               <PROFIT_CTR></PROFIT_CTR>               <PRC_GROUP1></PRC_GROUP1>               <PRC_GROUP2></PRC_GROUP2>               <PRC_GROUP3></PRC_GROUP3>               <PRC_GROUP4></PRC_GROUP4>               <PRC_GROUP5></PRC_GROUP5>               <COMPON_QTY></COMPON_QTY>               <SUBSTREASO></SUBSTREASO>               <SPEC_STOCK></SPEC_STOCK>               <ALLOC_INDI></ALLOC_INDI>               <PROFIT_SEG></PROFIT_SEG>               <WBS_ELEM></WBS_ELEM>               <ORDERID></ORDERID>               <PLNG_MATL></PLNG_MATL>               <PLNG_PLANT></PLNG_PLANT>               <BASE_UNIT></BASE_UNIT>               <ISOBASUNIT></ISOBASUNIT>               <CONV_FACT></CONV_FACT>               <ACCTASSCAT></ACCTASSCAT>               <CONSUMPT></CONSUMPT>               <BOMEXPLNO></BOMEXPLNO>               <OBJ_NR_IT></OBJ_NR_IT>               <RES_ANAL></RES_ANAL>               <REQMTSTYP></REQMTSTYP>               <CREDPRICIT></CREDPRICIT>               <PARTRELID></PARTRELID>               <ACTCREDID></ACTCREDID>               <CR_EXCHRAT></CR_EXCHRAT>               <CONFIG></CONFIG>               <CHCLASS_IN></CHCLASS_IN>               <STAT_PRICE></STAT_PRICE>               <COND_UPDAT></COND_UPDAT>               <SERNO_PROF></SERNO_PROF>               <NO_OF_SERI></NO_OF_SERI>               <NOGRPOSTED></NOGRPOSTED>               <MAT_GRP_SM></MAT_GRP_SM>               <MAN_PR_CH></MAN_PR_CH>               <DOC_CAT_SD></DOC_CAT_SD>               <MATDETERID></MATDETERID>               <ITUSAGEID></ITUSAGEID>               <COSTESTNR></COSTESTNR>               <CSTG_VRNT></CSTG_VRNT>               <BOMITEMNR></BOMITEMNR>               <STAT_VAL></STAT_VAL>               <STAT_DATE></STAT_DATE>               <BUS_TRANST></BUS_TRANST>               <PREF_INDIC></PREF_INDIC>               <NRCONDREC></NRCONDREC>               <INTCLASSNR></INTCLASSNR>               <BATCH_EXIT></BATCH_EXIT>               <BOM_CATEGO></BOM_CATEGO>               <BOM_IT_NR></BOM_IT_NR>               <COUNTER></COUNTER>               <INCONSCONF></INCONSCONF>               <OVERH_KEY></OVERH_KEY>               <CSTG_SHEET></CSTG_SHEET>               <CSTG_VRNT1></CSTG_VRNT1>               <PROD_ALLOC></PROD_ALLOC>               <PRICE_REF></PRICE_REF>               <MATPRICGRP></MATPRICGRP>               <MATFRGTGRP></MATFRGTGRP>               <PLANDLVSCH></PLANDLVSCH>               <SEQUENCENO></SEQUENCENO>               <CREDPRIC></CREDPRIC>               <PAY_GUARAN></PAY_GUARAN>               <GURANTEED></GURANTEED>               <CFOP_CODE></CFOP_CODE>               <TAXLAWICMS></TAXLAWICMS>               <TAXLAWIPI></TAXLAWIPI>               <SD_TAXCODE></SD_TAXCODE>               <VALCONTRNR></VALCONTRNR>               <VALCONTRIT></VALCONTRIT>               <ASSORT_MOD></ASSORT_MOD>               <VALSPECSTO></VALSPECSTO>               <MATGRHIE1></MATGRHIE1>               <MATGRHIE2></MATGRHIE2>               <PROMOTION></PROMOTION>               <SALES_DEAL></SALES_DEAL>               <FLGLEADUNI></FLGLEADUNI>               <FREE_GOODS></FREE_GOODS>               <VALID_OBJ></VALID_OBJ>               <TAX_AMOUNT></TAX_AMOUNT>               <MRP_AREA></MRP_AREA>               <CUST_MAT35></CUST_MAT35>               <CR_EXCHRAT_V></CR_EXCHRAT_V>               <EXCHRATEST_V></EXCHRATEST_V>               <ITM_TYPE_USAGE></ITM_TYPE_USAGE>               <CFOP_LONG></CFOP_LONG>               <GROSS_VAL></GROSS_VAL>               <LOG_SYSTEM_OWN></LOG_SYSTEM_OWN>               <TAXLAWISS></TAXLAWISS>               <TAXLAWCOFINS></TAXLAWCOFINS>               <TAXLAWPIS></TAXLAWPIS>            </item>         </TE_ORDER_ITEMS>         <!--Optional:-->         <TE_ORDER_PARTNERS>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <SD_DOC></SD_DOC>               <ITM_NUMBER></ITM_NUMBER>               <PARTN_ROLE></PARTN_ROLE>               <CUSTOMER></CUSTOMER>               <VENDOR_NO></VENDOR_NO>               <PERSON_NO></PERSON_NO>               <CONTACT></CONTACT>               <ADDRESS></ADDRESS>               <UNLOAD_PT></UNLOAD_PT>               <COUNTRY></COUNTRY>               <COUNTRYISO></COUNTRYISO>               <ADDRE_INDI></ADDRE_INDI>               <ACC_1_TIME></ACC_1_TIME>               <CUSTHITYP></CUSTHITYP>               <PRIC_REL></PRIC_REL>               <REBATE_REL></REBATE_REL>               <LEVEL_NR></LEVEL_NR>               <DESC_PARTN></DESC_PARTN>               <TRANSPZONE></TRANSPZONE>               <ASSIGN_HI></ASSIGN_HI>               <VAT_REG_NO></VAT_REG_NO>               <FURTHERPAR></FURTHERPAR>               <PERS_NO></PERS_NO>               <CALEND_UPD></CALEND_UPD>            </item>         </TE_ORDER_PARTNERS>         <!--Optional:-->         <TE_ORDER_SCHEDULES>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <DOC_NUMBER></DOC_NUMBER>               <ITM_NUMBER></ITM_NUMBER>               <SCHED_LINE></SCHED_LINE>               <SCHED_TYPE></SCHED_TYPE>               <RELFORDEL></RELFORDEL>               <REQ_DATE></REQ_DATE>               <REQ_TIME></REQ_TIME>               <REQ_QTY></REQ_QTY>               <CONFIR_QTY></CONFIR_QTY>               <SALES_UNIT></SALES_UNIT>               <ISOCODUNIT></ISOCODUNIT>               <REQ_QTY1></REQ_QTY1>               <BASE_UOM></BASE_UOM>               <ISOBASUNIT></ISOBASUNIT>               <REQ_DATE1></REQ_DATE1>               <REQ_TYPE></REQ_TYPE>               <PLTYPE></PLTYPE>               <BUSIDOCNR></BUSIDOCNR>               <BUSIITNR></BUSIITNR>               <SCHED_LIN1></SCHED_LIN1>               <EARL_DATE></EARL_DATE>               <MAINT_REQ></MAINT_REQ>               <PREQ_NO></PREQ_NO>               <PO_TYPE></PO_TYPE>               <DOC_CAT></DOC_CAT>               <CONF_STAT></CONF_STAT>               <IR_IND></IR_IND>               <RETURNDATE></RETURNDATE>               <DATE_TYPE></DATE_TYPE>               <TP_DATE></TP_DATE>               <MS_DATE></MS_DATE>               <LOAD_DATE></LOAD_DATE>               <GI_DATE></GI_DATE>               <CORR_QTY></CORR_QTY>               <REQ_DLV_BL></REQ_DLV_BL>               <GRP_DEFIN></GRP_DEFIN>               <RELEASTYP></RELEASTYP>               <FORCAST_NR></FORCAST_NR>               <COMMIT_QTY></COMMIT_QTY>               <SIZE2></SIZE2>               <SIZE3></SIZE3>               <UNIT_MEAS></UNIT_MEAS>               <ISO_ROMEI></ISO_ROMEI>               <FORMULAKEY></FORMULAKEY>               <SALESQTYNR></SALESQTYNR>               <SALESQTYDE></SALESQTYDE>               <AVAIL_CON></AVAIL_CON>               <MOVE_TYPE></MOVE_TYPE>               <PREQ_ITEM></PREQ_ITEM>               <LINTYP_EDI></LINTYP_EDI>               <ORDERID></ORDERID>               <PLANORDNR></PLANORDNR>               <BOMEXPL_NO></BOMEXPL_NO>               <CUSTCHSTAT></CUSTCHSTAT>               <GURANTEED></GURANTEED>               <MS_TIME></MS_TIME>               <TP_TIME></TP_TIME>               <LOAD_TIME></LOAD_TIME>               <GI_TIME></GI_TIME>               <ROUTESCHED></ROUTESCHED>            </item>         </TE_ORDER_SCHEDULES>         <!--Optional:-->         <TE_ORDER_TEXTLINES>            <!--Zero or more repetitions:-->            <item>               <OPERATION></OPERATION>               <APPLOBJECT></APPLOBJECT>               <TEXT_NAME></TEXT_NAME>               <TEXT_ID></TEXT_ID>               <LANGU></LANGU>               <LANGU_ISO></LANGU_ISO>               <LINE_CNT></LINE_CNT>               <LINE></LINE>               <FORMAT_COL></FORMAT_COL>            </item>         </TE_ORDER_TEXTLINES>      </urn:ZSD_RFC_GET_DETAIL>   </soapenv:Body></soapenv:Envelope>';
            var oSplitCont = this.getSplitContObj();
            oSplitCont.setBusy(true);

            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_get_detail/130/zservice_zsd_rfc_get_detail/zbinding_zsd_rfc_get_detail',
            jQuery.ajax({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zsd_rfc_get_detail/100/zsd_rfc_get_detail/zsd_rfc_get_detail',
                async: true,
                type: "POST",
                processData: false,
                data: ajaxRequest,
                dataType: 'xml',
                contentType: "text/xml; charset=\"utf-8\"",
                success: function(data, textStatus, jqXHR) {
                    var dataSoapDetail = [];
                    var sItemHeader = jQuery(jqXHR.responseXML).find("TE_ORDER_HEADERS item");
                    var sItemLines = jQuery(jqXHR.responseXML).find("TE_ORDER_TEXTLINES item");
                    var sItemLibera = jQuery(jqXHR.responseXML).find("TE_NIVEL_LIBERACION item");
                    var DOC_NUMBER = sItemHeader.find("DOC_NUMBER").text();
                    var DOC_DATE = sItemHeader.find("DOC_DATE").text();
                    var SOLD_TO = sItemHeader.find("SOLD_TO").text();
                    var RAZON_SOCIAL = sItemHeader.find("NAME1").text() + ' ' + sItemHeader.find("NAME2").text();
                    var IMPORTE = sItemHeader.find("NET_VAL_HD").text();
                    var IMPORTE_CURRENCY = sItemHeader.find("CURRENCY").text();
                    var MOTIVO = sItemLines.find("LINE").text();
                    var SOLICITANTE = sItemHeader.find("CREATED_BY").text();
                    var ULTIMO_APROBADOR = sItemLibera.find("USUARIO").text();
                    var MOTIVO_SAP = sItemHeader.find("BEZEI").text();
                    var REF_DOC = sItemHeader.find("REF_DOC").text();
                    var REF_DOC_L = sItemHeader.find("REF_DOC_L").text();
                    var DOC_CONTABLE = sItemHeader.find("BELNR").text();

                    var dataSoapDetailItem = [];
                    var sItemItems = jQuery(jqXHR.responseXML).find("TE_ORDER_ITEMS item");
                    sItemItems.each(function() {
                        var sItemItem = jQuery(this);
                        var ITM_NUMBER = sItemItem.find("ITM_NUMBER").text();
                        var MATERIAL = that.formatter.removeZero(sItemItem.find("MATERIAL").text());
                        var DESCRIPCION = sItemItem.find("SHORT_TEXT").text();
                        var REQ_QTY = parseFloat(sItemItem.find("REQ_QTY").text());
                        if (REQ_QTY === 0) {
                            REQ_QTY = parseInt(sItemItem.find("TARGET_QTY").text());
                        }
                        var NET_VALUE = sItemItem.find("NET_VALUE").text();
                        var TARGET_QU = sItemItem.find("TARGET_QU").text();
                        dataSoapDetailItem.push({ ITM_NUMBER: ITM_NUMBER, MATERIAL: MATERIAL, DESCRIPCION: DESCRIPCION, REQ_QTY: REQ_QTY, NET_VALUE: NET_VALUE, TARGET_QU: TARGET_QU });
                    });
                    dataSoapDetail = { DOC_NUMBER: DOC_NUMBER, DOC_DATE: DOC_DATE, SOLD_TO: SOLD_TO, RAZON_SOCIAL: RAZON_SOCIAL, IMPORTE: IMPORTE, IMPORTE_CURRENCY: IMPORTE_CURRENCY, MOTIVO: MOTIVO, SOLICITANTE: SOLICITANTE, ULTIMO_APROBADOR: ULTIMO_APROBADOR, MOTIVO_SAP: MOTIVO_SAP, REF_DOC: REF_DOC, REF_DOC_L: REF_DOC_L, DOC_CONTABLE: DOC_CONTABLE, ITEMS: dataSoapDetailItem };
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(dataSoapDetail);
                    that.getView().setModel(oModel, "dataSoapDetail");
                    var IDListArticle = sap.ui.controller("com.prodac.liberacion.notacreditoProdacLiberacionNotaCredito.controller.Detail").ongetIDListArticle();
                    sap.ui.getCore().byId(IDListArticle).setVisibleRowCount(dataSoapDetail.ITEMS.length);
                    that.getSplitContObj().toDetail(that.createId('PageDetail'));
                    setTimeout(function() {
                        that.getView().byId('PageDetail').scrollTo(0);
                    }, 100);
                    oSplitCont.setBusy(false);
                },
                error: function(e, xhr, status) {
                    sap.m.MessageBox.error('No se puede conectar al sistema, actualiza la aplicación.', {
                        details: e.statusCode().status + ' ' + e.statusText
                    });
                    oSplitCont.setBusy(false);
                },
                complete: function(xhr, status) {
                    oSplitCont.setBusy(false);
                }
            });
        },
        onListItemPress: function(oEvent) {
            var sNumero = oEvent.getParameter("listItem").data('Numero');
            this.onLoadItem(sNumero);
            //var sNumero = this.getView().byId('ListMenu').getSelectedItem().data('Numero');
        },
        onLoadList: function() {
            var that = this;
            var oList = this.getView().byId('ListMenu');
            var oObjectListItem = new sap.m.ObjectListItem({
                //title: '{dataSoap>VBELN}',
                title: {
                    path: 'dataSoap>VBELN',
                    formatter: function(sValue) {
                        return that.formatter.removeZero(sValue);
                    }
                },
                type: 'Active',
                iconInset: true,
                //number: "{dataSoap>NETWR}",
                number: {
                    path: 'dataSoap>NETWR',
                    formatter: function(sValue) {
                        return that.formatter.currencyValue(sValue);
                    }
                },
                numberUnit: "{dataSoap>MONEDA}",
                customData: [{
                    Type: "sap.ui.core.CustomData",
                    key: "Numero",
                    value: "{dataSoap>VBELN}"
                }],
                firstStatus: new sap.m.ObjectStatus({
                    //text: "{dataSoap>ERDAT}"
                    text: {
                        parts: ['dataSoap>ERDAT', 'formatdate>/large', 'formatdate>/add'],
                        formatter: function(sDate, sFormat, sOperation) {
                            return that.formatter.date(sDate, sFormat, sOperation);
                        }
                    }
                }),
                attributes: [
                    new sap.m.ObjectAttribute({
                        text: {
                            path: 'dataSoap>KUNNR',
                            formatter: function(sValue) {
                                return that.formatter.removeZero(sValue);
                            }
                        }
                    }),
                    new sap.m.ObjectAttribute({ text: "{dataSoap>RAZON_SOCIAL}" })
                ]
            });

            var sFilters = [];

            oList.bindItems({
                path: 'dataSoap>/',
                template: oObjectListItem,
                filters: new sap.ui.model.Filter(sFilters, true),
                sorter: [new sap.ui.model.Sorter('VBELN', true, false)]
            });
        },
        onLoadData: function() {
            var oSplitCont = this.getSplitContObj();
            oSplitCont.setBusy(true);
            var that = this;
            /*
            var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
            sap.ui.getCore().setModel(userModel, "userapi");
            userModel.attachRequestCompleted(function onCompleted(oEventModel) {
            */
            var sUser = sap.ui.getCore().getModel('UserSAP').User;
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
                async: true,
                type: "POST",
                processData: false,
                data: ajaxRequest,
                dataType: 'xml',
                contentType: 'application/soap+xml',
                success: function(data, textStatus, jqXHR) {
                    var dataSoap = [];
                    var sItems = jQuery(jqXHR.responseXML).find("TE_ITAB item");
                    sItems.each(function() {
                        var sItem = jQuery(this);
                        var VBELN = sItem.find("VBELN").text();
                        var AUART = sItem.find("AUART").text();
                        var BEZEI = sItem.find("BEZEI").text();
                        var ERDAT = sItem.find("ERDAT").text();
                        var KUNNR = sItem.find("KUNNR").text();
                        var RAZON_SOCIAL = sItem.find("RAZON_SOCIAL").text();
                        var NETWR = sItem.find("NETWR").text();
                        var MONEDA = sItem.find("MONEDA").text();
                        dataSoap.push({ VBELN: VBELN, AUART: AUART, BEZEI: BEZEI, ERDAT: ERDAT, KUNNR: KUNNR, RAZON_SOCIAL: RAZON_SOCIAL, NETWR: NETWR, MONEDA: MONEDA });
                    });
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(dataSoap);
                    that.getView().setModel(oModel, "dataSoap");
                    that.getView().byId('SearchField').setValue('');
                    if (BolList) {
                        that.onLoadList();
                        BolList = false;
                    }
                    oSplitCont.setBusy(false);
                },
                error: function(e, xhr, status) {
                    sap.m.MessageBox.error('No se puede conectar al sistema, actualiza la aplicación.', {
                        details: e.statusCode().status + ' ' + e.statusText
                    });
                    oSplitCont.setBusy(false);
                },
                complete: function(xhr, status) {
                    oSplitCont.setBusy(false);
                }
            });
            //});
        },
        getParamValue: function(paramName) {
            var url = window.location.search.substring(1); //get rid of "?" in querystring
            var qArray = url.split('&'); //get key-value pairs
            for (var i = 0; i < qArray.length; i++) {
                var pArr = qArray[i].split('='); //split key and value
                if (pArr[0] == paramName)
                    return pArr[1]; //return value
            }
        },
        onAfterRendering: function() {
            var that = this;
            var oSplitCont = this.getSplitContObj(),
                ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
            // set all parent elements to 100% height, this should be done by app developer, but just in case
            if (ref && !ref._sapui5_heightFixed) {
                ref._sapui5_heightFixed = true;
                while (ref && ref !== document.documentElement) {
                    var $ref = jQuery(ref);
                    if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
                        break;
                    }
                    if (!ref.style.height) {
                        ref.style.height = "100%";
                    }
                    ref = ref.parentNode;
                }
            }
            //this.onLoadData();
            //this.onLoginDialog();
            var sUser = this.getParamValue("usuario");
            sap.ui.getCore().setModel({ User: sUser }, 'UserSAP');
            this.getView().setModel('Hola', "UserSAP");

            var oModelUser = new sap.ui.model.json.JSONModel();
            oModelUser.setData({ Name: sUser });
            this.getView().setModel(oModelUser, "User");

            this.getView().byId('SplitCont').removeStyleClass('hide');
            this.onLoadData();
        },
        onLoginDialog: function() {
            var that = this;
            var inputUser;
            var inputPass;
            var submitButton;
            var dialog = new sap.m.Dialog({
                title: 'Autenticación',
                type: 'Message',
                stretch: false,
                content: [
                    new sap.m.Label({ text: 'Usuario', labelFor: 'submitDialogInputUser' }),
                    inputUser = new sap.m.Input('submitDialogInputUser', {
                        width: '100%',
                        placeholder: ''
                            /*,
                            						value:'POLIVERAB'*/
                    }),
                    new sap.m.Label({ text: 'Clave', labelFor: 'submitDialogInputPass' }),
                    inputPass = new sap.m.Input('submitDialogInputPass', {
                        width: '100%',
                        placeholder: '',
                        type: 'Password'
                            /*,
                            						value: 'seidor2018'*/
                    })
                ],
                beginButton: submitButton = new sap.m.Button({
                    id: 'idButtonLogin',
                    text: 'Acceder',
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

            inputUser.onkeyup = function(e) {
                if (e.keyCode == 13) {
                    sap.ui.getCore().byId("idButtonLogin").firePress();
                }
            };

            inputPass.onkeyup = function(e) {
                if (e.keyCode == 13) {
                    sap.ui.getCore().byId("idButtonLogin").firePress();
                }
            };

            dialog.open();
            jQuery("#" + dialog.getId()).keydown(function(e) {
                if (e.keyCode === 27) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        onLogin: function(sUser, sPassword) {
            var that = this;
            var oVBoxView = this.getView().byId('VBoxView');
            oVBoxView.setBusy(true);

            var ajaxRequest = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\
							   <soap:Header/>\
							   <soap:Body>\
								<urn:Z_VALID_CREDENTIALS>\
									<I_PASSWORD>' + sPassword + '</I_PASSWORD>\
									<I_USUARIO>' + sUser + '</I_USUARIO>\
								</urn:Z_VALID_CREDENTIALS>\
							   </soap:Body>\
							</soap:Envelope>';

            // 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_valid_credentials/130/zservice_zws_valid_credentials/zbinding_zws_valid_credentials',
            jQuery.ajax({
                url: 'https://destinations-d040c3179.dispatcher.us2.hana.ondemand.com/destinations/SAPDEV_RFC/sap/bc/srt/rfc/sap/zws_valid_credentials/100/zws_valid_credentials/zws_valid_credentials',
                async: true,
                type: "POST",
                processData: false,
                data: ajaxRequest,
                dataType: 'xml',
                contentType: "application/soap+xml",
                success: function(data, textStatus, jqXHR) {
                    var dataSoap = [];
                    var sUserID = jQuery(jqXHR.responseXML).find("E_USERID").text();
                    if (!sUserID === '') {
                        sap.m.MessageBox.information('Accesos incorrectos', {
                            onClose: function(oAction) {
                                oVBoxView.setBusy(false);
                                that.onLoginDialog();
                            }
                        });
                    } else {
                        sap.ui.getCore().setModel({ User: sUser }, 'UserSAP');
                        that.getView().setModel('Hola', "UserSAP");

                        var oModelUser = new sap.ui.model.json.JSONModel();
                        oModelUser.setData({ Name: sUser });
                        that.getView().setModel(oModelUser, "User");

                        oVBoxView.setBusy(false);
                        that.getView().byId('SplitCont').removeStyleClass('hide');
                        that.onLoadData();
                    }
                },
                error: function(e, xhr, status) {
                    sap.m.MessageBox.error('No se puede conectar al sistema, actualiza la aplicación.', {
                        details: e.statusCode().status + ' ' + e.statusText,
                        onClose: function(oAction) {
                            that.onLoginDialog();
                        }
                    });
                    oVBoxView.setBusy(false);
                },
                complete: function(xhr, status) {
                    //oVBoxView.setBusy(false);
                }
            });
        },
        onPressNavToDetail: function(oEvent) {
            this.getSplitContObj().to(this.createId("detailDetail"));
        },
        onPressDetailBack: function() {
            this.getSplitContObj().backDetail();
        },
        onPressMasterBack: function() {
            this.getSplitContObj().backMaster();
        },
        onPressGoToMaster: function() {
            this.getSplitContObj().toMaster(this.createId("master2"));
        },
        getSplitContObj: function() {
            var result = this.byId("SplitCont");
            if (!result) {
                jQuery.sap.log.error("SplitApp object can't be found");
            }
            return result;
        }
    });
});
