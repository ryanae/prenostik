var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var async = require('async'); // For rest calls

module.exports = CorporateController;
Util.inherits(CorporateController, Controller);

function CorporateController(injector) {
    Controller.call(this, injector);
	this.app = null //mc
    this.name = 'Corporate';	
	injector.injectInto(this);	
}
	
CorporateController.prototype.home = function(req, res) {
	res.redirect('/users/login');
};

CorporateController.prototype.corpaccounts = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	return new RenderAction('corpaccounts', this, injector, arguments);
};

CorporateController.prototype.mnu_add_account = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});

	injector.addMapping('accounts').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_corpaccounts(function(accounts) {
				callback(accounts);
			});
		});
	});
	
	injector.addMapping('siteManagers').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {			
			rest.get_siteManagers(function(siteManagers) {				
				callback(siteManagers);
			});
		});
	});

	injector.addMapping('departments').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_departments(function(departments) {
				callback(departments);
			});
		});
	});
	
	injector.addMapping('industries').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_industries(function(industries) {
				callback(industries);
			});
		});
	});
	
	injector.addMapping('accountTypes').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_account_types(function(accountTypes) {
				callback(accountTypes);
			});
		});
	});

	injector.addMapping('licenseTypes').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_license_types(function(licenseTypes) {
				callback(licenseTypes);
			});
		});
	});
	
	return new RenderAction('add_account', this, injector, arguments);
};

CorporateController.prototype.mnu_edit_account = function(req, res) {
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	injector.addMapping('users').toProvider(function(callback) {
		var rest = new (require('./components/UsersRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_users(function(users) {
				callback(users);
			});
		});
	});
	return new RenderAction('edit_account', this, injector, arguments);
};

CorporateController.prototype.mnu_deactivate_account = function(req, res) 
{
	var self = this;
	var injector = new Injector();

	injector.addMapping('user').toProvider(function(callback) {
		callback(req.session.user);
	});
	
	injector.addMapping('accounts').toProvider(function(callback) {
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.get_corpaccounts(function(accounts) {
				callback(accounts);
			});
		});
	});

	return new RenderAction('deactivate_account', this, injector, arguments);
};

//**************************************************************************
// Action implementations follow
//**************************************************************************
CorporateController.prototype.corpaccounts_add_account = function(req, res)
 {
	var injector = new Injector();	
	var self = this;	
	var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);
	
	if(req.body.mode == 'add')		
	{		
		rest.ready(function() {
			rest.addNewAccount(req.body, function(response)// Only uses hidden field edited_account 
				{
					if(response.success == true)
					{
						// console.log('\nPost POST account: ', response.data);
						// The account was created.  The server responds with the new account ID
						// So now the Account Manager can be created, associated with the account						
						var user = JSON.parse(req.body.edited_newAdmin);						
						// Build the company object using the server's response
						user.account = {"id":response.data.id, "name":response.data.name};
						// Add the user to the Site Manager group
						user.groups = [{"id":"1"}];
						// Restringify the user data
						req.body.edited_newAdmin = JSON.stringify(user);						
						// Create the user account						
						var rest = new (require('./components/UsersRest'))(self.app, req.session.id);
							
						rest.ready(function() {
							rest.saveNewProfile(req.body.edited_newAdmin, function(response) 
							{
								if(response.success == true)
								{
									console.log("\n\nUser Profile created.  Resetting");
									rest.ready(function(){rest.accounts_reset(response.data.username, 
										function(response)
										{
											if(response.success == true)
											{											
											var email = new(require('./components/prenostikEmail'))(this.app, req.session.id);
											var data={"name":user.name,
													  "email":response.data.email, 
													  "password":response.data.tmpPassword,
													  "type":emailTypes.ACT_NEW
													  }
											email.sendAutoEmail(data, response);											
											
											}});
									});																		
									// Creation of both accounts has been successful									
									// TODO: this is not actually a certainty.
									req.setToast('toast-success', 'Account profile created successfully!');
									res.redirect('/corporate/corpaccounts');
								}
								else
								{
									// Half fail. Delete the account that was created?
									// Account was created, but user creation failed.									
									req.setToast('toast-error', 'Account Manager user creation failed!');
									res.redirect('/corporate/corpaccounts');
								}
							});
						});				
					}
					else
					{
						// Complete fail.  Failed to create the account.  User was not created.
						req.setToast('toast-error', 'Customer account creation failed!');
						res.redirect('/corporate/corpaccounts');
					}	 
				});
		});
	}
	else
	{
		// PUT an edit of the account.  If successful, put the edit of the edited site manager.		
		rest.ready(function() {
			rest.updateAccount(req.body, function(response){
				if(response.success == true)
				{	// PUT the edits to the site manager						
					var rest = new (require('./components/UsersRest'))(self.app, req.session.id);
					//console.log("\nHere's the edited new admin",req.body.edited_newAdmin);
					//console.log("\nHere's the edited old admin",req.body.edited_oldAdmin);

					var newAdmin = req.body.edited_newAdmin; // Always holds valid edit
					var oldAdmin = req.body.edited_oldAdmin; // Only if role was changed
					var newStatus = false;
					var oldStatus = true;
					rest.ready(function(){	
						// Save edits to admin account
						rest.accounts_updateUser(newAdmin, function(response){									
								newStatus = response.success;
						});
					});
					
					if(oldAdmin != null){
						rest.ready(function(){							
							// Role was changed.  Need to update the old admin 
							rest.accounts_updateUser(oldAdmin, function(response){								
									oldStatus = response.success;								
							});
						});
					}
					
					if((newStatus && oldStatus) == true){
						// Update of all accounts has been successful
						req.setToast('toast-success', 'Site account profile updated successfully.');
						res.redirect('/corporate/corpaccounts');
					}
					else{
						req.setToast('toast-error', 'Site manager profile updates failed.');
						res.redirect('/corporate/corpaccounts');
					}
				}
				else
				{
					req.setToast('toast-error', 'Account profile update failed!');
					res.redirect('/corporate/corpaccounts');
				}
			});
		});
	}
} 

