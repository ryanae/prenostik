var PrenostikUser = require('./PrenostikUser');

// This file has functions common to all account management.
module.exports = accountsCommon;

function accountsCommon(){};

accountsCommon.prototype.getAuthUser = function()
{
	// Returns the currently authorized user for permissions checking
	var authUser;
   $.ajax({
		url: '/users/auth',
		dataType: 'json',
		async: false, // Don't want to return a null user
		success: function (response) {
		// Create a new Prenostik user from the response
		authUser = new PrenostikUser(response);		
		}
	});	
	return authUser;
}

accountsCommon.prototype.isValidEmail = function(emailAddress)
{
	// This is provided as a function stub in the event that extensive
	// validation is required.
	
	// Attempt basic e-mail field validation to avoid accidental errors
	// such as typos. This basic validation here essentialy assumes the user 
	// intended to enter a correct address.

	// Avoiding the slippery slope of regex validation
	// RFC822 provides a perl script that will validate correctly.
	// Found great notes here
	// http://ex-parrot.com/~pdw/Mail-RFC822-Address.html
	
	// Should never be null!
	if(emailAddress == null)
		return false;

	// Should always have length
	if(emailAddress == "")
		return false;

	// Should always be a bare minimum of 6 chars
	// e.g. "a@b.cd"
	if(emailAddress.length < 7)
		return false;
	
	// Should always be "at" somewhere
	if(emailAddress.indexOf("@") == -1)
		return false;
		
	// Should always be at least one "dot" in there somewhere.
	var dot = emailAddress.lastIndexOf(".");
	if(dot == -1)
		return false;
		
	// Should never start with the @
	var at = emailAddress.indexOf("@");		
	if(at == 0)
		return false;
		
	// Should have something between the @ and the .
	// Also fails if there is no dot after the @
	// e.g. fails on "name@.com" and "first.last@domain-com"
	if( (dot - at) < 2)
		return false;
	
	// Should not have commas in it
	if(emailAddress.indexOf(",") != -1)
		return false;

	// Pass validation
	return true;	
}

// This function sorts the selection dropdown passed in. A tad kludgey.
// The function assumes that the text visible to the user is the text
// on which to sort.  
accountsCommon.prototype.sortSelect = function(selectToSort) 
{	
	// Need an array to hold the list
	var arrOptions = [];

	// Dump the list in to the array
	for (var i = 0; i < selectToSort.options.length; i++) 
	{
		arrOptions.push(selectToSort.options[i]);
	}
	
	// Let the array sort it out	
	arrOptions.sort(function(a, b){
		var itemA=a.text.toLowerCase(), itemB=b.text.toLowerCase()
		if (itemA < itemB) // Ascending
			return -1 
		if (itemA > itemB)
			return 1
		return 0; 
		});

	// Dump the array back in to the list
	for (var i = 0; i < arrOptions.length; i++)
	{
		selectToSort.options[i] = arrOptions[i];
	}
	
}

accountsCommon.prototype.scorePassword = function (password)
{
	var score = 0;
	if (password == "")
		return score;

	// Array for tracking letter use
	var letters = new Object();
	
	// Parse the whole password letter by letter
	for (var i=0; i<password.length; i++) 
	{
		// The value of each letter drops the more it is used
		letters[password[i]] = (letters[password[i]] || 0) + 1;
		score += (5.0 / letters[password[i]]);
	}

	// Add points for each improvement
	var variations = {
						digits: /\d/.test(password),
						lower: /[a-z]/.test(password),
						upper: /[A-Z]/.test(password),
						nonWords: /\W/.test(password),
					}
	
	// Count and score the variations
	variationCount = 0;
	for (var check in variations) {
		variationCount += (variations[check] == true) ? 1 : 0;
	}
	
	// Just an arbitrary score, really.
	score += (variationCount - 1) * 10;
	
	// Return the int value of the score
	return (score|0);
}

// This function validates editing changes before submission.
// errors are hilighted.
accountsCommon.prototype.isValidEdit = function(profile)
{	
	// A valid edit should have at the least a first and last name, email
	// probably company membership and roles required too.  
	// Start by assuming the edit is valid

	// Create the error tracking object.
	var errors =[];
	var isValid ={
		valid : true,
		errList : errors		
	};	

	// Check the name fields
	var fname = profile.fname;	
	if(fname.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"First name is a required field."});		
		fname.style.borderColor = "red";
		}
	else
		fname.style.borderColor = "";
		
	var lname = profile.lname;
	if(lname.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Last name is a required field."});		
		lname.style.borderColor = "red";
		}
	else
		lname.style.borderColor = "";

	var uname = profile.username;
	if(uname.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Username is a required field."});		
		uname.style.borderColor = "red";
		}
	else
		uname.style.borderColor = "";
		
	// Validate email
	var email = profile.email;
	var emailc = profile.emailc;
	if(email.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"E-mail is a required field."});		
		email.style.borderColor = "red";
	}

	if(email.value != emailc.value)
	{
		isValid.valid = false;
		isValid.errList.push({text:"E-mail addresses do not match."});		
		email.style.borderColor = "red";
		emailc.style.borderColor = "red";		
	}
	else
	{
		email.style.borderColor = "";
		emailc.style.borderColor = "";
		var support = new accountsCommon;
		if (support.isValidEmail(email.value))
			email.style.borderColor = "";
		else{
			isValid.valid = false;
			isValid.errList.push({text:"E-mail addresses match, but appear to be invalid."});			
			email.style.borderColor = "red";		
			}
	}	
	return isValid;
}

accountsCommon.prototype.meter = function(value, elem)
{
	// Can't display anything without the control.
	if (elem == null)
		return;

	// Set the width of the element passed in as a percentage of size
	elem.style.width = (value > 100) ? 100:value + "%";
	
	// There are 5 divisions of strength		
	var intD = Math.ceil( value/20 ); 
	intD = (intD > 5) ?  5:intD;
	
	var strText = "";
	var strColor = "";
	// Apply subjective quality judgement
	switch(intD)
	{
		case 1: //0<x<20
			strText = "Very Weak";
			strColor = "#d00005";
			break;
		case 2://20<x<40
			strText = "Weak";
			strColor = "#e03d20";			
			break;
		case 3://40<x<60
			strText = "Average";
			strColor = "#e0cb00";			
			break;
		case 4: //60<x<80
			strText = "Strong";
			strColor = "#208020";				
			break;
		case 5: //80<x<100
			strText = "Very Strong";
			strColor = "#206020";				
			break;
		default:		
			break;
	}

	elem.style.backgroundColor = strColor;
	elem.value = strText;
}

accountsCommon.prototype.validatePassword = function (password, passConfirm)
{
	var errors =[];
	var isValid ={
		valid : true,
		errList : errors		
	};	

	if(passConfirm.localeCompare(password) != 0)
	{
		isValid.valid = false;
		isValid.errList.push({text:"Password confirmation does not match"});
		return isValid;
	}	

	if(password.length<8)
	{
		isValid.valid = false;
		isValid.errList.push({text:"Passwords must be at least 8 characters in length"});				
		return isValid;
	}
	
	var quality = this.scorePassword(password);
	if(quality < 20)
	{
		isValid.valid = false;
		isValid.errList.push({text:"You will need to select a stronger password."});
		return isValid;
	}
	
	return isValid;
}