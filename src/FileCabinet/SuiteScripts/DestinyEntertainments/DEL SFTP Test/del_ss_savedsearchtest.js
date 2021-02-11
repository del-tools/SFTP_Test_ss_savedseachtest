/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/log'],
    /**
     * @param{search} search
     * @param{log} log
     */
    (search, log) => {
      
      /**
       * Defines the Scheduled script trigger point.
       * @param {Object} scriptContext
       * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
       * @since 2015.2
       */
      const execute = (scriptContext) => {

        try {
          const searchItem = () => {
          
          };
          
          const searchSales = () => {
          
          };
          
          const printResults = () => {
          
          };
          
          
          
          searchItem();
          searchSales();
          printResults();
          
        } catch (e) {
          log.emergency({title: e.name, details: e.message});
        }
      };
      
      return {execute};
      
    });
