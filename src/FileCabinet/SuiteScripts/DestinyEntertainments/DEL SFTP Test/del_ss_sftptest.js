/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/sftp', 'N/file', 'N/log', 'N/search', 'N/task'],
/**
* @param{sftp} sftp
* @param{file} file
* @param{log} log
* @param{search} search
* @param{task} task
*/
    (sftp, file, log, search, task) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                log.debug("Script type:" + scriptContext.type);
                log.debug('Date Now: ' + Date.now().toString());
                // const username = 'bitnami';
                // const url = 'sandbox.audioinstallations.co.uk';
                // const port = 22;
                // // const fileName = Date.now().toString() + '.txt';
                // // const fileContents = 'This is a test file.'
                // const fileDirectory = '/';
                // const keyID = 'custkey_wp_audioinstallations';
                // const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQCvyoqELpQ9g/80pEz1x/lPFJ6l8dqlD3Avsdm550ZIBVkQr8CKfkV5zlBZxbnadcvWBKyRQvSk7NP23q6mEcfhQ0dZKSPoLgQ+C0bDOnYTnn4c6LMk/zWlFmpfvZbAsOFJGegV/Qe/EVbJGMiKtXqyG1OcXGDcghCqKS1kzNpPlKE+Fh7eAYfHSt/fc90AkyF39wwlqKzjfXWH1Y1F5rNXBvzWaDegyGiNIlTlW83fC+tPJAyjUKTbD8K3c8Ejn5r7DQv7LgmQj9WbWiKX6LHd3BSFZ4P9s/t7geCJzbSXue5vSwZt1UUt47mIGgcPvmXjq2SiFOwod/XhaEbbuZft';
                // log.debug("Loaded variables");
              //GLOBAL VARIABLES
              const fileId = 1741848;
   
              //DESTINY SFTP
               const username = 'ec2-user';
               const url = 'sftp.del.tools';
               const port = 22;
               // const fileName = Date.now().toString() + '.txt';
               // const fileContents = 'This is a test file.'
               const fileDirectory = 'sftp/inbound/';
               const keyID = 'custkey_del_sftpnetsuite';
               const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDPQ9+NAV8MjZNUCJNEdjMHV9vuOBZ0CIbXvCyHUqHL4ndmAreL3ji2hRz9mZjO0BZshuR1m8f8MJtm47+EetsSCKCkRErNjn/fHcKWDLf5pALQW5vrx5NAXGjboOxHM4KNtHdHvil6iaXJL5EF8ORXGTHGdGNhi196sUDHqCVqA/BbIjDcTvAVDEEDj06a4bIVa+8ascQMgRnMWWLETkOa9YaAUzLzvzBkthBhK4si/3oro8ykflnb4Fjmt/xLyM1haUJVwOwSHTOh7f/oy3ih1Z9aX0iK3VfAC51hccOZ1RVsl2Kz0BK+PIoNFfIaSzHW/61zg99U6dewBXdWRNVD';
               log.debug("Loaded variables");
  
              // //TRONIOS FTP
              //  const username = 'destinystock';
              //  const url = 'ftp.tronios.com';
              //  const port = 22;
              //  // const fileName = Date.now().toString() + '.txt';
              //  // const fileContents = 'This is a test file.'
              //  const fileDirectory = 'upload';
              //  // const keyID = 'custkey_del_sftpnetsuite';
              //  const guid = 'cd4a0a3bacd94714bda711750a163b6c';
              //  const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQCpEQn/My858BsvslF7yKjc/Knru9Q7LUDiwdiIZAWjCcvcsMeBhA5tj0nl/RbI83XRdqBrBin71zqYyIx3lCh6Wi2anDlm0tpC2LeYfBbLvtHuXGhhcHVhwRZ7x8vj0z1oplxbf6vEXb3/tiylKNE+gUis/K5YWV4fGCfG6l0H2NAXmK2xEury8K4iYAwkjJcI2dA+bNmuAQIRl8aMhkdzCvy4sfTPEq+OZ0bXE18yMk3MQSg7TjYYqZ9ISyE+9sA54uzBfvd0t4eXKThKCA7B5/Heqxa8jXejvVLpdyeT/8yUEt9ZJxzexPuvMH7/zCIh6/sAQ7KAkI7YdhNZ3iHp';
              //  log.debug("Loaded variables");
                
                const connection = sftp.createConnection({
                    username: username,
                    // passwordGuid: guid,
                    url: url,
                    port: port,
                    hostKey: hostKey,
                    hostKeyType: 'rsa',
                    keyId: keyID
                });
                
                log.debug("Created connection");
                
                function loadSearch() {
                  const mySearch = search.load({
                    id: 'customsearch_del_tof_itemlist'
                  });
                  const mySearchId = mySearch.searchId;
                  return mySearchId;
                }
                
                const myTask = task.create({
                  taskType: task.TaskType.SEARCH
                });
                
                myTask.savedSearchId = loadSearch();
                myTask.fileId = fileId;
                const myTaskId = myTask.submit();
                
                let taskStatus = task.checkStatus({
                  taskId: myTaskId
                });
                
                log.debug("Task Status", taskStatus);
  
                if (taskStatus.status === task.TaskStatus.COMPLETE) {
                  const testFile = file.load({
                    id: fileId // /testing/testcsv.csv
                  })
  
                  log.debug("Test file loaded");
  
                  connection.upload({
                    directory: fileDirectory,
                    // filename: '201812101707.js',
                    file: testFile,
                    replaceExisting: true
                  })
                  log.debug("File uploaded");
                }
                
                // const fileToUpload = file.create({
                //     name: fileName,
                //     fileType: file.Type.PLAINTEXT,
                //     contents: fileContents
                // });
                
                // connection.upload({
                //     directory: fileDirectory,
                //     filename: fileName,
                //     file: fileToUpload,
                //     replaceExisting: false
                // });
                
                // let list = connection.list();
                // log.debug(list);
                //
                // for (let i = 0; i<list.length; i++){
                //     log.debug(list[i]);
                // }
                
                // connection.makeDirectory({path: '/test',});
                // log.debug('Create directory.');
                
                // const testFile = file.load({
                //     id: 597041 // /testing/test.js
                // })
                //
                // log.debug("Test file loaded");
   
               // connection.move({
               //       from: fileDirectory + testFile.name,
               //       to: fileDirectory + 'archive/' + testFile.name
               //    }
               //
               // )

              //   connection.upload({
              //       directory: fileDirectory,
              //       // filename: '201812101707.js',
              //       file: testFile,
              //       replaceExisting: true
              //   })
              // log.debug("File uploaded");

   
               // connection.removeFile({
               //    path: fileDirectory + '201812101707.js',
               // })
                //
                // let itemList = search.create({
                //     type: "inventoryitem",
                //     filters:
                //        [
                //            ["type","anyof","InvtPart"],
                //            "AND",
                //            ["isinactive","is","F"],
                //            "AND",
                //            ["inventorylocation","anyof","2","7","27"],
                //            "AND",
                //            ["name","doesnotstartwith","PRA"],
                //            "AND",
                //            ["vendor","anyof","1380"],
                //            "AND",
                //            ["custitem_itemstatus","anyof","2","1"]
                //        ],
                //     columns:
                //        [
                //            search.createColumn({
                //                name: "itemid",
                //                summary: "GROUP",
                //                label: "Name"
                //            }),
                //            search.createColumn({
                //                name: "mpn",
                //                summary: "GROUP",
                //                label: "MPN"
                //            }),
                //            search.createColumn({
                //                name: "salesdescription",
                //                summary: "GROUP",
                //                label: "Description"
                //            }),
                //            search.createColumn({
                //                name: "created",
                //                summary: "GROUP",
                //                label: "Date Created"
                //            }),
                //            search.createColumn({
                //                name: "vendor",
                //                summary: "GROUP",
                //                label: "Preferred Supplier"
                //            }),
                //            search.createColumn({
                //                name: "locationaveragecost",
                //                summary: "AVG",
                //                label: "Location Average Cost"
                //            }),
                //            search.createColumn({
                //                name: "lastpurchaseprice",
                //                summary: "MAX",
                //                label: "Last Purchase Price"
                //            }),
                //            search.createColumn({
                //                name: "locationquantityavailable",
                //                summary: "SUM",
                //                label: "Location Available"
                //            })
                //        ]
                // });
                // const itemListString = itemList.toJSON();
                // let searchResultCount = itemList.runPaged().count;
                // log.debug("itemList result count",searchResultCount);
                //
                //
                // for (let i = 0; i<itemListString.length; i++){
                //     log.debug(itemListString[i]);
                // }
                // log.debug("itemList: ",itemListString);
    
                // const itemListFile = file.create({
                //     name: 'itemListFile.txt',
                //     fileType: file.Type.PLAINTEXT,
                //     contents: itemList
                // });
                // log.debug("File created");
                
                // connection.upload({
                //     directory: fileDirectory,
                //     file: itemListFile,
                //     replaceExisting: false
                // })
                // log.debug("File uploaded");
                
            } catch (e) {
                log.emergency({title:e.name, details:e.message});
            }
        }

        return {execute: execute};

    });
