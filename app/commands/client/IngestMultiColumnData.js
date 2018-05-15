var Util = require('util');
var Command = require('../../../lib/ClientCommand');
var dateFormat = require('dateformat');
var _ = require('underscore')._;

module.exports = MyCommand;
Util.inherits(MyCommand, Command);

function MyCommand(injector) {
    Command.call(this, injector);

    this.injector = injector;

    this.app = null

    injector.injectInto(this);
}

MyCommand.prototype.execute = function(sid, params) {
    var PrenostikRest = new (require('../../controllers/components/PrenostikRest'))(this.app, sid);

    var self = this;
    PrenostikRest.ready(function() {

    });
}