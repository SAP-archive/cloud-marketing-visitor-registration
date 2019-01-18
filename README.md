# Visitor Registration App

This app was built with the aim to showcase the usage of [SAP Marketing APIs](https://api.sap.com/package/SAPS4HANAMarketingCloud?section=Artifacts) together with the integration option of the [SAP Cloud Platform Integration](https://cloudplatform.sap.com/integration.html) and the extension options via [SAP Cloud Platform](https://cloudplatform.sap.com/).

<img align="right" width="150px"  src=documents/tradefair-visitor-app-mobile.png>
The use case of this UI5 app is the visitor data registration at a trade fair. An employee can use this app directly at the trade fair booth of his company to upload the visitors data like contact name, contact birth date and email together with company related data and visit remarks as an interaction to the connected SAP Marketing Cloud system. 
The upload of the data happens via an integration flow (iFlow) deployed on the SAP Cloud Platform Integration tenant to a connected SAP Marketing Cloud tenant. Value help options for contact and company data from the SAP Marketing Cloud tenant are also available. 


The app can be adapted to specific needs to match similar or different business cases.

## Overview

![](docs/component-overview.jpg)

## Prerequisite

To deploy this app successfully, you ideally have access to your:
* [SAP Cloud Platform](https://help.sap.com/viewer/p/CP) account (also [trial account](https://cloudplatform.sap.com/try.html) possible)
* [SAP Cloud Platform Integration](https://help.sap.com/viewer/product/CLOUD_INTEGRATION/Cloud) account (for the iFlow)
* [SAP Marketing Cloud](https://help.sap.com/viewer/p/SAP_MARKETING_CLOUD) tenant (target system)

You need to have access to the SAP Marketing Cloud product. With this you have also access to a SAP Cloud Platform Integration tenant. Check the [Onboarding Guide](https://help.sap.com/viewer/8982c0f28bca4839b563f10df1f8c259/latest/en-US) of SAP Marketing Cloud for information on how to get access to the different tenants involved.

## Installation

In a first step, [clone](https://help.github.com/articles/cloning-a-repository/) or download this repository to your local machine. The repository contains all artifacts required for this scenario. 

This is the integration flow to be deployed on the SAP Cloud Platform Integration tenant and the UI app to be imported into the Web IDE of your SAP Cloud Platform account. 

For detailed steps of the setup and configation of the needed components see the [Setup and Configuration guide](SETUP.md).

## Adapting the Sample Scenario

This sample app is a fully running example. It can serve as starting point for own enhancements and changes. Different adaptations to this iFlow are possible to fit other needs than the available one.

A typical adaptation option would be adding custom fields to the app. As an example, the contact entity of SAP Marketing Cloud would have been extended with custom fields following the chapter [Custom Fields](https://help.sap.com/viewer/13d84c47bb6749a188fd53915c256516/latest/en-US/7a4a465413254133ba2ca0f806fb9006.html) in the [Extensibility Guide](https://help.sap.com/viewer/13d84c47bb6749a188fd53915c256516/latest/en-US). The following steps are necessary to expose the custom fields also in this sample app:

* iFlow adaption	
	* Enhance the <code>CSV_Input_Data.XSD</code> file located in *Resources* of the iFlow. It contains the exposed attributes to be uploaded to SAP Marketing Cloud. Add your extension field at a suitable place. Note that the order of the attributes in the payload is relevant.
	* Enhance the XSLT transformation <code>MM_Transformation.xsl</code>. Check the relevant segments: For example, an extension to <code>ContactOriginData</code> EntitySet needs to be added to the <code>ContactOriginData</code> section.
	* Save and deploy the iFlow again to activate the changes.

* UI App Adaption
	* Add your field to the view [<code>webapp/view/VisitorRegistration.view.xml</code>](/ui/webapp/view/VisitorRegistration.view.xml) with suitable binding
	* Add your field to the view model *Data* in file [<code>webapp/model/AppModel.json</code>](/ui/webapp/model/AppModel.json). Note that the order is relevant here and needs to match the order of the fields in the <code>CSV_Input_Data.XSD</code> of the iFlow

Many other enhancement options are possible like adding additional services to the app and iFlow.

## To Do

In future this scenario might be enhanced with:
* Offline support
* Suitable Country API Service for reading countries directly from the SAP Marketing Cloud tenant
* UI app for file upload

## Support

The sample app is provided "as-is", no support is guaranteed. For more information, see the SCN blog "TODO!!!!!!!!!!!!!!"(), where you can use the comment function to ask questions and provide feedback.

## License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the SAP Sample Code License except as noted otherwise in the [LICENSE](LICENSE.md) file.

[Back to top](#visitor-registration-app)