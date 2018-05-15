var request = require('request');
var _ = require('underscore')._;
var restless = require('restless'); //({ proxy: "http://127.0.0.1:8888" });
var dateFormat = require('dateformat');
var PrenostikUser = require('../../../public/js/app/PrenostikUser');
var fs = require('fs');
var FormData = require('form-data');
var urlFunc = require('url');

var CommonRest = function(app, sid) {
	var self = this;

	this.isReady = false;
	this.app = app;
	this.readyCallback = function() {};

	app.get('sessionStore').get(sid, function(err, data) {
		self.session = data;
		self.doReady();
	});
}

CommonRest.prototype.doReady = function() {
	this.isReady = true;
	this.readyCallback();
};

CommonRest.prototype.ready = function(cb) {
	if (this.isReady)
		cb();
	else
		this.readyCallback = cb;
};

CommonRest.prototype.performRequest = function(method, path, auth, cb) {
	var options = {json: true, method: method, url: process.env.REST_ENDPOINT + path}; //, proxy: 'http://localhost:8888'};
	
	if (typeof auth === "object") {
		options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
		}
		
		cb = auth;
	}	
	request(options, cb);
};

CommonRest.prototype.performPostRequest = function(path, data, knownLength, auth, cb) {
	var options = {json: true, method: 'post', url: process.env.REST_ENDPOINT + path, timeout:300000, gzip: true}; //, proxy: 'http://localhost:8888'};

	if (typeof auth === "object") {
		options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
		}
		cb = auth;
	}
    
	if(knownLength) {
	    var form = new FormData();
		for(var formKey in data) {
			if(formKey === "data"){
				console.log("found data and it is this big: " + knownLength);
				form.append(formKey, data[formKey], {knownLength: knownLength});
			} else {
				form.append(formKey, data[formKey]);
			}
		}

		form.getLength(function(err, length){
			if(err) cb(err);
			var r = request(options, cb);
			r._form = form;
			r.setHeader('content-length', length);

		});

	} else {
		options.form = data;
		request(options, cb);
	}
};

CommonRest.prototype.performRawPostRequest = function(path, data, auth, cb) {
    var options = {json: true, method: 'post', body: data, url: process.env.REST_ENDPOINT + path};//, proxy: 'http://localhost:8888'};
	if (typeof auth === "object") {
        options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
    } else {
        if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
            options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
        }
        cb = auth;
    }
    
    console.log(options);
    request(options, cb);
};

CommonRest.prototype.performAnonymousPost = function(path, data, auth, cb) {
    var options = {json: true, method: 'post', body: data, url: process.env.REST_ENDPOINT + path}

    request(options, auth);
};

CommonRest.prototype.performPutRequest = function(path, data, knownLength, auth, cb) {
	var options = {json: true, method: 'put', url: process.env.REST_ENDPOINT + path}; //, proxy: 'http://localhost:8888'};

	if (typeof auth === "object") {
		options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
		}
		cb = auth;
	}

	if(knownLength) {
	    var form = new FormData();
		for(var formKey in data) {
			console.log(formKey);
			if(formKey === "file"){
				form.append(formKey, data[formKey], {knownLength: knownLength});
			} else {
				form.append(formKey, data[formKey]);
			}
		}

		form.getLength(function(err, length){
			if(err) cb(err);
			var r = request(options, cb);
			r._form = form;
			r.setHeader('content-length', length);

		});

	} else {
		options.form = data;
		request(options, cb);
	}

};

CommonRest.prototype.performRawPutRequest = function(path, data, auth, cb) {
	var options = {json: true, method: 'put', body: data, url: process.env.REST_ENDPOINT + path};//, proxy: 'http://localhost:8888'};
	    
	if (typeof auth === "object") {
		options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
		}
		cb = auth;
	}	
	//console.log('Raw put data options:', options);
	request(options, cb);
};

CommonRest.prototype.performRawDeleteRequest = function(path, data, auth, cb) {
	var options = {json: true, method: 'delete', body: data, url: process.env.REST_ENDPOINT + path}; //, proxy: 'http://localhost:8888'};

	if (typeof auth === "object") {
		options = _.extend(options, {auth: {user: auth[0], pass: auth[1]}});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {auth: {user: this.session.user.username, pass: this.session.user.password}});
		}
		cb = auth;
	}
	request(options, cb)
};


CommonRest.prototype.performGetRequest = function(path, auth, cb) {
	this.performRequest('get', path, auth, cb);
};

CommonRest.prototype.performDeleteRequest = function(path, auth, cb) {
	this.performRequest('delete', path, auth, cb);
};


var exports = module.exports = CommonRest;