// prenostikEmail
// This object comprises email functionality
/*
// This data object is stored in the external file.  
"from": "Prenostik Account <accounts@prenostik.com>",
"intro":"You are receiving this email because...",
"wrap":"Please do not reply to this email...",
"sig":"Prenostik slogan",
"replyto":"prenostik@prenostik.com", (in cases where this is needed)
"website":"www.prenostik.com", (generic ref)
"resetUser":{"subject": "Account Information",
			"body":"this is the body" // Specific text for each situation
			},
"resetAdmin" 			// Account reset by administrator
"accountNew"			// Account created
"accountLocked"			// Too many login failures
"accountPassExpired"	// Password expired
"accountExpired"		// Prenostik contract expired
"resetCommon":			// This is body text common to all "reset" emails.
*/
var nodemailer = require("nodemailer");
var fs = require("fs");

var smtpTransport;
var bouncebackURL;

module.exports = prenostikEmail;

emailTypes=
	{RESET_USER: 0,			// User initiated reset
	 RESET_ADMIN:1,			// Admin initiated reset
	 ACT_NEW:    2,			// New account notification
	 ACT_LOCKED: 3,			// Too many failed login attempts
	 ACT_PASS_EXPIRED:4,	// duh
	 ACT_EXPIRED:5}			// Contract expired.
Object.freeze(emailTypes);

function prenostikEmail() 
{	
	// Set up the transport for all functions
	smtpTransport = nodemailer.createTransport("SMTP", {
			service: process.env.SMTP_SERVICE,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
				}
			});		
	
	// Users are told to visit this address to reset their passwords
	bouncebackURL = process.env.APP_LOCATION + "relogin";
}	

prenostikEmail.prototype.sendAutoEmail = function(recipient, response)
{
	// Data looks like
	// recipient.name (user's name) "Bob Smith"
	// recipient.email (email address) "bob@gmail.com"
	// recipient.password (temp password, if needed) 
	// recipient.type RESET_USER(pseudo enum for the email being sent, e.g. reset) 
	
	// Load email variables	
	filename = 'app/controllers/email/email.txt';
	
	fs.readFile(filename, 'utf8', function(err, fileData)
	{
		if (err) throw err;	
		var allMail = JSON.parse(fileData);		
		
		var message;
		switch (recipient.type)
		{
		case emailTypes.RESET_USER: // User initiated reset	
			message = allMail.resetUser;	
		break;
		case emailTypes.RESET_ADMIN: // Admin initiated reset
			message = allMail.resetAdmin;
		break;
		case emailTypes.ACT_NEW:	// New account notification
			message = allMail.accountNew;
		break;
		case emailTypes.ACT_LOCKED: // Too many failed login attempts
			message = allMail.accountLocked;
		break;
		case emailTypes.ACT_PASS_EXPIRED: 
			message = allMail.accountPassExpired;
		break;
		case emailTypes.ACT_EXPIRED: // Contract expired.
			message = allMail.accountExpired;
		break;
		}		
		
		// Build the email
		var bodyText = message.body + allMail.resetCommon;		
		var bodyText = bodyText.replace("RELOGIN_URL", bouncebackURL);
		bodyText += recipient.password;
		bodyText += allMail.wrap;
		bodyText += allMail.sig;
		bodyText += allMail.website;
		var mailData={
			from: allMail.from,
			to: recipient.name + " <" + recipient.email + ">",					
			subject: message.subject,
			text: bodyText
			}		
		// Boom.
		smtpTransport.sendMail(mailData, function(err, response) {
				smtpTransport.close();
		});
	});			
}
