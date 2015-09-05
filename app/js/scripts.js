
$(document).ready(function() {

	var fb = new Firebase("https://scorching-heat-529.firebaseio.com");
	var messages = fb.child("messages");

	var bubbleRadius = 140.0;
	var geoRadius = (1.0/111000.0) * bubbleRadius;

	var longitude = 0;
	var latitude = 0;

	var counting = false;

	var uid = fb.getAuth().uid;
	var color = generateColor(uid);

	var userFB = fb.child('users').child(uid);
	var userHistory = fb.child('users').child(uid).child('messages');

	var historyFlag = true;

	//Static Functions
	function getLocation() {
		navigator.geolocation.getCurrentPosition(updateLocation);
		navigator.geolocation.watchPosition(updateLocation);
	}

	function bubbleCount() {

		var people = fb.child('users');
		people.once('value', function(snap) {
			var results = snap.val();
			total = 0;
			for (var k in results) {
				var dist = measure(latitude, longitude, results[k].latitude, results[k].longitude);
				console.log("dist="+results[k].latitude+" v "+latitude);
				if(dist <= bubbleRadius) {
					total = total + 1;
				}
			}
			console.log("TOTAL: "+total);			
				$("#count").text(total);
	  		if (total == 0) {
	  			$("#count").removeClass("on").addClass("off");
	  		} else {
	  			$("#count").removeClass("off").addClass("on");
	  		}

			setTimeout(bubbleCount, 10000);
		});

	}

	function updateLocation(position) {    

		latitude = position.coords.latitude;
    	longitude = position.coords.longitude;

	    userFB.child('latitude').set(latitude);
	    userFB.child('longitude').set(longitude);

    	console.log("Location: "+latitude+", "+longitude)

    	if (!counting) {
    		counting = true;
    		bubbleCount();
    	}

	};

	function generateColor(str) { // java String#hashCode
	    var hash = 0;
	    for (var i = 0; i < str.length; i++) {
	      hash = str.charCodeAt(i) + ((hash << 5) - hash);
	    }
	    var c = (hash & 0x00FFFFFF)
	      .toString(16)
	      .toUpperCase();

	    return "00000".substring(0, 6 - c.length) + c;
	};

	function measure(lat1, lon1, lat2, lon2){ 
	    var R = 6378.137; // Radius of earth in KM
	    var dLat = (lat2 - lat1) * Math.PI / 180;
	    var dLon = (lon2 - lon1) * Math.PI / 180;
	    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
	    Math.sin(dLon/2) * Math.sin(dLon/2);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	    var d = R * c;
	    console.log("Distance is " + (d * 1000));
	    return d * 1000; // meters
	}

	function pushMessage(){
		var text = $('#messageInput').val();
    	messages.push({text: text, longitude: longitude, latitude: latitude, color: color, uid: uid});

    	$('#messageInput').val('');
	};

	$('#messageInput').keypress(function (e) {
	    if (e.keyCode == 13)
	    {
	    	if($('#messageInput').val().length > 0) {
		    	pushMessage();
		    }

	    	return false;
	    }
	});
	$('.input-message .btn').click(function (e) {
		if($('#messageInput').val().length > 0)
		{
		    pushMessage();
		}
	});

	//when a new message is added, show it to the user & add to the users history of received & sent messages
	messages.limitToLast(1).on('child_added', function(snapshot) {
		var message = snapshot.val();
	  	if(measure(latitude, longitude, message.latitude, message.longitude) <= bubbleRadius)
	  	{
	  		if(message.uid == uid)
	  		{
	        	displayChatMessage(message.text, message.color, true);	
	  		}
	  		else
	  		{
	  			displayChatMessage(message.text, message.color, false);
	  		}

	  		userFB.child('messages').push({text: message.text, color: message.color, uid: message.uid});
	  	}
	});

	//on load, show the history of messages (but not on future additions)
	userHistory.on('child_added', function(snapshot) {
		var message = snapshot.val();
		if(historyFlag)
		{
			if(message.uid == uid)
	  		{
	        	displayChatMessage(message.text, message.color, true);	
	  		}
	  		else
	  		{
	  			displayChatMessage(message.text, message.color, false);
	  		}
		}
	});
  
  	function displayChatMessage(text, col, currUser) {
  		var addMessage = '';
  		if(currUser)
  		{
  			addMessage="<div class='message right'>" + text + "</div>";
  		}
  		else
  		{
  			addMessage="<div class='message left' style='border-right: 10px solid #"+col+"'>" + text + "</div>";
  		}
    	$(addMessage).appendTo($('#messagesDiv'));
    	$(document).scrollTop($(document).height());
  	};

	getLocation();

	setTimeout(function()
	{
		historyFlag = false;
	}, 2000);

});