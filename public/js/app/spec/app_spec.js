require('../../vendor/bootstrap/bootstrap-transition');
require('../../vendor/bootstrap/bootstrap-alert');
require('../../vendor/bootstrap/bootstrap-modal');
require('../../vendor/bootstrap/bootstrap-dropdown');
require('../../vendor/bootstrap/bootstrap-scrollspy');
require('../../vendor/bootstrap/bootstrap-tab');
require('../../vendor/bootstrap/bootstrap-tooltip');
require('../../vendor/bootstrap/bootstrap-popover');
require('../../vendor/bootstrap/bootstrap-button');
require('../../vendor/bootstrap/bootstrap-collapse');
require('../../vendor/bootstrap/bootstrap-carousel');
require('../../vendor/bootstrap/bootstrap-typeahead');
require('../../vendor/bootstrap/bootstrap-contextmenu.custom');
require('../../vendor/bootstrap/bootstrap-switch');
require('../../vendor/bootstrap/bootstrap-select');
require('../../vendor/bootbox/bootbox');
require('../../vendor/flat-ui/flatui-checkbox.custom');
require('../../vendor/flat-ui/flatui-radio');
require('../../vendor/jquery/jquery.ui');
require('../../vendor/jquery/jquery.select2');
require('../../vendor/jquery/jquery.sprintf');
require('../../vendor/jquery/jquery.toastr');
require('../../vendor/jquery/jquery.helpers');

(function($) {
  var socket = require('../../lib/socket');
  var toast = require('../../lib/toast');
  var hbs = require('hbs');
  var moment = require('moment');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var sinon = require('sinon');
  Backbone.$ = $;

  window.Handlebars = hbs.handlebars;
  // require('../../app/partials');

  $('[data-toggle=tooltip]').tooltip({
    container: 'body'
  });

  var HomeView = require('../../app/views/home');
  var AnalyzeView = require('../../app/views/analyze');
  var DatasetsView = require('../../app/views/dataset');
  var SnapshotsView = require('../../app/views/snapshot');


  describe('Home view', function() {
    var homeView = new HomeView(socket);
    describe("when going to home page", function() {
      it("Home backbone view will render", function() {
        homeView.render();
      });
    });

    describe("when clicking open worksheet button", function() {
      it("snapshot modal will open", function() {
        var spy = sinon.spy(homeView, 'worksheetModalHandler')
        $('.btn-open-worksheet').click(function(){
          sinon.assert.called(spy);
        });
      });
    });
  });


  describe("Analyze", function() {
    var analyzeView = new AnalyzeView(socket);
    describe("when going to trending page", function() {
      it("analyze view initializes", function() {
        analyzeView.ctxTrending !== null;
      });
    });

    describe("when creating a new tab", function() {
      it("increases tab count by one", function() {
        var currentTabCount = analyzeView.tabCount;
        $('.btn-create-tab').click(function(){
          analyzeView.tabCount === currentTabCount + 1;
        });
      });
    });

    describe("when clicking the remove tab button", function() {
      it("tab count decreases by one", function() {
        var currentTabCount = analyzeView.tabCount;
        $('.btn-remove-tab').click(function(){
          analyzeView.tabCount === currentTabCount - 1;
        });
      });
    });

    describe("when no options is found", function() {
      it("the correlation chart is not loaded", function() {
        var currentTabCount = analyzeView.tabCount;
        analyzeView.createTab();
        analyzeView.tabCount === currentTabCount + 1;
      });
    });

    describe("when snapshot has not been saved", function() {
      it("save button appears", function() {
        var currentTabCount = analyzeView.tabCount;
        analyzeView.createTab();
        analyzeView.tabCount === currentTabCount + 1;
      });
    });

  });


  //Datasets
  describe("Datasets", function() {
    var datasetsView = new DatasetsView(socket);
    describe("when going to datasets age", function() {
      it("renders datasets view", function() {
        datasetsView.render();
      });
    });

    describe("when clicking add dataset", function() {
      it("increases filecount by one", function() {
        var currentFileCount = datasetsView.fileCount;
        datasetsView.addDataset();
        datasetsView.fileCount === currentFileCount + 1;
      });
    });
  });


  //Worksheets
  describe("Snapshots", function() {
    var snapshotsView = new SnapshotsView(socket);
    describe("when goign to worksheets page", function() {
      it("renders worksheets view", function() {
        snapshotsView.render();
      });
    });
  });


  //Categories
  describe("Categories", function() {
  });
})(jQuery);
