
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

	var isTouch = $('html').hasClass('touch');

	var currBubble = '';

	var placeholders = ["Go on, compliment someone!", "Share your thoughts!", "Say hey, make a new friend!"];

	$('#bubblesDiv').hide();

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

	//find if there are any bubbles at the current location
	function findBubbles()
	{
		var bubbles = fb.child("bubbles");

		bubbles.once('value', function(snap) {
			var results = snap.val();
			total = 0;
			for (var j in results) {
				var bubbledist = measure(latitude, longitude, results[j].latitude, results[j].longitude);
				console.log("bubbledist="+results[j].latitude+" v "+latitude);
				if(bubbledist <= bubbleRadius) {
					displayBubbles(results[j].title, j)
				}
			}
		});
	}

	function displayBubbles(title, ref) {
		if(!($('#' + ref).length))
		{
	  		var addBubble = "<div class='bubble-message'><h3>You have entered: " + title + "</h3><button class='btn show-bubble' id='" + ref + "'>View Bubble</button></div>";

	    	$(addBubble).hide().appendTo($('#messagesDiv')).fadeIn(400);

	    	if($('.container').height() > $(window).height())
	    	{
	    		$(document).scrollTop($(document).height());	
	    	}
	    }
  	};


	function displayBubbleMessage(text, col, currUser) {
  		var addMessage = '';
  		if(currUser)
  		{
  			addMessage="<div class='message right'>" + text + "</div>";
  		}
  		else
  		{
  			addMessage="<div class='message left' style='border-right: 10px solid #"+col+"'>" + text + "</div>";
  		}

    	$(addMessage).hide().appendTo($('#bubblesDiv')).fadeIn(400);

    	if($('#bubblesDiv').height() > $(window).height())
    	{
    		$(document).scrollTop($(document).height());	
    	}
  	};

  	/*function getBubbleHistory()
  	{
  		currBubble.once('value', function(snap) {
			var results = snap.val();
			for (var i in results.messages) {
				displayBubbleMessage(results.messages[i].text, results.messages[i].color, results.messages[i].uid == uid)
			}
		});
  	}*/

  	function showBubble(ref)
  	{
  		var bubbles = fb.child("bubbles");

		bubbles.once('value', function(snap) {
			var results = snap.val();

			for (var i in results) {
				if(i == ref) {
					currBubble = bubbles.child(i);

					//show message history
					//getBubbleHistory();
					watchBubbleMessages();
					$('.input-message').removeClass('send-message').addClass('send-bubble');

					$('#bubblesDiv').fadeIn(400);
					$('.bubble-title').text(results[i].title);
				}
			}
		});
  	}

  	//show bubble on click
  	$('#messagesDiv').on('click', '.show-bubble', function (e) {
		showBubble(this.id);
	});
	$('.close-bubble').click(function (e) {
		$('#bubblesDiv').fadeOut();
		$('#bubblesDiv .message').remove();
		$('.input-message').addClass('send-message').removeClass('send-bubble');
	});


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

	    findBubbles();
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


	function changePlaceholder() {
		var rand = Math.floor((Math.random() * 3));

		$('#messageInput').attr('placeholder', placeholders[rand]);
	}

	//push to messages (not bubbles)
	function pushMessage(){
		if($('#messageInput').val().length > 0)
		{
			var text = $('#messageInput').val();
	    	messages.push({text: text, longitude: longitude, latitude: latitude, color: color, uid: uid});

	    	$('#messageInput').val('');
	    	$('.char-count').text('150');
	    	$('.char-count').removeClass('warning');

	    	changePlaceholder();

				mobileAnalyticsClient.recordEvent('SendMessage', {
        }, {
            'CharacterCount': text.length
        });
        mobileAnalyticsClient.submitEvents();

	    }
	};

	//push to bubbles (not messages)
	function pushBubbleMessage(){
		if($('#messageInput').val().length > 0)
		{
			var text = $('#messageInput').val();
	    	currBubble.child('messages').push({text: text, longitude: longitude, latitude: latitude, color: color, uid: uid});

	    	$('#messageInput').val('');
	    	$('.char-count').text('150');
	    	$('.char-count').removeClass('warning');

	    	changePlaceholder();

				mobileAnalyticsClient.recordEvent('SendMessage', {
        }, {
            'CharacterCount': text.length
        });
        mobileAnalyticsClient.submitEvents();

	    }
	};

	function watchBubbleMessages(){
		currBubble.child('messages').on('child_added', function(snapshot) {
			var message = snapshot.val();

	  		if(message.uid == uid)
	  		{
	        	displayBubbleMessage(message.text, message.color, true);	
	  		}
	  		else
	  		{
	  			displayBubbleMessage(message.text, message.color, false);
	  		}

				mobileAnalyticsClient.recordEvent('ReceiveMessage', {
	        }, {
	        });
	        mobileAnalyticsClient.submitEvents();
		});
	}

	//check for 'send' events: enter, button or done for Message input & add to messages or bubbles depending on setting
	$('#messageInput').keyup(function (e) {
	    if (e.keyCode == 13)
	    {
		    if($('.input-message.send-message').length)
			{
				pushMessage();
			}
			else
			{
				pushBubbleMessage();
			}

	    	return false;
	    }
	    else
	    {
	    	$('.char-count').text(150 - $('#messageInput').val().length);
	    	if($('#messageInput').val().length > 134)
			{
				$('.char-count').addClass('warning');
			}
	    }

	});
	$('.input-message .btn').click(function (e) {
		if($('.input-message.send-message').length)
		{
			pushMessage();
		}
		else
		{
			pushBubbleMessage();
		}
	});


	//when a new message is added, show it to the user & add to the users history of received & sent messages
	messages.on('child_added', function(snapshot) {
		var message = snapshot.val();
		if(!historyFlag)
		{
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

					mobileAnalyticsClient.recordEvent('ReceiveMessage', {
	        }, {
	        });
	        mobileAnalyticsClient.submitEvents();

		  	}
		}
	});

	userHistory.once('value', function(snapshot)
	{
		historyFlag = false;

		$('.loading').fadeOut();
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

    	$(addMessage).hide().appendTo($('#messagesDiv')).fadeIn(400);

    	if($('.container').height() > $(window).height())
    	{
    		$(document).scrollTop($(document).height());
    	}
  	};

	getLocation();


    //Make sure region is 'us-east-1'
  AWS.config.region = 'us-east-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-east-1:d75bea86-e3ee-413b-91f7-2c3440fa1c8a' //Amazon Cognito Identity Pool ID
  });

  var options = {
      appId : '24f707dde5a74fbfa4bc0148c0afbdff', //Amazon Mobile Analytics App ID
      appTitle : "Bubble7"};

  var mobileAnalyticsClient = new AMA.Manager(options);

});