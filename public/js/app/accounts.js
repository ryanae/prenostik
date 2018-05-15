
var toast = require('../lib/toast');
var PrenostikUser = require('./PrenostikUser');
var accountsCommon = require('./accountsCommon');

var ctxSocket = {};
var Accounts = function(socket) {
	this.ctx = '.accounts-controller';
	this.socket = socket;

	ctxSocket = socket;
	this.init();
}

Accounts.prototype.init = function() {
};

module.exports = Accounts;
 
$(document).ready(function() 
{
	// Get the authorized user to see what they can do
	var commonLib = new accountsCommon;
	var authUser = commonLib.getAuthUser();
	
	// Main index page links
	$('#add_user').attr('href', '/users/add_user');
	$('#delete_user').attr('href', '/users/delete_user');	
	$('#edit_user').attr('href', '/users/edit_user');	
	$('#edit_role').attr('href', '/users/edit_role');	
	$('#edit_all_roles').attr('href', '/users/edit_all_roles');
	
	if(authUser.canDo('AP_EDIT'))
	{
		// See if an account has been chosen before during this session
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
        
		var $filter = $("<input/>",{type:"hidden",id:"filter", name:"filter"}).appendTo("#info");	
		$filter.val(id);	
		if(authUser.getAccountID() != id)
		{
			// Prenostik site manager can edit existing accounts, not add or delete.
			$('#delete_user').css("visibility", "hidden");
			$('#add_user').css("visibility", "hidden");
		}
		else
		{
			// Otherwise, enable add and delete functions when Prenostik edits Prenostik.
			$('#delete_user').css("visibility", "");
			$('#add_user').css("visibility", "");			
		}
		
		// If not, hide all menu buttons until an account is chosen.		
		if(id==null)
		{
			$('#buttonbank').css("visibility", "hidden");			
			var actname = "All Accounts";		
		}
			//$("#buttonbank").children().prop('disabled',true);
		else
		{	// Otherwise, show the button bank and current account name
			$('#buttonbank').css("visibility", "");
			var actname = window.sessionStorage.getItem("AllUsersAccountCoName");
		}
	}
	else	
	{
		// User is not permitted to edit.  Simplify by removing the filter
		window.sessionStorage.removeItem("AllUsersAccountFilter");
		var actname = authUser.account.name;
		$('#buttonbank').css("visibility", "");
	}
	
	if(authUser.canDo('CG_ASSIGN') )
		$('#edit_all_roles').css("visibility",""); 
	if(authUser.canDo('CU_CREATE'))
		$('#add_user').css("visibility","");
	if(authUser.canDo('CU_DELETE'))
		$('#delete_user').css("visibility","");
	if(authUser.canDo('CU_EDIT'))
		$('#edit_user').css("visibility","");
	if(authUser.canDo('AP_EDIT'))
	{	// Set up account selection
		
		$('#btn_select_account').css("visibility", "");
		$('#selAccountAllUsers').css("visibility", "");
		//$('#actgreeting').css("visibility", "");		
	}
	else{		
		$('#btn_select_account').css("visibility", "hidden");
		$("#poption").empty();
		// Set the account filter to the current user
		//window.sessionStorage.setItem("AllUsersAccountFilter", authUser.getAccountID());
		//actname =  authUser.account.name;
		}
		
	if(authUser.getAccountID() != id)
	{
		// Prenostik site manager can edit existing accounts, not add or delete.
		$('#delete_user').css("visibility", "hidden");
		$('#add_user').css("visibility", "hidden");
	}
	else
	{
		// Otherwise, enable add and delete functions when Prenostik edits Prenostik.
		$('#delete_user').css("visibility", "");
		$('#add_user').css("visibility", "");			
	}	
	
	$('#coidentifier').html(actname);		
	$("#edit_roles_submit").prop("disabled", true);
	$("#edit_submit").prop("disabled", true);	
	$("#reset_password").prop("disabled", true);
	//$("#edit_role").prop("disabled", true);
	//$("#mcDeleteBtn").prop("disabled", true);

	// Store account data for later use by filtering
	// Need an array to hold the list of accounts
	var arrAccounts = [];
	var selAcc = $('#selEditUser').get(0);
	// Dump the list in to the array
	if(selAcc != null){
		for (var i = 0; i < selAcc.options.length; i++) 
		{
			var opt = selAcc.options[i];
			arrAccounts.push(opt);
		}
	}	
	// If a role was being edited, make it current
	var roleEditGroup = window.sessionStorage.getItem("CurrentRoleEdit");	
	if(roleEditGroup != null)
	{		
		var selRoles = $("#selRoles").get(0);
		if(selRoles != null)
		{
			var index = selRoles.options.namedItem(roleEditGroup).index
			selRoles.selectedIndex = index;		
			var selUsers = $("#selUsers").get(0);
			var selAvUsers = $("#selAvailableUsers").get(0);				
			roleChange(selRoles, selUsers, selAvUsers);	
		}		
	}	
	
	$('body').on('click', '#btn_select_account', function() {
		$("#dlg_selectAccount").modal({backdrop: 'static'});
	});
	
	$('body').on('click', '#btn_selActOK', function() {
	
		var selAccount = $("#selAccountAllUsers").get(0);		
		var accountData = getSelectedAccountData(selAccount);
		if(accountData != -1)
		{
			window.sessionStorage.setItem("AllUsersAccountFilter", accountData.id);
			window.sessionStorage.setItem("AllUsersAccountCoName", accountData.name);
			$('#buttonbank').css("visibility", "");
			$('#coidentifier').html(accountData.name);
			if(authUser.getAccountID() != accountData.id)
			{
				// Prenostik site manager can edit existing accounts, not add or delete.
				$('#delete_user').css("visibility", "hidden");
				$('#add_user').css("visibility", "hidden");
			}
			else
			{
				// Otherwise, enable add and delete functions when Prenostik edits Prenostik.
				$('#delete_user').css("visibility", "");
				$('#add_user').css("visibility", "");			
			}	
		}
	});

	$('body').on('click', '#add_user', function() {
		// Menu function
		// Get the id of the account to work with
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		
		if(authUser.canDo('AP_EDIT'))
		{	
			$('#add_user').attr('href', 'add_user/'+id);
		}
	});
	
	$('body').on('click', '#edit_user', function() {
		// Menu function
		// Get the id of the account to work with
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		
		if(authUser.canDo('AP_EDIT'))
		{	
			//$('#edit_user').attr('href', 'edit_user/?accountID='+id+'&maggie=78');
			$('#edit_user').attr('href', '/users/edit_user/'+id);
		}
	});
	
	$('body').on('click', '#yesDeleteUser', function(){
		// Remove the deleted item from the list.  Assumes the delete succeeded.
		// Forcing a page refresh could be problematic because of concurrency issues.
		// So this is the next best solution....
		document.getElementById("accounts_delete_user").submit();
		var sel = $('#selEditUser').get(0);
				
		/*
		window.sessionStorage.setItem("CurrentID", "-1");
		//var id = $('#selEditUser').children(":selected").attr("id");			
		//var index = sel.options.namedItem(id).index;		
		//sel.options.remove(index);			
		var x = document.getElementById("selEditUser");
		x.remove(x.selectedIndex);		
		//sel.selectedIndex = 0;		
		var opt = sel.options.namedItem("-1");		
		
		if(opt != null)
		{			
			opt.selected = true;		
			$( "#selEditUser" ).trigger( "change" );
		}
		*/
	});
	
	$('body').on('click', '#delete_user', function() {
		// Menu function
		// Get the id of the account to work with
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		
		if(authUser.canDo('AP_EDIT'))
		{	
			$('#delete_user').attr('href', 'delete_user/'+id);
		}
	});

	$('body').on('click', '#edit_all_roles', function() {
		// Menu function
		// Get the id of the account to work with
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		if(authUser.canDo('AP_EDIT'))
		{	
			$('#edit_all_roles').attr('href', '/users/edit_all_roles/'+id);
		}
	});
	
	$('body').on('change', '#status', function() {				
		var selected = this.options.item(this.selectedIndex);
		$('#lblStatus').text(selected.text);
		if(this.selectedIndex == 0)
			setLockIconLocked(false);
		else
			setLockIconLocked(true);
	});

	// Handle filter changes in edit accounts
	$('body').on('change', '#selFilter', function(){	

		// Get the index of the currently selected filter
		var index = this.options.selectedIndex;
		// Use the index to get the option selected
		var selected = this.options.item(index);		
		// Get the filter from the option		
		var filter = selected.value;		
		// Store the currently selected account
		var current = $("#selAccountEdit option:selected").text();
		// Apply the filter.		
		filterAccounts(filter);		
		// If the filter causes the selected account to change, clear error indicators
		if(current != $("#selAccountEdit option:selected").text())
		{
			resetBorders();		
			clearFields();
		}
	});

	$('body').on('change', '#selEditUser', function() {	
		// This is the "select user" on the "edit a single user" page
		// This function is called when the user selected for editing has changed
		// Get the selected user data from the option in the select
		
		var selUser = $("#selEditUser").get(0);				
		var userData = getSelectedUserData(selUser); // Note this is the user object, not the web page hybrid
		
		var selEnabled = document.getElementById("status");		
		
 		if(userData != -1)
		{
			var pUser = new PrenostikUser(userData);
			// Display the currently selected user data
			//console.log("Username", userData);

			window.sessionStorage.setItem("CurrentID", userData.id);	
			document.getElementById("id").value = userData.id;			
			document.getElementById("firstname").value = userData.firstname;			
			document.getElementById("middlename").value = userData.middlename;			
			document.getElementById("lastname").value = userData.lastname;	
			document.getElementById("username").value = userData.username;			
			document.getElementById("email").value = userData.email;
			// This one isn't on the page if it's the delete user page
			if(document.getElementById("emailc") != null)
				document.getElementById("emailc").value = userData.email;
			
			// Set the account enabled status.
			// Translate the boolean to a nice UI text indicator
			if(selEnabled != null)
			{
				$('#lblStatus').text(pUser.getStatusString());
				// Now make sure a user isn't changing their own status to locked:
				if(userData.id == authUser.id)
				{
					// The auth user is obviously in active status, so just lock the change.
					$("#status").append('<option value=-1 id="immutable">Status cannot be changed</option>');					
					$('#status').prop('disabled', 'true');											
					selEnabled.selectedIndex = 0;
					setLockIconLocked(false);					
				}else{
					if(userData.status == 0)
					{	// Account is active
						$('#status').prop('disabled', '');
						$("#status option[value='-1']").remove();					
						selEnabled.selectedIndex = 0;
						setLockIconLocked(false);					
					}
					else if(userData.status == 2)
					{
						// Account is locked, but status can be changed
						$('#status').prop('disabled', '');
						$("#status option[value='-1']").remove();					
						selEnabled.selectedIndex = 1;
						setLockIconLocked(true);										
					}
					else
					{	// Any other value is some sort of disabled account.
						$("#status").append('<option value=-1 id="immutable">Status cannot be changed</option>');					
						$('#status').prop('disabled', 'true');											
						selEnabled.selectedIndex = 2;
						setLockIconLocked(true);
					}
				}
				// Update the user's list of roles
				$("#lstRoles").empty();
				var items = userData.groups;
				$.each(items, function (i, item) {
					$('#lstRoles').append($('<li>', { 
						value: item.id,
						text : item.name 
					}));
				});				
			}
			
			
			$("#edit_submit").prop("disabled", false);		
			$("#reset_password").prop("disabled", false);
			//$("#edit_role").prop("disabled", false);
			//$("#mcDeleteBtn").prop("disabled", false);

		}
		else
		{
			window.sessionStorage.setItem("CurrentID", "-1");			
			// Clear all data fields - no user selected.
			document.getElementById("id").value = -1
			document.getElementById("firstname").value = "";
			document.getElementById("middlename").value = "";
			document.getElementById("lastname").value = "";
			document.getElementById("username").value = "";
			document.getElementById("email").value = "";
			document.getElementById("emailc").value = "";
			
			// Set the account enabled status.			
			if(selEnabled !== null)
			{
				$('#lblStatus').text("Unknown");
				$("#status").append('<option value=-1 id="immutable">Status cannot be changed</option>');					
				$('#status').prop('disabled', 'true');											
				selEnabled.selectedIndex = 2;
				setLockIconLocked(true);
			}
			$("#lstRoles").empty();
			$('#lstRoles').append($('<li>', { 
					value: 0,
					text : "(Unknown)" 
				}));		

			$("#edit_submit").prop("disabled", true);
			$("#reset_password").prop("disabled", true);
			//$("#edit_role").prop("disabled", true);
			//$("#mcDeleteBtn").prop("disabled", true);
			
		}
	});	
	
	$('body').on('change', '#userSelect', function() {
		// Happens when the user name is changed in edit_role	
		var selUser = $("#userSelect").get(0);		
		userChange(selUser);
		synchronizeGroupList();		
	});	
	
	$('body').on('dblclick', '#selAssignedRoles', function() {
		// Handle a double click on the list of available roles in edit role		
		var selAs = $("#selAssignedRoles").get(0);
		var selAv = $("#selAvailableRoles").get(0);	
		if(CanRemoveRole(selAs))
		{
			swapListItem( selAs, selAv);
			synchronizeGroupList();
		}
	});
	
	$('body').on('change', '#selRoles', function() {
		// Happens when the group/role being viewed is changed in edit all roles		
		var selRoles = $("#selRoles").get(0);
		var selUsers = $("#selUsers").get(0);
		var selAvUsers = $("#selAvailableUsers").get(0);		
		// TODO: If edits have been made, confirm the change so edits are not lost.			
		roleChange(selRoles, selUsers, selAvUsers);		
	});
		
	$('body').on('click', '#selAvailableUsers', function() {
		// Handle a click on the list of available users in edit all roles
		// Pass the clicked select to the role edit page
		displayUserInfo(this);					
	});	

	$('body').on('dblclick', '#selAvailableRoles', function() {
		// Handle a double click on the list of assigned roles in edit role		
		var selAs = $("#selAssignedRoles").get(0);
		var selAv = $("#selAvailableRoles").get(0);
		if(CanRemoveRole(selAv))
		{
			swapListItem( selAv, selAs);		
			synchronizeGroupList();		
		}
	});
	
	$('body').on('dblclick', '#selAvailableUsers', function() {
		// Handle a double click on the list of available users in edit all roles		
		var selAvUsers = $("#selAvailableUsers").get(0);
		var selAsUsers = $("#selUsers").get(0);
		var selRoles = $("#selRoles").get(0);
		// TODO: if(isAssignmentAllowed()) // Business rules
		swapListItem( selAvUsers, selAsUsers);		
	});
	
	$('body').on('click', '#btnOKSiteMgr', function() {
		// User has selected a site manager from the "no site manager"
		// error dialog.  Synch the available users list in the main
		// page with the dialog, then do the swap.
		var selAvUsers = $("#selAvailableUsers").get(0);
		var index = $("#selUserList").get(0).selectedIndex;
		selAvUsers.selectedIndex = index;
		var selAsUsers = $("#selUsers").get(0);		
		// TODO: if(isAssignmentAllowed()) // Business rules
		swapListItem( selAvUsers, selAsUsers);	
		// Make sure save is enabled.
		$("#edit_roles_submit").prop("disabled","");

	});

	$('body').on('click', '#btnCancelSiteMgr', function() {
		// If the user cancels site manager assignment from the
		// no site manager error box, just reassign the previously
		// selected on.
		var selAvUsers = $("#selAvailableUsers").get(0);
		var selAsUsers = $("#selUsers").get(0);
		var selRoles = $("#selRoles").get(0);
		// TODO: if(isAssignmentAllowed()) // Business rules
		swapListItem( selAvUsers, selAsUsers);
		// Make sure save is enabled.
		$("#edit_roles_submit").prop("disabled","");
		
	});
	
	$('body').on('click', '#selUsers', function() {
		// Handle a click on the list of available users in edit all roles
		// Pass the clicked select to the role edit page
		displayUserInfo(this);					
	});	

	$('body').on('dblclick', '#selUsers', function() {
		// Handle a double click on the list of assigned users in edit all roles		
		var selAvUsers = $("#selAvailableUsers").get(0);
		var selAsUsers = $("#selUsers").get(0);
		var selRoles = $("#selRoles").get(0);
		// Make the change in role membership, but check for trouble after
		swapListItem( selAsUsers, selAvUsers);
		var index = selRoles.selectedIndex;
		// IF the list is empty, AND there's a role selected, check for site manager
		if((selAsUsers.length == 0) && (index != "-1") )
		{
			if(selRoles.options[index].id == "1")// Is "site manager" currently role selected?
			{	
				// Empty site manager not allowed. Disable save and warn the user.			
				$("#edit_roles_submit").prop("disabled", true);
				$('#errText').text("Site Manager is a required role for all sites.  You will not be able to save your changes to this role until you assign a Site Manager.  Please select a user from the list below, or cancel your changes.");
				$("#theList").empty();	
				$('#selAvailableUsers').clone(false)
				.attr('id', 'selUserList')	
				.attr('size', '7')				
				.appendTo("#theList");				
				
				$("#errRole").modal({backdrop: 'static'});
			}
			else
			{
				// Make sure save is enabled.
				$("#edit_roles_submit").prop("disabled","");
			}
		}
		
	});
	
	$('body').on('click', '#reset_password', function() {		
		// Get the account data for the selected user
		var selUsers = $('#selEditUser').get(0);
		var user = getSelectedUserData(selUsers);
		// Make sure we got one.
		if(user != -1)
		{		 
			// Pass the selected user to the password reset gatekeeper
			var id = user.id;			
			if(id != 0) // Don't do anything if no user is selected.
			{
				// Collect user data for the user to be reset
				var fullname = document.getElementById("firstname").value +  " " +
						 document.getElementById("middlename").value + " " +
						 document.getElementById("lastname").value; 
				var username = $('#username').val();				
				var email = document.getElementById("email").value;				
				var status = 'Active';
				if(user.status != 0)
					status = 'Disabled';
				
				// Set up the confirmation dialog
				$('#fullname').text( "Name: " + fullname);
				$('#rusername').text("Username: " + username);
				$('#remail').text(   "Email: " + email);
				$('#rstatus').text(  "Account status: " + status);
				
				// Prompt to confirm or cancel the reset
				$("#confirmReset").modal({backdrop: 'static'});				
			}
		}
	});
	
	$('body').on('click', '#resOK', function() {
		// Build the url for the router
		var href = '/users/pw_reset_admin'
		// Put the url for the REST call together with the data	
		var body={'url':href, 'username': $('#username').val()}	
		
		// Use AJAX to post the account reset.
		$.ajax({
				url: href,
				data: body,
				async: true, 
				method: 'POST',			
				dataType: 'json',
				success: function (response) {
					if (response.success) 
					{
						toast.notifySuccess('Success', 'User password has been reset');						
					} 
					else 
					{
						toast.notifyError('Error', 'Error: '+response.error.code+' - '+response.error.message);
					}
				},
			error: function(response){
			toast.notifyError('Error', 'User password NOT reset');	
				//TODO: handle error condition gracefully
			}
		});		
	});	

	$('body').on('click', '#divnav', function() {
		// Get the id of the account to work with
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		//$('<input/>',{type:'hidden', id:'filter', name:'filter', value:id}).appendTo('#info');
		if(authUser.canDo('AP_EDIT'))
		{				
			window.location.href = '/users/edit_user/'+id;
		}
		else
			window.location.href = '/users/edit_user';	
	});
	
	$('body').on('click', '#edit_role', function() {
		// Handle a click on the "Edit Role" button in Edit User
		// Pass the selected user to the role edit page		
		var userid = document.getElementById("id").value;
		
		window.sessionStorage.setItem("CurrentID",userid);
		var id = window.sessionStorage.getItem("AllUsersAccountFilter");
		//$('<input/>',{type:'hidden', id:'filter', name:'filter', value:id}).appendTo('#info');
		if(authUser.canDo('AP_EDIT'))
		{	
			$('#edit_role').attr('href', '/users/edit_role/'+id);
		}		
	});
		
	$('body').on('click', '#edit_role_submit', function() {
		// Stub for validation on single role edit
		document.getElementById("edit_single_role_form").submit();
	});
	
	$('body').on('click', '#edit_submit', function() {
		// Handle a click on the "Save Changes" button in Edit User	
		// Make sure there are no required fields that are space filled
		trimAllFields();	
		var profile = {fname:$('#firstname').get(0),
					   lname:$('#lastname').get(0),
					   username:$('#username').get(0),
					   email:$('#email').get(0),
					   emailc:$('#emailc').get(0)
					   }		
		var audit = commonLib.isValidEdit(profile);		
		if(audit.valid == true){
			// Save data and submit page
			var edituser = commitEdit();
			if(edituser !=null)
			{
				// Update the hidden data field in the web page
				var $editedUser = 
				$('<input/>',{type:'hidden',id:'edited_user', name:'edited_user'})
				.appendTo('#info');	
				$editedUser.val(JSON.stringify(edituser));	
				
				document.getElementById("edit_user_form").submit();				
			}
			else
				// big trouble.  never happen
				alert("An unspecified error has occurred.");
		}
		else
		{
			// Oops.  Validation failed.  Inform the user of the problem.			
			displayErrors(audit); 			
		}
	});

	$('body').on('click', '#new_profile_submit', function() {
		// Handle a click on "add profile" in user account management
		trimAllFields();
		var profile = {fname:$('#firstname').get(0),
					   lname:$('#lastname').get(0),
					   username:$('#username').get(0),
					   email:$('#email').get(0),
					   emailc:$('#emailc').get(0)
					   }		

		var audit = commonLib.isValidEdit(profile);
		
		if(audit.valid == true)
		{
			var newuser = commitNewProfile();			
			// Update the hidden data field in the web page
			var $editedUser = 
			$('<input/>',{type:'hidden',id:'edited_user', name:'edited_user'})
			.appendTo('#info');	
			$editedUser.val(JSON.stringify(newuser));			
			// Submit page
			document.getElementById("add_user_form").submit();			
		}
		else
		{			
			// Oops.  Validation failed.  Inform the user of the problem.			
			displayErrors(audit); 			
		}		
	});
	
	$('body').on('click', '#edit_roles_submit', function() {
		// Handle a click on the "Save Changes" button in Edit All Roles
				
		// Save data and submit page
		commitRoleEdit();		
		document.getElementById("edit_roles_form").submit();			
 
	});
	
	// Preload functions	
	$('#userSelect').load(loadRoleEdit).load(); 
	$('#selEditUser').load(preloadUserEdit).load();
	$('#selRoles').load(loadRoleListAll).load();
	$('#selAvailableRoles').load(loadRoleListUser).load();

function clearFields()
{
	$(":text").val("");
	
	// TODO: Database fields here
}

function CanRemoveRole(selRoles)
{
	// Returns true if the role can be removed from the user's assigned roles.
	// Prevents the site manager role from being removed if no other user has
	// the role.
	// Returns true if it's okay.
	// Deref for clarity	
	var index = selRoles.selectedIndex;
	var opt = selRoles.options[index];
	if(opt != null)
	{
		// If the group selected is not a site manager, it's automatically okay.
		if(opt.id == '1')
		{
			// Site manager role cannot be edited from the single role edit screen.
			$('#errText').text("Site Manager assignment cannot be changed from this screen.  Please use the \"Manage User Roles\" menu option.");
			$("#errRole").modal();
			return false;
		}
	}
	
	return true;

}

function filterAccounts(filter)
{
	// This function uses the global accounts array arrAccounts
	// Get the accounts select
	var accSel = $('#selEditUser').get(0);
	// Empty it
	$("#selEditUser").empty();
	// Rebuild the accounts list from the global array
	// filtering as it loops through the list
	for (var i = 0; i < arrAccounts.length; i++)
	{
		// Get an option
		var opt = arrAccounts[i];
		// Filter it and (maybe) add it back to the list
		if(filter == 'all')
			accSel.options.add( arrAccounts[i]);
		else
		{
			if(!isFiltered(opt, filter))
				accSel.options.add( arrAccounts[i]);
		}
	}
	// When the "all accounts" is chosen, add back the "create account" selection
	if(filter == 'all')
	{
		arrAccounts[0].selected = true;
		accSel.options.add(arrAccounts[0],0);
	}
	if(accSel.options.length == 0)
	{
		arrAccounts[0].selected = true;
		var option = document.createElement("option");
		option.text = "(No matches)";
		option.value = "-1";
		accSel.options.add(option,0);		
	}
	// Force the refresh of the page through the select	
	$('#selEditUser').change();	
}	

// Returns true if the option passed in is allowed
function isFiltered(opt, filter)
{	
	
	// Establish the list of status types available
	var statusTypes = authUser.getStatusDescriptions();
	
	var filterID = 0;
	// Get the ID of the status type as a filter
	for(var i=0; i<statusTypes.length; i++)
	{
		if(filter == statusTypes[i]){
			filterID = i;
			break;
		}
	}

	// If the filter is not found on the list, default to no filter.
	if(i==statusTypes.length)
		filterID = 0;
		
	// Get the data from the option
	if(opt != null)
		var data = opt.value;
	
	if(data != null)
	{
		// Reconstitute the account object
		var accountData = JSON.parse(data);	
		//console.log("Status: ", accountData.status);
		if(accountData.status == filterID)
			return false;
	}
	// If the loop drops out, the filter never matched
	// an actual status.  No accounts with the status exist.	
	
	return true;		
}

function loadRoleListAll()
{
	// Find out what account is being edited
	var act = window.sessionStorage.getItem("AllUsersAccountFilter");
	// Remove Prenostik Admin when editing a non-prenostik account
	if(act != null) // Will be null when user is non prenostik
	{
		if (authUser.getAccountID() != act) // When prenostik admin edits other accounts
		{
			if(selRoles.options.namedItem("2") != null) // never happen.
			{
				var index = selRoles.options.namedItem("2").index		
				selRoles.options.remove(index);	
			}
			
		}
	}
}

function loadRoleListUser()
{
	// Find out what account is being edited
	var act = window.sessionStorage.getItem("AllUsersAccountFilter");
	// Remove Prenostik Admin when editing a non-prenostik account		
	if (authUser.getAccountID() != act)
	{
		var index = selAvailableRoles.options.namedItem("2").index		
		selAvailableRoles.options.remove(index);	
		
	}
}


function setLockIconLocked(status)
{
	// Sets the lock icon to display open or closed 
	if(status == true)
	{
		$("#statusPic").removeClass("icon-unlock");
		$("#statusPic").addClass("icon-lock");			
	}
	else
	{			
		$("#statusPic").removeClass("icon-lock");
		$("#statusPic").addClass("icon-unlock");			
	}
}	

function displayUserInfo(selCurrent)
{
	// This function takes the select passed in
	// and displays the user info for it.
	var user = getSelectedUserData(selCurrent);
	var puser = new PrenostikUser(user);
	
	// If a user was selected, update the user object with the edits
	if(user != -1)
	{
		$('#name').text(user.firstname + ' ' + user.middlename + ' ' + user.lastname);		
		$('#username').text(user.username);
		$('#email').text(user.email);
		$('#emailc').text(user.email);
		$('#company').text(user.account.name);
		
		var status = 'Account status: ' + puser.getStatusString();
		if(user.status == 0)
		{
			setLockIconLocked(false);			
		}
		else
		{			
			setLockIconLocked(true);			
		}
		
		$('#status').text(status);
		window.sessionStorage.setItem("CurrentID",user.id);
	}
}

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

function trimAllFields()
{
	// Condition the user data fields for robustness	
	var t = $(":text");
	for(var i=0; i<t.length; i++)	
		t[i].value = t[i].value.trim();	
}

// Update the selected user object and save the data for the post
// Assumes the edit has been validated.
function commitEdit()
{	
	// NOTE: fields are assigned explicitly rather than with a 
	// regex jquery like $(':text')
	// to avoid maintenance problems.  Enforces tighter control for
	// future field additions and special validations.
	
	var selUsers = $("#selEditUser").get(0);
	var user = getSelectedUserData(selUsers);
	// If a user was selected, update the user object with the edits
	if(user != -1)
	{
		user.firstname = $("#firstname").val();
		user.middlename = $('#middlename').val();
		user.lastname =  $('#lastname').val();
		user.username = $('#username').val();
		user.email = $('#email').val();		
		user.active = $('#status').val();
	}
	else
		return null;
		
	return user;
}

// Function assembles all data for the new record
// Uses the global PrenostikUser "authUser" established
// at the top of the file.
function commitNewProfile()
{	
	var user = 
	{	
		account: authUser.account,
		firstname: $("#firstname").val(),
		middlename: $('#middlename').val(),
		lastname: $('#lastname').val(),
		username: $('#username').val(),
		email: $('#email').val(),		
		active: 0,
		password: "prenostik",
		groups: [{"id":"5"}]  // Add the user to the Executive group by default
	};	
	return user;
}

// Commits the currently visible group assignment on the web page
// assumes data has been validated.  None required for now.
function commitRoleEdit()
{
	// Get the "assignedUsers" hidden text box and keep it up to date
	var pass = $("#assignedUsers").get(0);
	var passID = $("#id").get(0);
	// Get the list of all groups
	var groups = $("#selRoles").get(0);
	// Get the currently selected group from the list
	var group = getSelectedGroupData(groups);
	
	// Get the list of users that have been assigned to the current group
	var selAsU = $("#selUsers").get(0);
		
	// Don't do anything if no group is selected
	if(group != -1)
	{
		// Read the list of users assigned to the current group
		var users = [];		// selAsU == "select assigned users" dumb name needs an explanation.
		for (var i = 0; i < selAsU.options.length; i++)
		{
			// Get a user
			var strUser = selAsU.options.item(i).value;
			// Convert the user string data to a user object
			var objUser = JSON.parse(strUser);
		
			// Build a list of user IDs as simple ID objects for the server
			userID = {"id" : objUser.id}
			users.push(userID);			
		}		
		// Now build a group object for the server
		var newGroup = {"id": group.id, 
						"users": users
						};
		
		// Pass new group list to the web page
		pass.value = JSON.stringify(newGroup);
		passID.value = JSON.stringify(group.id);
	}	
	else
	pass.value = "";
}

function getSelectedAccountData(selList)
{	
	// Broken into steps for clarity
	// Get the index of the currently selected user
	var index = selList.options.selectedIndex;
	// Use the index to get the user option object	
	var selected = selList.options.item(index);		
	// Get the data from the option
	if(selected !=null)
		var data = selected.value;
	else
		data = -1;
	if(data != -1)
	{
		// Reconstitute the account object
		var accountData = JSON.parse(data);		
		return accountData;
	}
	else
		return -1; // No selected user	
}

function loadRoleEdit()
{
	// Load the current user when the "edit role" button is clicked in edit user	
	var id = window.sessionStorage.getItem("CurrentID");	

	// Set the select to the current user id.
	var selUser = $("#userSelect").get(0);	
	var opt = selUser.options.namedItem(id);	
	if(opt != null)
	{
		opt.selected = true;
		userChange(selUser);
	}
}

function preloadUserEdit()
{
	// Load the current user when the user info is clicked in edit all roles
	var id = window.sessionStorage.getItem("CurrentID");	

	// Set the select to the current user id.
	var selUser = $("#selEditUser").get(0);	
	var opt = selUser.options.namedItem(id);	
	if(opt != null)
	{
		opt.selected = true;
		$( "#selEditUser" ).trigger( "change" );
	}
}
// This function keeps the hidden text box on the page up to date
// with the current user's assigned groups.
function synchronizeGroupList()
{
	// Get the user that is being edited
	var userData = getSelectedUserData($("#userSelect").get(0));

	// Get the "pass" hidden text box and keep it up to date
	var selAsR = $("#selAssignedRoles").get(0);
	var pass = $("#assignedGroups").get(0);
	
	// If a user is not selected, don't bother.
	if(userData != -1)
	{
		// Read the IDs of the groups to which the user is assigned
		var groups = [];	
		for (var i = 0; i < selAsR.options.length; i++)
		{
		// for each group id on the list, get the group data off the from list
		// stringify and build it 
		// assign it all to the pass field.
		
			// Build the list of groups to which this user is now assigned
			if(selAsR.options.item(i) != null)
			{	
				var group = selAsR.options.item(i).value;
				groups.push(JSON.parse(group));				
			}
		}
		// Set the list to the user object
		userData.groups = groups;
		// Stringify the user object list and pass it to the web page
		pass.value = JSON.stringify(userData);
		//console.log("pass data: " + pass.value);
	}
	else
		pass.value = "";
}

// Returns the user object from the select passed in
// assumes the select is a "standard" (for this program) user select
function getSelectedUserData(selList)
{	
	// If there are no users on the list passed in, there can be none selected.
	if(selList.options == null)
		return -1;
	// Broken in to steps for clarity
	// Get the index of the currently selected user
	var index = selList.options.selectedIndex;
	// Use the index to get the user option object
	var selected = selList.options.item(index);		
	// Get the data from the option
	var data = selected.value;
	
	if(data != -1)
	{
		// Reconstitute the user object
		var userData = JSON.parse(data);
		return userData;
	}
	else
		return -1; // No selected user	
}

// Returns the group object from the select passed in.
function getSelectedGroupData(selList)
{	
	// Broken in to steps for clarity
	// Get the index of the currently selected user
	var index = selList.options.selectedIndex;
	// Use the index to get the user option object
	var selected = selList.options.item(index);		
	// Get the data from the option
	var data = selected.value;
	if(data != -1)
	{
		// Reconstitute the user object
		var group = JSON.parse(data);
		return group;
	}
	else
		return -1; // No selected group	
}

// This function resets the list boxes to the way they were when the page loaded.
function resetLists(selTo, selFrom)
{	
// Move all items from the to list back to the from list
	for (var i in selTo.options)
	{
		var opt = selTo.options[0];				
		if(opt != null)
			selFrom.add(opt);
	}
	// Sort the list that received the new names.
	var commonLib = new accountsCommon;
	
	commonLib.sortSelect(selFrom);
}

// This function extracts the list of member groups from the user's data
function extractGroupList(user)
{		
	var memberGroups =[];
	var groupList = user.groups;
	for(i in groupList)
	{
		memberGroups.push(groupList[i].id);
	}
	return memberGroups;
}

// This function synchronizes the list boxes passed in with the list of IDs passed in.
function synchronizeLists(idList, selTo, selFrom)
{	
	// For example, if a list of 3 user IDs are passed in, each user will be 
	// moved from the FROM list to the TO list.
	
	// Loop through the list of IDs passed in
	for (var i = 0; i < idList.length; i++)
	{		
		// Use an ID from the list to find the option on the FROM list
		var opt = selFrom.options.namedItem(idList[i]);
		if(opt != null)
		{
			// Remove the item from the FROM list
			selFrom.remove(opt.index);				
			// Add the item to the TO list
			selTo.add(opt);
		}
		else
			// The user data contains an ID not provided by the server with the group list.
			// This warning should not be commented out.
			console.log("Warning: Unrecognized ID = " + idList[i]);
		
	}
	// Sort the list that acquired a new item
	var commonLib = new accountsCommon;
	commonLib.sortSelect(selTo);	
}

// This function moves an item from the "from" selection box to the "to" selection box
function swapListItem(selFrom, selTo)
{	 	
	// Deref for clarity	
	var index = selFrom.selectedIndex;
	var opt = selFrom.options[index];
	
	selTo.add(opt);
	
	// Sort the list that acquired a new item
	var commonLib = new accountsCommon;
	commonLib.sortSelect(selTo);			
}

// Support for change of user in Edit Role page
function userChange(selUser)
{	
	// Get the selected user data from the option in the select		
	var userData = getSelectedUserData(selUser);	
	// Update the currently selected user data
	// This is the hidden value storing the ID
	document.getElementById("id").value = userData.id;				
	window.sessionStorage.setItem("CurrentID",userData.id);
		
	// Get pointers to the list boxes of roles. (Better known as groups)	
	var assigned = $("#selAssignedRoles").get(0);
	var available = $("#selAvailableRoles").get(0);
	// Clear the previously displayed user's assignments to prepare for the next one	
	resetLists(assigned, available);
	
	// If a user was selected
	if(userData != -1)
	{	
		// Display the currently selected user data
		displayUserInfo(selUser);
		
		// Extract the list of member groups to which the user belongs		
		var memberGroups = extractGroupList(userData);	

		// Now loop through the list of assigned groups and make the 
		// lists on the web page match.		
		synchronizeLists(memberGroups, assigned, available);
	}
}

// Support for change of role in edit_all_roles page
function roleChange(selRoles, selUsers, selAvailableUsers)
{	
	// Get the selected group from the list
	var group = getSelectedGroupData(selRoles);

	// Reset the membership lists
	resetLists(selUsers, selAvailableUsers);
	
	// If a group has been selected
	if(group != -1)
	{
		var index = selRoles.options.selectedIndex;
		var selected = selRoles.options.item(index);
		window.sessionStorage.setItem("CurrentRoleEdit", selected.id);
		// Extract the list of members that belong to the selected group
		var groupMembers = extractMemberList(group, selAvailableUsers);
		// And move the members from the Available list to the Assigned list
		synchronizeLists(groupMembers, selUsers, selAvailableUsers);
		$('#edit_roles_submit').prop('disabled', false);
	}
	else
	{
		window.sessionStorage.setItem("CurrentRoleEdit", "-1");
		$('#edit_roles_submit').prop('disabled', true);
	}
}

// This function takes the group ID passed in and returns a list
// of all users that are part of that group.
function extractMemberList(group, selAll)
{		
	var memberIDList = [];
	// Loop through the list of all users and check the list of roles each has.
	for (var i = 0; i < selAll.options.length; i++)
	{
		// Get a single user's data from the user list
		var opt = selAll.options.item(i);
		var data = opt.value;
		var user = JSON.parse(data);
		// Is the user a member of the current group?
		if(isMember(group, user))
		{
			memberIDList.push(user.id);
		}
	}
	return memberIDList;
}

// Returns true if the user data passed in represents a user that is a member of the 
// group ID passed in.
function isMember(group, userData)
{	
	// Extract the user's group membership list
	var membershipList = userData.groups;

	// Parse the user's membership list for the group concerned
	for(var i=0; i<membershipList.length; i++)
	{
		if(group.id == membershipList[i].id)
			return true; // Found it.
	}
	return false; // Not a member.
}
/*
function getMembershipCount(group)
{ // This function returns the count of members in the group passed in
	
}
*/

}) // end of document ready function

