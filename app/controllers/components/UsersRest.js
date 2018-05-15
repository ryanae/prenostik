var request = require('request');
var _ = require('underscore')._;
var restless = require('restless'); //({ proxy: "http://127.0.0.1:8888" });
var dateFormat = require('dateformat');
var UsersRest = require('./CommonRest');
var PrenostikUser = require('../../../public/js/app/PrenostikUser');
var fs = require('fs');
var urlFunc = require('url');

UsersRest.prototype.login = function(username, password, cb) 
{
	this.performGetRequest('authenticate', [username, password], function(err, res, body) {
		
			// Enable to simulate a different return code.			
			// body = {"httpStatus":301, "reasonCode":2, "message":"Account locked."}
		
		console.log(body);
		console.log(err);
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			// If login fails, return the reason.
			var result = {
				success: false,
				code: res.statusCode,
				error: "Login failed.",
				data: body
			}			
			cb(result);
		}
		else 
		{	
			// Success.
			var user = new PrenostikUser(body);
			user.password = password;
			console.log("\n\nHere's the authenticated user: ", user);
			var newItem = {
				success: true,
				code: res.statusCode,
				error: "Login succeeded.",
				data: user				
			}			
			cb(newItem);
		}		
	});
}

// Added by Ken Townsley 10/25/13
UsersRest.prototype.getGroups_users = function(cb) {
    // Do the REST call to get the list of available groups/roles
	
	this.performGetRequest('group', function(err, res, body) {
		// This object will return the groups list
		var groups = [];
		// Parse the body of data returned for each group
		for (var i in body) {
			var group = body[i]; // Get a group

			var obj = {
                id: group.id,
                name: group.name,
				data: JSON.stringify(group)
			};
			if(obj.id == 1)
				obj.name = "Site Manager";
			if(obj.id == 2)
				obj.name = "Prenostik Account Admin";
			groups.push(obj);
		}		
		// Sort the returned data by last role name
		groups.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});

		//console.log("List of groups returned in prenostikRest", groups);
		
		cb(groups);
	});
};

// Added by Ken Townsley 10/25/13
UsersRest.prototype.get_users = function(filterID, cb) {
    // Do the REST call to get the list of all available users
	
	this.performGetRequest('/user', function(err, res, data) 
	{
		if (res.statusCode !== 200)
		{ 					
			if(res.statusCode == 401)
			{
				console.log("Error 401 unauthorized.");
				console.log(data);
			cb(null); // Fail.  Return no user.
			}
		}
		else
		{
			// This array will hold the list of users
			var users = [];			
			
			// Parse the list of user objects returned by REST
			for (var i in data) 
			{	
				// Get a user object off the list
				var user = data[i];
				
				var obj = 
				{
					id: user.id,
					siteid: user.account.id,
					name: user.lastname+', '+user.firstname+' ' +user.middlename,
					status: user.status,
					fname: user.firstname,
					mname: user.middlename,
					lname: user.lastname,				
					data: JSON.stringify(user)
				}
				
				// If a filter is provided, use it.
				if(filterID != null)
				{
					if(obj.siteid == filterID)
						users.push(obj);
				}
				else // Otherwise, assume the server is only returning legal data.
					users.push(obj);
			}
			
			// Sort the returned data by last name
			users.sort(function(a, b){
				var nameA=a.lname.toLowerCase(), nameB=b.lname.toLowerCase()
				if (nameA < nameB) // Ascending
					return -1 
				if (nameA > nameB)
					return 1
				return 0; 
				});
				
			//console.log("List of users from PrenostikRest:");
			//console.log(users);
			cb(users);
		}		
	});
	
};

// Added by Ken Townsley 10/28/13
UsersRest.prototype.accounts_updateUser = function(editedUser, cb) {
	
	this.performRawPutRequest('user', editedUser, function(err, res, body) {
			if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the account was not updated, return the error
				cb(
					{success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
					});
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					data: body				
				};	
				
				cb(newItem);
			}
		});	

};

UsersRest.prototype.accounts_getAuth = function(data, cb){
	// Returns the currently authorized user
	// Skeleton here to facilitate future changes.
	//var user = new PrenostikUser(data);
	cb(data);
}

UsersRest.prototype.accounts_reset = function(username, cb){
	// Build the put url - must have account ID to identify which account is being modified
	var url = 'user/reset?username=' + username;
	// e.g.	'user/reset?username=patrick.hong@prenostik.com
	
	// Enable this section for testing without calling reset on server
	/*
	console.log("\n\nRESETING ACCOUNT: ", url);
				var newItem = {
					success: true,
					data:{email:"kgtownsley@gmail.com",
						tmpPassword:"FakeAccountReset"}
				};			
				cb(newItem);
	*/
	this.performAnonymousPost(url, username, function(err, res, body) {
			
			if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the user was not reset, return the error
				cb({  success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
				  });
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					data: body				
				};			
				cb(newItem);
			}
		});		
}

