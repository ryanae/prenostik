var exports = module.exports = function(router) {
	/* In this file, you set up routes to your controllers and their actions.
	 * Routes are very important mechanism that allows you to freely connect
	 * different urls to chosen controllers and their actions (functions). */

	router.get('/', 'PagesController.home');
	// Controller for individual logged in user functions
	router.get('/users/auth', 'UsersController.getAuth');
	router.all('/users/login', 'UsersController.login');
	router.get('/users/logout', 'UsersController.logout');
	router.get('/users/profile', 'UsersController.profile');
	router.post('/users/profile', 'UsersController.update');
	router.get('/relogin', 'UsersController.relogin');
	router.post('/relogin', 'UsersController.resetLogin');

	// Authentication problems
	router.get('/users/forgot', 'UsersController.forgot');
	router.post('/users/forgot', 'UsersController.resetAnon');
	router.get('/expired_pass', 'UsersController.expired_pass');
	router.post('/expired_pass', 'PagesController.home');
	router.get('/expired_account', 'UsersController.expired_account');
	router.post('/expired_account', 'PagesController.home');
	router.get('/lockout', 'UsersController.lockout');
	router.post('/lockout', 'PagesController.home');

	// Controller for user account management functions
	router.all('/users/accounts', 'AccountsController.accounts');
	router.get('/users/add_user', 'AccountsController.add_user');
	router.get('/users/add_user/:id', 'AccountsController.add_user');
	router.get('/users/delete_user', 'AccountsController.delete_user');
	router.get('/users/delete_user/:id', 'AccountsController.delete_user');
	router.post('/users/accounts_delete_user', 'AccountsController.accounts_delete_user');
	router.get('/users/edit_user', 'AccountsController.edit_user');
	router.get('/users/edit_user/:id', 'AccountsController.edit_user');
	router.post('/users/pw_reset_admin', 'AccountsController.pw_reset_admin');

	router.post('/users/accounts_add_user', 'AccountsController.accounts_add_user');
	router.post('/users/update_user', 'AccountsController.update_user');
	router.get('/users/edit_role', 'AccountsController.edit_role');
	router.get('/users/edit_role/:id', 'AccountsController.edit_role');
	router.get('/users/edit_all_roles', 'AccountsController.edit_all_roles');
	router.get('/users/edit_all_roles/:id', 'AccountsController.edit_all_roles');
	router.post('/users/accounts_set_user_roles', 'AccountsController.accounts_set_user_roles');
	router.post('/users/accounts_update_role_membership', 'AccountsController.accounts_update_role_membership');
	router.put('/users/site_users', 'UsersController.get_siteUsers');

	// Controller for software access accounts management
	router.get('/corporate/corpaccounts', 'CorporateController.corpaccounts');
	router.get('/corporate/mnu_edit_account', 'CorporateController.mnu_edit_account');
	router.get('/corporate/mnu_add_account', 'CorporateController.mnu_add_account');
	router.get('/corporate/mnu_deactivate_account', 'CorporateController.mnu_deactivate_account');
	router.post('/corporate/deactivate_account', 'CorporateController.deactivate_account');
	router.all('/corporate/delete_account', 'CorporateController.delete_account');
	router.post('/corporate/corpaccounts_add_account', 'CorporateController.corpaccounts_add_account');

	// Characterization list maintenance
	router.put('/corporate/account/department', 'CorporateController.edit_charItem');
	router.post('/corporate/account/department', 'CorporateController.add_charItem');
	router.delete('/corporate/account/department', 'CorporateController.del_charItem');
	router.put('/corporate/account/industry', 'CorporateController.edit_charItem');
	router.post('/corporate/account/industry', 'CorporateController.add_charItem');
	router.delete('/corporate/account/industry', 'CorporateController.del_charItem');
	router.post('/corporate/account/accounttype', 'CorporateController.add_charItem');
	router.put('/corporate/account/accounttype', 'CorporateController.edit_charItem');
	router.delete('/corporate/account/accounttype', 'CorporateController.del_charItem');
	router.put('/corporate/account/contracttype', 'CorporateController.edit_charItem');
	router.post('/corporate/account/contracttype', 'CorporateController.add_charItem');
	router.delete('/corporate/account/contracttype', 'CorporateController.del_charItem');

	// router.get('/analyze/trending', 'AnalyzeController.trending');
	router.get('/analyze/render', 'AnalyzeController.renderTrending');

	router.get('/api/datasets', 'DatasetsController.index');
	router.get('/api/datasets/filtercategory/:id', 'DatasetsController.filter');
	router.all('/manage/datasets/add', 'DatasetsController.add');
	router.all('/api/datasets/update/:id', 'DatasetsController.update');
	router.all('/api/datasets/multiupdate', 'DatasetsController.multiUpdate');
	router.all('/manage/datasets/append', 'DatasetsController.append');
	router.all('/api/datasets/append/:id', 'DatasetsController.append');
	router.all('/api/datasets/delete/:id', 'DatasetsController.delete');
    router.all('/api/datasets/multidelete', 'DatasetsController.multiDelete');
	router.all('/api/datasets/get', 'DatasetsController.getDatasets');

	router.all('/manage/datasets/add/preview', 'DatasetsController.previewMultiColumn');
	router.all('/manage/datasets/injest/multicolumn', 'DatasetsController.ingestMultiColumn');
	router.get('/api/datasets/render', 'DatasetsController.renderDatasets');
	router.get('/api/datasets/renderFilter', 'DatasetsController.renderDatasetsFilter');

	router.get('/api/categories', 'CategoriesController.list');
	router.get('/api/categories/get/:id', 'CategoriesController.get');
	router.get('/api/categories/list', 'CategoriesController.list');
	router.all('/manage/categories/add', 'CategoriesController.add');
	router.all('/manage/categories/add/:type', 'CategoriesController.add');
	router.all('/manage/categories/update', 'CategoriesController.update');
	router.all('/manage/categories/update/:id', 'CategoriesController.update');
	router.all('/manage/categories/delete/:id', 'CategoriesController.delete');

	router.get('/api/snapshots', 'WorksheetsController.index');
	router.get('/api/snapshots/filtercategory/:id', 'WorksheetsController.filter');
	router.all('/api/snapshots/add', 'WorksheetsController.add');
	router.all('/api/snapshots/clone/:id', 'WorksheetsController.clone');
	router.all('/api/snapshots/update', 'WorksheetsController.update');

	router.all('/api/snapshots/multiupdate', 'WorksheetsController.multiUpdate');
	router.all('/api/snapshots/get/:id', 'WorksheetsController.get');//new worksheet/snapshot *LH*
	router.all('/api/snapshots/list', 'WorksheetsController.list');
	router.all('/api/snapshots/delete/:id', 'WorksheetsController.delete');
	router.all('/api/snapshots/multidelete', 'WorksheetsController.multiDelete');
	router.get('/api/snapshots/render', 'WorksheetsController.renderSnapshots');
	router.get('/api/snapshots/renderFilter', 'WorksheetsController.renderSnapshotsFilter');

	router.get('/api/snapshots/:id/forecasts', 'WorksheetsController.listForecasts');
	router.get('/api/snapshots/:id/forecasts/delete/:forecastId', 'WorksheetsController.deleteForecast');
	router.post('/api/snapshots/:id/forecasts/add', 'WorksheetsController.addForecast');
	router.post('/api/snapshots/:id/forecasts/update/:forecastId', 'WorksheetsController.saveForecast');
};
