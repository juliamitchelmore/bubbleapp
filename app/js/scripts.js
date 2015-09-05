$(document).ready(function()
{
	var fb = new Firebase("https://scorching-heat-529.firebaseio.com/");

	$('#messageInput').keypress(function (e) {
	    if (e.keyCode == 13) {
	      var text = $('#messageInput').val();
	      fb.push({text: text});
	      $('#messageInput').val('');
	    }
	  });

	fb.on('child_added', function(snapshot) {
	  var message = snapshot.val();
        displayChatMessage(message.text);
      });
  
  	function displayChatMessage(text) {
  		var addMessage="<div class='message left'>" + text + "</div>";
    	$(addMessage).appendTo($('#messagesDiv'));
    	$(document).scrollTop($('#messagesDiv')[0].scrollHeight);
  	};

});