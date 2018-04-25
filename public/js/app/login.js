
var toast = require('../lib/toast');
var hbs = require('hbs');
var PrenostikUser = require('./PrenostikUser');
var accountsCommon = require('./accountsCommon');

var ctxSocket = {};
var Login = function(socket) {
	this.ctx = '.login-controller';
	this.socket = socket;

	ctxSocket = socket;
	this.init();
}

Login.prototype.init = function() {
};

module.exports = Login;

$( document ).ready(function() {

	var commonLib = new accountsCommon;
	$( "#username" ).focus();  
	$('#forgot').attr('href', 'forgot');
	$('#password').attr('maxlength',"50");
	$('#passwordConfirm').attr('maxlength',"50");
	$('#qualityMeter').prop("disabled", true);
	$('#qualityMeter').css('color', 'white');
	commonLib.meter(0, $('#qualityMeter').get(0));

	$('body').on('click', '#init_pass', function() {		
		var pass = $('#password').val();
		var passC = $('#passwordConfirm').val();
		var audit = commonLib.validatePassword(pass, passC);
		if(audit.valid == true)		
			document.getElementById("relogin").submit();		
		else // There's a problem with the passwords.
			displayErrors(audit); 
		
	});
	
	$('body').on('click', '#mnulogout', function() {
		console.log("\n log out on menu clicked.");
		var backlen = window.history.length;
		window.history.go(-backlen);
		//window.location.href = '/users/login';
	});
	
	$('body').on('click', '#profile_submit', function() {
		// Submit edits to a user's personal profile.
		var profile = {fname:$('#firstname').get(0),
					   lname:$('#lastname').get(0),
					   username:$('#username').get(0),
					   email:$('#email').get(0),
					   emailc:$('#emailc').get(0)
					   }			
		var audit = commonLib.isValidEdit(profile);
		
		if(audit.valid == true)
		{
			// Now check for a new password
			var newPass = $('#password').val();		
			if(newPass.localeCompare("") !=0)			
				audit = commonLib.validatePassword(newPass, $('#passwordConfirm').val());				
				
			if(audit.valid == true)
				$("#authEdits").modal(); // Get the current password.
			else // Password trouble.  Tell the user.
				displayErrors(audit); 			
		}
		else // Profile validation failed.  Inform the user of the problem.						
			displayErrors(audit); 					
	});
	
	$('body').on('click', '#authOK', function() {
			console.log("Pass: ", $('#cpass').val());			
			// Submit page
			console.log("Page approved.  Submitting.");
			document.getElementById("personal_profile").submit();			
			$('#cpass').val("");			
	});	
	
	$('body').on('click', '#authNO', function() {
		// If user cancels the dialog, don't need the pass
		// hanging around in memory.
		$('#cpass').val("");
	});
	
	$('body').on('keyup', '#password', function(e)
	{
		var pass = $('#password').val();
		var quality = commonLib.scorePassword(pass);
		commonLib.meter(quality, $('#qualityMeter').get(0));		
	});		
	
	$('body').on('change', '#password', function()
	{
		var pass = $('#password').val();
		var quality = commonLib.scorePassword(pass);
		commonLib.meter(quality, $('#qualityMeter').get(0));
	});

function displayErrors(audit)
{
	// Add the list to be modified to the dialog
	$("#errList").empty();
	$('#errList').append("<ul id='lstList' style='list-style-type:disc'></ul>");
	// Populate the error messages
	for (i=0; i<audit.errList.length; i++) 			
		$("#lstList").append("<li>"+audit.errList[i].text+"</li>");
	// Tell the user what happened
	if(audit.errList.length > 1)
		$('#errText').text("The following errors have occurred:");
	else
		$('#errText').text("The following error has occurred:");
	// Display
	$("#errAudit").modal(); 	
}	
});
