sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Core",
    "sap/ui/core/Element"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, Message, coreLibrary, Core, Element) {
        "use strict";
        var MessageType = coreLibrary.MessageType;
        return Controller.extend("assignmentcurd.controller.assignmentcurd", {
            onInit: function () {
                this.onPressLoad();
                this.refreshform();

                this._MessageManager = Core.getMessageManager();
                this._MessageManager.removeAllMessages();
                this._MessageManager.registerObject(this.getView().byId("idEmployeeTabel"), true);
                this.getView().setModel(this._MessageManager.getMessageModel(), "message");

            },

            onPressLoad: function () {
                this.oModel = new sap.ui.model.json.JSONModel();
                this.oModel.loadData(sap.ui.require.toUrl("assignmentcurd/model/empdatamodel.json"), null, false);
                this.getView().setModel(this.oModel, "LocalModel");
            },

            onPressCreate: function () {
                if (!this.oCreatebuttonfragment) {
                    var sFragmentPath = "assignmentcurd.view.Fragments.createbutton";
                    this.oCreatebuttonfragment = Fragment.load({
                        id: this.getView().getId(),
                        name: sFragmentPath,
                        controller: this.getView().getController()
                    }).then(function (oDialog) {
                        this.getView().addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }

                this.oCreatebuttonfragment.then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));


            },
            inputValidationCheck: function () {
                let aformElements = this.getView().byId("idCreateFragmentform").getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
                for (let i = 1; i < aformElements.length; i++) {
                    if (aformElements[i].getLabel().getProperty("required") === true) {
                        let feilds = aformElements[i].getFields();
                        for (let j = 0; j < feilds.length; j++) {
                            this.handelRequiredField(feilds[j], aformElements[i].getLabel().getText());
                        }
                    }
                }
            },

            onPressCreateSave: function () {
                this.inputValidationCheck();
                if (this.getView().getModel("message").getData().length > 0) {
                    this.getView().byId("messagePopoverBtn").firePress();
                }
                else {
                    let oCreateData = this.getView().getModel("LocalModel").getProperty("/EmployeeList");
                    let EmployeeCreationObject = this.getView().getModel("LocalModel").getProperty("/EmployeeCreationObject");
                    if (oCreateData.length == 0) {
                        EmployeeCreationObject.EmployeeId = 1;
                    } else {
                        EmployeeCreationObject.EmployeeId = oCreateData[oCreateData.length - 1].EmployeeId + 1;
                    };
                    oCreateData.push(EmployeeCreationObject);
                    this.getView().getModel("LocalModel").setProperty("/EmployeeList", oCreateData);
                    this.onPressCreateClose();
                }
            },

            onPressCreateClose: function () {
                this.refreshform();
                this.byId("idEmpCreatFragmentDialoge").close();

            },
            refreshform: function () {
                let oCreateEmployeeObj = {
                    "EmployeeId": "",
                    "Salutation": -1,
                    "First_Name": "",
                    "Last_Name": "",
                    "Address": "",
                    "CountryCode": "",
                    "ContactNo": "",
                    "Position": ""
                }

                this.getView().getModel("LocalModel").setProperty("/EmployeeCreationObject", oCreateEmployeeObj);


            },

            handelRequiredField: function (oInput, sAdditionalText) {
                let sTarget = oInput.getBindingPath("value");
                this.removeMessageFromTarget(sTarget);
                if (!oInput.getValue()) {
                    this._MessageManager.addMessages(
                        new Message({
                            message: "A mandatory field is required",
                            type: MessageType.Error,
                            target: sTarget,
                            additionalText: sAdditionalText

                        })
                    );
                }

            },

            createMessagePopover: function () {
                if (!this.oMessagePopoverDialog) {
                    var sFragmentPath = "assignmentcurd.view.Fragments.messagepopover";
                    this.oMessagePopoverDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sFragmentPath,
                        controller: this.getView().getController()
                    }).then(function (oDialog) {
                        this.getView().addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }

                this.oMessagePopoverDialog.then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));

            },

            handleMessagePopoverPress: function (oEvent) {
                if (!this.oMessagePopoverDialog) {
                    this.createMessagePopover();
                }
                this.oMessagePopoverDialog.then(function (oDialog) {
                    this.getView().byId("messagePopoverBtn").addDependent(oDialog);
                    oDialog.toggle(oEvent.getSource());

                }.bind(this));
            },

            removeMessageFromTarget: function (sTarget) {
                this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                    if (oMessage.target === sTarget) {
                        this._MessageManager.removeMessages(oMessage);
                    }
                }.bind(this));
            },
            buttonTypeFormatter: function () {
                var sHighestSeverity;
                var aMessages = this._MessageManager.getMessageModel().oData;
                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sHighestSeverity = "Negative";
                            break;
                        case "Warning":
                            sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
                            break;
                        case "Success":
                            sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
                            break;
                        default:
                            sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
                            break;
                    }
                });

                return sHighestSeverity;
            },

            // Display the number of messages with the highest severity
            highestSeverityMessages: function () {
                var sHighestSeverityIconType = this.buttonTypeFormatter();
                var sHighestSeverityMessageType;

                switch (sHighestSeverityIconType) {
                    case "Negative":
                        sHighestSeverityMessageType = "Error";
                        break;
                    case "Critical":
                        sHighestSeverityMessageType = "Warning";
                        break;
                    case "Success":
                        sHighestSeverityMessageType = "Success";
                        break;
                    default:
                        sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                        break;
                }

                return this._MessageManager.getMessageModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
                    return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
                }, 0) || "";
            },
            getGroupName: function (sControlId) {

                var oControl = Element.registry.get(sControlId);

                if (oControl) {
                    var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
                        sFormTitle = oControl.getParent().getParent().getParent().getTitle();

                    return sFormTitle + ", " + sFormSubtitle;
                }
            },

            isPositionable: function (sControlId) {
                // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
                return sControlId ? true : true;
            },

            // Set the button icon according to the message with the highest severity
            buttonIconFormatter: function () {
                var sIcon;
                var aMessages = this._MessageManager.getMessageModel().oData;

                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sIcon = "sap-icon://error";
                            break;
                        case "Warning":
                            sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                            break;
                        case "Success":
                            sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                            break;
                        default:
                            sIcon = !sIcon ? "sap-icon://information" : sIcon;
                            break;
                    }
                });

                return sIcon;
            },
            onSalutaionChange: function (oEvent) {
                let SalutaionIndex = oEvent.getSource().getSelectedIndex();
                let Saluation = 0;
                switch (SalutaionIndex) {
                    case 0:
                        Saluation = "Mr.";
                        break;
                    case 1:
                        Saluation = "Ms.";
                        break;
                    case 2:
                        Saluation = "Mrs.";
                        break;

                }
                this.getView().getModel("LocalModel").setProperty("/EmployeeCreationObject/Salutation", Saluation);
            },
            getSalutaionIndex: function (sSaluation) {
                let Index = 0;
                switch (sSaluation) {
                    case "Mr.":
                        Index = 0;
                        break;
                    case "Ms.":
                        Index = 1;
                        break;
                    case "Mrs.":
                        Index = 2;
                        break;
                }
                return Index;
            },
            OnPositionAddChnage: function (oEvent) {
                let Positionkey = oEvent.getSource().getSelectedKey();
                let Position = "";
                switch (Positionkey) {
                    case "0":
                        Position = "GET";
                        break;
                    case "1":
                        Position = "Solution Developer";
                        break;
                    case "2":
                        Position = "Team Lead";
                        break;
                    case "3":
                        Position = "Manager";
                        break;
                }
                this.getView().getModel("LocalModel").setProperty("/EmployeeCreationObject/Position", Position);

            },
            OnCountryCodeChnage: function (oEvent) {
                let CountryCodeKey = oEvent.getSource().getSelectedKey();
                let CountryCode = "";
                switch (CountryCodeKey) {
                    case "0":
                        CountryCode = "+ 91";
                        break;
                    case "1":
                        CountryCode = "+ 1";
                        break;
                    case "2":
                        CountryCode = "+ 2";
                        break;

                }
                this.getView().getModel("LocalModel").setProperty("/EmployeeCreationObject/CountryCode", CountryCode);

            },
            PositionColor: function (sPoistion) {
                let state = "None";
                switch (sPoistion) {
                    case "GET":
                        state = "Information";
                        break;
                    case "Solution Developer":
                        state = "Success";
                        break;
                    case "Team Lead":
                        state = "Error";
                        break;
                    case "Manager":
                        state = "Warning";
                        break;
                }
                return state;
            }
        });
    });
