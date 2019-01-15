sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("sap.mkt.demo.visitor-registration-ui.controller.VisitorRegistration", {

		onInit: function () {

			// some "constants" -----
			// cpi iflow http endpoint via destination of SAP Cloud platform
			this.sHttpEndpoint = "/cpi-destination";
			// ideally take custom origins for the trade fair to have specific facets
			this.contactOriginId = "SAP_HYBRIS_CONSUMER"; //"ZZ_TRADE_FAIR_ID"; 
			this.accountOriginId = "SAP_CRM_BUPA"; // 

			// accessing the user api - see: 
			// https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/1de599bf722446849d2b2e10132df42a.html
			var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			this.getView().setModel(userModel, "userapi");
		},

		// just reset the model fields.
		clearData: function () {

			var oModel = this.getView().getModel();
			var oData = oModel.getData().Data;
			var sProperty = "";
			// for all properties of shallow/plain object
			for (var key in oData) {
				// js-lint guard-for-in...
				if (Object.prototype.hasOwnProperty.call(oData, key)) {
					sProperty = "/Data/" + key;
					oModel.setProperty(sProperty, "");
				}
			}
		},

		// send json payload to CPI iflow http input
		sendData: function () {

			var oModel = this.getView().getModel();
			// set the Contact/Company ID + Origin hidden (not on ui) if necessary
			var datehelper = new Date().toISOString().replace(/[-T:Z]/g, "");

			var sContactId = oModel.getProperty("/Data/ContactId");
			if (sContactId === "") {
				// set generated data for contact id, else assume it is set through value help
				oModel.setProperty("/Data/ContactId", "TRADEFAIR-CONTACT-" + datehelper);
				oModel.setProperty("/Data/ContactOrigin", this.contactOriginId);
			}

			// set email permission explicitely, but only if email is given...
			if (oModel.getProperty("/Data/ContactEmail") !== "") {
				oModel.setProperty("/Data/ContactEmailPermission", this.getView().byId("contPerm").getState() ? "Y" : "N");
			}

			// if company id empty -> upload company currently as new company -> add id + origin
			var sCompanyId = oModel.getProperty("/Data/CompanyId");
			if (sCompanyId === "") {
				oModel.setProperty("/Data/CompanyId", "TRADEFAIR-COMPANY-" + datehelper);
				oModel.setProperty("/Data/CompanyOrigin", this.accountOriginId);
			}

			// add interaction day hidden (DayOfVisit) always
			var dayOfVisit = new Date().toISOString().replace(/[-]/g, "").split("T")[0];
			oModel.setProperty("/Data/DayOfVisit", dayOfVisit);

			// get x-csrf-token first, as cpi endpoint is csrf Protected
			var sUrl = this.sHttpEndpoint;
			var sPayload = JSON.stringify(oModel.getData().Data);
			var that = this;

			this.setInputBusy(true);
			this.fetchToken(sUrl).then(function (token) {
				that.postPayload(sUrl, token, sPayload, that);
			}).catch(function (e) {
				this.setInputBusy(false);
			});
		},

		onSearchCompany: function (event) {

			var oModel = this.getView().getModel();
			var oAccountModel = this.getView().getModel("accountSrv");
			var item = event.getParameter("suggestionItem");

			var bClearButtonPressed = event.getParameter("clearButtonPressed");

			if (bClearButtonPressed) {
				// reset the Company Fields
				oModel.setProperty("/Data/CompanyId", "");
				oModel.setProperty("/Data/CompanyOrigin", "");
				oModel.setProperty("/Data/CountryName", "");
				oModel.setProperty("/Data/CityName", "");
				oModel.setProperty("/Data/PostalCode", "");
				oModel.setProperty("/Data/StreetName", "");
				oModel.setProperty("/Data/HouseNumber", "");
				return;
			}

			if (item) {
				oModel.setProperty("/Data/CompanyName", item.getText());
				var path = item.getBindingContext("accountSrv").getPath();
				oModel.setProperty("/Data/CompanyId", oAccountModel.getProperty(path + "/CorporateAccountID"));
				oModel.setProperty("/Data/CompanyOrigin", oAccountModel.getProperty(path + "/CorporateAccountOrigin"));
				oModel.setProperty("/Data/CountryName", oAccountModel.getProperty(path + "/CountryName"));
				oModel.setProperty("/Data/CityName", oAccountModel.getProperty(path + "/CityName"));
				oModel.setProperty("/Data/PostalCode", oAccountModel.getProperty(path + "/ContactPostalCode"));
				oModel.setProperty("/Data/StreetName", oAccountModel.getProperty(path + "/StreetName"));
				oModel.setProperty("/Data/HouseNumber", oAccountModel.getProperty(path + "/AddressHouseNumber"));
			}
		},

		onSuggestCompany: function (event) {
			var value = event.getParameter("suggestValue");
			var oSource = event.getSource();
			var aFilters = [];
			if (value) {
				// combined or filter on different fields
				aFilters = [
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("FullName", sap.ui.model.FilterOperator.Contains, value),
						new sap.ui.model.Filter("CityName", sap.ui.model.FilterOperator.Contains, value),
						new sap.ui.model.Filter("StreetName", sap.ui.model.FilterOperator.Contains, value)
					], false)
				];
			}

			// apply them and register for dataReceived    
			var oBinding = event.getSource().getBinding("suggestionItems");
			oBinding.filter(aFilters);
			oBinding.attachEventOnce("dataReceived", function () {
				// now activate suggestion popup
				oSource.suggest();
			});

		},

		onSuggestContact: function (event) {
			var value = event.getParameter("suggestValue");
			var oSource = event.getSource();
			var aFilters = [];
			if (value) {
				// combined or filter on different fields
				aFilters = [
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("FullName", sap.ui.model.FilterOperator.Contains, value),
						new sap.ui.model.Filter("EmailAddress", sap.ui.model.FilterOperator.Contains, value)
					], false)
				];
			}

			// apply them and register for dataReceived    
			var oBinding = event.getSource().getBinding("suggestionItems");
			oBinding.filter(aFilters);
			oBinding.attachEventOnce("dataReceived", function () {
				// now activate suggestion popup
				oSource.suggest();
			});

		},

		onSearchContact: function (event) {
			var oModel = this.getView().getModel();
			var oContactModel = this.getView().getModel("contactSrv");
			var item = event.getParameter("suggestionItem");

			if (event.getParameter("clearButtonPressed")) {
				// reset the Contact Fields filled before through the valuehelp
				oModel.setProperty("/Data/ContactId", "");
				oModel.setProperty("/Data/ContactOrigin", "");
				oModel.setProperty("/Data/FirstName", "");
				oModel.setProperty("/Data/LastName", "");
				oModel.setProperty("/Data/BirthDate", "");
				oModel.setProperty("/Data/ContactEmail", "");
				oModel.setProperty("/Data/ContactJobTitle", "");
				return;
			}

			if (item) {

				// prefilling of the fields with data from backend
				oModel.setProperty("/Data/ContactEmail", item.getText());
				var path = item.getBindingContext("contactSrv").getPath();
				oModel.setProperty("/Data/ContactId", oContactModel.getProperty(path + "/ContactID"));
				oModel.setProperty("/Data/ContactOrigin", oContactModel.getProperty(path + "/ContactOrigin"));
				oModel.setProperty("/Data/FirstName", oContactModel.getProperty(path + "/FirstName"));
				oModel.setProperty("/Data/LastName", oContactModel.getProperty(path + "/LastName"));
				var ds = oContactModel.getProperty(path + "/BirthDate");
				ds = ds ? ds.toISOString().split("T")[0].replace(/-/g,"") : "";
				oModel.setProperty("/Data/BirthDate", ds);
				oModel.setProperty("/Data/ContactJobTitle", oContactModel.getProperty(path + "/ContactFunctionName"));

				// now set also company data if available
				var companyguid = oContactModel.getProperty(path + "/CorporateAccountUUID");
				if (companyguid) {
					var oAccountModel = this.getView().getModel("accountSrv");
					var accountpath = "/CorporateAccounts(guid'" + companyguid + "')/CorporateAccountOriginData";
					var fnSuccess = function (data) {
						if (data && data.results && data.results[0]) {
							var company = data.results[0];
							oModel.setProperty("/Data/CompanyId", company.CorporateAccountID);
							oModel.setProperty("/Data/CompanyOrigin", company.CorporateAccountOrigin);
							oModel.setProperty("/Data/CompanyName", company.FullName);
							oModel.setProperty("/Data/CountryName", company.CountryName);
							oModel.setProperty("/Data/CityName", company.CityName);
							oModel.setProperty("/Data/PostalCode", company.ContactPostalCode);
							oModel.setProperty("/Data/StreetName", company.StreetName);
							oModel.setProperty("/Data/HouseNumber", company.AddressHouseNumber);
						}
					};
					// data needs to be read from backend as it is typically not in model
					oAccountModel.read(accountpath, {
						success: fnSuccess
					});
				}
			}

		},

		setInputBusy: function (busy) {
			this.getView().byId("p").setBusy(busy);
		},

		// communication to CPI tradefair-visitor-iflow with https endpoint, direct ajax calls
		fetchToken: function (url) {
			return new Promise(function (resolve, reject) {
				// get x-csrf-token first, as cpi endpoint is csrf Protected
				$.ajax({
					type: "GET",
					url: url,
					headers: {
						"x-csrf-token": "fetch"
					},
					success: function (data, textStatus, xhdr) {
						var token = xhdr.getResponseHeader("x-csrf-token");
						if (token) {
							resolve(token);
						} else {
							MessageBox.error("No CSRF Token obtained from CPI");
							reject();
						}
					},
					error: function (error) {
						MessageBox.error("Error when fetching x-csrf-token from CPI");
						reject();
					}
				});
			});
		},

		postPayload: function (url, token, payload, that) {
			$.ajax({
				type: "POST",
				url: url,
				headers: {
					"x-csrf-token": token
				},
				processData: false,
				contentType: "application/json",
				data: payload,
				success: function (d, t, x) {
					that.setInputBusy(false);
					MessageToast.show("Data successfully uploaded");
				},
				error: function (e) {
					that.setInputBusy(false);
					var info = e && e.responseText ? e.responseText : "";
					MessageBox.error("Error occured when uploading Data", {
						details: info
					});
				}
			});
		}

	});
});