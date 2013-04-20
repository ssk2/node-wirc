var client = require('../lib/car');
var childProcess = require('child_process');
var wrapper = require("./kokiWrapper");
var data = require('./kokiData');

var serialNumber = '0000981';

client.discover()
    .then(function() { return client.connect(serialNumber); })
    .then(function() { return client.enable(); })
    .then(function() {
		data.startCapturing(client);

		setInterval(function() {
			console.log(data.getLastMarkers());
		}, 1000);

    });
