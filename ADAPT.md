# Adapting the Sample Scenario

The following steps are necessary to expose custom fields in the sample scenario:

* iFlow Adaptation	
	* Enhance the <code>CSV_Input_Data.XSD</code> file located under the *Resources* tab of the iFlow. It contains the exposed attributes to be uploaded to SAP Marketing Cloud. Add your extension field at a suitable place. Note that the order of the attributes in the payload is relevant.
	* Enhance the XSLT transformation <code>MM_Transformation.xsl</code>. Check the relevant segments: For example, an extension to <code>ContactOriginData</code> EntitySet needs to be added to the <code>ContactOriginData</code> section.
	* Save and deploy the iFlow again to activate the changes.

* UI App Adaptation
	* Add your field to the view [<code>webapp/view/VisitorRegistration.view.xml</code>](/ui/webapp/view/VisitorRegistration.view.xml) with suitable binding
	* Add your field to the view model *Data* in file [<code>webapp/model/AppModel.json</code>](/ui/webapp/model/AppModel.json). Note that the order is relevant here and needs to match the order of the fields in the <code>CSV_Input_Data.XSD</code> of the iFlow

Many other enhancement options are possible like adding additional services to the UI app and iFlow.
