var last_seen_marker = 0;
var max_move = 1 //Arbitrary
var steer = 0;
var move = 0.3;
var accelerate = 1.05;
var clockwise = true;

var last_steer = 0.5;

var steer_reduction_timeout = null;
var steering_marker_id = null;

var previous_bearing = 0;

var driver = {}

driver.drive = function (client, steer, move) {	
	client.steer(steer);
	client.move(move);
	console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
}

driver.scan_for_markers = function (client) {
	//Go the other way!
	steer = last_steer * -1; 
	driver.accelerate(); //Ambitious
	driver.drive(client, steer, move);
	last_steer = steer;
}

driver.see_marker = function (client, marker) {
    console.log('Marker seen');
    if (marker.centre.world.y < 1) {
        if ( marker.code != steering_marker_id ) {
            clearInterval(steer_reduction_timeout);
            steer_reduction_timeout = null;
        }
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
			if (marker.code % 2 == 0) {
				if (clockwise) {
					//Marker is on the outside edge
					var marker_location = marker.centre.world;
					steer = 0.5;
					driver.accelerate();
					driver.drive(client, steer, move);
				}
			} else {
				if (clockwise) {
					//Marker is on the inside edge
					var marker_location = marker.centre.world;
					steer = -0.5;
					driver.accelerate();
					driver.drive(client, steer, move);
				}
			}    	
		} else if (marker.code < last_seen_marker) {
			driver.decelerate();
			driver.scan_for_markers(client); //We shouldn't be going backwards!
		} else {
			//steer = Math.cos(marker.center.world.y * 20);
            //console.log('maintain going toward marker at steering - ' + steer);
            driver.drive(client, steer, move);
		}
        last_seen_marker = marker.code;
	}
}

driver.accelerate = function () {
	console.log('Accelerate');
	move *= accelerate;

	if (move > max_move) {
		move = max_move;
	}
}

driver.decelerate = function () {
	console.log('Decelerate');
	move /= accelerate;
}

driver.avoid_walls = function(client, marker) {
    var distance_to_wall = driver.distance_to_wall(marker);
    console.log('Distance to the wall ' + distance_to_wall);
    
    if (distance_to_wall <= 0.15) {
    	console.log('Avoiding wall!');
        if (Math.abs(marker.bearing.x) < previous_bearing) {
            steer = -last_steer
            previous_bearing = Math.abs(marker.bearing.x);
        }
        driver.drive(client, steer, move);
        return true;
    }
    return false;
}


driver.distance_to_marker = function (marker) {
	console.log(marker);
	return marker.centre.world.y;
}

driver.distance_to_wall = function (marker) { 
    angle = marker.rotation.x * (180 / Math.PI);
    console.log('Angle of us to marker ' + angle);
    return marker.centre.world.y * Math.cos(angle);
}

module.exports = driver;
