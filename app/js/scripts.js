var longitude = 0
var latitude = 0

//Static Functions
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation);
    }
}

function updateLocation(position) {    
    // Update Location in Bubble backend via API
		fb.set({longitude: position.coords.longitude});
		fb.set({latitude: position.coords.latitude});
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
    return d * 1000; // meters
}

$(document).ready(function()
{

	//Init the loop to track location
	getLocation();

	var fb = new Firebase("https://scorching-heat-529.firebaseio.com/");
		
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
	      fb.push({text: text, longitude: longitude, latitude: latitude});
	      $('#messageInput').val('');
	    }
	  });

	fb.on('child_added', function(snapshot) {
	  var message = snapshot.val();
	  		if(measure(latitude, longitude, message.latitude, message.longitude) <= 7.0) {
	        displayChatMessage(message.text);	  			
	  		}
      });
  
  	function displayChatMessage(text) {
  		var addMessage="<div class='message left'>" + text + "</div>";
    	$(addMessage).appendTo($('#messagesDiv'));
    	$(document).scrollTop($(document).height());
  	};

});