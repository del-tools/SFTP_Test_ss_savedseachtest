/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/log', 'N/search', 'N/file'],
    /**
     * @param{log} log
     * @param{search} search
     * @param{file} file
     */
    (log, search, file) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                let delItemList_Arr = new Array();
                let delItemArrival_Arr = new Array();
                let delItemField_Arr = new Array();
                let del7DaySales_Arr = new Array();
                let del7DaySo_Arr = new Array();
                let del7dayQty_Arr = new Array();
                let del60daySales_Arr = new Array();
                let CombinedArray = new Array();
                let matchedarray = false;

                let delItemArrival_Search = search.load({
                    id: 'customsearch2956'
                });
                let delItemList_Search = search.load({
                    id: 'customsearch1754'
                });
                let del7DaySales_Search = search.load({
                    id: 'customsearch1716'
                });
                let del7DaySo_Search = search.load({
                    id: 'customsearch1718'
                });
                let del7dayQty_Search = search.load({
                    id: 'customsearch1719'
                });
                let del60daySales_Search = search.load({
                    id: 'customsearch3058'
                });


                delItemList_Search.run().each(buildItemArray);
                delItemArrival_Search.run().each(buildArrivalArray);
                del7DaySales_Search.run().each(Build7DaySalesArray);
                del7DaySo_Search.run().each(Build7DaySOArray);
                del7dayQty_Search.run().each(Build7DayQtyArray);
                del60daySales_Search.run().each(Build60DaySalesArray);

                let itemsDropShipSearch = new Array();
                delItemList_Arr.forEach(function (itemarr) {
                    itemsDropShipSearch.push(itemarr[0])
                })
                buildItemFieldDynamicSearch(itemsDropShipSearch).run().each(buildItemFieldArray);


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
                            } else if (delItemField_Arr[i][0] == "GGA4035" || delItemField_Arr[i][0] == "FFA1995" || delItemField_Arr[i][0] == "FFA2241") {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][0].substring(0, 3) == "BSA") {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][3] == "Discontinued" || delItemField_Arr[i][3] == "Clearance") {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][1] == true) {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][4] == "") {
                                delItemRecord.push(0);
                            } else {
                                delItemRecord.push(delItemField_Arr[i][4]);
                            }


                            if (delItemField_Arr[i][0] == "GGA4035" || delItemField_Arr[i][0] == "FFA1995" || delItemField_Arr[i][0] == "FFA2241") {
                                delItemRecord.push("0");
                            } else if (delItemField_Arr[i][2] == true) {
                                delItemRecord.push("0");
                            } else {
                                //Monthly Overall Average Demand	Stock Percentages to Hold
                                //fix percentagevalue from string to int
                                let Stock_PercentagesToHold_Int = 0;
                                Stock_PercentagesToHold_Int = parseFloat(delItemField_Arr[i][5]) / 100.0;
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

                    for (let i = 0; i < del60daySales_Arr.length; i++) {
                        if (del60daySales_Arr[i][0].trim() == itemarr[0].trim()) {
                            matchedarray = true;
                            delItemRecord.push(del60daySales_Arr[i][1]);
                            break;
                        }
                    }
                    if (matchedarray == false) {
                        delItemRecord.push("0");
                    } else {
                        matchedarray = false;
                    }

                    if(delItemRecord[4] == false){
                        delItemRecord[4] = "No"
                    }else if(delItemRecord[4] == true){
                        delItemRecord[4] = "Yes"
                    }

                    CombinedArray.push({
                        "Name": delItemRecord[0],
                        "MPN": delItemRecord[1],
                        "Sum of Location Available": itemarr[2],
                        "Quantity on Next Delivery": delItemRecord[2],
                        "Next Arrival Date": delItemRecord[3],
                        'Monthly Overall Average Demand': delItemRecord[5],
                        'Stock Percentages to Hold': delItemRecord[6],
                        "DropShip?": delItemRecord[4],
                        "7 Days Sales": delItemRecord[7],
                        "7 Days Number of Sales Order": delItemRecord[8],
                        "7 Days Highest Sold Qty": delItemRecord[9],
                        "Last 6 Months Sales": delItemRecord[10],
                        "Date":formatedateforcsv(1)
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
                log.debug({title: "60Days Sales", details: del60daySales_Arr});

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
                        name: formatedateforfilesave(0),
                        fileType: file.Type.CSV,
                        contents: csvBody
                    });

                    fileObj.folder = 739723;

                    let id = fileObj.save();
                    log.debug({title: "File Saved", details: id});

                }

                function buildItemArray(result) {
                    let delName = result.getValue({name: "itemid", summary: "GROUP"})
                    let delMpn = result.getValue({name: "mpn", summary: "GROUP"})
                    let delLocationAvailable = result.getValue({name: "formulanumeric", summary: "SUM"})
                    delItemList_Arr.push([
                        delName,
                        delMpn,
                        delLocationAvailable
                    ]);
                    return true;
                }

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

                function Build60DaySalesArray(result) {
                    let delName = result.getText({name: "item", summary: "GROUP"})
                    let delvalue = result.getValue({name: "quantity", summary: "Sum"})
                    del60daySales_Arr.push([
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
                        return itemSearchObj;
                    }
                }


                function buildItemFieldArray(result) {
                    let test = JSON.parse(JSON.stringify(result))
                    let delName = test["values"]["itemid"];
                    let delDropShip = test["values"]["isdropshipitem"];
                    let delDemandNotNeeded = test["values"]["custitem_item_demandnolongerrequired"];
                    let delStatus = test["values"]["custitem_itemstatus"][0]["text"];
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

                function formatedateforcsv(intdate){
                    let objDate= new Date();
                    if (intdate == 1){
                        objDate = new Date(objDate)
                        objDate.setDate(objDate.getUTCDate() - 1)
                    }
                    let dd = objDate.getUTCDate();
                    let mm = objDate.getUTCMonth() + 1;
                    let yyyy = objDate.getUTCFullYear();
                    if (dd < 10) {
                        dd = '0' + dd;
                    }
                    if (mm < 10) {
                        mm = '0' + mm;
                    }
                    strReturn = dd + '/' + mm + '/' + yyyy;
                    return strReturn;
                }

                function formatedateforfilesave(intdate){
                    let objDate= new Date();
                    if (intdate == 1){
                        objDate = new Date(objDate)
                        objDate.setDate(objDate.getUTCDate()- 1)
                    }
                    objDate = new Date(objDate);
                    let dd = objDate.getUTCDate();
                    let mm = objDate.getUTCMonth() + 1;
                    let yyyy = objDate.getUTCFullYear();
                    let hh = objDate.getUTCHours();
                    let nn = objDate.getUTCMinutes();
                    if (dd < 10) {
                        dd = '0' + dd;
                    }
                    if (mm < 10) {
                        mm = '0' + mm;
                    }
                    if (hh < 10) {
                        hh = '0' + hh;
                    }
                    if (nn < 10) {
                        nn = '0' + nn;
                    }
                    strReturn = "TroniosOrderingFile-" + yyyy + mm + dd + hh + nn + ".csv"
                    return strReturn;
                }

            } catch (e) {
                log.emergency({title: e.name, details: e.message + e.lineNumber});
            }

        }

        return {execute}

    });
