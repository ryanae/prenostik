var Backbone = require('backbone');

var Dataset = Backbone.Model.extend({
});

// Datasets Collection

// url: /manage/datasets
var Datasets = Backbone.Collection.extend({
	url: '/api/datasets',
	model: Dataset,
});


module.exports = Datasets;