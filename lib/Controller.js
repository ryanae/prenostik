var path = require('path');

module.exports = Controller;

function Controller(injector) {
    this.models = null;
	this.app = null;

    injector.injectInto(this);
}

Controller.prototype.render = function(req, res, template, params) {
	params = params || {};

    params.AppTitle = (typeof process.env.APP_TITLE !== 'undefined') ? process.env.APP_TITLE : '';
    params.AppVersion = (typeof process.env.APP_VERSION !== 'undefined') ? process.env.APP_VERSION : '';

    params.Sitemap = require('../app/config/sitemap')(req.session.user);

	params.user = req.session.user;

	params.clientTemplates = this.app.get('clientTemplates');

    params.flashMessages = req.session.flashMessages;
    params.toastMessages = req.session.toastMessages;

	res.render(this.getTemplatePath(template), params);

    req.session.flashMessages = [];
    req.session.toastMessages = [];
};

Controller.prototype.getTemplatePath = function(template) {
    return this.name + path.sep + template;
};