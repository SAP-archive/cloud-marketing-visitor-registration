/*
 The integration developer needs to create the method processData
 This method takes Message object of package com.sap.gateway.ip.core.customdev.util
 which includes helper methods useful for the content developer:
 The methods available are:
 public java.lang.Object getBody()
 public void setBody(java.lang.Object exchangeBody)
 public java.util.Map<java.lang.String,java.lang.Object> getHeaders()
 public void setHeaders(java.util.Map<java.lang.String,java.lang.Object> exchangeHeaders)
 public void setHeader(java.lang.String name, java.lang.Object value)
 public java.util.Map<java.lang.String,java.lang.Object> getProperties()
 public void setProperties(java.util.Map<java.lang.String,java.lang.Object> exchangeProperties)
 public void setProperty(java.lang.String name, java.lang.Object value)
 */

import com.sap.gateway.ip.core.customdev.util.Message
import java.util.HashMap
import groovy.xml.XmlUtil
import groovy.util.XmlSlurper
import groovy.json.JsonSlurper


/*
 * Some helper functions for the data upload iflow 
 *  
 */

// default...
def Message processData(Message message) {
	return message
}

def Message extractPayloads(Message message){

	// after transformation, we have the 3 payloads in one big xml
	// split it to 3 payloads for the 3 services
	def body = message.getBody(java.lang.String) as String

	def Payloads = new XmlSlurper().parseText(body)

	// Company Payload:
	def companyPayld =  Payloads.CompanyPayload.batchParts

	// Contact Payload
	def contactPayld = Payloads.ContactPayload.batchParts

	// Interaction Payload
	def interactionPayld = Payloads.InteractionPayload.batchParts

	// set it to exchange properties for later use
	message.setProperty("CompanyPayload", XmlUtil.serialize(companyPayld) )
	message.setProperty("ContactPayload", XmlUtil.serialize(contactPayld) )
	message.setProperty("InteractionPayload", XmlUtil.serialize(interactionPayld) )

	return message
}


def Message setPayloadAndUrl(Message message){

	// SendEntity needs to be set accordingly, is used to choose payload
	def entity = message.getProperty("SendEntity")
	def host = message.getProperty("SAPMarketingHost")
	def payload = ""
	def url = ""

	switch (entity) {
		case "Company":
			payload = message.getProperty("CompanyPayload") as String
			url = "sap/opu/odata/SAP/API_MKT_CORPORATE_ACCOUNT_SRV;v=0002"
			break

		case "Contact":
			payload = message.getProperty("ContactPayload") as String
			url = "sap/opu/odata/SAP/API_MKT_CONTACT_SRV;v=0002"
			break

		case "Interaction":
			payload = message.getProperty("InteractionPayload") as String
			url = "sap/opu/odata/SAP/API_MKT_INTERACTION_SRV"
			break

	}
	
	if ( payload != ""  ) {
	    
    	// check if host was configured with or without trailing /..
    	url = ( host[-1..-1] == "/" ? host + url : host + "/" + url )
    
    	message.setBody(payload)
    	message.setProperty("ServiceURL", url)    
	    
	}

	return message

}


// todo - check input of http call if plain json
def Message checkJSON(Message message){

	def body = message.getBody(java.lang.String) as String
	def js = new JsonSlurper()

	try {

		def jsObject = js.parseText(body)
		message.setProperty("IsJson", 'X')

	} catch(Exception ex) {
		message.setProperty("IsJson", '')
	}

	return message
}

def Message beautifyBody(Message message){
    
    // in this case the message body contains a text node (<body>) 
    // in which there is an xml as text -> < as &lt and > as &gt 
    
    // to be more readable in the email, transform that back
    
    def body = message.getBody(java.lang.String) as String
    body = body.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&apos;","'").replaceAll("&quot;","\"").replaceAll("&amp;","&")
    
    message.setBody(body)
    
    return message
}




// LOGGING HELPER STUFF ++++++++++++++++++++++++++++++++++++++++++++++
// use TRACE functionality instead..

def Message log(Message message){

    // log only if Iflow Loglevl is set to Debug or Trace..
	def loglevel =  message.properties.SAP_MessageProcessingLogConfiguration.logLevel
	message.setProperty("MyLoglevel", loglevel)
	message.setProperty("MyLoglevelString", loglevel.toString())
	if( loglevel in ['DEBUG', 'TRACE'])   {

		// local iflow step counter
		def step = message.getProperty("MessageStep")

		stepnumber = step.toInteger()
		stepnumber += 1
		message.setProperty("MessageStep", stepnumber)

		def title = "Log " + stepnumber
		return logMessageHelper(title, false, message)

	} else {
		return message		
	}

}



def Message logMessageHelper(String title, boolean bodyonly, Message message){

	def messageLog = messageLogFactory.getMessageLog(message)

	Map properties = message.getProperties()
	Map headers = message.getHeaders()
	def body = message.getBody(java.lang.String) as String

	StringBuilder  ps = new StringBuilder()

	if (!bodyonly) {

		ps << " ***** All Message Headers:\n"
		// iterate over map and log all keys and values
		headers.each { key, value -> ps << " * ${key}=${value}\n" }

		ps <<  "\n ***** All Message Properties:\n"
		// iterate over map and log all keys and values
		properties.each { key, value -> ps << " * ${key}=${value}\n" }

	}

	ps << "\n ***** Message Body:\n"
	try {
		body = XmlUtil.serialize(body)
	} catch (all){
		output = body
	}
	ps << body

	if(messageLog != null){
		messageLog.addAttachmentAsString(title, ps.toString() , "text/plain");
	}

	return message;
}
