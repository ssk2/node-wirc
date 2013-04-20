var last_seen_marker = 0;
var max_speed = 1 //Arbitrary
var steer = 0;
var move = 0;
var clockwise = true;

var last_steer = 1;
var previous_bearing = 0;
var last_move = 0.5;

var driver = {}

driver.scan = function (client) {
	//Go the other way!
	steer = last_steer * -1; 
	move = last_move * -1;
	client.steer(steer);
	client.move(move);
	console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
	last_steer = steer;
	last_move = move;
}

driver.avoidWalls = function(client, marker) {
    var distance_to_wall = driver.distance_to_wall(marker);
    
    //if we're too close to a wall then get away before doing anything else
    if (distance_to_wall <= 0.15) {
        if (Math.abs(marker.bearing.x) < previous_bearing) {
            steer = -last_steer
            previous_bearing = Math.abs(marker.bearing.x);
        }
        client.steer(move);
        client.move(move);
        
        //return a value to show that we're performing evasive actions
        return true;
    }
    return false;
}

driver.drive = function (client, data) {	
	//Keep going straight

	//Approach Marker

	if (data.getLastMarkers().length > 0) {
		console.log('Seen a marker');
		//Seen a new marker
        if (!driver.avoidWalls()) {
            //reset this to zero to make sure that if we hit another wall it's reset
            previous_bearing = 0;
            
            marker = data.getFurthestMarker();
            driver.approach(client, marker);
        }
	} else {
		driver.scan(client);
	}
}

driver.approach_marker = function (client, marker)  {
	// Have 

    //Is marker the next marker we're expecting? (i.e. < last marker)
    //Drive towards it (clever driving logic here that slows down when we hit a marker)
    console.log('Moving towards marker');

    if (marker.code > last_seen_marker)
    {
    	last_seen_marker = marker.code;
	    if (marker.code % 2 == 0) {
	    	console.log('Even marker');
	    	if (clockwise) {
	    		//Marker is on the outside edge
				var marker_location = marker.centre.world;
				steer = marker_location.x * -3;
				move = (marker_location.y - 1) * 0.7;
				client.steer(steer);
				client.move(move);
	    	}
	    } else {
	    	console.log('Odd Marker');
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


driver.distance_to_marker = function (marker) {
	return marker.centre.world.y;
}

driver.distance_to_wall = function (marker) { 
    angle = marker.rotation.x * (180 / Math.pi);
    return marker.centre.world.y * Math.cos(angle);
}

module.exports = driver;
