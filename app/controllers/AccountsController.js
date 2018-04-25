var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var async = require('async'); // For rest calls

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
    Controller.call(this, injector);
	this.app = null //mc
    this.name = 'Accounts';	
	injector.injectInto(this);	
}
	
MyController.prototype.home = function(req, res) {
	res.redirect('/users/login');
}

MyController.prototype.accounts = function(req, res) {
	var self = this;
	var injector = new Injector();
	
	injector.addMapping('accounts').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_corpaccounts(function(accounts) {
				callback(accounts);
			});
		});
	});

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	return new RenderAction('accounts', this, injector, arguments);
}

MyController.prototype.add_user = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	return new RenderAction('add_user', this, injector, arguments);
}

MyController.prototype.edit_user = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	injector.addMapping('statusVals').toProvider(function(callback) {
			var statusVals=[
				{id:"active", value:0, text:"Active"},
				//{id:"newaccount", value:"1", text:"New Account"},
				{id:"locked", value:2, text:"Locked"},
				//{id:"expass", value:"3", text:"Expired Password"},
				//{id:"exacc", value:"4", text:"Account Expired"},
				//{id:"reset", value:"5", text:"Reset"}
				];
			callback(statusVals);
			// The above mappings are best handled through the proper pages, and should
			// not be exposed here.  The only two values that matter for display are
			// active or locked.
		});
	
	injector.addMapping('users').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		// Filter out users based on the company being requested
		rest.ready(function() {	
				rest.get_users(req.params.id, function(users) {
					callback(users);
				});			
			});
		});
		return new RenderAction('edit_user', this, injector, arguments);
	
}

MyController.prototype.edit_role = function(req, res) 
{
	var self = this;
	var injector = new Injector();
	
	// Inject the current user, as always
	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});	
	
	// Map the role groups
	injector.addMapping('groups').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {
				rest.getGroups_users(function(groups) { 
				callback(groups);
			});
		});
	});
	
	// Map the list of users	
	injector.addMapping('users').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		// Filter out users based on the company being requested
		rest.ready(function() {	
			rest.get_users(req.params.id, function(users) {
				callback(users);
			});			
		});	
	});
	
	// When edit_role page loads, user roles will be parsed in accounts.js
	return new RenderAction('edit_role', this, injector, arguments);
}

MyController.prototype.edit_all_roles = function(req, res) 
{
	var self = this;
	var injector = new Injector();
	
	// Map the current user
	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	// Map the groups
	injector.addMapping('groups').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.getGroups_users(function(groups) {
				callback(groups);
			});
		});
	});
	
	// Map the users	
	injector.addMapping('users').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		// Filter out users based on the company being requested
		rest.ready(function() {	
			rest.get_users(req.params.id, function(users) {
				callback(users);
			});			
		});
	});
	return new RenderAction('edit_all_roles', this, injector, arguments);
}

MyController.prototype.delete_user = function(req, res) 
{
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	injector.addMapping('users').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {	
			rest.get_users(req.params.id, function(users) {
				callback(users);
			});			
		});
	});

	return new RenderAction('delete_user', this, injector, arguments);
}

//**************************************************************************
// Action implementations follow
//**************************************************************************
MyController.prototype.accounts_add_user = function(req, res)
 {
	var injector = new Injector();	
	var self = this;
	
	if (req.isPOST()) 
	{
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {
                    rest.saveNewProfile(req.body.edited_user, function(response) {
								if(response.success == true)
								{
									// The new user profile was created successfuly.  Now reset it.
									rest.ready(function(){rest.accounts_reset(response.data.username, 
										function(response)
										{
											if(response.success == true)
											{											
											var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
											var data={"name":response.firstname,
													  "email":response.data.email, 
													  "password":response.data.tmpPassword,
													  "type":emailTypes.ACT_NEW
													  }
											email.sendAutoEmail(data, response);											
											
											}});
									});									
									// response.data.body has returned data
									// Update POST has been successful
									req.setToast('toast-success', 'User profile added successfully!');
									res.redirect('/users/add_user');
								}
								else
								{
									req.setToast('toast-error', 'User profile update failed!');
									res.redirect('/users/add_user');
									console.log("Response from failure: ", response);
								}   
                    });
                });
 	
	} else 
	{
		return new RenderAction('add_user', this, injector, arguments);
	}
	
};

