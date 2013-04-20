var koki = require("../lib/koki");

var data = {};
var lastVisibleMarkers = [];
var lastMarkers = [];

data.startCapturing = function(client) {
	client.startCamera(0, function(data) {
		koki.findMarkers(data.image, function(err, markers) {
			lastMarkers = markers;
			if (markers.length > 0) {
				lastVisibleMarkers = markers;
			}
		});
	});
};
data.getLastMarkers = function() {
	return lastMarkers;
};
data.getLastVisibleMarkers = function() {
	return lastVisibleMarkers;
};
data.getFurthestMarker = function() {
	var furthestMarker = null;
	var furthestDistance = 0;
	lastMarkers.forEach(function(marker) {
		if (marker.center.world.y > furthestDistance) {
			furthestMarker = marker;
			furthestDistance = marker.center.world.y;
		}
	});
	return furthestMarker;
};

module.exports = data;

