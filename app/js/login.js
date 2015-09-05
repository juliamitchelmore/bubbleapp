	var fb = new Firebase("https://scorching-heat-529.firebaseio.com/");
		fb.authWithOAuthPopup("facebook", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		  }
		});