val last_seen_marker = 0;


driver.scan = function (client, marker) {
	//Can't see marker?
		//Look for marker
	//Move left
	//Move right

    move = move * 0.8;
    client.move(move);

}

driver.drive = function (client, markers)  {
	//Drive towards marker?
    //Classify marker (left or right?)
    //Is marker the next marker we're expecting? (i.e. < last marker)

    //Drive towards it (clever driving logic here that slows down when we hit a marker)

	var marker = markers[0].centre.world;
	steer = marker.x * -3;
	move = (marker.y - 1) * 0.7;
	client.steer(steer);
	client.move(move);
}

module.exports = driver;