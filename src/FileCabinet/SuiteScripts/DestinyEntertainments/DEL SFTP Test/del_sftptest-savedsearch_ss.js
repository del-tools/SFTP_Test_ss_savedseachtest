/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/log', 'N/search', 'N/file', 'N/sftp', 'N/email','N/format','N/runtime'],
    /**
     * @param{log} log
     * @param{search} search
     * @param{file} file
     * @param{sftp} sftp
     * @param{email} email
     * @param{format} format
     * @param{runtime} runtime
     */
    (log, search, file, sftp, email, format,runtime ) => {
        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            let sendtoftp = true;
            runtronfile(1,sendtoftp);
            //runtronfile(2,sendtoftp);
            // runtronfile(3,sendtoftp);
            // runtronfile(4,sendtoftp);
            // runtronfile(5,sendtoftp);
            // runtronfile(6,sendtoftp);
            // runtronfile(7,sendtoftp);
        }

        function runtronfile(daysagorun, sendsftp) {
            let sevendaystart = "daysago" + (daysagorun + 6);
            let sevendayend = "daysago" + daysagorun
            let datetime = getdate();
            function getdate() {
                var now = new Date();
                var local = format.format({
                    value: now,
                    type: format.Type.DATETIME,
                    timezone: format.Timezone.GMT
                });

                let objdate = local.split(" ")[0].split("/")
                let strday = objdate[0]
                let strmonth = objdate[1]
                let stryear = objdate[2]
                let objtime = local.split(" ")[1].split(":")
                let strhour = objtime[0]
                let strminute = objtime[1]
                let strsecond = objtime[2]

                var ret = {};
                ret.file = stryear + strmonth + strday + strhour + strminute + strsecond;
                ret.csv = strday + "/" + strmonth + "/" + stryear;
                return ret;
            }
            log.debug({title: "function init", details: "True"});
            try {
                log.debug({title: "function init in Try", details: "True"});
                let delItemList_Arr = new Array();
                let delItemArrival_Arr = new Array();
                let delItemField_Arr = new Array();
                let del7DaySales_Arr = new Array();
                let del7DaySo_Arr = new Array();
                let del7dayQty_Arr = new Array();
                let delYesterddaySales_Arr = new Array();
                let delbackorder_Arr = new Array();
                let CombinedArray = new Array();
                let matchedarray = false;
                let softerrors = new Array();
                let del_itemstatus = {};

                del_itemstatus["B-Stock"] = 5;
                del_itemstatus["Clearance"] = 4;
                del_itemstatus["Current Line"] = 2;
                del_itemstatus["Discontinued"] = 3;
                del_itemstatus["New Line Not Listed"] = 1;
                del_itemstatus["Spare Part"] = 6;

                let delbackorder_Search = search.create({
                    type: "item",
                    filters:
                        [
                            ["quantitybackordered", "greaterthan", "0"],
                            "AND",
                            ["inventorylocation", "anyof", "7", "27", "2"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({name: "quantitybackordered", label: "Back Ordered"})
                        ]
                });
                // let delItemArrival_Search = search.load({
                //     id: 'customsearch_del_script524_itemarrival'
                // });

                let delItemArrival_Search = search.create({
                    type: "purchaseorder",
                    filters:
                        [
                            ["type", "anyof", "PurchOrd"],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["shipping", "is", "F"],
                            "AND",
                            ["taxline", "is", "F"],
                            "AND",
                            ["formulanumeric: {quantity}-{quantityshiprecv}", "greaterthan", "0"],
                            "AND",
                            ["status", "noneof", "PurchOrd:H", "PurchOrd:C"],
                            "AND",
                            ["expectedreceiptdate", "before", "weeksfromnow8"],
                            "AND",
                            ["closed", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                summary: "MIN",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "tranid",
                                summary: "MIN",
                                label: "Document Number"
                            }),
                            search.createColumn({
                                name: "trandate",
                                summary: "MIN",
                                label: "Date"
                            }),
                            search.createColumn({
                                name: "purchasedescription",
                                join: "item",
                                summary: "GROUP",
                                label: "Purchase Description"
                            }),
                            search.createColumn({
                                name: "itemid",
                                join: "item",
                                summary: "GROUP",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "mpn",
                                join: "item",
                                summary: "GROUP",
                                label: "MPN"
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "SUM",
                                formula: "{quantity}-{quantityshiprecv}",
                                label: "Qty Remaining"
                            }),
                            search.createColumn({
                                name: "location",
                                summary: "GROUP",
                                label: "Location"
                            }),
                            search.createColumn({
                                name: "expectedreceiptdate",
                                summary: "MIN",
                                label: "Arrival Date"
                            }),
                            search.createColumn({
                                name: "entityid",
                                join: "vendor",
                                summary: "GROUP",
                                label: "Name"
                            })
                        ]
                });
                // let delItemList_Search = search.load({
                //     id: 'customsearch_del_script524_item_list'
                // });



                ///THIS SEARCH NEEDS TO CHANGE FROM HERE INDER///
                /*


                 */
                let delItemList_Search_with_inventory = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type", "anyof", "InvtPart"],
                            "AND",
                            ["isinactive", "is", "F"],
                            "AND",
                            ["inventorylocation", "anyof", "2", "7", "27","29"],
                            "AND",
                            ["vendor", "anyof", "1380"],
                            "AND",
                            ["custitem_itemstatus", "anyof", "2", "1"],
                            "AND",
                            ["custitem_pro_item", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                summary: "GROUP",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "mpn",
                                summary: "GROUP",
                                label: "MPN"
                            }),
                            search.createColumn({
                                name: "salesdescription",
                                summary: "GROUP",
                                label: "Description"
                            }),
                            search.createColumn({
                                name: "created",
                                summary: "GROUP",
                                label: "Date Created"
                            }),
                            search.createColumn({
                                name: "vendor",
                                summary: "GROUP",
                                label: "Preferred Supplier"
                            }),
                            search.createColumn({
                                name: "locationaveragecost",
                                summary: "AVG",
                                label: "Location Average Cost"
                            }),
                            search.createColumn({
                                name: "lastpurchaseprice",
                                summary: "MAX",
                                label: "Last Purchase Price"
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "SUM",
                                formula: "NVL({locationquantityavailable},0)+NVL({locationquantityintransit}, 0)",
                                label: "Location Available"
                            })
                        ]
                });


                let delItemList_Search = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type", "anyof", "InvtPart"],
                            "AND",
                            ["isinactive", "is", "F"],
                            "AND",
                            // ["inventorylocation", "anyof", "2", "7", "27","29"],
                            // "AND",
                            ["vendor", "anyof", "1380"],
                            "AND",
                            ["custitem_itemstatus", "anyof", "2", "1"],
                            "AND",
                            ["custitem_pro_item", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                summary: "GROUP",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "mpn",
                                summary: "GROUP",
                                label: "MPN"
                            }),
                            search.createColumn({
                                name: "salesdescription",
                                summary: "GROUP",
                                label: "Description"
                            }),
                            search.createColumn({
                                name: "created",
                                summary: "GROUP",
                                label: "Date Created"
                            }),
                            // search.createColumn({
                            //     name: "vendor",
                            //     summary: "GROUP",
                            //     label: "Preferred Supplier"
                            // }),
                            // search.createColumn({
                            //     name: "locationaveragecost",
                            //     summary: "AVG",
                            //     label: "Location Average Cost"
                            // }),
                            // search.createColumn({
                            //     name: "lastpurchaseprice",
                            //     summary: "MAX",
                            //     label: "Last Purchase Price"
                            // }),
                            // search.createColumn({
                            //     name: "formulanumeric",
                            //     summary: "SUM",
                            //     formula: "NVL({locationquantityavailable},0)+NVL({locationquantityintransit}, 0)",
                            //     label: "Location Available"
                            // })
                        ]
                });

                ////TOO HERE///


                // let del7DaySales_Search = search.load({
                //     id: 'customsearch_del_script524_7daysales'
                // });
                log.audit("transaction.trandate within " + sevendaystart + ", " + sevendayend)
                let del7DaySales_Search = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type", "anyof", "InvtPart"],
                            "AND",
                            ["transaction.type", "anyof", "ItemShip"],
                            "AND",
                            ["inventorylocation", "anyof", "7", "2"],
                            "AND",
                            ["transaction.quantity", "greaterthan", "0"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Transfer"],
                            "AND",
                            ["transaction.trandate", "within", sevendaystart, sevendayend],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Supplier Return"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                summary: "GROUP",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "SUM",
                                formula: "{transaction.quantity}/2",
                                label: "Formula (Numeric)"
                            })
                        ]
                });

                // let del7DaySo_Search = search.load({
                //     id: 'customsearchdel_script524_7day_no_sales'
                // });

                let del7DaySo_Search = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type", "anyof", "InvtPart"],
                            "AND",
                            ["transaction.type", "anyof", "ItemShip"],
                            "AND",
                            ["inventorylocation", "anyof", "7", "2"],
                            "AND",
                            ["transaction.quantity", "greaterthan", "0"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Transfer"],
                            "AND",
                            ["transaction.trandate", "within", sevendaystart, sevendayend],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Supplier Return"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                summary: "GROUP",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "tranid",
                                join: "transaction",
                                summary: "COUNT",
                                label: "Document Number"
                            })
                        ]
                });

                // let del7dayQty_Search = search.load({
                //     id: 'customsearch_del_script524_7dayhighest'
                // });

                let del7dayQty_Search = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type", "anyof", "InvtPart"],
                            "AND",
                            ["transaction.type", "anyof", "ItemShip"],
                            "AND",
                            ["inventorylocation", "anyof", "7", "2"],
                            "AND",
                            ["transaction.quantity", "greaterthan", "0"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Transfer"],
                            "AND",
                            ["transaction.trandate", "within", sevendaystart, sevendayend],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Supplier Return"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"],
                            "AND",
                            ["formulatext: {transaction.appliedtotransaction}", "doesnotstartwith", "Purchase"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                summary: "GROUP",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "quantity",
                                join: "transaction",
                                summary: "MAX",
                                label: "Quantity"
                            })
                        ]
                });

                // let del60daySales_Search = search.load({//YESTERDAYS SALES NOW
                //     id: 'customsearch_del_script524_6monthsales'
                // });

                let delyesterdaySales_Search = search.create({
                    type: "itemfulfillment",
                    filters:
                        [
                            ["trandate", "within", sevendayend, sevendayend],
                            "AND",
                            ["type", "anyof", "ItemShip"],
                            "AND",
                            ["posting", "is", "T"],
                            "AND",
                            ["formulatext: {account}", "startswith", "5"],
                            "AND",
                            ["item.type", "anyof", "InvtPart"],
                            "AND",
                            ["formulatext: {appliedtotransaction}", "doesnotstartwith", "Supp"],
                            "AND",
                            ["formulatext: {appliedtotransaction}", "doesnotstartwith", "Tran"],
                            "AND",
                            ["formulatext: {appliedtotransaction}", "doesnotstartwith", "Purc"],
                            "AND",
                            ["quantity", "greaterthan", "0"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "item",
                                summary: "GROUP",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            })
                        ]
                });

                if (delbackorder_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"delbackorder_Search is 0 </br> This is possible but unlikely, we will investigate on ourside although please ignore this error unless otherwise stated."})
                }
                delbackorder_Search.run().each(buildbackorderArray);

                if (delItemList_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"delItemList_Search is 0 </br>  Something has gone wrong! we are currently investigating this issue."})
                }
                delItemList_Search.run().each(buildItemArray);

                if (delItemArrival_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"delItemArrival_Search is 0 </br>  Something has gone wrong! we are currently investigating this issue."})
                }
                delItemArrival_Search.run().each(buildArrivalArray);

                if (del7DaySales_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"del7DaySales_Search is 0 </br>  Something has gone wrong! we are currently investigating this issue."})
                }
                del7DaySales_Search.run().each(Build7DaySalesArray);

                if (del7DaySo_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"del7DaySo_Search is 0 </br> Something has gone wrong! we are currently investigating this issue."})
                }
                del7DaySo_Search.run().each(Build7DaySOArray);


                if (del7dayQty_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:"del7dayQty_Search is 0 </br> Something has gone wrong! we are currently investigating this issue."})
                }
                del7dayQty_Search.run().each(Build7DayQtyArray);

                if (delyesterdaySales_Search.runPaged().count < 1) {
                    softerrors.push({name:"Query Error (saved Search)",details:
                            "Yesterday's sales were 0 [zero]. <i>(delYesterdaySales_Search)</i><br/><br/> " +
                            "Please ignore this error if yesterday was a Sunday or UK Bank Holiday:<br/>" +
                            "<a href = 'https://www.gov.uk/bank-holidays'>https://www.gov.uk/bank-holidays</a><br/><br/>" +
                            "</br>" +
                            "If yesterday was not a Sunday/Bank Holiday, please <b>DO NOT USE THE FILE</b>.<br/>Please wait for Destiny to investigate the issue and send a new file."})
                }

                delyesterdaySales_Search.run().each(BuildyesterdaySalesArray);


                let itemsDropShipSearch = new Array();
                delItemList_Arr.forEach(function (itemarr) {
                    itemsDropShipSearch.push(itemarr[0])
                })

                if (buildItemFieldDynamicSearch(itemsDropShipSearch).runPaged().count < 1) {
                    let e = new Error('itemsDropShipSearch is 0'); // e.name is 'Error'
                    e.name = 'Saved Search Error';
                    throw e;
                } else {
                    buildItemFieldDynamicSearch(itemsDropShipSearch).run().each(buildItemFieldArray);
                }


                let unmatchedInt = 0;
                delItemList_Arr.forEach(function (itemarr) {
                    let delItemRecord = new Array();
                    delItemRecord.push(itemarr[0], itemarr[1]);

                    for (let i = 0; i < delItemArrival_Arr.length; i++) {
                        if (delItemArrival_Arr[i][4].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(delItemArrival_Arr[i][6], delItemArrival_Arr[i][8]);
                            break;
                        }
                    }
                    if (matchedarray == false) {
                        delItemRecord.push("0", "");
                    } else {
                        matchedarray = false;
                    }
                    for (let i = 0; i < delItemField_Arr.length; i++) {
                        if (delItemField_Arr[i][0] == itemarr[0]) {
                            matchedarray = true;
                            delItemRecord.push(delItemField_Arr[i][1]);
                            if (delItemField_Arr[i][2] == true) {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][3] == del_itemstatus["Discontinued"] || delItemField_Arr[i][3] == del_itemstatus["Clearance"] || delItemField_Arr[i][3] == del_itemstatus["B-Stock"] || delItemField_Arr[i][3] == del_itemstatus["Spare Part"]) {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][1] == true) {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][4] == "") {
                                delItemRecord.push(0);
                            } else {
                                delItemRecord.push(delItemField_Arr[i][4]);
                            }

                            if (delItemField_Arr[i][2] == true) {
                                delItemRecord.push("0");
                            } else {
                                //Monthly Overall Average Demand	Stock Percentages to Hold
                                //fix percentagevalue from string to int
                                let Stock_PercentagesToHold_Int = 0;
                                Stock_PercentagesToHold_Int = parseFloat(delItemField_Arr[i][5]) / 100.0;
                                Stock_PercentagesToHold_Int = Stock_PercentagesToHold_Int || 1
                                //end fix
                                delItemRecord.push(Stock_PercentagesToHold_Int);
                            }
                            break;
                        }
                    }

                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    //Add SEVEN DAYS SALES ARRAY
                    for (let i = 0; i < del7DaySales_Arr.length; i++) {
                        if (del7DaySales_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(del7DaySales_Arr[i][1]);
                            break;
                        }
                    }
                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    //Add SEVEN DAYS SO ARRAY
                    for (let i = 0; i < del7DaySo_Arr.length; i++) {
                        if (del7DaySo_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(del7DaySo_Arr[i][1]);
                            break;
                        }
                    }
                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    //Add SEVEN DAYS QTY ARRAY
                    for (let i = 0; i < del7dayQty_Arr.length; i++) {
                        if (del7dayQty_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(del7dayQty_Arr[i][1]);
                            break;
                        }
                    }

                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    for (let i = 0; i < delYesterddaySales_Arr.length; i++) {
                        if (delYesterddaySales_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(delYesterddaySales_Arr[i][1]);
                            break;
                        }
                    }

                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    //Add Backorder ARRAY
                    for (let i = 0; i < delbackorder_Arr.length; i++) {
                        if (delbackorder_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(delbackorder_Arr[i][1]);
                            break;
                        }
                    }
                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    if (delItemRecord[4] == false) {
                        delItemRecord[4] = "No"
                    } else if (delItemRecord[4] == true) {
                        delItemRecord[4] = "Yes"
                    }
                    // if(delItemRecord[0] == "BBA4011"){
                    //     log.debug("delItemRecord[11]",delItemRecord[11])
                    //     log.debug("itemarr[2]",itemarr[2])
                    // }

                    CombinedArray.push({
                        "Name": delItemRecord[0],
                        "MPN": delItemRecord[1],
                        "Sum of Location Available": itemarr[2] - delItemRecord[11],
                        "Quantity Arriving within 8 Weeks": delItemRecord[2],
                        "Next Arrival Date": delItemRecord[3],
                        'Monthly Overall Average Demand': delItemRecord[5],
                        'Stock Percentages to Hold': delItemRecord[6],
                        "DropShip?": delItemRecord[4],
                        "7 Days Sales": delItemRecord[7],
                        "7 Days Number of Sales Orders": delItemRecord[8],
                        "7 Days Highest Sold Qty": delItemRecord[9],
                        "Yesterday's Sales": delItemRecord[10],//Last 6 Months Sales
                        "Date": datetime.csv///Change to zero to be todays date
                    });

                })

                //log.debug({title:"Item list-item Arrival join", details:"Matched = " + matchedInt + " / UnMatched = " + unmatchedInt +"\n Total items in arrival search = " + delItemArrival_Arr.length});
                log.debug({title: "Item Array", details: delItemList_Arr});
                log.debug({title: "Arrival Array", details: delItemArrival_Arr});
                log.debug({title: "DropShip Array", details: delItemField_Arr});
                log.debug({title: "combined Array", details: CombinedArray});
                log.debug({title: "7Days Sales", details: del7DaySales_Arr});
                log.debug({title: "7Days SO", details: del7DaySo_Arr});
                log.debug({title: "7Days QTY", details: del7dayQty_Arr});
                log.debug({title: "60Days Sales", details: delYesterddaySales_Arr});

                buildcsv(CombinedArray);

                function buildcsv(csvarrayinput) {
                    let csvBody = "";
                    Object.keys(csvarrayinput[0]).forEach(function (headervalue) {
                        csvBody += headervalue + ',';
                    })
                    csvBody = csvBody.substring(0, csvBody.length - 1);
                    csvBody += '\n';

                    csvarrayinput.forEach(function (rowarr) {
                        Object.keys(csvarrayinput[0]).forEach(function (columnname) {
                            csvBody += rowarr[columnname] + ',';
                        })
                        csvBody = csvBody.substring(0, csvBody.length - 1);
                        csvBody += '\n';
                    })

                    let fileObj = file.create({
                        name: "DestinyStockSalesInfo-" + datetime.file + ".csv",
                        fileType: file.Type.CSV,
                        contents: csvBody
                    });
                    fileObj.folder = 739723;

                    let id = fileObj.save();
                    log.audit({title: "File Saved", details: id});
                    if (sendsftp == true) {
                        SFTPFILE(id, 'upload', 'DestinyStockSalesInfo.csv')
                        SFTPFILE(id, 'upload/old', "DestinyStockSalesInfo-" + datetime.file + ".csv")
                    }
                    else{
                        SFTPFILEtest(id, 'upload', 'DestinyStockSalesInfo.csv')
                        SFTPFILEtest(id, 'upload/old', "DestinyStockSalesInfo-" + datetime.file + ".csv")
                    }
                }

                try{
                    let errorbody
                    if(softerrors.length > 0){
                        softerrors.forEach((error) => {
                            errorbody = '<b>' + error.name + '</b><br/>' + error.details + '<br/> <br/>';
                            log.emergency({title: error.name, details: error.details});
                        });
                        email.send({
                            author: 17323496,
                            recipients: "it@destinyentertainments.net; h.smit@tronios.com; L.Koller@tronios.com",
                            subject: 'Suspected Tronios Ordering File Error!',
                            body: 'Please see the below error on the latest tronios ordering file;<br/><br/>' + errorbody
                        });
                    }

                }
                catch (e) {

                }

                function SFTPFILE(fileID, strfileDirectory, outfilename) {
                    /*
                    //DESTINY SFTP

                    const username = 'ec2-user';
                    const url = 'sftp.del.tools';
                    const port = 22;
                    const fileDirectory = 'sftp/inbound/TroniosOrderingFile/';
                    const keyID = 'custkey_del_delsftpserver';
                    const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDPQ9+NAV8MjZNUCJNEdjMHV9vuOBZ0CIbXvCyHUqHL4ndmAreL3ji2hRz9mZjO0BZshuR1m8f8MJtm47+EetsSCKCkRErNjn/fHcKWDLf5pALQW5vrx5NAXGjboOxHM4KNtHdHvil6iaXJL5EF8ORXGTHGdGNhi196sUDHqCVqA/BbIjDcTvAVDEEDj06a4bIVa+8ascQMgRnMWWLETkOa9YaAUzLzvzBkthBhK4si/3oro8ykflnb4Fjmt/xLyM1haUJVwOwSHTOh7f/oy3ih1Z9aX0iK3VfAC51hccOZ1RVsl2Kz0BK+PIoNFfIaSzHW/61zg99U6dewBXdWRNVD';

                    */

                    //TRONIOS FTP
                    var accountid = runtime.accountId;
                    log.debug('ACCOUNT ID', accountid)
                    if(accountid == '3426564'){
                        const username = 'destinystock';
                        const url = 'ftp.tronios.com';
                        const port = 22;

                        const fileDirectory = strfileDirectory;
                        // const keyID = 'custkey_del_sftpnetsuite';
                        const guid = '55dc2f25c5f345a9b78dd216db960383';
                        //const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQCpEQn/My858BsvslF7yKjc/Knru9Q7LUDiwdiIZAWjCcvcsMeBhA5tj0nl/RbI83XRdqBrBin71zqYyIx3lCh6Wi2anDlm0tpC2LeYfBbLvtHuXGhhcHVhwRZ7x8vj0z1oplxbf6vEXb3/tiylKNE+gUis/K5YWV4fGCfG6l0H2NAXmK2xEury8K4iYAwkjJcI2dA+bNmuAQIRl8aMhkdzCvy4sfTPEq+OZ0bXE18yMk3MQSg7TjYYqZ9ISyE+9sA54uzBfvd0t4eXKThKCA7B5/Heqxa8jXejvVLpdyeT/8yUEt9ZJxzexPuvMH7/zCIh6/sAQ7KAkI7YdhNZ3iHp';
                        const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABgQDDbXE6BUetfz+50Lh1ULa15DOXI7hLsbHj+NZ2Udutv7b/gIVMvaJlwqlMUimN021YViX2N1Q7M//Ym3yctBEgpHY8SZ3cc1bwuJe4IxhpiATtMFmR1W9o982zwkElLquMzcOnkl2G6bE4BanJwPhJq9YbjdJVEcBA4AtB+aCcylMbDvpPF1kHWu+hU5cBhOZQMPv0mQRP8PeREI+5+mijeWpkXttXjADjGTV+PLf2Wnt9yGw7+aXOGuokZYDuHT8YNGRmcpxMwV65AsbWzdTXeIIBcIhqq0ybNp+VkynfJrkXKO7Sx5m5kiUETbcJ1oG/XQdnH7EbCv4Ia9lWRDAAe45FJKQiQyLCFCRkUo5EZHg9MbmYtHQZ3SaUukk7QbSELTjbSnuGI5QDnK3eC+d9rJVu2gMBPkptxHhCBA7BxHAksER/4R41H0TQLQaZOYacNos/KHDGR+2MjMTAh/PL4E6btAfVNZDafDV39Da7nnsvzFHRkoiI4Uq39IshOyc='
                        log.debug("Loaded variables");

                        try {
                            const testFile = file.load({
                                id: fileID
                            })
                            const connection = sftp.createConnection({
                                username: username,
                                passwordGuid: guid, //For SFTP that uses Username/Password, you must create a GUID from the Suitelet and this should be used. Comment out for Username/Key.
                                // keyId: keyID, //For SFTP that uses Username/Key, this should be used. Comment out for Username/Password.
                                url: url,
                                port: port,
                                hostKey: hostKey,
                                hostKeyType: 'rsa'
                            });

                            connection.upload({
                                directory: fileDirectory,
                                filename: outfilename,
                                file: testFile,
                                replaceExisting: true
                            })
                            log.audit({
                                title: "SFTP tronios log",
                                details: "File saved to " + strfileDirectory + "/" + outfilename
                            });
                        } catch (e) {
                            email.send({
                                author: 17323496,
                                recipients: "it@destinyentertainments.net",
                                subject: 'Tronios Ordering File Error!',
                                body: 'Please see the below error on the latest tronios ordering file;<br/><br/><b>' + e.name + '</b><br/>' + e.message
                            });
                            log.emergency({title: e.name, details: e.message + e.lineNumber});
                        }
                    }
                }

                function SFTPFILEtest(fileID, strfileDirectory, outfilename) {

                    //DESTINY SFTP

                    const username = 'ec2-user';
                    const url = 'sftp.del.tools';
                    const port = 22;
                    const fileDirectory = 'sftp/inbound/TroniosOrderingFile/';
                    const keyID = 'custkey_del_delsftpserver';
                    const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDPQ9+NAV8MjZNUCJNEdjMHV9vuOBZ0CIbXvCyHUqHL4ndmAreL3ji2hRz9mZjO0BZshuR1m8f8MJtm47+EetsSCKCkRErNjn/fHcKWDLf5pALQW5vrx5NAXGjboOxHM4KNtHdHvil6iaXJL5EF8ORXGTHGdGNhi196sUDHqCVqA/BbIjDcTvAVDEEDj06a4bIVa+8ascQMgRnMWWLETkOa9YaAUzLzvzBkthBhK4si/3oro8ykflnb4Fjmt/xLyM1haUJVwOwSHTOh7f/oy3ih1Z9aX0iK3VfAC51hccOZ1RVsl2Kz0BK+PIoNFfIaSzHW/61zg99U6dewBXdWRNVD';


/*
                    //TRONIOS FTP

                    const username = 'destinystock';
                    const url = 'ftp.tronios.com';
                    const port = 22;

                    const fileDirectory = strfileDirectory;
                    // const keyID = 'custkey_del_sftpnetsuite';
                    const guid = '55dc2f25c5f345a9b78dd216db960383';
                    //const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQCpEQn/My858BsvslF7yKjc/Knru9Q7LUDiwdiIZAWjCcvcsMeBhA5tj0nl/RbI83XRdqBrBin71zqYyIx3lCh6Wi2anDlm0tpC2LeYfBbLvtHuXGhhcHVhwRZ7x8vj0z1oplxbf6vEXb3/tiylKNE+gUis/K5YWV4fGCfG6l0H2NAXmK2xEury8K4iYAwkjJcI2dA+bNmuAQIRl8aMhkdzCvy4sfTPEq+OZ0bXE18yMk3MQSg7TjYYqZ9ISyE+9sA54uzBfvd0t4eXKThKCA7B5/Heqxa8jXejvVLpdyeT/8yUEt9ZJxzexPuvMH7/zCIh6/sAQ7KAkI7YdhNZ3iHp';
                    const hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAABgQDDbXE6BUetfz+50Lh1ULa15DOXI7hLsbHj+NZ2Udutv7b/gIVMvaJlwqlMUimN021YViX2N1Q7M//Ym3yctBEgpHY8SZ3cc1bwuJe4IxhpiATtMFmR1W9o982zwkElLquMzcOnkl2G6bE4BanJwPhJq9YbjdJVEcBA4AtB+aCcylMbDvpPF1kHWu+hU5cBhOZQMPv0mQRP8PeREI+5+mijeWpkXttXjADjGTV+PLf2Wnt9yGw7+aXOGuokZYDuHT8YNGRmcpxMwV65AsbWzdTXeIIBcIhqq0ybNp+VkynfJrkXKO7Sx5m5kiUETbcJ1oG/XQdnH7EbCv4Ia9lWRDAAe45FJKQiQyLCFCRkUo5EZHg9MbmYtHQZ3SaUukk7QbSELTjbSnuGI5QDnK3eC+d9rJVu2gMBPkptxHhCBA7BxHAksER/4R41H0TQLQaZOYacNos/KHDGR+2MjMTAh/PL4E6btAfVNZDafDV39Da7nnsvzFHRkoiI4Uq39IshOyc='
                    log.debug("Loaded variables");
*/
                    try {
                        const testFile = file.load({
                            id: fileID
                        })
                        const connection = sftp.createConnection({
                            username: username,
                            //passwordGuid: guid, //For SFTP that uses Username/Password, you must create a GUID from the Suitelet and this should be used. Comment out for Username/Key.
                            keyId: keyID, //For SFTP that uses Username/Key, this should be used. Comment out for Username/Password.
                            url: url,
                            port: port,
                            hostKey: hostKey,
                            hostKeyType: 'rsa'
                        });

                        connection.upload({
                            directory: fileDirectory,
                            filename: outfilename,
                            file: testFile,
                            replaceExisting: true
                        })
                        log.audit({
                            title: "SFTP tronios log",
                            details: "File saved to " + strfileDirectory + "/" + outfilename
                        });
                    } catch (e) {
                        email.send({
                            author: 17323496,
                            recipients: "it@destinyentertainments.net",
                            subject: 'Tronios Ordering File Error!',
                            body: 'Please see the below error on the latest tronios ordering file;<br/><br/><b>' + e.name + '</b><br/>' + e.message
                        });
                        log.emergency({title: e.name, details: e.message + e.lineNumber});
                    }


                }


                function buildbackorderArray(result) {
                    let delName = result.getValue("itemid")
                    let delquantitybackordered = result.getValue("quantitybackordered")
                    delbackorder_Arr.push([
                        delName,
                        delquantitybackordered
                    ]);
                    //log.debug(delbackorder_Arr)
                    return true;
                }
