var last_seen_marker = 0;
var max_move = 1 //Arbitrary
var steer = 0;
var move = 0.3;
var accelerate = 1.05;
var clockwise = true;

var steer_reduction_timeout = null;
var steering_marker_id = null;

var last_steer = 1;
var last_move = 1;

var previous_bearing = 0;

var driver = {}

driver.drive = function (client) {	
	last_steer = steer;
	last_move = move;
	client.steer(steer);
	client.move(move);
	console.log('Steer:' + steer.toString() + ' Move: ' + move.toString());
}

driver.scan_for_markers = function (client) {
	//Go the other way!
	console.log('Scanning');
	steer = last_steer * -1; 
	move = last_move * -1; //Ambitious
	driver.drive(client, steer, move);
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
            driver.drive(client);
            steer_reduction_timeout = setInterval(function() {
                driver.reduce_steering(client);
            }, 500);
        }
    }
}

driver.reduce_steering = function (client) {
    var reduction_rate = 0.4;
    if (last_steer > 0) {
        var steer = last_steer - reduction_rate;
    } else {
        var steer = last_steer + reduction_rate;
    }
    console.log('New steer: ', new_steer);
    driver.drive(client);
    if (0 <= steer) {
        console.log('Steering finished');
        clearInterval(steer_reduction_timeout);
        steer_reduction_timeout = null;
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

driver.distance_to_wall = function (marker) { 
    angle = marker.rotation.x * (180 / Math.PI);
    console.log('Angle of us to marker ' + angle);
    return marker.centre.world.y * Math.cos(angle);
}

module.exports = driver;
