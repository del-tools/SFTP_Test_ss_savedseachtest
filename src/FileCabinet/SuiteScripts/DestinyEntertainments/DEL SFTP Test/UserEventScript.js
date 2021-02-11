/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/search'],
   /**
 * @param{log} log
 * @param{search} search
 */
   (log, search) => {
      /**
      * Defines the function definition that is executed before record is loaded.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @param {Form} scriptContext.form - Current form
      * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
      * @since 2015.2
      */
      const beforeLoad = (scriptContext) => {
        try {
           // CODE GOES HERE
        } catch (e) {
           log.error(e.name, e.message);
        }
      }
  
      return {beforeLoad}
  
   });
