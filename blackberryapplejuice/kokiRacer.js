var client = require('../lib/car');
var childProcess = require('child_process');
var koki = require("../lib/koki");
var wrapper = require("./kokiWrapper");

var serialNumber = '0000981';

client.discover()
    .then(function() { return client.connect(serialNumber); })
    .then(function() { return client.enable(); })
    .then(function() {

        //What is the expected marker orientation? Clockwise or anticlockwise? Initialise appropriately.

        //State machine
        //Scan for marker

        //Found marker?
            //Classify marker (left or right?)
            //Is marker the next marker we're expecting? (i.e. < last marker)
            //Drive towards it (clever driving logic here that slows down when we hit a marker)
        



        var device = client.chosenDevice();
        var steer = 0;
        var move = 0;

        client.startCamera(0, function(data) {
            koki.findMarkers(data.image, function(err, markers) {
                if (markers[0]) {
                    var marker = markers[0].centre.world;
                    steer = marker.x * -3;
                    move = (marker.y - 1) * 0.7;
                    client.steer(steer);
                    client.move(move);
                }
                else {
                    move = move * 0.8;
                    client.move(move);
                }
            });
        });
    });
