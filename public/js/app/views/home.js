var toast = require('../../lib/toast'),
   hbs = require('hbsfy/runtime'),
   _ = require('underscore'),
   store = require('store'),
   Backbone = require('backbone');

Backbone.$ = $;

//templates
var homeTpl = require('../../../templates/home.hbs');
var listWorsheetsTableTpl = require('../../../templates/list-worksheets-table.hbs');

var HomeView = Backbone.View.extend({

  el: $('#container'),

  template: homeTpl,

  events: {
    "click .btn-open-worksheet": "worksheetModalHandler",
    "click .btn-open": "openWorksheetHandler",
  },

  initialize: function(socket) {
    _.bindAll(this, 'render');
    this.socket = socket;
    //this.app = app;
    this.render();
  },

  remove: function() {
        this.$el.empty().off(); /* off to unbind the events */
        this.stopListening();
        return this;
  }, 

  render: function() {
    store.clear();
    $('#container').html(this.template);
  },

  loadModal: function() {
    $('#openWorksheetModal').find('.modal-body').html('<div class="well"><img src="/img/ajax-loader-circle.gif"/> &nbsp; Loading Snapshots...</div>');
    $('#openWorksheetModal').modal('show');

    $.ajax({
      url: '/api/snapshots/list',
      dataType: 'json',
      success: function(response) {
        var data = {
          worksheets: response
        };
        var html = listWorsheetsTableTpl(data);
        $('#openWorksheetModal').find('.modal-body').html(html);
      }
    });
  },

  worksheetModalHandler: function(e) {
    e.preventDefault();
    this.loadModal();
  },

  openWorksheetHandler: function(e) {
    e.preventDefault();
    var href = $(e.currentTarget).attr('href');
    console.log(href);
    $('#openWorksheetModal').modal('hide');
    window.router.navigate(href, {trigger: true});
  }
});

module.exports = HomeView;
