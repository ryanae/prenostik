var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var PrenostikUser = require('../../public/js/app/PrenostikUser');

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
	Controller.call(this, injector);

	this.app = null

	this.name = 'Users';

	injector.injectInto(this);
}

MyController.prototype.logout = function(req, res) {
	var self = this;
	var injector = new Injector();

	req.setToast('toast-info', 'You have been logged out.');
	req.session.user = null;
	res.clearCookie('auth');
  req.session.destroy(function(err) {
		console.log('Error accessing session:', err);
	});

	res.redirect('/');
};

MyController.prototype.login = function(req, res)
{
	if (req.session.user)
	{
		res.redirect('/');
		return;
	}
	var self = this;
	var selfArguments = arguments;
	var injector = new Injector();

	/*	Login return codes
	ACTIVE, 0
	NEW_USER, 1
	LOCKED, 2
	EXPIRED_PASSWORD, 3
	ACCOUNT_EXPIRED, 4
	RESET, 5
	OTHER, 6
	*/
	if (req.isPOST())
	{
		var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

		rest.login(req.body.username, req.body.password, function(result) {

			if(result.success == true)
			{
				req.session.user = result.data;
				req.clearFlash();
				req.setToast('toast-success', 'Welcome back, ' + req.session.user.firstname + '.');
				// Redirect home unless a redirect is defined.
				if (typeof req.session.authRedirect == "undefined")
					res.redirect('/');
				else
				{
					res.redirect(req.session.authRedirect);
					delete req.session.authRedirect;
				}
			}
			else
			{	
				console.log("\n\nReason code: ", result.data.reasonCode);
				switch(result.data.reasonCode)
				{
					case -1: 
						req.setToast('toast-error', 'Invalid username or password.');
					break;
					case 1: // New user status.  Shouldn't happen.
						// Throw to reset?
						console.log("\n\nWARNING: User account status is 1 (new)");
					break;							

					case 2: // Locked account
						rest.ready(function() {
							rest.accounts_reset(req.body.username, function(response) {
							if(response.success == true){
								//console.log('Post reset user: ', response.data);
								var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
								var data={"name":req.body.username,
										  "email":response.data.email, 
										  "password":response.data.tmpPassword,
										  "type":emailTypes.ACT_LOCKED
										  }
								email.sendAutoEmail(data, response);
							}});
						});
						res.redirect('/lockout');
						req.setToast('toast-error', 'Too many login attempts.')
					break;
					case 3: // Expired password
						rest.ready(function() {
							rest.accounts_reset(req.body.username, function(response) {
							if(response.success == true){
								//console.log('Post reset user: ', response.data);
								var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
								var data={"name":req.body.username,
										  "email":response.data.email, 
										  "password":response.data.tmpPassword,
										  "type":emailTypes.ACT_PASS_EXPIRED
										  }
								email.sendAutoEmail(data, response);

							}});
						});
						req.setToast('toast-error', 'Account password has expired.')
						res.redirect('/expired_pass');
					break
					case 4: // Expired account
						req.setToast('toast-error', 'Account license has expired.')
						res.redirect('/expired_account');
					break;
					case 5: // Account in reset state - user came in through the front door.
						req.setToast('toast-error', 'You must reset your password.')
						res.redirect('/relogin');
					break;
					case 6: // Some other problem
						req.setToast('toast-error', 'Invalid username or password.');
					break;
					case 7:
						req.setToast('toast-error', 'Unknown user name or password.');
						break;
					default:
						// Double darn it.
						req.setToast('toast-error', 'Unknown problem encountered.');
					break;
				}
				return new RenderAction('login', self, injector, selfArguments);
			}
		});

	}
	else
	{
		return new RenderAction('login', this, injector, arguments);
	}
};

MyController.prototype.forgot = function(req, res){
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	return new RenderAction('forgot', this, injector, arguments);
}

MyController.prototype.expired_pass = function(req, res){
	var self = this;
	var injector = new Injector();

	return new RenderAction('expired_pass', this, injector, arguments);
}

