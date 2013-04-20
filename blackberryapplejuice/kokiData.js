var koki = require("../lib/koki");

var RAISE_EVENT_AFTER = 3333;

var callbacks = {};
var timeout = null;

var data = {};

var triggerTimeout = function() {
	data.trigger('timeout', null);
	resetTimeout();
};

var resetTimeout = function() {
	clearTimeout(timeout);
	timeout = setTimeout(triggerTimeout, RAISE_EVENT_AFTER);
};

data.startCapturing = function(client) {
	client.startCamera(0, function(imageData) {
		koki.findMarkers(imageData.image, function(err, markers) {
			markers.forEach(function(marker) {
				data.trigger('marker', marker);
			});
			if (markers.length > 0) {
				resetTimeout();
			}
		});
	});
};

data.on = function(eventName, callback) {
	if (eventName in callbacks) {
		callbacks[eventName].push(callback);
	} else {
		callbacks[eventName] = [callback];
	}
};

data.off = function(eventName, callback) {
	newCallbacks = [];
	for (var i in callbacks[eventName]) {
		if (callbacks[eventName][i] !== callback) {
			newCallbacks.push(callbacks[eventName][i]);
		};
	}
	callbacks[eventName] = newCallbacks;
};

data.trigger = function(eventName, eventData) {
	for (var i in callbacks[eventName]) {
		callbacks[eventName][i](eventData);
	}
};

module.exports = data;

