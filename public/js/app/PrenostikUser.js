// PrenostikUser.js
// This user object is to prevent a single unified user
// object throughout the program.  

// Initial coding 1/28/2014 by Ken Townsley
// Revision to remove legacy code 3/8/2014
// Revision to add group membership support

// This object encapsulates the user data returned by 
// the server.  It offers simple member access to user 
// permissions and data fields.
/*
 Here's an example of how to use the "canDo" method:
 
 if (PrenostikUser.canDo("CG_EDIT") ){
 		allow editing
 }
 else
 		don't allow editing
		
*/

module.exports = PrenostikUser;

function PrenostikUser(data) 
{
	// Custom type id for construction from another PrenostikUser
	this.type = "PrenostikUser";

    // Convert the user string data to a user object
	if( (typeof data == 'string') && (data != null) )
	{
		console.log("Using PrenostikUser string constructor");		
		this.userData = JSON.parse(data);		
	}	

	if(data.type == "PrenostikUser")
	{
		// console.log("Constructing from a PrenostikUser type");
		// Convert the PrenostikUser to a plain data structure
		data = data.userData;
	}
	
	// Just a plain data object.  Assign it.	
	this.userData = data;
	// Break out top used fields for easy access
	this.status = this.userData.status;
	this.id = this.userData.id;
	this.email = this.userData.email;
	this.username = this.userData.username;
	this.firstname = this.userData.firstname;
	this.middlename = this.userData.middlename;
	this.lastname = this.userData.lastname;
	this.permissions = this.userData.permissions;
	this.groups = this.userData.groups;
	this.account = this.userData.account;
	this.company = this.userData.account.name;
}	

PrenostikUser.prototype.canDo = function(action)
{
  // Returns true if the user has the authority
  // to perform the requested action
  
  // If no action is provided, don't approve it.
  if(action == null)
	return false;
	
  // A disabled user account can't do anything.
  if(this.userData.isLocked == true)
	return false;
  
	// Returns true if the user has the authority to perform the specified action
	var permissions = this.permissions;	
	
	// Search the user's permissions list for the requested action
	for (var i in permissions) 
	{
		var p = permissions[i];
		if(p != null)
			{				
				if(p.name.localeCompare(action)==0)
					return true; // Found it.
			}
	}	
	// The specified permission was not found on the list
	return false;
  
}

// This function manages permissions to view access controlled menus
PrenostikUser.prototype.canDoMenu = function(menuName)
{	
	var self = this;

	// This function is a pseudo REST call to allow for storage
	// of menu permissions on the server in the future.
	// Returns a list of objects that define the permissions 
	// required to view the access controlled menus.
	// So the first thing is to create permission structures in a list
	var getMenus = function(){	
		var menus = [];		
		var mnuEditCompany = 
		{	// At this time, companies do not manage their accounts, we do.
			// So these permissions always fail.
			id: 0,
			name: "MNU_MANAGE_COMPANY",
			description: "Edit Company Account",
			permissions:[{id: 0, name: "XX_CREATE", description: "none"},
						 {id: 1, name: "XX_DELETE", description: "none"},
						 {id: 2, name: "XX_EDIT", description: "none"},
						 {id: 3, name: "XX_PERMASSIGN", description: "none"}						 
						 ]
		}
		
		// Any of these permissions allow them to see the edit companies menu
		var mnuEditCompanies = // "Prenostik Account Admin" has these explicit permissions
		{
			id: 1,
			name: "MNU_ACCOUNT_ADMIN",
			description: "Edit All Company Accounts",// Permissions correct as of 5/15/2014
			permissions:[{id: 0, name: "AP_CREATE", description: "none"},
						 {id: 1, name: "AP_EDIT", description: "none"},
						 {id: 2, name: "AP_DELETE", description: "none"},						 
						 {id: 3, name: "AL_CREATE", description: "none"},
						 {id: 4, name: "AL_EDIT", description: "none"},
						 {id: 5, name: "AL_DELETE", description: "none"},
						 {id: 6, name: "AS_CREATE", description: "none"},
						 {id: 7, name: "AS_EDIT", description: "none"},
						 {id: 8, name: "AS_DELETE", description: "none"}						 
						 ]
		}
		
		// Any of these permissions allow user account editing
		var mnuEditUsers = 
		{
			id: 2,
			name: "MNU_SITE_ADMIN",
			description: "Edit User Accounts",// Permissions correct as of 5/15/2014
			permissions:[{id: 0, name: "CU_CREATE", description: "none"},
						 {id: 1, name: "CU_DELETE", description: "none"},
						 {id: 2, name: "CU_EDIT", description: "none"},						 
						 {id: 3, name: "CG_CREATE", description: "none"},
						 {id: 4, name: "CG_DELETE", description: "none"},
						 {id: 5, name: "CG_EDIT", description: "none"},
						 {id: 6, name: "CG_ASSIGN", description: "none"}
						 ]

		}
		menus.push(mnuEditCompany);
		menus.push(mnuEditCompanies);
		menus.push(mnuEditUsers);	
		return menus;
	}
	
	// Returns true if the user passed in has required permissions for the menu
	var testPermissions = function(user, menu){
		// Cycle through all the required permissions for the menu passed in
		for (var i in menu.permissions) 
		{
			var permission = menu.permissions[i];
			//console.log("Checking for permission name: ", permission);
			if(permission != null)
			{	// See if the user has this permission				
				if(user.canDo(permission.name))
				{	// If the user has even one required permission, they can see the menu.
					// otherwise, how could they do the permitted action?
					//console.log("User can do: ", permission.name);
					return true;
				}
			}
		}	
		// The user has none of the required permissions for this menu
		return false;
	}
	
	// Get the permissions list for access controlled menus
	var menus = getMenus();
	
	// Now check the list of menus for the requested item passed in.
	for (var i in menus) 
	{
		var mnu = menus[i]; // Get a menu object
		//console.log("here's a menu: ", mnu);
		if(mnu != null)
			{	// See if the name matches the requested menu			
				if(mnu.name.localeCompare(menuName)==0)
				{				
					// Found the specified menu.  Now check permissions
					return testPermissions(this, mnu);
				}
			}
	}	
	// The specified menu was not found on the list
	return false;
}

PrenostikUser.prototype.isLocked = function()
{
	// Returns true if the user's account is locked
	if(this.userData.status == 0)
		return false; // False, user account is not locked
	else
		return true;  // True, user account is locked.
}

PrenostikUser.prototype.getStatus = function()
{
	// Returns the code for why a user's account is locked
	return this.userData.status;
}

PrenostikUser.prototype.getStatusString = function(status)
{					 
	var description = this.getStatusDescriptions();
	if(status != null)
		return description[status];
	else
		return description[this.status];
}

PrenostikUser.prototype.getStatusDescriptions = function()
{
	// Convenience function to centralize these descriptions	
	var description=["Active",
					 "New User",
					 "Locked",
					 "Expired Password",
					 "Expired Account",
					 "Reset"];
	return description;
}

PrenostikUser.prototype.isMember = function(group)
{
	
	// Returns true if this user is a member
	// of the group passed in.		
	var membershipList = this.groups;

	// Parse the user's membership list for the group concerned
	for(var i=0; i<membershipList.length; i++)
	{
		if(group.id == membershipList[i].id)
			return true; // Found it.
	}
	return false; // Not a member.
}

PrenostikUser.prototype.getAccountID = function()
{
	// Returns the account this user is associated with	
	return this.account.id;
}