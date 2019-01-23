
# Setup and Configuration

The following steps describe how to proceed with the setup and configuration of the iFlow, the UI app and the needed destinations.

* [Deployment of the Integration Flow](#deployment-of-the-integration-flow)
	* [Configuring the SFTP Adapter (optional)](#configuring-the-sftp-adapter-optional)
	* [Configuring the HTTPS Endpoint](#configuring-the-https-endpoint)
	* [Configuring Access to SAP Marketing Cloud](#configuring-access-to-sap-marketing-cloud)
	
* [Deployment of the UI App](#deployment-of-the-ui-app)
	* [Destinations](#destinations)
	* [Import the UI App into the Web IDE](#import-the-ui-app-into-the-web-ide)
	* [Deploy the App](#deploy-the-app)

You can also adapt the sample projects to your needs. For more information see here:

* [Adapting the Sample Scenario](README.md#adapting-the-sample-scenario)


## Deployment of the Integration Flow

The iFlow serves as middleware to prepare the payload transmitted from the UI App for sending to the SAP Marketing Cloud tenant. The iFlow handles the creation of the necessary batch payloads for the involved SAP Marketing Cloud APIs:
* API_MKT_CONTACT_SRV;v=0002
* API_MKT_CORPORATE_ACCOUNT_SRV;v=0002
* API_MKT_INTERACTION_SRV

Navigate to the folder *iflow* of your cloned repository and zip all available content to an archive named, for example, *tradefair-visitor-iflow.zip*. Create a custom package in your SAP Cloud Platform Integration tenant and import the zip file in the section Artifacts via *Add -> Integration Flow -> Upload from zip file*.

The iFlow can handle simple json like payloads as sent via the UI app, as well as CSV-like input. It also has an SFTP adapter for file-based upload. 

The different steps in the iFlow check and validate the incoming payload against an XSD file, create the payloads via XSLT transformation and calls the involved OData services in an orchestrated manner: first the company, then the contact and then the interaction is uploaded in synchronous way to immediately get the success response.

After successful import of the iFlow to your package, you can configure it via *Actions -> Configure*. For information on the needed parameters, see the following chapters.


### Configuring the SFTP Adapter (optional)

In case you have an SFTP server available and want to use the file-based load as well, you need to provide the necessary [settings for the SFTP Adapter](https://help.sap.com/viewer/fd940ad7e2034505a055f14e457c6d5b/Cloud/en-US/2de9ee58737247969eb7dc9e68b1b121.html) like host, credentials, file name pattern, and post processing handling.

In case you do not want to use the SFTP adapter yet, you can simply configure dummy values for host and credentials (dummy credentials that are available in the key store) and set a date in the far future, so deployment will not lead to an error. Alternatively, you can  just delete the SFTP input option in your iFlow.

### Configuring the HTTPS Endpoint

You can change the endpoint address of the sender HTTPS endpoint. The URL address of the endpoint is displayed after deployment of the iFlow in the *Monitor* section of the SAP Cloud Platform Integration tenant. Use this address in the URL parameter of the [destination mkt-destination](#destinations) in your SAP Cloud Platform account.

### Configuring Access to SAP Marketing Cloud

To load the data into your SAP Marketing Cloud tenant, you must set up the outbound communication from the SAP Cloud Platform Integration tenant to your SAP Marketing Cloud tenant.
On the configuration screen, specify the URL of your tenant in the parameter *SAPMarketingHost* on tab *More*. In addition, you must provide the necessary connection data on the tab *Receiver* for *MktSystem*. A typical value would be *Internet* for cloud systems, together with the authentication method of your choice (for example *Basic*) together with the credential name maintained in the Key Store. For more details, see [Authentication Options (Outbound)](https://help.sap.com/viewer/368c481cd6954bdfa5d0435479fd4eaf/Cloud/en-US/58a75377cc154f44bb81c0376d330901.html).

Having configured all required parameters, you can deploy the iFlow. After successful deployment, the iFlow appears as *Started* (green) in the monitor of your integration tenant.

To test it, you can directly use [postman](https://www.getpostman.com/) with a simple json payload matching the XSD definition of the iFlow. In case of no modifications, a sample payload looks as follows:

```
	{

		"CompanyId": "COMPANY-1",
		"CompanyOrigin": "SAP_CRM_BUPA",
		"CompanyName": "Postman Upload Company",
		"CountryName": "United States",
		"CityName": "New York",
		"PostalCode": "10001",
		"StreetName": "Postman Avenue",
		"HouseNumber": "1",
		"ContactId": "CONTACT-1",
		"ContactOrigin": "SAP_HYBRIS_CONSUMER",
		"FirstName": "Micky",
		"LastName": "Tester",
		"BirthDate": "20010101",
		"ContactJobTitle": "Postman",
		"ContactEmail": "micky.tester@postman-upload-company.com",
		"ContactEmailPermission": "Y",		
		"DayOfVisitTimeStampUTC": "2019-01-23T12:22:00",
		"Remark": "Contact uploaded via postman"
	
	}
```
You can also send a flat CSV like payload to the HTTPS endpoint, as follows:

```
CompanyId;CompanyOrigin;CompanyName;CountryName;CityName;PostalCode;StreetName;HouseNumber;ContactId;ContactOrigin;FirstName;LastName;BirthDate;ContactJobTitle;ContactEmail;ContactEmailPermission;DayOfVisitTimeStampUTC;Remark
COMPANY-1;SAP_CRM_BUPA;Postman Upload Company;United States;New York;10001;Postman Avenue;1;CONTACT-1;SAP_HYBRIS_CONSUMER;Mickey;Tester;20010101;Postman;mickey.tester@postman-upload-company.com;N;2019-01-23T08:22:00;Contact uploaded via postman
COMPANY-2;SAP_CRM_BUPA;Postman Sending Corporation;United States;New York;10001;Postman Park;10;CONTACT-2;SAP_HYBRIS_CONSUMER;Suzi;Sender;20010203;Sender;suzi.sender@postman-corporation.com;Y;2019-01-23T10:22:00;Visit remark from file
```
Note that the HTTPS endpoint is CSRF-protected in the sample iFlow, so you need to fetch a token first via a GET call and then POST the json payload together with the authentication and token data. The data should reach your SAP Marketing Cloud tenant in three independent API calls, which can be checked in the Import Monitor of the tenant.

## Deployment of the UI App

The UI app is intended to be deployed and hosted on a SAP Cloud Platform account. 

As a prerequisite, the iFlow available in folder *iflow* needs to be imported, configured and deployed on your SAP Cloud Platform Integration tenant. This iFlow will receive the payload containing the combined data from the UI app and send it to the SAP Marketing Cloud tenant after mapping in an orchestrated manner. 

In addition, the UI app also retrieves already existing contact and company data directly from the SAP Marketing Cloud tenant. This data is displayed as search help to avoid duplicate creation of contacts.

For this reason, the app needs two [destinations](https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681/Cloud/en-US/e4f1d97cbb571014a247d10f9f9a685d.html) for communication in the SAP Cloud Platform account.

### Destinations

The communication from the UI5 app to SAP Marketing Cloud for the search helps and to SAP Cloud Platform Integration for the call to the iFlow happens via the destinations named **mkt-destination** and **cpi-destination**.

Set up the destinations or import the destination files available in folder [destinations](/destinations). You can do this using the Cockpit of your SAP Cloud Platform Account. If you imported the destinations, replace the placeholder values for tenant host and connectivity.

Make sure that the communication user for the SAP Marketing Cloud tenant has the authorizations for the required services (communication arrangements for communication scenario SAP_COM_0206 and SAP_COM_0207). 

The names of the destinations are used in the UI app. In case you choose different names, adapt the respective places in the neo-app.json file of the app and - for the CPI destination only - also in file [webapp/controller/VisitorRegistration.controller.js](/ui/webapp/controller/VisitorRegistration.controller.js).

### Import the UI App into the Web IDE 

Import the UI app into the [Web IDE](https://developers.sap.com/tutorials/sapui5-webide-open-webide.html) of your SAP Cloud Platform account. To do so, navigate to the folder *ui* of your cloned repository and zip all available content to an archive named, for example, *visitor-app-ui.zip*. Import this zip file into the workspace of your Web IDE.

Have a look at the structure of the app: it is a simple single page SAP UI5 web app built using the SAP UI5 application template. The most important files are:
* [neo-app.json](/ui/neo-app.json) - holding the path to the resources information (like the destinations)
* [webapp/manifest.json](/ui/webapp/manifest.json) - holding information about routing, models and datasources
* [webapp/view/VisitorRegistration.view.xml](/ui/webapp/view/VisitorRegistration.view.xml) - xml view with the UI elements like input fields
* [webapp/controller/VisitorRegistration.controller.js](/ui/webapp/controller/VisitorRegistration.controller.js) - controller of the xml view where the main logic is located.

The app is built as a multi-model app. It uses a simple json model for the UI view model to send then to the HTTP endpoint of the iFlow. Two named models *accountSrv* and *contactSrv* point to the services API_MKT_CORPORATE_ACCOUNT_SRV;v=0002 and API_MKT_CONTACT_SRV;v=0002 exposed by the destination *mkt-destination*. For details, see details in the manifest.json under *sap.app.datasources* and *sap.app.ui5.models*.

You can directly test the app in the Web IDE using the Run option on the index.html. The app can now be directly deployed or serve as a starting point for own implementations.

### Deploy the App

Deploy the app directly from the Web IDE to your SAP Cloud Platform account using the [deployment option](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/2b38eb45d6ab4da8ac6d8ffedaf679be.html) available on the *Projects* context menu in your workspace. It will be available as HTML5 application under *Application*, from where you can get the application URL to the app to call directly or to integrate for example in your SAP Fiori launchpad.
