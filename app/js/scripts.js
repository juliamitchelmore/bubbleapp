

$(document).ready(function()
{
	var fb = new Firebase("https://scorching-heat-529.firebaseio.com");
	var messages = fb.child("messages");
	var longitude = 0;
	var latitude = 0;

	//Static Functions
	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(updateLocation);
	    }
	}

	function updateLocation(position) {    
	    // Update Location in Bubble backend via API
	    longitude = position.coords.longitude;
	    latitude = position.coords.latitude;

			console.log("GEO: "+latitude+","+longitude);

	    // Get co-ordinates again in 30 sectonds
	    setTimeout(getLocation, 30000);
	}

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
		
	fb.authWithOAuthPopup("facebook", function(error, authData) {
	  if (error) {
	    console.log("Login Failed!", error);
	  } else {
	    console.log("Authenticated successfully with payload:", authData);
	  }
	});

	$('#messageInput').keypress(function (e) {
	    if (e.keyCode == 13) {
	      var text = $('#messageInput').val();
	      messages.push({text: text, longitude: longitude, latitude: latitude, color: color, uid: userID});
	      $('#messageInput').val('');
	    }
	  });

	messages.on('child_added', function(snapshot) {
		var message = snapshot.val();
	  	if(measure(latitude, longitude, message.latitude, message.longitude) <= 7.0) {

	  		if(message.uid == userID)
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
  			addMessage="<div class='message left' style='background-color: #"+col+"'>" + text + "</div>";
  		}
    	$(addMessage).appendTo($('#messagesDiv'));
    	$(document).scrollTop($(document).height());
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
	} 

	function intToRGB(i){
	    
	}

  	//add a user
  	var isNewUser = true;
  	var userFB = '';
  	var userMessages = '';
  	var color = '';
  	var userID = '';

	fb.onAuth(function(authData) {
	  if (authData && isNewUser) {
	    // save the user's profile into the database so we can list users,
	    // use them in Security and Firebase Rules, and show profiles

	    userID = authData.uid;

	    userFB = new Firebase("https://scorching-heat-529.firebaseio.com/users/" + userID);
			
			userFB.on("value", function(snapshot) {

				//Already Registered read color into local var
				if (snapshot.val() == null || snapshot.val().color === null) {
					//This user isn't assigned a color yet.
					color = generateColor(userID);
					userFB.child("color").set(color);
				} else {
					color = snapshot.val().color;
				}

				//Init the loop to track location
				getLocation();

			  console.log("Color: " + color);

			}, function (errorObject) {

			//If not there then add user
			color = generateColor(userID);

	    	userFB.set({
	    		provider: authData.provider,
		      	name: authData.facebook.displayName,
		      	color: color
	    	});

		});

	  }

	});

});