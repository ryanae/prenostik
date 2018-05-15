var Util = require('util');
var Command = require('../../../lib/Command');

module.exports = MyCommand;
Util.inherits(MyCommand, Command);

function MyCommand(injector) {
    Command.call(this, injector);
}

MyCommand.prototype.execute = function() {
    var conf = require('nconf');
    var events = require('events');

    conf.argv().env().file({file: __dirname + '/../../config/config.json'});

    process.env.PORT = conf.get("PORT");
    process.env.NODE_ENV = conf.get("NODE_ENV");
    process.env.ON_LOCALHOST = conf.get("ON_LOCALHOST");
    process.env.DEBUG = conf.get("DEBUG");
    process.env.COOKIE_SECRET = conf.get("COOKIE_SECRET");
    process.env.HTTP_AUTH_ENABLED = conf.get("HTTP_AUTH_ENABLED");
    process.env.HTTP_AUTH_USERNAME = conf.get("HTTP_AUTH_USERNAME");
    process.env.HTTP_AUTH_PASSWORD = conf.get("HTTP_AUTH_PASSWORD");
    process.env.SMTP_SERVICE = conf.get("SMTP_SERVICE");
    process.env.SMTP_USER = conf.get("SMTP_USER");
    process.env.SMTP_PASS = conf.get("SMTP_PASS");
    process.env.EXCEPTION_MAILER_ENABLED = conf.get("EXCEPTION_MAILER_ENABLED");
    process.env.EXCEPTION_MAILER_FROM = conf.get("EXCEPTION_MAILER_FROM");
    process.env.EXCEPTION_MAILER_TO = conf.get("EXCEPTION_MAILER_TO");
    process.env.EXCEPTION_MAILER_SUBJECT = conf.get("EXCEPTION_MAILER_SUBJECT");
    process.env.APP_TITLE = conf.get("APP_TITLE");
    process.env.APP_VERSION = conf.get("APP_VERSION");
    process.env.REST_ENDPOINT = conf.get("REST_ENDPOINT");
	process.env.APP_LOCATION = conf.get("APP_LOCATION");
    process.env.SECURITY_SALT = conf.get("SECURITY_SALT");
    process.env.UNASSIGNED_CATEGORY_LABEL = conf.get("UNASSIGNED_CATEGORY_LABEL");
    process.env.MEMCACHED_HOST = conf.get("MEMCACHED_HOST");

    this.dispatch('LOAD_CONFIGURATION_COMPLETE');
};
