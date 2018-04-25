var socket = require('./lib/socket');
var toast = require('./lib/toast');
var hbs = require('hbs');
var moment = require('moment');
var _ = require('underscore');
var Backbone = require('backbone');

window.Handlebars = hbs.handlebars;
require('./app/partials');

$('[data-toggle=tooltip]').tooltip({
  container: 'body'
});

var AnalyzeView = require('./app/analyze');
var DatasetsView = require('./app/datasets');
var WorksheetsView = require('./app/worksheets');

var controller = $('html').attr('class').match(/(.*)-controller/)[1];

describe("Analyze", function() {
  describe("when a an id is passed in", function() {
    it("returns false", function() {
      var analyzeController = new AnalyzeView(socket);

    });
  });
});
