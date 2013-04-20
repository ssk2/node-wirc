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

        setInterval(function() {
            driver.drive(client, data);
        }, 50); //20 times a second

    });
