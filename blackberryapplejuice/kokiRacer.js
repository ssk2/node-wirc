var client = require('../lib/car');
var childProcess = require('child_process');
var driver = require("./kokiDriver");
var koki = require("../lib/koki");
var wrapper = require("./kokiWrapper");

var serialNumber = '0000981';

client.discover()
    .then(function() { return client.connect(serialNumber); })
    .then(function() { return client.enable(); })
    .then(function() {

        var device = client.chosenDevice();

        client.startCamera(0, function(data) {

            koki.findMarkers(data.image, function(err, markers) {
                if (markers[0]) {     
                    //Found marker
                    marker = markers[0];
                    driver.drive(client, marker);
                }
                else {
                    //Look for marker
                   driver.scan(client);
                }
            });
        });
    });