MyController.prototype.expired_account = function(req, res){
	var self = this;
	var injector = new Injector();

	return new RenderAction('expired_account', this, injector, arguments);
}

MyController.prototype.lockout = function(req, res){
	var self = this;
	var injector = new Injector();

	return new RenderAction('lockout', this, injector, arguments);
}

MyController.prototype.profile = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	return new RenderAction('profile', this, injector, arguments);
};

// Reset a locked account and send an email - does not require login
// TODO: This exposes us to DOS attacks by an attacker continually 
// resetting the victim's password.
MyController.prototype.resetAnon = function(req, res){
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.accounts_reset(req.body.username, function(response) {
			if(response.success == true)
			{
				var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
				console.log('Post reset user: ', response.data);
				 
				var data={"name":req.body.username,
						  "email":response.data.email, 
						  "password":response.data.tmpPassword,
						  "type":emailTypes.RESET_USER
						  }
				email.sendAutoEmail(data, response);				
				req.setToast('toast-success', 'Account profile has been reset');
				res.redirect('/users/login'); 
			}
			else
			{
				req.setToast('toast-error', 'Account profile reset failed');
				res.redirect('/users/login');
			}
		});
	});	
}

MyController.prototype.relogin = function(req, res){
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	return new RenderAction('relogin', this, injector, arguments);
}

MyController.prototype.getAuth = function(req, res){
	// Return the current authorized user
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.accounts_getAuth(req.session.user, function(authUser) {
			res.end(JSON.stringify(authUser));
		});
	});
}

MyController.prototype.get_siteUsers = function(req, res)
{
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.get_siteUsers(req.body.accountid, function(siteUsers) {			
			var data = JSON.stringify(siteUsers);
			res.end(data);
		});
	});
}

MyController.prototype.resetLogin = function(req, res){
	// req.body = username, tempass, password, confirmed, data
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	rest.ready(function() {
	rest.resetLogin(req.body, function(response) {
		if(response.success == true)
		{
			console.log('Post reset user: ', response.data);
			req.setToast('toast-success', 'Account profile has been reset');
			res.redirect('/users/login');
		}
		else
		{
			req.setToast('toast-error', 'Account profile reset failed');
			res.redirect('/users/login');
		}
	});
});

}

MyController.prototype.update = function(req, res) {
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	if (req.body.cpass !== req.session.user.password)
    {
        req.setToast('toast-error', 'Current password is incorrect.  Your changes were not saved.');
        res.redirect('/users/profile');
        return;
    }

	/*REQ BODY { firstname: 'Joe',
	middlename: 'B',
	lastname: 'Low',
	username: 'jbl@gmail.com',
	email: 'jbl@gmail.com',
	emailc: 'jbl@gmail.com',
	password: '',
	passwordConfirm: '',
	cpass: 'prenostik' }
	*/

	// Prepare the user data for submission.
	var userData = {
		account:req.session.user.account,
		id: req.session.user.id,
		firstname: req.body.firstname,
		middlename: req.body.middlename,
		lastname: req.body.lastname,
		username: req.body.username,
		email: req.body.email
	}
	if (req.body.password.length)
		userData.password = req.body.password;

	rawData = JSON.stringify(userData);
	//console.log("\n\nHere's the raw data before PUT: ", rawData);

	rest.ready(function() {
		rest.updateUser(rawData, function(response) {
			if(response.success == true)
			{
				// Update PUT has been successful
				//console.log("\n\nReturned code: ", response.resCode);
				//console.log("\n\nReturned body from edit: ", response.data);

				req.session.user.firstname = userData.firstname;
				req.session.user.middlename = userData.middlename;
				req.session.user.lastname = userData.lastname;
				req.session.user.userName = userData.username;
				req.session.user.email = userData.email;

				if (userData.password != null)
					req.session.user.password = userData.password;

				req.setToast('toast-success', 'User profile updated successfully!');
				res.redirect('/users/profile');
			}
			else
			{
				console.log("UDPATE USER RESPONSE: ", response);
				req.setToast('toast-error', 'User profile update failed!');
				res.redirect('/users/profile');
			}

		});
	});
}
