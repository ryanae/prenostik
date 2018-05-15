var toast = require('../../lib/toast'),
    hbs = require('hbsfy/runtime'),
    _ = require('underscore'),
    Backbone = require('backbone');

Backbone.$ = $;

var Category = require('../models/category');
var category = new Category()

var categoryUpdateTpl = require('../../../templates/category-update.hbs');

var CategoryUpdateView = Backbone.View.extend({
	el: $('#container'),

	template: categoryUpdateTpl,

	events: {
		'click #btn-continue': 'onUpdateClick',
		'click #btn-cancel': 'onCancelClick'
	},

	initialize: function(socket, id, categoryType) {
		_.bindAll(this, 'render');
		this.socket = socket;
		this.categoryId = id;
		this.categoryType = categoryType;
		this.render();
	},

	remove: function() {
	      this.$el.empty().off(); /* off to unbind the events */
	      this.stopListening();
	      return this;
	},

	render: function() {
		var self = this;
		category.fetch({
			url: '/api/categories/get/' + this.categoryId,
			success: function() {
				var categoryData = category.toJSON();
				var html = self.template({category: categoryData});
				$('#container').html(html);
			}
		});
		return this;
	},

	onUpdateClick: function(e) {
		console.log('clicked');
		e.preventDefault();

	},

	onCancelClick: function() {
		console.log('clicked');
		window.router.navigate('/manage/'+this.categoryType+'/'+this.categoryId);


	}
});

module.exports = CategoryUpdateView;