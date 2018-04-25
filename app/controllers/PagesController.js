var Util = require('util');
var path = require('path');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
    Controller.call(this, injector);

    this.name = 'Pages';
}

MyController.prototype.home = function(req, res) {
	// If the user is already logged in, 'user' will not be null.
	// The user object is assigned to the session at login.
    if (req.session.user) {
        var self = this;
        var injector = new Injector();
        return new RenderAction('index', self, injector, arguments);
    }
	// Otherwise, drop to the login screen.
	res.redirect('/users/login');
};

