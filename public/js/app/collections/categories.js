var Backbone = require('backbone');
var Category = require('../models/category');


// Categories Collection

// url: /manage/categories
var Categories = Backbone.Collection.extend({
	url: '/api/categories',
	model: Category,
	parse: function(data) {
		console.log(data.categories);
	    if(Array.isArray(data)){
	      console.log('array??');
	      var data = data[0];
	    }
	    return data.categories;
	}
});


module.exports = Categories;