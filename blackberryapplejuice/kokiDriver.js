var last_seen_marker = 0;
var max_speed = 1 //Arbitrary
var steer = 0;
var move = 0;
var clockwise = true;

var last_steer = 1;
var previous_bearing = 0;
var last_move = 0.5;

var steer_reduction_timeout = null;

var driver = {}

driver.drive = function (client, data) {	
	if (data.getLastMarkers().length > 0) {
		console.log('Seen a marker');
		//Seen a new marker
        marker = data.getFurthestMarker();
        driver.approach_marker(client, marker);
	} else {
		driver.scan_for_markers(client);
	}
}

driver.scan_for_markers = function (client) {
    console.log('Scanning');
    //Go the other way!
    steer = last_steer * -1; 
    move = last_move * -1;
	client.move(move);
    console.log(steer);
    client.steer(steer);
	console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
	last_steer = steer;
	last_move = move;
    console.log('Finished scanning');
}

driver.see_marker = function (client, marker) {
    console.log('Marker seen');
    if (marker.centre.world.y < 1) {
        if (null == steer_reduction_timeout) {
            if (marker.code %2 == 0) {
                steer = -1;
            } else {
                steer = 1;
            }
            last_steer = steer;
            client.steer(steer);
            steer_reduction_timeout = setInterval(function() {
                driver.reduce_steering(client);
            }, 500);
        }
    }
}

driver.reduce_steering = function (client) {
    var reduction_rate = 0.4;
    if (last_steer > 0) {
        var new_steer = last_steer - reduction_rate;
    } else {
        var new_steer = last_steer + reduction_rate;
    }
    console.log('New steer: ', new_steer);
    client.steer(new_steer);
    if (0 <= new_steer) {
        console.log('Steering finished');
        clearInterval(steer_reduction_timeout);
        steer_reduction_timeout = null;
    }
    last_steer = new_steer;
}

driver.approach_marker = function (client, marker)  {
    //Is marker the next marker we're expecting? (i.e. < last marker)
    //Drive towards it (clever driving logic here that slows down when we hit a marker)

    if (!driver.avoid_walls(client, marker)) {
    	previous_bearing = 0;
		console.log('Moving towards marker ' + marker.code.toString());

		if (marker.code > last_seen_marker) {
			last_seen_marker = marker.code;
			if (marker.code % 2 == 0) {
				if (clockwise) {
					//Marker is on the outside edge
					var marker_location = marker.centre.world;
					steer = marker_location.x * -3;
					move = (marker_location.y - 1) * 0.5;
					console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
					client.steer(steer);
					client.move(move);
				}
			} else {
				if (clockwise) {
					//Marker is on the inside edge
					var marker_location = marker.centre.world;
					steer = marker_location.x * -3;
					move = (marker_location.y - 1) * 0.5;
					console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
					client.steer(steer);
					client.move(move);
				}
			}    	
		} else if (marker.code < last_seen_marker) {
			driver.scan_for_markers(client); //We shouldn't be going backwards!
		} else {
			//Keep going.
		}
	}
}

driver.avoid_walls = function(client, marker) {
    var distance_to_wall = driver.distance_to_wall(marker);

    if (distance_to_wall <= 0.15) {
    	console.log('Avoiding wall!');
        if (Math.abs(marker.bearing.x) < previous_bearing) {
            steer = -last_steer
            previous_bearing = Math.abs(marker.bearing.x);
        }

        client.steer(steer);
        client.move(move);
        console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
        return true;
    }
    return false;
}


driver.distance_to_marker = function (marker) {
	return marker.centre.world.y;
}

driver.distance_to_wall = function (marker) { 
    angle = marker.rotation.x * (180 / Math.pi);
    return marker.centre.world.y * Math.cos(angle);
}

module.exports = driver;
