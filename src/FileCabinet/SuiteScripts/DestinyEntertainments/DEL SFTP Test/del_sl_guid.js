/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https', 'N/ui/serverWidget', 'N/ui/message', 'N/url', 'N/log'],
    /**
     * @param{https} https
     * @param{serverWidget} serverWidget
     * @param{message} message
     * @param{url} url
     * @param{log} log
     */
    (https, serverWidget, message, url, log) => {
      /**
       * Defines the Suitelet script trigger point.
       * @param {Object} scriptContext
       * @param {ServerRequest} scriptContext.request - Incoming request
       * @param {ServerResponse} scriptContext.response - Suitelet response
       * @since 2015.2
       */
      function onRequest(option) {
        
        if (option.request.method === 'GET') {
          let form = serverWidget.createForm({
            title: 'Create a GUID Password',
          });
          
          let credField = form.addCredentialField({
            
            id: 'password',
            label: 'FTP Password',
            restrictToDomains: ['ftp.tronios.com'],
            restrictToCurrentUser: false,
            restrictToScriptIds: 'customscript_del_sftptest_ss',
            //test!
          });
          credField.maxLenth = 32;
          form.addSubmitButton();
          option.response.writePage({
            pageObject: form,
          });
        } else {
          let passwordGuid = option.request.parameters.password;
          log.debug(passwordGuid);
          let guidForm = serverWidget.createForm({
            title: 'GUID Form',
          });
          guidForm.addPageInitMessage({
            type: message.Type.CONFIRMATION,
            title: 'GUID Created successfully',
            message: 'Please copy the code below.',
          });
          
          guidForm.addField({
            id: 'guidresult',
            type: serverWidget.FieldType.TEXT,
            label: 'GUID',
          }).defaultValue = passwordGuid;
          
          option.response.writePage({
            pageObject: guidForm,
          });
          
        }
      }
      
      return {
        onRequest: onRequest,
      };
      
    });
