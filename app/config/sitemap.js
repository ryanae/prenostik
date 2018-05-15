var PrenostikUser = require('../../public/js/app/PrenostikUser');

var exports = module.exports = function(user) {

    var getPrimaryNavigation = function(user) {

        if (user) {
            return [
/*                {
                    url: '/overview',
                    name: 'Overview'
                },
                {
                    url: '/discover',
                    name: 'Discover'
                },*/
                {
                    url: '/analyze/trending',
                    name: 'Analyze'
                },
                {
                    url: '/manage',
                    name: 'Manage',
                    children: [
                        {
                            url: '/manage/snapshots',
                            name: 'Snapshots'
                        },
                        {
                            url: '/manage/datasets',
                            name: 'Data Sets'
                        },
                    ]
                }
            ];
        } else {
            return [];
        }

    };

    var getAccountNavigation = function(user) {
        if (user) {
			
			// Build menu based on group membership
			var mnuAccounts = null;
			var mnuCompanies = null;
			var mnuCompany = null;
			
			var myUser = new PrenostikUser(user);			
			
			// Only Prenostik Account Manager/Admin can see this menu
			if(myUser.canDoMenu("MNU_ACCOUNT_ADMIN") == true)			
			{				
				mnuCompanies = {url: '/corporate/corpaccounts',
								name: 'Manage Customer Accounts'}		
			}
			/*
			else
			{	// Enable this to allow a site user to manager their company account.		
				if(myUser.canDoMenu("MNU_MANAGE_COMPANY") == true)			
				{				
					mnuCompany = {url: '/corporate/edit_account',
								  name: 'Manage Accounts'}		
				}
			}
			*/
			// A Site admin manages user accounts at a site.
			if(myUser.canDoMenu("MNU_SITE_ADMIN") == true)
			{
				mnuAccounts = {	url: '/users/accounts',
								name: 'Manage Users'}
            }
			
			// No need for both menu items to show for superusers
			if(mnuCompanies != null)
				mnuCompany = null;
				
			var mnuItems = [{	label: myUser.firstname + ' ' + myUser.lastname,
								url: '/users/profile',
								id: 'mnulogout',
								name: 'Edit Personal Profile'},
								mnuAccounts,
								mnuCompanies,								
							{	//id: 'mnulogout',
								url: '/users/logout',
								name: 'Logout'}
							]
			// Add the children to the menu
			var mnuChildren =[];
			for (var i in mnuItems) {
				var mnuItem = mnuItems[i]; // Get a menu item
				if(mnuItem != null)
				{
					var obj = {
							label: mnuItem.label,							
							url: mnuItem.url,
							id: mnuItem.id,							
							name: mnuItem.name
						};			
					mnuChildren.push(obj);
				}
			}
			// Return the finished menu
            return [
                {   // Add the customer account name to the menu bar                
                    name: '<i class="icon-globe"></i>&nbsp; ' + myUser.account.name,
					state:'disabled'
                },			
                {				
                    url: '/users/profile',
                    name: '<i class="icon-user"></i> &nbsp; Account',
                    children: mnuChildren
                }

            ];
        } else {
            return [
                {url: '/users/login', name: 'Login'}
            ];
        }
    };
	
    return {
        primary: getPrimaryNavigation(user),
        account: getAccountNavigation(user),
    };
};