////THIS CODE TO CHANGE AND INCLUDE STOCK IF AVAILABLE INDER/////
                function buildItemArray(result) {
                    /*
                    delLocationAvailable is now located in delItemList_Search_with_inventory sesrch

                    this will need to be looped though and delLocationAvailable value set when matched on delName

                    make an array of the new search values, otherwise we will exceed SSS limits

                     */
                    let delName = result.getValue({name: "itemid", summary: "GROUP"})
                    let delMpn = result.getValue({name: "mpn", summary: "GROUP"})

                    //start search loop here
                    //if delname = newsearch itemid then add location
                    let delLocationAvailable = //inventory_array search



                    delItemList_Arr.push([
                        delName,
                        delMpn,
                        delLocationAvailable
                    ]);
                    return true;
                }

                /////STOP EDITING///////
                function Build7DaySalesArray(result) {
                    let delName = result.getValue({name: "itemid", summary: "GROUP"})
                    let delvalue = result.getValue({name: "formulanumeric", summary: "SUM"})
                    del7DaySales_Arr.push([
                        delName,
                        delvalue
                    ]);
                    return true;
                }

                function Build7DaySOArray(result) {
                    let delName = result.getValue({name: "itemid", summary: "GROUP"})
                    let delvalue = result.getValue({name: "tranid", summary: "COUNT", join: "transaction"})
                    del7DaySo_Arr.push([
                        delName,
                        delvalue
                    ]);
                    return true;
                }

                function Build7DayQtyArray(result) {
                    let delName = result.getValue({name: "itemid", summary: "GROUP"})
                    let delvalue = result.getValue({name: "quantity", summary: "MAX", join: "transaction"})
                    del7dayQty_Arr.push([
                        delName,
                        delvalue
                    ]);
                    return true;
                }

                function BuildyesterdaySalesArray(result) {
                    let delName = result.getText({name: "item", summary: "GROUP"})
                    let delvalue = result.getValue({name: "quantity", summary: "Sum"})
                    delYesterddaySales_Arr.push([
                        delName,
                        delvalue
                    ]);
                    return true;
                }

                function buildItemFieldDynamicSearch(arrIn) {
                    let itemSearchObj;
                    let stringArr = '';
                    let i;

                    for (i = 0; arrIn && arrIn.length > i; i += 1) {
                        stringArr += i > 0 ? ", '" + arrIn[i] + "', 'true'" : "'" + arrIn[i] + "', 'true'";
                    }
                    if (arrIn.length > 0) {
                        itemSearchObj = search.create({
                            type: 'item',
                            filters: [
                                ["formulatext: DECODE({itemid}," + stringArr + ")", "is", 'true']
                            ],
                            columns: [
                                'itemid',
                                'isdropshipitem',
                                'custitem_item_demandnolongerrequired',
                                'custitem_itemstatus',
                                'custitem_demand',
                                'custitem_item_demandstockpercentage'
                            ]
                        });
                        //itemSearchObj.save({title:"Tronios Ordering File EXT Columns"});
                        return itemSearchObj;
                    }
                }

                function buildItemFieldArray(result) {
                    let test = JSON.parse(JSON.stringify(result))
                    let delName = test["values"]["itemid"];
                    let delDropShip = test["values"]["isdropshipitem"];
                    let delDemandNotNeeded = test["values"]["custitem_item_demandnolongerrequired"];
                    let delStatus = test["values"]["custitem_itemstatus"][0]["value"];
                    let delDemand = test["values"]["custitem_demand"];
                    let delDemandpercentage = test["values"]["custitem_item_demandstockpercentage"];
                    delItemField_Arr.push([
                        delName,
                        delDropShip,
                        delDemandNotNeeded,
                        delStatus,
                        delDemand,
                        delDemandpercentage
                    ]);
                    return true;
                }

                function buildArrivalArray(result) {
                    let delInternalId = result.getValue({name: "internalid", summary: "MIN"})
                    let delTranId = result.getValue({name: "tranid", summary: "MIN"})
                    let delTranDate = result.getValue({name: "trandate", summary: "MIN"})
                    let delPurchaseDescription = result.getValue({
                        name: "purchasedescription",
                        summary: "GROUP",
                        join: "item"
                    })
                    let delName = result.getValue({name: "itemid", summary: "GROUP", join: "item"})
                    let delMpn = result.getValue({name: "mpn", summary: "GROUP", join: "item"})
                    let delQtyRemaining = result.getValue({name: "formulanumeric", summary: "SUM"})
                    let delLocation = result.getText({name: "location", summary: "GROUP"})
                    let delExpectedReceiptDate = result.getValue({name: "expectedreceiptdate", summary: "MIN"})
                    let delVendor = result.getValue({name: "entityid", summary: "GROUP", join: "vendor"})
                    delItemArrival_Arr.push([
                        delInternalId,
                        delTranId,
                        delTranDate,
                        delPurchaseDescription,
                        delName,
                        delMpn,
                        delQtyRemaining,
                        delLocation,
                        delExpectedReceiptDate,
                        delVendor
                    ]);
                    return true;
                }
            } catch (e) {
                email.send({
                    author: 17323496,
                    recipients: "it@destinyentertainments.net",
                    subject: 'Tronios Ordering File Error!',
                    body: 'Please see the below error on the latest tronios ordering file;<br/><br/><b>' + e.name + '</b><br/>' + e.message
                });
                log.emergency({title: e.name, details: e.message + e.lineNumber});
            }

        }

        return {execute}

    });
