var express = require('express');
var fs = require('fs');
var path = require('path');

var exports = module.exports = function(app) {
	app.configure('development', function() {
		app.use(express.logger('dev'));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function() {
		app.use(express.errorHandler());
	});

	// var clientTemplates = [];
	// fs.readdir(__dirname + '/../views/partials/', function(err, files) {
	// 	if (err) throw err;
	// 	files.forEach(function(filename) {
	// 		var templateName = filename.slice(0, -4);
	// 		clientTemplates.push({
	// 			id: templateName + '-template',
	// 			template: fs.readFileSync(__dirname + '/../views/partials/' + filename).toString()
	// 		});
	// 	});
	// });
	// app.set('clientTemplates', clientTemplates);

	var MemcachedStore = require('connect-memcached')(express);
	var sessionStore = new MemcachedStore({hosts:[process.env.MEMCACHED_HOST]});
	var bodyParser = require('body-parser');
	var compression = require('compression');

	var multer = require('multer');
	var upload = multer({dest: '/tmp'});

	app.set('sessionStore', sessionStore);
	app.set('views', __dirname + '/../views');
	app.set('view engine', 'hbs');
	// app.use(compression());
	app.use(bodyParser.urlencoded({ inflate: true , extended: false, limit: '1gb'}))
	app.use(bodyParser.json({inflate: false, strict: false, limit: '1gb'}));
	app.use(upload.fields([{name:'file'}]));
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/../../public'));
	app.use(express.static(__dirname + '/../../docs'));
	app.use(express.cookieParser());
	app.use(express.session({secret: process.env.COOKIE_SECRET, store: sessionStore, cookie: {httpOnly: false} }));
	app.use(require('../../lib/middleware/SessionHelper')());
	app.use(require('../../lib/middleware/RequestHelper')());
	app.use(require('../../lib/middleware/AuthChecker')());
    //Per Jason's suggestion, insert policy middleware here after authentication and before router???
	app.use(app.router);
	app.use(function(req, res){
	  var newUrl = process.env.APP_LOCATION + '#' + req.url;
	  return res.redirect(newUrl);
	});

	app.get('/*',function(req,res,next){
       res.header('Cache-Control', 'no-cache');
       next();
    });

    app.get('/tests', function(req, res){
	    res.sendfile(path.resolve('./public/js/app/spec/test.html'));
    });

    app.get('/docs', function(req, res){
    	if(process.env.APP_LOCATION.indexOf('http://localhost:3000/') >= 0){
		    res.sendfile(path.resolve('./docs/app.html'));
    	} else {
    		res.redirect('/');
    	}
    });

};
