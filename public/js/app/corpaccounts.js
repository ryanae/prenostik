
var toast = require('../lib/toast');
var hbs = require('hbs');
var PrenostikUser = require('./PrenostikUser');
var accountsCommon = require('./accountsCommon');

var ctxSocket = {};
var Corporate = function(socket) {
	this.ctx = '.corporate-controller';
	this.socket = socket;

	ctxSocket = socket;
	this.init();
}

Corporate.prototype.init = function() {
};

module.exports = Corporate;

$(document).ready(function() 
{
	var commonLib = new accountsCommon;
	var currentUser = commonLib.getAuthUser();
	
	// Set the company name
	$('#coName').text("Prenostik");
	
	// Main index page links
	$('#add_account').attr('href', 'mnu_add_account');
	$('#deactivate_account').attr('href', 'mnu_deactivate_account');	
	$('#edit_account').attr('href', 'mnu_add_account');
	
	// Enforce permissions
	if(currentUser.canDo('CU_CREATE'))
		$('#add_account').css("visibility","");
	if(currentUser.canDo('CU_EDIT'))
		$('#edit_account').css("visibility","");
	if(currentUser.canDo('CU_DELETE') )
		$('#deactivate_account').css("visibility",""); 
	if(currentUser.canDo("AP_DELETE"))
		addCheckbox();
	if(currentUser.canDoMenu("MNU_MANAGE_COMPANIES") == true){						
		$("#selCompany").css("visibility","");}
	else{
		$("#selCompany").css("visibility","hidden");}

	// Register popup for account errors
	var popOptions = {'placement': 'left', 'html': true, 'trigger':'manual', 'animation':false};
	$('.blueWhitebluePop').popover(registerPopover('blueWhiteblue', popOptions));
	//$('#userList').append("<select id='selUserList' style='list-style-type:disc'></select>");	
	// Change the emperor's clothes on the account add page
	if(window.sessionStorage.getItem("AccountMode") == "edit")
	{	
		$('#edit_add_account_submit').text("Save Changes");		
		$('#action_title').text("Edit Account");
		// Show the account select, but start in add mode now.
		$('#selAccountEdit').css("visibility","");
		$('#selFilter').css("visibility", "");
		$('#edit_add_account_submit').css("visibility","hidden");
		$('#changeRole').css("visibility", "");
		// Uncomment the following line to enable add account from edit mode
		//window.sessionStorage.setItem("AccountMode", "add");		
		$("#liSiteAdmin").attr("title" , "Customer admin cannot be created for existing accounts");		
		enableTabs(false);
		enableNavButtons(false);	
		$('#accountNotes').addClass("disabled");		
	}
	else // Account mode "add"
	{	
		$('#edit_add_account_submit').text("Create Account");
		$('#action_title').html("Add New Account");
		$('#selAccountEdit').css("visibility","hidden");
		$('#selFilter').css("visibility", "hidden");
		$('#changeRole').css("visibility", "hidden");		
		$("#siteAdminTab").removeClass("disabled");	
		$('#accountNotes').removeClass("disabled");		
		$("#prevtab").addClass("disabled");		
	}
	// Customize the Account editing page
	// The selects on this page should adjust dynamically
	// with the width of the web page for graceful degradation
	// as the window is resized. Overide the width dynamically.
	$("#selState").css("width", "100%");
	$("#selCountry").css("width", "100%");
	$("#selAccountStatus").css("width", "100%");	
	
	// Set the height of the tabs to the height of the largest
	// tab, thus keeping them all the same size.
	var tabHeight = $('#tabAddress').css('height'); 	
	$('.tab-content').css('height',tabHeight);

	// Default to enabled account on creation.
	var selAccountStatus = $('#selAccountStatus').get(0);
	if(selAccountStatus != null)
		selAccountStatus.selectedIndex = 0;

	// Store account data for later use by filtering
	// Need an array to hold the list of accounts
	var arrAccounts = [];
	var selAcc = $('#selAccountEdit').get(0);
	// Dump the list in to the array
	if(selAcc != null){
		for (var i = 0; i < selAcc.options.length; i++) 
		{
			var opt = selAcc.options[i];
			arrAccounts.push(opt);
		}
	}
  
	$("#accountName").focusout(function(){
		// If the search popover was showing, hide it.
		$('#dynpop').popover('hide');
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

	// Handle clicks directly on tabs
	$(document).on( 'show.bs.tab', 'a[data-toggle="tab"]', function (t) {				
		
		var audit = validateTab(t.relatedTarget.id);
		if(audit.valid == false)		
			displayErrors(audit);		
		return audit.valid;
	})	
	
	$(document).on( 'shown.bs.tab', 'a[data-toggle="tab"]', function (t) {
		var tab = t.target;	
		
		var mode = window.sessionStorage.getItem("AccountMode");	
		if(mode == "add")
		{	// In add mode, hide the save button until the last tab.				
			if(tab!=null)
			{ 	// If this is the last tab, show the submit button.
				if(tab.id == 'dbTab')				
					$("#edit_add_account_submit").css("visibility","");				
				else // Otherwise, hide it.
					$("#edit_add_account_submit").css("visibility","hidden");
			}
		}
		
		if(tab!=null)
		{ 	// If this is the last tab, synchronize nav button states.
			if(tab.id == 'dbTab')
			{trimAllFields();
				$("#nexttab").addClass("disabled");		
				$("#prevtab").removeClass("disabled");				
			}
			else if(tab.id == 'anTab')
			{					
				$("#prevtab").addClass("disabled");	
				$("#nexttab").removeClass("disabled");				
			}
			else
			{
				$("#prevtab").removeClass("disabled");		
				$("#nexttab").removeClass("disabled");				
			}
		}
	})	

	// Handle the clicks for the "next" and "previous" buttons on the page
	var $tabs = $('.tabbable li');	
	$('#prevtab').on('click', function() {
		var mode = window.sessionStorage.getItem("AccountMode");	
		if(mode == "add")
		{	// When moving backward, always hide the submit button because
			// the dialog is no longer on the last tab in the sequence.
			$("#edit_add_account_submit").css("visibility","hidden");			
		}
		
		var audit = validateTab($tabs.filter('.active').find('a[data-toggle="tab"]').get(0).id);
		if(audit.valid == true)
		{
			// Get the next tab that should be shown.
			var tab = $tabs.filter('.active').prev('li').find('a[data-toggle="tab"]');		
			/*
			// Skip the "CustomerAdmin" tab if in edit mode
			if((tab[0].id == "siteAdminTab") && (mode == "edit") )
			{			
				var skip = $tabs.filter('.active').prev('li')			
				.prev('li').find('a[data-toggle="tab"]');
				skip.tab('show');
			}
			else */
			{
				tab.tab('show');
			}
		}
		else
			displayErrors(audit);
	});
	
	$('#nexttab').on('click', function() {
		// "Next" button was clicked.  See if there is a tab to move to.
		var tab = $tabs.filter('.active').next('li').find('a[data-toggle="tab"]').get(0);
		var mode = window.sessionStorage.getItem("AccountMode");
		
		if(mode == "add")
		{
			if(tab!=null)
			{ 	// If this is the last tab, show the submit button.
				if(tab.id == 'dbTab')
					$("#edit_add_account_submit").css("visibility","");					
				else
					$("#edit_add_account_submit").css("visibility","hidden");
			}				
		}

		var audit = validateTab($tabs.filter('.active').find('a[data-toggle="tab"]').get(0).id);
		if(audit.valid == true)
		{
			// Get the next tab that should be shown.
			var tab = $tabs.filter('.active').next('li').find('a[data-toggle="tab"]');		
			/*
			// Skip the "CustomerAdmin" tab if in edit mode
			if( (tab[0].id == "siteAdminTab")&& (mode == "edit") )
			{			
				var skip = $tabs.filter('.active').next('li')
				.next('li').find('a[data-toggle="tab"]');
				skip.tab('show');
			}
			else */
			{
				tab.tab('show');
			}		
		}
		else	
			displayErrors(audit);		
	});
	
	// Start with the account deactivate button disabled
	$('#mcDeleteBtn').prop('disabled', false);	

	// Editing an account and adding an account are effectively 
	// the same thing, so only one page is used for both functions.
	// When the menu item is chosen, the mode is set here.
	$('body').on('click', '#edit_account', function(){
		window.sessionStorage.setItem("AccountMode", "edit");			
	});

	$('body').on('click', '#add_account', function(){		
		window.sessionStorage.setItem("AccountMode", "add");				
	});

	$('body').on('keyup', '#accountName', function(e)
	{
		// Check for "<enter>"
	    var code = e.which;		
		var mode = window.sessionStorage.getItem("AccountMode");	
		if(code==13)
		{
			if(mode == "edit")
			{	// Switch to the current account that was found
				$('#selAccountEdit').change();
				$('#accountNotes').removeClass("disabled");
				$('#dynpop').popover('hide');
				return;
			}
			else
			{
				// stub for save mode tasks
			}
		}
		// Search for existing accounts as account name is entered
		var matchOpt = null;
		var optAccount = null;
		var optText = null;
		
		
		for(var i=0; i<arrAccounts.length; i++)
		{
			// Get an account from the list
			optAccount = arrAccounts[i];
			optText = optAccount.text.trim().toLowerCase();
			// Search for the current string
			var p = optText.indexOf(this.value.trim().toLowerCase());
			if(p == 0)
			{				
				matchOpt = optAccount;
				break;
			}
		}
		
		if(mode == "edit")
		{
			if(matchOpt!=null) // Found a matching account
			{		
				var newopt = selAccountEdit.options.namedItem(matchOpt.id);
				if(newopt != null)
					newopt.selected = true;
				$('#dynpop').data('popover').options.title = "Select Account"
				$('#dynpop').data('popover').options.content = "Press enter to select this account: "
					+ getPopContent(optAccount);				
				$('#dynpop').popover('show');

				if((matchOpt.id == "-1"))//||(this.value.toLowerCase() != optText) )
				{
					// If no account is selected, lock up
					enableTabs(false);
					enableNavButtons(false);
					$('#edit_add_account_submit').css("visibility","hidden");
					$('#accountNotes').val("");
					$('#accountNotes').addClass("disabled");
					$('#dynpop').popover('hide');					
				}
			}		
		}
		else
		{
			// In add mode, if a match is found, hilight the box and show an error
			if((matchOpt!=null)&&(this.value.trim().toLowerCase() == optText))			
			{				
				$('#dynpop').data('popover').options.title = "Existing Account"
				$('#dynpop').data('popover').options.content = getPopContent(optAccount);				
				$('#dynpop').popover('show');
				$('#accountName').get(0).style.borderColor = "red";
				enableTabs(false);
				$("#nexttab").addClass("disabled");
				}
			else
			{
				$('#accountName').get(0).style.borderColor = "";
				$('#dynpop').popover('hide');
				enableTabs(true);
				$("#nexttab").removeClass("disabled");
			}
		}
	})
	
	$('body').on('change', '#selState', function(){	
		// If a state is chosen, the country should default to US		
		var selState = $("#selState").get(0);
		// Get the index of the currently selected state
		var index = selState.options.selectedIndex;
		// Use the index to get the country option object
		var selected = selState.options.item(index);		
		// Get the data from the option
		var data = selected.value;
		
		if(data == "-1")
		{		
			var selCountry = $("#selCountry").get(0);	
			var opt = selCountry.options.namedItem('-1');	
			if(opt != null)
			{
				opt.selected = true;
				document.getElementById("selCountry").disabled=false;				
			}		
		}
		else
		{		
			var selCountry = $("#selCountry").get(0);	
			var opt = selCountry.options.namedItem('US');	
			if(opt != null)
			{
				opt.selected = true;				
				document.getElementById("selCountry").disabled=true;
			}		
		}			
	});
	
	$('body').on('change', '#selCountry', function(){
		// If a non-US country is chosen, the state should default to not selected		
		var selCountry = getSelectedOption($("#selCountry").get(0));
		if(selCountry != null)
		{
			if(selCountry.value != "US")
			{
				// Set the state to unspecified
				var opt = $("#selState").get(0).options.namedItem('-1');	
				if(opt != null)
				{
					opt.selected = true;					
					// Set color to black if it was changed by audit.
					$('#selState').get(0).style.borderColor = "";	
					document.getElementById("selState").disabled=true;				
				}					
			}
			else
			{
				document.getElementById("selState").disabled=false;
			}
		}
	});
	
	$('body').on('click', '#edit_department_submit', function() {
		// Handle a click on the "edit departments" button		
		var args = { title : "Edit Departments", // Dialog title
					assignedList : "department", // Switch for GetCharacterizationList()
					instructions : "Enter the new department name:",
					placeholder : "<new department name>",
					cloneSel : 'selDepartment', // ID of select to edit
					selInstructions : "(Create New Department)" // Selection zero
					}
		// Prepare and display the modal edit dialog
		prepDialog(args);		
		$('#listEdit').modal();		
	});	
	
	$('body').on('click', '#edit_industry_submit', function() {
		// Handle a click on the "edit industries" button
		var args = { title : "Edit Industries",
					assignedList : "industry",
					instructions : "Enter the new industry:",
					placeholder : '<new industry name>',
					cloneSel : 'selIndustry',
					selInstructions : "(Create New Industry)"
					}
		prepDialog(args);
		$("#listEdit").modal(); 			
	});	

	$('body').on('click', '#edit_account_submit', function() {
		// Handle a click on the "edit account types" button			
		var args = { title : "Edit Account Types",
					assignedList : "account",
					instructions : "Enter the new account type:",
					placeholder : '<new account type>',
					cloneSel : 'selAccountType',
					selInstructions : "(Create New Account Type)"
					}
		prepDialog(args);		
		$("#listEdit").modal();
	});	

	$('body').on('click', '#edit_license_submit', function() {
		// Handle a click on the "edit license types" button
		var args = { title : "Edit Contract Types",
					assignedList : "contract",
					instructions : "Enter the new contract type:",
					placeholder : '<new contract type>',
					cloneSel : 'selContractType',
					selInstructions : "(Create New Contract Type)"
					}
		prepDialog(args);	
		$("#listEdit").modal();
	});	

	$('body').on('change', '#selEditList', function(){
		// Handles a change in the selected item in the 
		// list edit modal dialog
		var sel = this.options[this.selectedIndex];
		if(sel.id != "-1")
		{
			$('#newListValue').get(0).value = sel.value;			
			$("#listDel").css("visibility","");
		}
		else
		{
			$('#newListValue').get(0).value = "";		
			$("#listDel").css("visibility","hidden");
		}
	})
	
	$('body').on('click', '#listDel', function() {		
		// Get the name of the list that is being edited
		// The names are assigned by the button that was clicked
		// to show the modal dialog.  See
		// $('body').on('click', '#edit_department_submit' for example
		var listName = $('#assignedList').get(0).value;
		var res = GetCharacterizationList(listName);
		var crudName = res.name;
		var list = res.selList;// This is the actual list, not the dialog list
		var editList = $('#selEditList').get(0); // This is the dialog copy list
				
		if(list != null) // null is a "never happen"
		{
			// Use the index to get the user option object	
			var selected = getSelectedOption(editList);
			// Make sure button wasn't clicked with nothing selected
			if(selected != null)
			{				
				var method = 'delete';				
				var editID = selected.id;
				var update={url: 'account',
							list: crudName,
							item: "",
							method: method,
							id: editID // ID of entity to delete
							}
							
				var newID = UpdateCharacterization(update);
				// If the ID is not null, the DELETE failed.
				if(newID == null)
				{	// Success.  Remove the item from the current lists.
					list.removeChild(list.options.namedItem(editID));
					editList.removeChild(editList.options.namedItem(editID));
					// Clear the dialog text box
					$('#newListValue').get(0).value = "";					
				}
			}
		}
	})
	
	$('body').on('click', '#listSave', function() {
		// Handle the "save changes" button in the list edit dialog 

		// Get the name of the list that is being edited
		var listName = $('#assignedList').get(0).value;
		var res = GetCharacterizationList(listName);
		var list = res.selList; // This is the actual list, not the dialog list
		var editList = $('#selEditList').get(0); // This is the dialog copy list
		var crudName = res.name;
		
		if(list != null) // null is a "never happen"
		{
			// Assume a new item is being added (post)
			var method = 'post';
			var editID = null; // Server will provide the ID
			
			// Check if an item has been selected for editing instead of creation
			var selected = getSelectedOption(editList);
			if(selected != null)
			{
				method = 'put'; // This will be an edit of an existing item	
				editID = selected.id; // Need the ID for the PUT
			}
			
			// Prepare the information for AJAX
			var update={url: 'account', // Where the list is
						list: crudName, // Which list the item belongs to
						item: $('#newListValue').get(0).value, // Text for the item
						method: method,	// PUT or POST
						id: editID // Required for PUT, id of the item 
						}
			// Update the list
			var newID = UpdateCharacterization(update);
			if(newID != null)
			{
				// On a PUT, the id is pre-set, and doesn't change. 	
				// On a POST, the id goes in null, but comes back assigned.			
				// Remove previous item from the current lists if it was edited
				if(update.method == "put"){

					list.removeChild(list.options.namedItem(editID));
					editList.removeChild(editList.options.namedItem(editID));
				}				
				// Create a new option from the text entered by the user
				var option = document.createElement("option");
				option.text = update.item;			
				option.selected = true;
				option.id = newID; // new or existing
				// Add it to the lists and sort the lists
				list.add(option);
				var commonLib = new accountsCommon;
				commonLib.sortSelect(list);
				
				var option2 = document.createElement("option");
				option2.text = update.item;			
				option2.selected = true;
				option2.id = newID; // new or existing
				// Add it to the lists and sort the lists
				editList.add(option2);
				commonLib.sortSelect(editList);				
			}
		}
	});
	
	$('body').on('click', '#edit_add_account_cancel', function() {
		window.location.href = "corpaccounts";
	});
	
	$('body').on('click', '#siteRole', function() {
		$('#roleChange').modal();
	});
	
	$('body').on('click', '#roleOK', function() {
		// A (possibly) new user has been selected as the site admin.
		// Check the current one		
		var currentID = $('#adminUserID').val();		
		var optAdmin = getSelectedOption($('#selUserList').get(0));
		
		if(optAdmin!=null)
		{	
			var admin = JSON.parse(optAdmin.value);		
			// console.log("\nHere's the value of the option: ", admin);
			if(currentID != admin.id)
			{	// Admin user has change.  Sigh.  Update the display.										
				$('#firstname').val(admin.firstname);
				$('#middlename').val(admin.middlename);
				$('#lastname').val(admin.lastname);
				$('#username').val(admin.username);
				$('#email').val(admin.email);
				$('#emailc').val(admin.email);
				$('#adminUserID').val(admin.id);
				// The role change will not happen until commit
			}
		}
	});
	
	$('body').on('click', '#edit_add_account_submit', function() {
		// Handle a click on the "Save Changes" button in Add/Edit account		
				
		// Sanity check audit for all tabs in both add and edit modes
		var audit = isValidAccount();		
		if(audit.valid == true)
		{			
			// Save data and submit page
			commitAccount(); // Commits either add or edit data			
			document.getElementById("add_account_form").submit();			
		}
		else
		{
			// Oops.  Validation failed.  Inform the user of the problem.
			displayErrors(audit);
			// Move to the tab with errors
			$('#'+audit.tabID).tab('show');
		}
	});
	
	$('body').on('change', '#selAccountEdit', function(){	
		// This is the "select account" on the Edit Account tab.
		// When the selected account changes, the displayed fields
		// must be updated.  That happens here.		
		var selAccount = $("#selAccountEdit").get(0);		
		var accountData = getSelectedAccountData(selAccount);		
		// In all cases, a change to the current account
		// means errors should be cleared
		resetBorders();
		clearFields();
 		if(accountData != -1)
		{
			var siteAdmin = getSelectedSiteAdmin(accountData.id);	
			enableTabs(true);
			$("#nexttab").removeClass("disabled");
			$('#accountNotes').removeClass("disabled");
			$('#selAccountStatus').removeClass("disabled");
			// User has selected an account to edit.  Switch modes.
			// Change page appearance for edit mode
			window.sessionStorage.setItem("AccountMode", "edit");
			$('#edit_add_account_submit').text("Save Changes");
			$('#action_title').text("Edit Account");
			$("#edit_add_account_submit").css("visibility","");
			// $("#siteAdminTab").addClass("disabled");
			// Change hidden account information
			window.sessionStorage.setItem("CurrentAccountID", accountData.id);	
			//document.getElementById("id").value = accountData.id;
			window.sessionStorage.setItem("AccountStatus", accountData.status);			
			// Display the newly selected account information
			// Account name Tab
			document.getElementById("accountName").value = accountData.name;			
			document.getElementById("accountNotes").value = accountData.notes;
			var selAccountStatus = $('#selAccountStatus').get(0);
			
			if(selAccountStatus != null)
			{
				if(accountData.status == 0)
						selAccountStatus.selectedIndex = 0;
					else
						// Any other value is some sort of disabled account.
						selAccountStatus.selectedIndex = 1;
			}
			// Address Tab			
			document.getElementById("accountAddress").value = accountData.address;			
			document.getElementById("accountAddress2").value = accountData.address2;
			document.getElementById("accountCity").value = accountData.city;	
			document.getElementById("accountZip").value = accountData.zip;
			
			// Site Admin Tab
			if(siteAdmin != null){
			$('#firstname').val(siteAdmin.firstname);
			$('#middlename').val(siteAdmin.middlename);
			$('#lastname').val(siteAdmin.lastname);
			$('#username').val(siteAdmin.username);
			$('#email').val(siteAdmin.email);
			$('#emailc').val(siteAdmin.email);
			$('#adminUserID').val(siteAdmin.id);
			}
			
			// Load the list of all users at the selected company
			$("#selUserList").empty();	
			LoadUserList(accountData.id, $("#selUserList").get(0));
			
			// Handle State, Country
			if(accountData.state != null)
			{
				var index = getItemIndex(selState, accountData.state.toUpperCase());
				selState.options[index].selected = true;				
			}
			else 
				selState.options[0].selected = true;				
				
			if(accountData.country != null)
			{
				var index = getItemIndex(selCountry, accountData.country.toUpperCase());
				selCountry.options[index].selected = true;				
			}
			else
				selCountry.options[0].selected = true;
			// Characterization Tab
			if(accountData.department != null)
			{				
				var id = accountData.department.id;
				selDepartment.options.namedItem(id).selected = true;	
			}	
			else
				selDepartment.options[0].selected = true;
				
			if(accountData.industries != null)
			{	
				if(accountData.industries[0] != null){			
				var id = accountData.industries[0].id;
				selIndustry.options.namedItem(id).selected = true;				
				}
			}	
			else
				selIndustry.options[0].selected = true;
				
			if(accountData.accountType != null)
			{				
				var id = accountData.accountType.id;
				selAccountType.options.namedItem(id).selected = true;	
			}
			else
				selAccountType.options[0].selected = true;
			// License Tab
			if(accountData.contract != null)
			{	
				if(accountData.contract.contractType != null){
				var id = accountData.contract.contractType.id;
				selContractType.options.namedItem(id).selected = true;}							
				var startDate = new Date(accountData.contract.startdate);
				var endDate = new Date(accountData.contract.expirationdate);
			}
			else
			{
				var startDate = new Date();
				var endDate = new Date();
				endDate.setTime(endDate.getTime()+86401000);// add 24 hours to end date
			}
			document.getElementById("startContract").value = startDate.toDateString();
			document.getElementById("endContract").value = endDate.toDateString();
			// Database Tab
			// TODO: Must add database configuration here once it is defined
		}
		else
		{
			// User has changed to no account selected - i.e. add account mode.  
			// Uncomment these lines to enable account creation from edit mode
			// Change the appearance to add mode.
			//window.sessionStorage.setItem("AccountMode", "add");
			//$('#edit_add_account_submit').text("Create Account");
			//$('#action_title').html("Add New Account");			
			//$("#siteAdminTab").removeClass("disabled");
			enableTabs(false);
			enableNavButtons(false);
			$('#accountNotes').addClass("disabled");
			$("#edit_add_account_submit").css("visibility","hidden");
			// Clear or reset all data fields on all tabs
			window.sessionStorage.setItem("CurrentAccountID", "-1");	
			window.sessionStorage.setItem("AccountStatus", "0");
			var selAccountStatus = $('#selAccountStatus').get(0);
			if(selAccountStatus != null)
				selAccountStatus.selectedIndex = 1;// Default to disabled account on creation.
			clearFields();
			
			selState.options[0].selected = true;
			selCountry.options[0].selected = true;
			
			// Now handle characterizations
			var index = 0;
			selIndustry.options[index].selected = true;				
			selDepartment.options[index].selected = true;	
			selAccountType.options[index].selected = true;	
			selContractType.options[index].selected = true;	

			// Initial contract date starts and ends today.
			var startDate = new Date();
			var endDate = new Date();
			document.getElementById("startContract").value = startDate.toLocaleDateString();
			document.getElementById("endContract").value = endDate.toLocaleDateString();
			// Database configuration
			
		}
	});
	
	$('body').on('click', '#mconfirm', function() {
		var delID = window.sessionStorage.getItem("CurrentAccountID");
		var curID = window.sessionStorage.getItem("AllUsersAccountFilter");
		// If the id of the company deleted was the same as was being
		// edited in the user accounts screens, clear the cached account
		// information to force the selection of a new account.
		if(delID == curID)
		{			
			window.sessionStorage.removeItem("AllUsersAccountFilter");
			window.sessionStorage.removeItem("AllUsersAccountCoName");			
		}
	});
	
	$('body').on('change', '#deleteAccount', function() {
		// Switch the page to delete mode if selected
		var x = document.getElementById("deleteAccount").checked;		
		if(x == true)
		{	
			$('#mcDeleteBtn').text("DELETE ACCOUNT PERMANENTLY");
			document.getElementById("mcDeleteBtn").className = "btn btn-block btn-danger";									
			$("#deactivateForm").attr("action", "/corporate/delete_account");
			// Switch to danger mode
			$("#modal-title").html("Warning! DELETING ACCOUNT");
			$("#lblWarning").text("YOU MUST FIRST DELETE ASSOCIATED USERS AND SNAPSHOTS.  Deleting this account will permanently remove it from the server.  This action cannot be undone.  The delete performed is not a cascade, so any associated users and snapshots will not be removed.");				
			document.getElementById('mconfirm').className = "btn btn-danger";
			$('#mconfirm').text("Yes, DELETE this Account");
		}
		else
		{		
			$('#mcDeleteBtn').text("Suspend Account");
			document.getElementById("mcDeleteBtn").className = "btn btn-block btn-primary";						
			$("#deactivateForm").attr("action", "/corporate/deactivate_account");
			// Switch to suspend mode
			$("#modal-title").html("Confirm Account Suspension");
			$("#lblWarning").text("Are you sure you wish to suspend this account?");			
			document.getElementById('mconfirm').className = "btn btn-primary";			
			$('#mconfirm').text("Suspend Account");
		}
	})
	
	$('body').on('change', '#selAccount', function() {	
		// This is the "select Account" on the "Suspend Account" page
		// This function is called when the account to be deleted has changed
		// Get the selected account data from the option in the select
		
		var selAccount = $("#selAccount").get(0);
		var accountData = getSelectedAccountData(selAccount); // Note this is the account object, not the web page hybrid
		
 		if(accountData != -1)
		{			
			// Display the currently selected account data
			window.sessionStorage.setItem("CurrentAccountID", accountData.id);				
			document.getElementById("id").value = accountData.id;			
			$('#name').text(accountData.name);
			if(accountData.status == 0)
				$('#status').text("Active");
			else
				$('#status').text("Suspended");
			$('#address').text(accountData.address);			
			$('#city').text(accountData.city);					
			$('#state').text(accountData.state);
			$('#zip').text(accountData.zip);
			$('#mcDeleteBtn').prop('disabled', false);
		}
		else
		{
			window.sessionStorage.setItem("CurrentAccountID", "-1");
			$('#mcDeleteBtn').prop('disabled', true);			
			document.getElementById("id").value = -1			
			$('#name').text("(account name)");
			$('#status').text("(status)");
			$('#address').text("(street)");			
			$('#city').text("(city)");		
			$('#state').text("(state)");						
			$('#zip').text("(postal code)");
		}
	});		

// This function disables or enables the tabs in the accounts editing page
function enableTabs(boolVal)
{
	if(boolVal == true)
	{	
		// First tab, "#anTab" never gets disabled
		$("#addressTab").removeClass("disabled");
		// Primary user tab can be edited in Account Add mode
		var mode = window.sessionStorage.getItem("AccountMode");	
		//if(mode == "add") // Now allow site admin edit from the tab
		$("#siteAdminTab").removeClass("disabled");
		$("#charTab").removeClass("disabled");
		$("#licenseTab").removeClass("disabled");
		$("#dbTab").removeClass("disabled");
	}
	else
	{	
		$("#addressTab").addClass("disabled");
		$("#siteAdminTab").addClass("disabled");
		$("#charTab").addClass("disabled");
		$("#licenseTab").addClass("disabled");
		$("#dbTab").addClass("disabled");	
	}
}

function enableNavButtons(state)
{
	// Not using default because custom css is prettier
	if(state == true)
	{
		$("#nexttab").removeClass("disabled");
		$("#prevtab").removeClass("disabled");
		$("#selAccountStatus").removeClass("disabled");
	}
	else
	{
		$("#nexttab").addClass("disabled");
		$("#prevtab").addClass("disabled");
		$("#selAccountStatus").addClass("disabled");
	}
}

function LoadUserList(accountID, selList)
{
	// This function loads the list of all users for the 
	// account id passed in.  
		
    // Build the url for the router
	var href = '/users/site_users';				
	// Put the url for the REST call together with the data	
	var body={'url':href, 'accountid': accountID}	
	var retData;	
	// Use AJAX to post the account reset.
	$.ajax({			
			url: href,
			data: body,
			async: false, 
			method: 'PUT',			
			dataType: 'json',
			success: function (response) {
				if (response.success) 
				{
					retData = response.data;
				} 
				else 
				{
					console.log("Failure. ", response);
					//toast.notifyError('Error', 'Error: '+response.error.code+' - '+response.error.message);
				}
			},
		error: function(response){
			toast.notifyError('Error', 'Site users could not be loaded!');	
			//TODO: handle error condition gracefully
		}
	});

	for (i=0; i<retData.length; i++) 	
	{
		// JQuery '.append' has a bug.  MUST use DOM to do the work.
		var data = JSON.stringify(retData[i].data);
		var option = document.createElement("option");		
		option.id = retData[i].userid;
		option.value = data;
		option.text = retData[i].name;
		selList.add(option);
	}	
}

function filterAccounts(filter)
{
	// This function uses the global accounts array arrAccounts
	// Get the accounts select
	var accSel = $('#selAccountEdit').get(0);
	// Empty it
	$("#selAccountEdit").empty();
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

	// Force the refresh of the page through the select	
	$('#selAccountEdit').change();	
}

// Returns true if the option passed in is allowed
function isFiltered(opt, filter)
{	
	// Establish the list of status types available
	var statusTypes=['active',
					'suspended'];
	
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
		if(accountData.status == filterID)
			return false;
	}
	// If the loop drops out, the filter never matched
	// an actual status.  Something is wrong.	
	return true;		
}

function validateTab(tabID)
{
	// Create the error tracking object.
	var errors =[];
	var isValid ={
		valid : true,
		errList : errors,		
	};
	
	// Make sure there are no empty "space" only fields
	trimAllFields();
	
	switch(tabID)
	{
		case "anTab":
			return validateAnTab(isValid);
		break;
		case "addressTab":
			return validateAddressTab(isValid);
		break;
		case "siteAdminTab":
			return validateSiteManagerTab(isValid);
		break;
		case "charTab":
			return validateCharTab(isValid);
		break;
		case "licenseTab":
			return valdiateLicenseTab(isValid);
		break;
		case "dbTab":
			return validateDbTab(isValid);
		break;
		
		default:
			isValid.valid = false;
			isValid.errList.push({text:"Unknown tab ID in validation"});			
		break;
	}
	
	return isValid;
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

function resetBorders()
{
	// This function clears all red "error" borders back to normal
	$(":text").css('border-color', '');	
}

function clearFields()
{
	$(":text").val("");
	$("#accountNotes").val('');
	// TODO: Database fields here
}

function validateAnTab(isValid)
{
	// Account Name Tab			
	// Check the account name field
	var name = $('#accountName').get(0);	
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Account name is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";

	return isValid;
}

function validateAddressTab(isValid)
{
	// Account Address Tab
	var name = $('#accountAddress').get(0);	
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Account address is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";
		
	// City	
	var name = $('#accountCity').get(0);	
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"City is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";
		
	// Zip
	var name = $('#accountZip').get(0);	
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Postal code is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";
		
	// Country and state
	var country = $('#selCountry').get(0);
	var countryOpt = getSelectedOption(country);	
	var state = $('#selState').get(0)
	var stateOpt = getSelectedOption(state);	
		
	if( (countryOpt == null) ){
		isValid.valid = false;
		isValid.errList.push({text:"Country is a required field."});		
		country.style.borderColor = "red";
		}
	else
	{
		// A country has been selected.  If it's the US, then require a state.
		country.style.borderColor = "";		
		if (country.value == "US")
		{
			if(stateOpt == null) {
				isValid.valid = false;
				isValid.errList.push({text:"State is a required field."});				
				state.style.borderColor = "red";
				}
			else
			{			
				state.style.borderColor = "";
			}
		}
		else
			state.style.borderColor = "";
	}
	return isValid;
}

function validateSiteManagerTab(isValid)
{
	var name = $('#email').get(0);	
	var namedup = $('#emailc').get(0);
	// Check that the email was entered correctly
	if (name.value != namedup.value)
	{
		isValid.valid = false;
		isValid.errList.push({text:"E-mail addresses do not match."});		
		name.style.borderColor = "red";
	}
	else
	{	// Duplicates match, but is the address basically valid?	
		var commonLib = new accountsCommon;
		if(commonLib.isValidEmail(name.value)==false)
		{
			isValid.valid = false;
			isValid.errList.push({text:"A valid e-mail address is required."});			
			name.style.borderColor = "red";
		}
		else
			name.style.borderColor = "";
	}
	// Check for valid username
	var name = $('#username').get(0);
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"User name is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";

	// Check for valid first name
	var name = $('#firstname').get(0);
	if(name.value == "")
	{
		isValid.valid = false;
		isValid.errList.push({text:"First name is a required field."});		
		name.style.borderColor = "red";
	}
	else
		name.style.borderColor = "";

	// Check for valid last name
	var name = $('#lastname').get(0);
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Last name is a required field."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";

	return isValid;	
}

function validateCharTab(isValid)
{
	// Characterizations Tab
	var selDepartment = $('#selDepartment').get(0);
	var optDepartment = getSelectedOption(selDepartment);	
	if(optDepartment == null){
		isValid.valid = false;
		isValid.errList.push({text:"Department type is a required field."});		
		selDepartment.style.borderColor = "red";
		}
	else
		selDepartment.style.borderColor = "";

	var selIndustry = $('#selIndustry').get(0);
	var optIndustry = getSelectedOption(selIndustry);	
	if(optIndustry == null){
		isValid.valid = false;
		isValid.errList.push({text:"Industry type is a required field."});		
		selIndustry.style.borderColor = "red";
		}
	else
		selIndustry.style.borderColor = "";

	var selAccountType = $('#selAccountType').get(0);
	var optAccountType = getSelectedOption(selAccountType);	
	if(optAccountType == null){
		isValid.valid = false;
		isValid.errList.push({text:"Account type is a required field."});		
		selAccountType.style.borderColor = "red";
		}
	else
		selAccountType.style.borderColor = "";	
	
	return isValid;
}

function valdiateLicenseTab(isValid)
{
	// License Tab
	// Check that a license has been selected
	var contract = $('#selContractType').get(0);
	var contractOpt = getSelectedOption(contract);	
	if(contractOpt == null){
		isValid.valid = false;
		isValid.errList.push({text:"Contract type is a required field."});		
		contract.style.borderColor = "red";
		}
	else
		contract.style.borderColor = "";
	// Check that dates have been provided
	var name = $('#startContract').get(0);	
	if(name.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"Start date for contract is required."});		
		name.style.borderColor = "red";
		}
	else
		name.style.borderColor = "";

	var enddate = $('#endContract').get(0);	
	if(enddate.value == ""){
		isValid.valid = false;
		isValid.errList.push({text:"End date for contract is required."});		
		enddate.style.borderColor = "red";
		}
	else
		enddate.style.borderColor = "";

	// Make sure the end date is later than the start date
	if(enddate.style.borderColor != "red")// No point in continuing if it's already a problem.
	{
		var startd = new Date($('#startContract').get(0).value);
		var endd = new Date($('#endContract').get(0).value);	
		if(startd.getTime() > endd.getTime())
		{
			isValid.valid = false;
			isValid.errList.push({text:"Contract duration is invalid.  End date cannot precede start date."});			
			enddate.style.borderColor = "red";
		}
		else
			enddate.style.borderColor = "";
	}	

	if(enddate.style.borderColor != "red")// No point in continuing if it's already a problem.
	{	
		// Make sure the contract is longer than 24 hours.
		if((endd.getTime() - startd.getTime()) < 86400000 ) //24 hours in ms
		{
			isValid.valid = false;
			isValid.errList.push({text:"Contract duration is invalid.  Minimum duration is 24 hours."});			
			enddate.style.borderColor = "red";
		}
		else
			enddate.style.borderColor = "";

	}
	return isValid;
}

function validateDbTab(isValid)
{
	// TODO: Database settings validation, once settings are determined.
	return isValid;
}

function registerPopover(classStr, options)
{	// Register custom classname and HTML for the error popovers
    if ($.isPlainObject(classStr))
	{
        options = classStr;
        classStr = '';
    }
    return $.extend({'template': '<div class="popover ' + classStr +'"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}, options);
}

function getPopContent(opt)
{
	// Returns the content to display in the existing account popover
	var data = opt.value;
	if(data != -1)
	{
		// Reconstitute the account object
		var accountData = JSON.parse(data);		
		
		var status = "Active";
		if(accountData.status > 0)
			status = "Suspended";

		// Assemble an address card as an HTML string for display
		var card = accountData.name +'<br>'+
					accountData.address +'<br>'+
					accountData.city + ', '+
					accountData.state +'<br>'+
					accountData.zip +'<br>'+
					'Status: ' + status;		
		return card;
	}
	else
		return "The account name selected cannot be used."; // never happen
}

function prepDialog(args)
{	// This function preps the modal edit dialog for each
	// list being edited.
	// Set the title to identify what the user is doing	
	$('#dlgTitle').text(args.title);
	// Pass the list that is being modified to the dialog	
	$('#assignedList').get(0).value = args.assignedList;
	// Display instructions	
	$('#instText').text(args.instructions);
	// Clear out any previous text and put in customized placeholder	
	$('#newListValue').get(0).value = "";	
	$('#newListValue').attr('placeholder', args.placeholder);
	// Add the list to be modified to the dialog
	$("#theList").empty();	
	$('#'+args.cloneSel).clone(false)
	.attr('id', 'selEditList')		
	.appendTo("#theList");
	// Change the "create new..." instruction in the select
	$('#selEditList').get(0).options[0].text=args.selInstructions;
	// Hide the delete button
	$("#listDel").css("visibility","hidden");		
	// Get the new list and set the select to match the current selection
	var editList = $('#selEditList').get(0);
	editList.selectedIndex = $('#'+args.cloneSel)[0].selectedIndex;
	// If an item is preselected, put its text in the edit box
	if(editList.selectedIndex > 0){
		$("#listDel").css("visibility","");// and show the delete button
		$('#newListValue').get(0).value = $("#selEditList option:selected").val();
	} 
}	

function addCheckbox() 
{
	// This is Patrick's account kill option
   var div = $('#cbp');
   $('<input />', { type: 'checkbox', name: "deleteAccount", id: "deleteAccount", value: "kill" }).appendTo(div);   
}

function getItemIndex(selSearch, value) 
{
	// Returns the index of the item specified by value
	// on the list passed in.
	for (var i in selSearch.options)
	{
		var opt = selSearch.options[i];	
		if(opt.value == value)
			return i;			
	}
	return -1;
}
// Returns the account object from the select passed in
// assumes the select is a "standard" (for this program) 
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

function getSelectedSiteAdmin(accountID)
{
	// Returns the site administrator information
	// for the account ID passed in
	// This has been abstracted in to a function call
	// as a stub for making this an AJAX call in the future.		
	return $("#info ul li[id="+accountID+"]").data('json');		
}

// Update the selected account object and save the data for the post
// Assumes the edit has been validated.
function commitAccount()
{		
	// Determine if the page is in add mode or edit mode.	
	var mode = window.sessionStorage.getItem("AccountMode");	
	// The primary difference between adding and editing is
	// the rest call, and some of the information provided.
	// Edit mode requires more information - i.e. the original record
	if(mode == "edit")
	{		
		// Get the full account data that is to be modified
		var selAccount = $("#selAccountEdit").get(0);		
		var accountData = getSelectedAccountData(selAccount);				
		// Apply the edits to the account
		var account = commitAccountEdit(accountData);
		// Get the current site admin user object for the current account
		var currentAdmin = getSelectedSiteAdmin(accountData.id);		
		var oldAdmin = null;
		// See if the admin role has changed
		if(currentAdmin.id != $('#adminUserID').val())
		{
			var optAdmin = getSelectedOption($('#selUserList').get(0));
			var nAdmin = JSON.parse(optAdmin.value);			
			adminRoleChange(currentAdmin, nAdmin); 
			oldAdmin = currentAdmin; // Save old admin, now without role
			currentAdmin = nAdmin; // Save new admin, now with role
			$('#adminUserID').val(nAdmin);
		}		
		// Apply field edits to the current admin account
		var newAdmin = commitSiteAdminEdit(currentAdmin);		
	}
	
	// Explicit test for explicit behavior
	if(mode == "add")
	{	
		// Finalize the new account and user data
		// Note that two types of account are being created
		var account = commitAccountNew();
		var newAdmin = commitSiteAdminNew();
	}

	// Once the account record has been created or edits applied,
	// update the web page with the new information to pass to REST API.
	// These hidden data fields in the web page are the only place data is passed.
	// The idea is to loosen the coupling between the web page and the data
	// by making a single point of binding.	Maybe make it ajax some day.
	var $editedAccount = $('<input/>',{type:'hidden',id:'edited_account', name:'edited_account'}).appendTo('#info');	
	$editedAccount.val(JSON.stringify(account));	
	
	var $editedNewAdmin = $('<input/>',{type:'hidden',id:'edited_newAdmin', name:'edited_newAdmin'}).appendTo('#info');
	$editedNewAdmin.val(JSON.stringify(newAdmin));

	var $editedOldAdmin = $('<input/>',{type:'hidden',id:'edited_oldAdmin', name:'edited_oldAdmin'}).appendTo('#info');
	$editedOldAdmin.val(JSON.stringify(oldAdmin));
	
	// Mode determines PUT or POST
	$('<input/>',{type:'hidden', id:'mode', name:'mode', value:mode}).appendTo('#info');
		
}

function adminRoleChange(oldAdmin, newAdmin)
{
	// Remove the admin role from the old admin
	// add the admin role to the newAdmin
	for (i=0; i<oldAdmin.groups.length; i++) 	
	{
		if(oldAdmin.groups[i].id == 2)// TODO: Make this an enum or const.
		{
			var group = oldAdmin.groups[i];
			oldAdmin.groups.splice(i,1);
			break;
		}
	}
	newAdmin.groups.push(group);
}

function commitAccountEdit(account)
{
	// This function takes the finalized account information 
	// from the fields and builds the new record to PUT.
	
	trimAllFields();
	// Get the contract information
	var selected = getSelectedOption($("#selContractType").get(0));
	//console.log("START DATE CONTROL VALUE: ", $('#startContract').get(0).value	);
	var startd = new Date($('#startContract').get(0).value);
	//console.log("Start date says: ", startd.toUTCString());
	var endd = new Date($('#endContract').get(0).value);	
	
	// Get the characterizations as objects
	var sel = getSelectedOption($('#selDepartment').get(0));
	var department = { "id": sel.id};//, "name": sel.value};
	// Industry
	var sel = getSelectedOption($('#selIndustry').get(0));	
	var industry = { "id": sel.id};//, "name": sel.value};
	var ia=[];
	ia[0]=industry;
	// Account Type
	var sel = getSelectedOption($('#selAccountType').get(0));
	var type = { "id": sel.id};//, "name": sel.value};
	
	// Edit the account object
	// account.id = window.sessionStorage.getItem("CurrentAccountID"),
	//account.status: 0,//window.sessionStorage.getItem("AccountStatus"),
	account.name =  $('#accountName').get(0).value;
	account.notes =  $('#accountNotes').get(0).value;
	account.address =  $('#accountAddress').get(0).value;
	account.address2 = $('#accountAddress2').get(0).value;
	account.city =  $('#accountCity').get(0).value;
	account.state =  getSelectedOption($('#selState').get(0)).value;
	account.zip =  $('#accountZip').get(0).value;
	account.country =  getSelectedOption($('#selCountry').get(0)).value;
	account.province =  "-1"; // Abandoned field
	account.department =  department;
	account.industries =  ia;
	account.accountType =  type;
	// An invalid account may be editable (i.e. it exists in some form) but the 
	// contract might not exist.  This will handle incomplete records on the 
	// server.  This should never happen, but during testing, the server
	// was initialized with incomplete data.  This code adds a layer of 
	// robustness.
	if(account.contract == null)
	{
		var contract = {
					//"id":null, // New contract ID provided by server
					"contractType":{"id": selected.id//,
									//"name": selected.value // Server assigned name
									},
					"startdate": startd.getTime(),
					"expirationdate":endd.getTime()	};
	}
	else
	{
		//account.contract.id = null, // ID already exists, and will be used by the server	
		account.contract.contractType.id = selected.id;								
		account.contract.contractType.name = selected.value	
		account.contract.startdate = startd.getTime();
		account.contract.expirationdate = endd.getTime();					
	}
	// Finally, account status.
	field = $('#selAccountStatus').get(0);		
	account.status = field.value;

	return account;
}

function commitSiteAdminEdit(siteAdminData)
{
	// This function takes the finalized user information 
	// from the fields and builds the new record to PUT.
	// Assumes data has been validated.
	trimAllFields();
	siteAdminData.firstname =  $('#firstname').get(0).value;
	siteAdminData.middlename =  $('#middlename').get(0).value;
	siteAdminData.lastname =  $('#lastname').get(0).value;
	siteAdminData.username = $('#username').get(0).value;
	siteAdminData.email =  $('#email').get(0).value;
	return siteAdminData;
}

function commitAccountNew()
{
	// This function takes the finalized account information 
	// from the fields and builds the new record to POST.	
	
	trimAllFields();	
	// Get the contract information
	var selected = getSelectedOption($("#selContractType").get(0));		
	var startd = new Date($('#startContract').get(0).value);
	var endd = new Date($('#endContract').get(0).value);	
	var contract = {
					//"id":null, // New contract ID provided by server
					"contractType":{"id": selected.id//,
									//"name": selected.value
									},
					"startdate": startd.getTime(),
					"expirationdate":endd.getTime()	};
	
	// Get the characterizations as objects
	var sel = getSelectedOption($('#selDepartment').get(0));
	var department = { "id": sel.id};//, "name": sel.value};
	// Industry
	var sel = getSelectedOption($('#selIndustry').get(0));	
	var industry = { "id": sel.id};//, "name": sel.value};
	var ia=[];
	ia[0]=industry;
	// Account Type
	var sel = getSelectedOption($('#selAccountType').get(0));
	var type = { "id": sel.id};//, "name": sel.value};
	// Build the account object
	var account = { //id: window.sessionStorage.getItem("CurrentAccountID"),
					status: 0,//window.sessionStorage.getItem("AccountStatus"),
					name: $('#accountName').get(0).value,
					notes: $('#accountNotes').get(0).value,
					address: $('#accountAddress').get(0).value,
					address2:$('#accountAddress2').get(0).value,
					city: $('#accountCity').get(0).value,
					state: getSelectedOption($('#selState').get(0)).value,
					zip: $('#accountZip').get(0).value,
					country: getSelectedOption($('#selCountry').get(0)).value,
					province: "-1", // Abandoned field
					department: department,
					industries: ia,
					accountType: type,
					contract: contract
					};
	// Finally, account status.
	field = $('#selAccountStatus').get(0);		
	account.status = field.value;

	return account;
}

function commitSiteAdminNew()
{
	// New accounts are established with the original first user name
	// This function prepares the user information for account creation.
	// Assumes the account data is validated and unique
	
	var user = 
	{		
		firstname: $("#firstname").val(),
		middlename: $('#middlename').val(),
		lastname: $('#lastname').val(),
		username: $('#username').val(),
		email: $('#email').val(),
		status: 1, // New User status
		password: "prenostik" // This will be reset immediately
	}	
	return user;
}

function trimAllFields()
{
	// Condition the user data fields for robustness	
	var t = $(":text");
	for(var i=0; i<t.length; i++)	
		t[i].value = t[i].value.trim();	
}

function debugDumpAccount(account)
{
	
	// This is strictly a utility function to assist
	// debugging the complex account object structure
	console.log("Debug dump: Account object detail");
	console.log("status: " + account.status);
	console.log("id: " + account.id);
	console.log("name: " + account.name);
	console.log("notes: " + account.notes);
	console.log("address: " + account.address);
	console.log("address2: " + account.address2);
	console.log("city: " + account.city);
	console.log("state: " + account.state);
	console.log("zip: " + account.zip);
	console.log("country: " + account.country);
	console.log("province: " + account.province);
	console.log("department: " , account.department);
	console.log("industry: " , account.industries[0]);	
	console.log("accountType: " , account.accountType);
	
	// Break out the contract object
	if(account.contract !=null)
	{
		console.log("contract object: " , account.contract);
		console.log("contract ID:" , account.contract.id);
		console.log("contract type:" , account.contract.contractType);
		var sd = new Date(account.contract.startdate);
		var ed = new Date(account.contract.expirationdate);
		console.log("contract Start: ", sd.toLocaleDateString());
		console.log("contract End: ",ed.toLocaleDateString() );
	}	
	else
	console.log("Contract null");
}

// Returns the group object from the select passed in.
function getSelectedOption(selList)
{	
	// Broken in to steps for clarity
	if(selList == null)
		return null;
		
	// Get the index of the currently selected option
	var index = selList.options.selectedIndex;
	// Use the index to get the selected option object
	var selected = selList.options.item(index);		
	// Get the id from the option
	var data = selected.id;
	if(data != -1)
	{
		return selected;
	}
	else
		return null; // No selected option	
}

// This function validates editing changes before submission.
// errors are hilighted.
function isValidAccount()
{
	// Make sure there are no empty "space" only fields
	trimAllFields();
	// This function validates all the Account data fields on all tabs
	// When in edit mode, the Prime user is not included
	if(window.sessionStorage.getItem("AccountMode") == "edit")
	{
		var idList =[
					"anTab",		// Account Name
					"addressTab",	// Account address
					"siteAdminTab", // Account manager user
					"charTab",		// Characteristics
					"licenseTab",	// License type
					"dbTab"			// Database settings
					]
	}
	else
	{
		var idList =[
					"anTab",		// Account Name
					"addressTab",	// Account address
					"siteAdminTab", // Account manager user
					"charTab",		// Characteristics
					"licenseTab",	// License type
					"dbTab"			// Database settings
					]
	}
	
	for(var i in idList)
	{
		var tabID = idList[i];		
		var audit = validateTab(tabID);
		if(audit.valid == false)
		{	// Return the id of the tab that failed audit
			audit.tabID = tabID;
			return audit;
		}
	}
	return audit;
}

function GetCharacterizationList(listName)
{
	// Takes the list name passed in and returns 
	// a handle to the list as well as its crud name.
	var crudName = null;
	var list = null;
	// Now get a handle on the list object itself
	switch (listName)
	{
	case 'department':
		list = $('#selDepartment').get(0);
		crudName = 'department';
	break;
	case 'industry':
		list = $('#selIndustry').get(0);
		crudName = 'industry';
	break;
	case 'account':
		list = $('#selAccountType').get(0);
		crudName = 'accounttype';
	break;
	case 'contract':
		list = $('#selContractType').get(0);
		crudName = 'contracttype';
	break;

	default:
		list = null;
	}
	return { "selList":list, "name":crudName};

}

// This function updates the characterization lists on the server
// with new items. Handles POST, PUT and DELETE via AJAX
function UpdateCharacterization(charObj)
{	
	/*
	charObj={url: 'account', // base url for this type of update
			list: crudName,  // base url for this particular item
			id: editID,		 // ID needed to put and delete
			item: $('#newListValue').get(0).value, // The new text to create (if put or post)
			method: method // REST method
			}
	*/		
    // Build the url for the router
	var href = charObj.url + '/' + charObj.list;
	// Make a small object out of the new item data
	// This is the body in req.body	
	var newitem = {'id':charObj.id, 'name':charObj.item};
	// Put the url for the REST call together with the data	
	var data={'url':href, 'body': newitem};	
	
	var newID;
	// Use AJAX to post the new list object to the server.
	$.ajax({
			url: href,
			data: data,
			async: false, // Can't come back without an ID from the server
			method: charObj.method,			
			dataType: 'json',
			success: function (response) {
				if (response.success) 
				{
					toast.notifySuccess('Success', 'List Item updated successfully.');					
					newID = response.data.id;					
				} 
				else 
				{
					toast.notifyError('Error', 'Error: '+response.error.code+' - '+response.error.message);
				}
			},
		error: function(response){
			//todo: handle error condition gracefully
		}

	});
	
	// Return the id for the new option or null for failure
	return newID;	
}

}) // end of document ready function

