<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" />

	<!-- use of externalized parameters SourceSystemId and SourceSystemType for headers -->
	<xsl:param name="SourceSystemId" />
	<xsl:param name="SourceSystemType" />

	<xsl:template match="/">

		<Payloads>

			<!-- Generate payload for API_MKT_CONTACT_SRV -->
			<ContactPayload>

				<batchParts>
					<batchChangeSet>

						<xsl:for-each select="Data/Line">

							<!-- data for ContactOriginData Entity -->
							<xsl:if test="FirstName!='' and LastName!='' ">

								<batchChangeSetPart>
									<xsl:call-template name="Headers" />

									<ContactOriginData>
										<ContactOriginData>
											<ContactID>
												<xsl:value-of select="ContactId" />
											</ContactID>

											<xsl:copy-of select="ContactOrigin" />

											<OriginDataLastChgUTCDateTime>
												<xsl:value-of select="format-dateTime(current-dateTime(),'[Y0001]-[M01]-[D01]T[H01]:[m01]:[s]+0000')" />
											</OriginDataLastChgUTCDateTime>

											<xsl:copy-of select="FirstName" />
											<xsl:copy-of select="LastName" />
										
											<xsl:if test="BirthDate != ''">
            									<BirthDate>
            										<xsl:call-template name="birthdateformat">
            											<xsl:with-param name="datestring" select="BirthDate" />
            										</xsl:call-template>
            									</BirthDate>
								            </xsl:if>
										
											<EmailAddress>
												<xsl:value-of select="ContactEmail" />
											</EmailAddress>
							
											<!-- company related data -->
											<CorporateAccountID>
											    	<xsl:value-of select="CompanyId" />
											</CorporateAccountID>
											<CorporateAccountOrigin>
											    <xsl:value-of select="CompanyOrigin" />
											</CorporateAccountOrigin>
											<ContactFunctionName>
								    		    <xsl:value-of select="ContactJobTitle" />
								            </ContactFunctionName>
							
										</ContactOriginData>
									</ContactOriginData>

								</batchChangeSetPart>

							</xsl:if>

							<!-- data for MarketingPermission Entity -->
							<xsl:if test="ContactEmail!='' and ContactEmailPermission!='' ">
								<xsl:call-template name="MarketingPermissions">
									<xsl:with-param name="PermissionID" select="ContactEmail" />
									<xsl:with-param name="Permission" select="ContactEmailPermission" />
									<xsl:with-param name="PermissionUTC" select="DayOfVisitTimeStampUTC" />
									<xsl:with-param name="PermissionOrigin" select="'EMAIL'" />
									<xsl:with-param name="CommMedium" select="'EMAIL'" />
								</xsl:call-template>
							</xsl:if>

						</xsl:for-each>

					</batchChangeSet>
				</batchParts>
			</ContactPayload>


			<!-- Generate payload for API_MKT_CORPORATE_ACCOUNT_SRV -->
			<CompanyPayload>
				<batchParts>
					<batchChangeSet>

						<xsl:for-each select="Data/Line">

							<xsl:if test="CompanyName!=''">
								<batchChangeSetPart>
									<xsl:call-template name="Headers" />
									<CorporateAccountOriginData>
										<CorporateAccountOriginData>
											<CorporateAccountID>
												<xsl:value-of select="CompanyId" />
											</CorporateAccountID>
											<CorporateAccountOrigin>
												<xsl:value-of select="CompanyOrigin" />
											</CorporateAccountOrigin>
											<FullName>
												<xsl:value-of select="CompanyName" />
											</FullName>
											<!-- timestamp needed for companies -->
											<OriginDataLastChgUTCDateTime>
												<xsl:value-of select="format-dateTime(current-dateTime(),'[Y0001]-[M01]-[D01]T[H01]:[m01]:[s]+0000')" />
											</OriginDataLastChgUTCDateTime>
											
											<xsl:copy-of select="CountryName" />
									        <ContactPostalCode>
									            <xsl:value-of select="PostalCode"/>
                                            </ContactPostalCode>
											<xsl:copy-of select="CityName" />
											<xsl:copy-of select="StreetName" />
											
											<AddressHouseNumber>
                                                <xsl:value-of select="HouseNumber"/>
                                            </AddressHouseNumber>
                                            
											
										</CorporateAccountOriginData>
									</CorporateAccountOriginData>
								</batchChangeSetPart>
							</xsl:if>

						</xsl:for-each>
					</batchChangeSet>
				</batchParts>
			</CompanyPayload>

			<!-- Generate payload for API_MKT_INTERACTION_SRV -->
			<InteractionPayload>
				<batchParts>
					<batchChangeSet>

						<xsl:for-each select="Data/Line">

							<!-- condition for creating an interaction -->
							<xsl:if test="DayOfVisitTimeStampUTC!= ''">

								<batchChangeSetPart>
									<method>POST</method>
									<Interactions>
										<Interaction>

											<InteractionUUID>00000000-0000-0000-0000-000000000000</InteractionUUID>
											<InteractionContactId>
												<xsl:value-of select="ContactId" />
											</InteractionContactId>
											<InteractionContactOrigin>
												<xsl:value-of select="ContactOrigin" />
											</InteractionContactOrigin>
											<!-- choose suitable comm medium + interaction type -->
											<CommunicationMedium>IN_PERSON</CommunicationMedium>
											<InteractionType>APPOINTMENT</InteractionType>
											<InteractionTimeStampUTC>
											    <xsl:value-of select="DayOfVisitTimeStampUTC" />
											</InteractionTimeStampUTC>
											<InteractionContent>
												<xsl:value-of select="Remark" />
											</InteractionContent>
										</Interaction>
									</Interactions>

								</batchChangeSetPart>

							</xsl:if>

						</xsl:for-each>

					</batchChangeSet>
				</batchParts>
			</InteractionPayload>

		</Payloads>

	</xsl:template>


	<!-- HELPER TEMPLATES -->

	<xsl:template name="Headers">
		<method>PUT</method>
		<headers>
			<header>
				<headerName>Sap-Cuan-SourceSystemId</headerName>
				<headerValue>
					<xsl:value-of select="$SourceSystemId" />
				</headerValue>
			</header>
			<header>
				<headerName>Sap-Cuan-SourceSystemType</headerName>
				<headerValue>
					<xsl:value-of select="$SourceSystemType" />
				</headerValue>
			</header>
			<header>
				<headerName>Sap-Cuan-ForceSynchronousProcessing</headerName>
				<headerValue>X</headerValue>
			</header>
		</headers>
	</xsl:template>

	<!-- template for Marketing Permissions segment for the different Marketing permission types -->
	<xsl:template name="MarketingPermissions">

		<xsl:param name="PermissionID" />
		<xsl:param name="Permission" />
		<xsl:param name="PermissionUTC" />
		<xsl:param name="PermissionOrigin" />
		<xsl:param name="CommMedium" />

		<batchChangeSetPart>
			<method>PATCH</method>
			<MarketingPermissions>
				<MarketingPermission>
				    <ContactID>
				        <xsl:value-of select="ContactId" />
				    </ContactID>
					<xsl:copy-of select="ContactOrigin" />
					<ContactPermissionID>
						<xsl:value-of select="$PermissionID" />
					</ContactPermissionID>
					<!-- tbc -->
					<ContactPermissionOrigin>
						<xsl:value-of select="$PermissionOrigin" />
					</ContactPermissionOrigin>
					<PermissionUTCDateTime>
					    <xsl:value-of select="$PermissionUTC" />
					</PermissionUTCDateTime>
					<!-- permission for the marketing area assigned for contact -->
					<MarketingArea></MarketingArea>
					<CommunicationMedium>
						<xsl:value-of select="$CommMedium" />
					</CommunicationMedium>
					<CommunicationCategory>
					</CommunicationCategory>
					<ContactPermission>
						<xsl:value-of select="$Permission" />
					</ContactPermission>
					<IsConfirmationRequired>false</IsConfirmationRequired>
				</MarketingPermission>
			</MarketingPermissions>
		</batchChangeSetPart>
	</xsl:template>
	
	<!-- template function for Birthdate formatting: yyyymmdd -> yyyy-mm-dd'T00:00:00' -->
	<xsl:template name="birthdateformat">
		<!-- import parameter -->
		<xsl:param name="datestring" />

		<xsl:variable name="yyyy">
			<xsl:value-of select="substring($datestring,1,4)" />
		</xsl:variable>
		<xsl:variable name="mm">
			<xsl:value-of select="substring($datestring,5,2)" />
		</xsl:variable>
		<xsl:variable name="dd">
			<xsl:value-of select="substring($datestring,7,2)" />
		</xsl:variable>
		<xsl:variable name="apos" select='"&apos;"' />
		<!-- return result -->
		<xsl:value-of select="concat($yyyy,'-',$mm,'-',$dd,$apos,'T00:00:00')" />

	</xsl:template>


</xsl:stylesheet>