UsersRest.prototype.resetLogin = function(body, cb){
	// Resets the user's password from the login screen
	var url = 'authfromreset'

	var data = { 
				username: body.username,
				tmppassword: body.tempass,
				newpassword: body.password,
				token: body.data
				}
	var sendData = JSON.stringify(data);
	
	this.performRawPostRequest(url, sendData, function(err, res, body) {
		
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			// If the user was not reset, return the error
			cb({  success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
			  });
		}
		else 
		{	
			// Success.
			var newItem = {
				success: true,
				data: body				
			};			
			cb(newItem);
		}
	});

}

UsersRest.prototype.accounts_updateRoleMembership = function(data, cb){
	
	// Build the put url - must have account ID to identify which account is being modified
	var url = 'group/reassignforaccount/' + data.accountID;	
	console.log("\n\nPerforming PUT");
	console.log("\n\nHere's the url and accountID: ", url);
	console.log("\n\nHere's the data to send: ", data.list);
	this.performRawPutRequest(url, data.list, function(err, res, body) {
	console.log("\n\nHere's the err response: ", err);
	console.log("\nHere's the result code: ", res.statusCode);
	console.log("\nHere's the body: ", body);
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			// If the user was not reset, return the error
			cb({  success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
			  });
		}
		else 
		{	
			// Success.
			var newItem = {
				success: true,
				data: body				
			};			
			cb(newItem);
		}		
	});
}

UsersRest.prototype.accounts_updateUserRoles = function(data, cb) {
	
	// Get the updated user information
	var user = data.assignedGroups;	
	// Update it
	this.performRawPutRequest('user', user, function(err, res, body) {
		cb();
	});
	
};
// Added by Ken Townsley 10/28/13
UsersRest.prototype.saveNewProfile = function(data, cb) {

	formData = data;
	this.performRawPostRequest('user', formData, function(err, res, body) {
		if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the user was not added, return the error
				cb({  success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
				  });
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					data: body				
				};			
				cb(newItem);
			}
		});

};

UsersRest.prototype.deleteUser = function(id, cb) {

	this.performDeleteRequest('user/' + id, function(err, res, body) {
			if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the account was not updated, return the error
				console.log("Delete User error: ", res.statusCode);
				cb(
					{success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
					});
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					resCode:res.statusCode,
					data: body				
				};			
				cb(newItem);
			}
		});			
};


UsersRest.prototype.updateUser = function(data, cb) {
	// Called for updating a user's own personal profile.

	this.performRawPutRequest('user', data, function(err, res, body) {
			if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the account was not updated, return the error
				cb(
					{success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
					});
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					resCode:res.statusCode,
					data: body				
				};			
				cb(newItem);
			}
		});	
}

UsersRest.prototype.get_siteManagers = function(cb){
	// Do the REST call to get the list of available site managers
	// Call to the user URI with a role id gets all roles for all accounts
	// that match the id.  Only if you have permission to see across accounts.
	var url = '/user?roleid=1';
	
	this.performGetRequest(url, function(err, res, data) {
		// This array will hold the list of accounts
		var users = [];		
		// Parse the list of user objects returned by REST
		for (var i in data) 
		{	
			// Get a user object off the list
			var account = data[i];
			var obj = 
			{
				siteid: account.account.id,
				userid: account.id,
				name: account.lastname+', '+ account.firstname,
				data: JSON.stringify(account)
			}			
			users.push(obj);			
		}
		
		// Sort the returned data by user name
		users.sort(function(a, b){
			var nameA=a.siteid, nameB=b.siteid;
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
		// console.log("List of site managers in Users Rest: ", users);			
		cb(users);
	});
}

UsersRest.prototype.get_siteUsers = function(id, cb){
	// Do the REST call to get the list of available site users
	// Call to the user URI with a role id gets all roles for all accounts
	// that match the id.  Only if you have permission to see across accounts.
	var url = "/user?accountid="+id;
	
	this.performGetRequest(url, function(err, res, data) {
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			// If the account was not updated, return the error
			cb(
				{success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
				});
		}
		else 
		{	
			// This array will hold the list of accounts
			var users = [];		
			// Parse the list of user objects returned by REST
			for (var i in data) 
			{	
				// Get a user object off the list
				var user = data[i];
				var obj = 
				{
					"siteid": id,
					"userid": user.id,
					"name": user.lastname +", "+ user.firstname +" "+ user.middlename,
					"data": user
				};
				users.push(obj);			
			}
		
			// Sort the returned data by user name
			users.sort(function(a, b){
				var nameA=a.name, nameB=b.name;
				if (nameA < nameB) // Ascending
					return -1 
				if (nameA > nameB)
					return 1
				return 0; 
				});
		
			//console.log("List of users returned by get by iD", users);	
			var newItem = {
				success: true,
				resCode:res.statusCode,
				data: users				
				}			
				cb(newItem);			
		}
	});
}

UsersRest.prototype.getAccountUser = function(data, cb){
// Returns a single user profile based on account and ID
	var url = '/user?accountid=' + data.accountid + '&roleid=' + data.roleid;
	
	this.performGetRequest(url, function(err, res, data){
			if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the account was not updated, return the error
				cb(
					{success: false, 
					   error:{message: 'Invalid status code received from server.',
					   code: res.statusCode}
					});
			}
			else 
			{	
				// Success.
				var newItem = {
					success: true,
					resCode:res.statusCode,
					data: data				
				};			
				cb(newItem);
			}
		});	
}


var exports = module.exports = UsersRest;
