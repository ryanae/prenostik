var request = require('request');
var _ = require('underscore')._;
var restless = require('restless'); //({ proxy: "http://127.0.0.1:8888" });
var dateFormat = require('dateformat');
var AccountsRest = require('./CommonRest');
var PrenostikUser = require('../../../public/js/app/PrenostikUser');
var fs = require('fs');
var urlFunc = require('url');

AccountsRest.prototype.get_corpaccounts = function(cb) {
    // Do the REST call to get the list of available accounts
	
	this.performGetRequest('/account', function(err, res, data) {
		// This array will hold the list of accounts
		var accounts = [];		
		// Parse the list of user objects returned by REST
		for (var i in data) 
		{	
			// Get a user object off the list
			var account = data[i];

			var obj = 
			{
				id: account.id,
				name: account.name,
				data: JSON.stringify(account)
			}
			accounts.push(obj);
		}
		
		// Sort the returned data by account name
		accounts.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
			
		 //console.log("List of accounts from AccountsRest:");
		 //console.log(accounts);
			
		cb(accounts);
	});
	
};

AccountsRest.prototype.get_departments = function(cb) {
    // Do the REST call to get the list of available departments
		// Test data for use without server.
		/*
		var depts =[];
		
		var obj = {
				id: 1,
				name: "Corporate Planning",
				data: null
			}			
			depts.push(obj);
			obj = {
				id: 2,
				name: "Marketing",
				data: null
				}
			depts.push(obj);
			obj = {
				id: 3,
				name: "Public Relations",
				data: null
				}
			depts.push(obj);
			
		cb(depts);
	*/
	
	this.performGetRequest('/account/department', function(err, res, data) {
		// This array will hold the list of departments
		var departments = [];		
		// Parse the list of department objects returned by REST
		
		for (var i in data) 
		{	
			// Get a department object off the list
			var dept = data[i];

			var obj = 
			{
				id: dept.id,
				name: dept.name,
				data: JSON.stringify(dept)
			}
			
			departments.push(obj);
		}
		
		// Sort the returned data by department name
		departments.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
			
		//console.log("List of departments from AccountsRest:");
		//console.log(departments);
		cb(departments);

	});
	
};

AccountsRest.prototype.get_industries = function(cb) {
    // Do the REST call to get the list of available industries

	this.performGetRequest('/account/industry', function(err, res, data) {
		// This array will hold the list of industries
		var industries = [];		
		// Parse the list of industry objects returned by REST
		for (var i in data) 
		{	
			// Get an industry object off the list
			var industry = data[i];

			var obj = 
			{
				id: industry.id,
				name: industry.name,
				data: JSON.stringify(industry)
			}			
			industries.push(obj);
		}
		
		// Sort the returned data by industry name
		industries.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
			
		//console.log("List of industries from AccountsRest:");
		//console.log(industries);			
		cb(industries);
	});
	
};

AccountsRest.prototype.get_account_types = function(cb) {
    // Do the REST call to get the list of available account types

	this.performGetRequest('/account/accounttype', function(err, res, data) {
		// This array will hold the list of departments
		var types = [];		
		// Parse the list of contract types returned by REST
		for (var i in data) 
		{	
			// Get an account type off the list
			var actType = data[i];
			var obj = 
			{
				id: actType.id,
				name: actType.name,
				data: JSON.stringify(actType)
			}
			
			types.push(obj);
		}
		
		// Sort the returned data by department name
		types.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
			
		//console.log("List of Account types from AccountsRest:");
		//console.log(types);			
		cb(types);
	});
	
};

AccountsRest.prototype.get_license_types = function(cb) {
    // Do the REST call to get the list of available license types

	this.performGetRequest('/account/contracttype', function(err, res, data) {
		// This array will hold the list of licenses
		var licenses = [];		
		// Parse the list of license objects returned by REST
		for (var i in data) 
		{	
			// Get a license object off the list
			var license = data[i];

			var obj = 
			{
				id: license.id,
				name: license.name,
				data: JSON.stringify(license)
			}			
			licenses.push(obj);
		}
		
		// Sort the returned data by department name
		licenses.sort(function(a, b){
			var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
			if (nameA < nameB) // Ascending
				return -1 
			if (nameA > nameB)
				return 1
			return 0; 
			});
			
		//console.log("List of licenses from AccountsRest:");
		//console.log(licenses);
		cb(licenses);

	});
	
};

AccountsRest.prototype.deactivateAccount = function(id, cb) {

console.log("\nWARNING: Account deactivation in AccountsRest.js not implemented.\n");
	/*formData = data.edited_account;
	//console.log("Account data PUT in AccountsRest: ", formData);
	this.performRawPutRequest('account', formData, function(err, res, body) {	
	
		cb(null);
	});
*/
};

AccountsRest.prototype.deleteAccount = function(id, cb) {
// Super secret undocumented account delete function
	//console.log("\nWARNING: delete in AccountsRest.js has been called.\n");
	
	this.performDeleteRequest('account/' + id, function(err, res, body) {
		cb();
	});
};

AccountsRest.prototype.addNewAccount = function(data, cb) {

	// The data has been preprocessed, formatted and validated
	// in corpaccounts.js prior to form submission, so just
	// use the already stringified object passed in this field.
	formData = data.edited_account;
	
	this.performRawPostRequest('account', formData, function(err, res, body) {

		if (res.statusCode != 200 && res.statusCode != 201) 
			{
				// If the account was not added, return the error
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

}

AccountsRest.prototype.updateAccount = function(data, cb)
{
	
	// The data has been preprocessed, formatted and validated
	// in corpaccounts.js prior to form submission, so just
	// use the already stringified object passed in this field.
	formData = data.edited_account;
	
	this.performRawPutRequest('account', formData, function(err, res, body) {	
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
}

AccountsRest.prototype.addCharItem = function(data, cb)
{
	// Bug in AJAX versions < 1.8 will not pass null, stringified or not.
	// So it must be "corrected" to null when it arrives here.
	// Any POST for characterizations are null ID, so this is okay.
	data.body.id = null;
	formData = JSON.stringify(data.body);
	href = data.url;
	
	this.performRawPostRequest(href, formData, function(err, res, body) {
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			cb(
				{success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
				});
		}
		else 
		{		
			var newItem = {
				success: true,
				data: body,				
			};			
			cb(newItem);
		}
	})
	
}

AccountsRest.prototype.editCharItem = function(data, cb)
{
	formData = JSON.stringify(data.body);
	href = data.url;
	
	this.performRawPutRequest(href, formData, function(err, res, body) {
		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			cb(
				{success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
				});
		}
		else 
		{		
			var newItem = {
				success: true,
				data: body,				
			};			
			cb(newItem);
		}
	})
	
}

AccountsRest.prototype.deleteCharItem = function(data, cb)
{
	// Get the id of the record to delete from the web page	
	
	var href = data.url+'/' + data.body.id;
	//console.log("AccountsRest:deleteCharItem:href: ", href);
	
	this.performDeleteRequest(href, function(err, res, body) {

		if (res.statusCode != 200 && res.statusCode != 201) 
		{
			cb(
				{success: false, 
				   error:{message: 'Invalid status code received from server.',
				   code: res.statusCode}
				});
		}
		else 
		{		
			var newItem = {
				success: true,
				data: {"id":null}				
			};			
			cb(newItem);
		}
	});
	
}

var exports = module.exports = AccountsRest;