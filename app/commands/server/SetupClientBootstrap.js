var Util = require('util');
var Command = require('../../../lib/Command');
var Injector = require('medic-injector').Injector;
var ClientEventDispatcher = require('../../../lib/ClientEventDispatcher');
var ClientCommandMap = require('../../../lib/ClientCommandMap');

module.exports = MyCommand;
Util.inherits(MyCommand, Command);

function MyCommand(injector) {
    Command.call(this, injector);

    this.injector = injector;
    this.io = null;
    this.app = null;

    injector.injectInto(this);
}

MyCommand.prototype.execute = function(socket) {
    var injector = new Injector();
    var eventDispatcher = new ClientEventDispatcher(this.io, socket);

    injector.addMapping('eventDispatcher').toValue(eventDispatcher);
    injector.addMapping('app').toValue(this.app);

    var commandMap = new ClientCommandMap(injector);

    new (require('../../bootstraps/ClientBootstrap'))(commandMap);

    this.dispatch('SETUP_CLIENT_BOOTSTRAP_COMPLETE');
};
