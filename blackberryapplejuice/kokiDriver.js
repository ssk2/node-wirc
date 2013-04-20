var last_seen_marker = 0;
var max_speed = 1 //Arbitrary
var steer = 0;
var move = 0;
var clockwise = true;
//What is the expected marker orientation? Clockwise or anticlockwise? Initialise appropriately.
var last_steer = 1;
var last_move = 0.5;

var driver = {}

driver.scan = function (client) {
	//Go the other way!
	steer = last_steer * -1; 
	move = last_move * -1;
	client.steer(steer);
	client.move(move);
	console.log(move);
	last_steer = steer;
	last_move = move;
}

driver.drive = function (client, data) {
	if (data.getLastMarkers().length > 0) {
		console.log('Seen a marker');
		//Seen a new marker
		marker = data.getFurthestMarker();
        driver.approach(client, marker);
	} else {
		driver.scan(client);
	}
}

driver.approach = function (client, marker)  {
    //Is marker the next marker we're expecting? (i.e. < last marker)
    //Drive towards it (clever driving logic here that slows down when we hit a marker)
    if (marker.code > last_seen_marker)
    {
    	last_seen_marker = marker.code;
	    if (marker.code % 2 == 0) {
	    	if (clockwise) {
	    		//Marker is on the outside edge
				var marker_location = marker.centre.world;
				steer = marker_location.x * -3;
				move = (marker_location.y - 1) * 0.7;
				client.steer(steer);
				client.move(move);
	    	}
	    } else {
	    	if (clockwise) {
	    		//Marker is on the inside edge
				var marker_location = marker.centre.world;
				steer = marker_location.x * -3;
				move = (marker_location.y - 1) * 0.7;
				client.steer(steer);
				client.move(move);
	    	}
	    }    	
    } else {
    	//Scan or something. We shouldn't be going towards lower ranked markers.
    }
}

module.exports = driver;