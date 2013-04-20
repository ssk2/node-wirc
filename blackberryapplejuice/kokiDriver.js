var last_seen_marker = 0;
var max_speed = 1 //Arbitrary
var steer = 0;
var move = 0;
//What is the expected marker orientation? Clockwise or anticlockwise? Initialise appropriately.

driver.scan = function (client) {
	
	//Reverse rotation and speed
	    move = move * 0.8;
    client.move(move);
}

driver.drive = function (client, marker)  {
    //Classify marker (left or right?)
    //Is marker the next marker we're expecting? (i.e. < last marker)

    //Drive towards it (clever driving logic here that slows down when we hit a marker)

	var marker_location = marker.centre.world;
	steer = marker_location.x * -3;
	move = (marker_location.y - 1) * 0.7;
	client.steer(steer);
	client.move(move);
}

module.exports = driver;