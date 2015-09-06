$(document).ready(function() {

	//init carousel
  	$('.carousel').carousel({
  		wrap: false
  	});

  	$('.carousel').on('slide.bs.carousel', function () {
	 	if($('.item.active').hasClass('slide1'))
	 	{
	 		$('.logo').removeClass('large').addClass('small');
	 	}
	})
	$('.carousel').on('slid.bs.carousel', function () {
	 	if($('.item.active').hasClass('slide1'))
	 	{
	 		$('.logo').removeClass('small').addClass('large');
	 	}
	})

	var fb = new Firebase("https://scorching-heat-529.firebaseio.com/");
	//fb.auth();
		
	$(".facebook").click(function() {

		fb.authWithOAuthRedirect("facebook", function(error) {
			if (error) {
		    console.log("Login Failed!", error);
			}
		});

	});	

	var authData = fb.getAuth();
	if (authData != null) {
			color = generateColor(authData.uid);
			fb.child("users").child(authData.uid).set({
				id: authData.uid,
  			provider: authData.provider,
    		name: authData.facebook.displayName,
    		color: color
  		});
			console.log("redirecting");
			window.location.href = "chat.html";
	}

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

