$(document).ready(function() {
	
	var fb = new Firebase("https://scorching-heat-529.firebaseio.com/");
		
	$("#facebook").click(function() {

		fb.authWithOAuthRedirect("facebook", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		  }
		});

	fb.onAuth(function(authData) {

	  if (authData) {
	    // save the user's profile into the database so we can list users,
	    // use them in Security and Firebase Rules, and show profiles

	    var userFB = fb.child("users").child(authData.uid);
			
			userFB.on("value", function(snapshot) {

				//Already Registered read color into local var
				if (snapshot.val() === null) {
					//This user isn't registered
					color = generateColor(authData.uid);
					userFB.set({
						id: authData.uid,
	    			provider: authData.provider,
	      		name: authData.facebook.displayName,
	      		color: color
	    		});
				}

				window.location.href = "chat.html";

			}, function (errorObject) {

				//TODO Show error

			});

		}

  });

	});	

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

});