CorporateController.prototype.deactivate_account = function(req, res)
{
	var injector = new Injector();	
	var self = this;
	
	if (req.isPOST()) 
	{
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);
		// Get the id of the record to delete from the web page
		var id = req.body.id;
		rest.ready(function(){rest.deactivateAccount(id,function(){
					});                   
                });
		req.setToast('toast-success', 'Account deactivated successfully!');
		res.redirect('/corporate/mnu_deactivate_account'); 	
	} else 
	{
		return new RenderAction('deactivate_account', this, injector, arguments);
	}

};

CorporateController.prototype.delete_account = function(req, res)
{
	// Super secret undocumented account delete function
	var injector = new Injector();	
	var self = this;
	
	if (req.isPOST()) 
	{
		var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);
		// Get the id of the record to delete from the web page
		var id = req.body.id;
		rest.ready(function(){rest.deleteAccount(id,function(){
					});                   
                });
		req.setToast('toast-success', 'Account deleted successfully!');
		res.redirect('/corporate/mnu_deactivate_account'); 	
	} else 
	{
		return new RenderAction('deactivate_account', this, injector, arguments);
	}

};

// CRUD operations for Characteristics
CorporateController.prototype.add_charItem = function(req, res)
{
	var rest = new (require('./components/AccountsRest'))(this.app, req.session.id);	

	rest.ready(function() {
		rest.addCharItem(req.body, function(response) {
			res.end(JSON.stringify(response));
		});
	});
	
}

CorporateController.prototype.edit_charItem = function(req, res)
{
	var rest = new (require('./components/AccountsRest'))(this.app, req.session.id);
		
	rest.ready(function() {
		rest.editCharItem(req.body, function(response) {
			res.end(JSON.stringify(response));
		});
	});
	
}

CorporateController.prototype.del_charItem = function(req, res)
{
	var rest = new (require('./components/AccountsRest'))(this.app, req.session.id);
		
	var self = this;	
	var rest = new (require('./components/AccountsRest'))(self.app, req.session.id);

	rest.ready(function(){rest.deleteCharItem(req.body,function(response){
				res.end(JSON.stringify(response));
				});                   
			});
	
}

