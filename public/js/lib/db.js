var Q = require('q');

var keyPrefix = '';
if(window.location.origin !== 'http://app.dev.prenostik.com'){
	keyPrefix = 'local_';
}

var db = {
	set: function(key, data) {
		var key = keyPrefix + key;
		var deferred = Q.defer();

		$.ajax({
			type: 'POST',
			url:'http://app.dev.prenostik.com/webdis',
			data: "SET/" + key + "/" + JSON.stringify(data),
			dataType: 'json',
			success: function(response) {
				deferred.resolve(response.SET);
			}
		});

		return deferred.promise;
	},

	get: function(key) {
		var key = keyPrefix + key;
		var deferred = Q.defer();

		$.getJSON('http://app.dev.prenostik.com/webdis/GET/'+key+'?callback=?', function(response) {
			deferred.resolve(JSON.parse(response.GET));
		});

		return deferred.promise;
	}
}


module.exports = db;