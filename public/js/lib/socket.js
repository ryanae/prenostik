var Socket = function() {
	this.socket = io.connect('/');
}

Socket.prototype.emit = function(event, data) {
	var parts = $.cookie('connect.sid').match(/s:(.*)\.(.*)/);
	var sid = parts[1];
	this.socket.emit(event, sid, data);
};

Socket.prototype.on = function(event, cb) {
	this.socket.on(event, cb);
};

module.exports = new Socket({
    timeout: 300000
  });