MyController.prototype.update_user = function(req, res) {
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);
	var data = req.body.edited_user;
	//console.log("\n\nEdited user data: ", data);
	rest.ready(function() {
		rest.accounts_updateUser(data, function(response) {
			if(response.success == true)
			{	// response.data.body has returned data
				//console.log("\nEdited User in Accounts Controller post update_user: ", response);
				// Update PUT has been successful
				req.setToast('toast-success', 'User profile updated successfully!');
				res.redirect('/users/edit_user');
			}
			else
			{
				req.setToast('toast-error', 'User profile update failed!');
				res.redirect('/users/edit_user');
			}
		
		});
	});

};

MyController.prototype.pw_reset_admin = function(req, res)
{

	// Called via AJAX to reset a user's account from the admin page.
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);	

	rest.ready(function() {		
		rest.accounts_reset(req.body.username, function(response) {
			if(response.success == true)
			{
				var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
				//console.log('Post reset user: ', response.data);
				 
				var data={"name":req.body.username,
						  "email":response.data.email, 
						  "password":response.data.tmpPassword,
						  "type":emailTypes.RESET_ADMIN
						  }
				email.sendAutoEmail(data, response);				
				res.end(JSON.stringify(response));								
			}
			else
			{				
				res.end(JSON.stringify(response));
			}
		});
	});	
}

MyController.prototype.accounts_delete_user = function(req, res)
{
	var injector = new Injector();	
	var self = this;
	
	var rest = new (require('./components/UsersRest'))(self.app, req.session.id);
	console.log("Req.body", req.body);
	
	// Get the user's account ID	
	if(req.body.filter != null)
		var f = req.body.filter;
	else
		var f = req.session.user.account.id;
		
	// Add the account ID to the object
	var data = {"accountID" : f	}
	// Get the id of the record to delete from the web page
	var id = req.body.id;
	//console.log("user id to delete: ", id);
	//console.log("body", req.body);
	rest.ready(function(){rest.deleteUser(id,function(response){
			if(response.success == true)
			{	// response.data.body has returned data
				// console.log("\nDeleted User in Accounts Controller post delete: ", response);
				// Update PUT has been successful
				req.setToast('toast-success', 'User profile deleted successfully!');
				res.redirect('/users/delete_user');
			}
			else
			{
				req.setToast('toast-error', 'User profile delete failed!');
				res.redirect('/users/delete_user');
			}
			
			if((data.accountID != null) && (req.body.filter != null) )
				res.redirect('/users/delete_user/'+req.body.filter);
			else
				res.redirect('/users/delete_user');

		});                   
	});
};

MyController.prototype.accounts_set_user_roles = function(req, res)
{	
	// This function adds multiple roles to a single user.
	var injector = new Injector();	
	var self = this;
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);

	rest.ready(function() {		
	rest.accounts_updateUserRoles(req.body, function() {	

		req.setToast('toast-success', 'User profile updated successfully!');
		
		if(req.body.filter != null)
			res.redirect('/users/edit_role/'+req.body.filter);
		else
			res.redirect('/users/edit_role');
		});
	});
}

MyController.prototype.accounts_update_role_membership = function(req, res)
{
	// This function adds multiple users to a single role
	var injector = new Injector();	
	var self = this;
	var rest = new (require('./components/UsersRest'))(this.app, req.session.id);
	// Get the user's account ID	
	if(req.body.filter != null)
		var f = req.body.filter;
	else
		var f = req.session.user.account.id;
		
	// Add the account ID to the object
	var data = {"accountID" : f,
				"list" : req.body.assignedUsers
				}
	
		rest.ready(function() {		
		rest.accounts_updateRoleMembership(data, function(response) {
			if(response.success == true)
			{
				req.setToast('toast-success', 'Group membership updated successfully!');
			}
			else
			{
				req.setToast('toast-error', 'Group membership update failed.');
			}

			if((data.accountID != null) && (req.body.filter != null) )
				res.redirect('/users/edit_all_roles/'+req.body.filter);
			else
				res.redirect('/users/edit_all_roles');
		});
	});		
};

