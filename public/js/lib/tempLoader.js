var hbs = require('hbs');
var Q = require('q');

var Tpl = {

	loadTemplate:  function(name) {
		var deferred = Q.defer();
		$.get('/templates/'+ name + '.hbs', function(template){
			var compiledTemp = hbs.handlebars.compile($(template).html());
			deferred.resolve(compiledTemp);
		});
		return deferred.promise;
	},

	getTemplate: function(name) {
		this.loadTemplate(name).then(function(template){
			return template;
		});
	}
};


module.exports = Tpl;