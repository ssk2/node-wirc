var client = require('../lib/car');
var childProcess = require('child_process');    
var driver = require("./kokiDriver");
var koki = require("../lib/koki");
var wrapper = require("./kokiWrapper");
var data = require('./kokiData');

var serialNumber = '0000981';

client.discover()
    .then(function() { return client.connect(serialNumber); })
    .then(function() { return client.enable(); })
    .then(function() {

        var device = client.chosenDevice();
        data.startCapturing(client);
        console.log('Started capturing');

        client.move(0.3);

        data.on('marker', function(marker) {
            driver.see_marker(client, marker);
        });

        data.on('timeout', function() {
            console.log('Panic');
            driver.scan_for_markers(client);
        });
    });