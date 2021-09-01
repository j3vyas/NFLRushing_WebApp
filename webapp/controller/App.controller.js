sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
], function ( Controller, MessageToast, JSONModel, Filter ) {
    "use strict"
    return Controller.extend( "sap.ui.demo.walkthrough.App", {
        onInit: function () {
            this._oView = this.getView();
            this._oTable = this.byId( 'table' );

            var oModel = new JSONModel({});
            this._oView.setModel( oModel );
            this._oTable.getModel().setSizeLimit( 10000 );

            this.addCustomSortingLongestRushColumn(); 
            this.getNFLRushingTableData();
            return;
        },

        //Ugly solution to add custom ordering on a column that is text based like Lng which has 'T' for touchdown
        //SAPUI5 Table will filter very sporadically ( 1, 2, 3, 10, 10T, 11, 2, 7 ... ??? )
        //https://answers.sap.com/questions/10483218/custom-sorter-in-sapuitabletable.html
        //https://blogs.sap.com/2014/01/13/custom-sorter-and-filter-in-sapui5-table/
        addCustomSortingLongestRushColumn: function() {
            var that = this;
            var oColumn = new sap.ui.table.Column({
                width: '11rem',
                label: new sap.ui.commons.Label({text: "Longest Rush"}),
                template: new sap.ui.commons.TextView().bindProperty("text", "Lng"),
                sortProperty: "Lng"
            });

            var oCustomMenu = new sap.ui.commons.Menu();

            function compareDoubles(value1, value2) {
                if(parseFloat(value1) < parseFloat(value2)) return -1;
                if(parseFloat(value1) == parseFloat(value2)){
                    if( typeof value1 === 'string' && value1.slice(-1) === 'T' ){
                        return 1;
                    } else if( typeof value2 === 'string' && value2.slice(-1) === 'T' ){
                        return -1;
                    } else {
                        return 0;
                    }
                }
                if(parseFloat(value1) > parseFloat(value2)) return 1;
            };

            oCustomMenu.addItem(new sap.ui.commons.MenuItem({
                text:"Sort ascending",
                select:function() {
                    var oSorter = new sap.ui.model.Sorter("Lng", false);
                    oSorter.fnCompare=compareDoubles;
                    that._oTable.getBinding("rows").sort(oSorter);
                }
            }));

            oCustomMenu.addItem(new sap.ui.commons.MenuItem({
                text:"Sort descending",
                select:function() {
                    var oSorter = new sap.ui.model.Sorter("Lng", true);
                    oSorter.fnCompare=compareDoubles;
                    that._oTable.getBinding("rows").sort(oSorter);
                }
            }));

            oColumn.setMenu(oCustomMenu);
            this._oTable.addColumn(oColumn);
        },

        getNFLRushingTableData: function() {
            var that = this;
            var sURL = 'http://localhost:8080/nflrushing'
            $.ajax({
                type: 'GET',
                url: sURL,
                contentType: 'application/json',
                dataType: 'json',
                success: this.taskSuccess.bind( this ),
                error: [ this.taskError, this ]
            });
        },

        taskSuccess: function( data ){
            var oModel = this._oView.getModel().getData();

            //Limitation of SAPUI5 Data binding model; it uses '/' to seperate objects in models, eg: att/g = att: { g: }.
            //Workaround involves iterating through each entry and making it SAPUI5 model friendly.
            //Additionally, peform any data manipulations here to customize handling of data
            data.forEach( ( d ) => {
                if( typeof d['Yds'] === 'string' ){
                    d['Yds'] = parseInt( d['Yds'].replace( /,/g, '' ) );
                }
                d['Att_G'] = d['Att/G'];
                d['Yds_G'] = d['Yds/G'];
                delete d['Att/G'];
                delete d['Yds/G'];
            });

            oModel.nflRushingData = data;
            this._oView.getModel().setData( oModel );
        },

        //Add message toast to display error and notify user something went wrong?
        taskError: function( err ){
            return;
        },

        downloadData: function () {
            var rows = this._oTable.getBinding('rows').getContexts();
            var dataToDownload = [];

            //rows is only the binding context, use that to get object data and remove the keys, download only values
            rows.forEach( ( data ) => {
                dataToDownload.push( Object.values( data.getObject() ).toString() );
            })
            sap.ui.core.util.File.save( dataToDownload.join( '\n' ), 'nflrushing_data', 'csv', 'text/csv', 'charset=utf-8' );
        }
    });
});