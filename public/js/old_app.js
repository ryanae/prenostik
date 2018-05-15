// Main Client-side javascript file
// ________
$ = global.jQuery = require('jquery');


// Import all third party dependencies
// using browserify.
// Some dependencies may have to be modified.
// This makes dependencies global to the entire application 
// In the future refactors, these should only be used in files
// that need them. 
require("./vendor/spin.min");
require("./vendor/jquery.cookie");
require("./vendor/foundation.datepicker");
require("./vendor/select2.min");
require("./vendor/date.format");
require("./vendor/dateutil");
require("./vendor/date");
require("./vendor/highstock-2.0.4/js/highstock");
require("./vendor/highstock-2.0.4/js/modules/exporting");
require("./vendor/jquery/jquery.dataTables");
require("./vendor/tabletools/TableTools");
require("./vendor/tabletools/ZeroClipboard");
require("./vendor/jquery.isloading.min");
require('./vendor/bootstrap/bootstrap-transition');
require('./vendor/bootstrap/bootstrap-alert');
require('./vendor/bootstrap/bootstrap-modal');
require('./vendor/bootstrap/bootstrap-tooltip');
require('./vendor/bootstrap/bootstrap-affix');
require('./vendor/bootstrap/bootstrap-dropdown');
require('./vendor/bootstrap/bootstrap-scrollspy');
require('./vendor/bootstrap/bootstrap-tab');
require('./vendor/bootstrap/bootstrap-popover');
require('./vendor/bootstrap/bootstrap-button');
require('./vendor/bootstrap/bootstrap-collapse');
require('./vendor/bootstrap/bootstrap-carousel');
require('./vendor/bootstrap/bootstrap-typeahead');
require('./vendor/bootstrap/bootstrap-contextmenu.custom');
require('./vendor/bootstrap/bootstrap-switch');
require('./vendor/bootstrap/bootstrap-select');
require('./vendor/bootbox/bootbox');
require('./vendor/flat-ui/flatui-checkbox.custom');
require('./vendor/flat-ui/flatui-radio');
require('./vendor/jquery/jquery.ui');
require('./vendor/jquery/jquery.select2');
require('./vendor/jquery/jquery.sprintf');
require('./vendor/jquery/jquery.toastr');
require('./vendor/jquery/jquery.helpers');
require('./vendor/jquery.tablesorter.min');


// Marionette and their dependencies imported.
// Along with the `localStorage` wrapper [store.js](https://github.com/marcuswestin/store.js/)
_ = require('underscore');
require('underscore.normalize');
var Backbone = require('backbone');
var store = require('store');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

var React = require('react');

// The application depends heavily on jQuery. So, we
// enclose the application in a self-invoking function
// that is called when the page is loaded and jQuery
// is ready. 
(function($) {
  // Import custom libraries and handlebars
  var moment = require('moment');
  var socket = require('./lib/socket');
  var toast = require('./lib/toast');
  var form = require('./lib/form');

  // Bind handlebars to the window for easy access
  window.Handlebars = require('hbsfy/runtime');

  // Register titlecase template helper 
  Handlebars.registerHelper(function titleCase (str) {
    if (typeof str === 'undefined') return '';

    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  });

  Handlebars.registerHelper('YYYY-MM-DD', function(date) {
      return moment(date).utc().format('YYYY-MM-DD');
  });
  // load all templates here
  // require('./app/partials');

  // Instantiate Bootstrap's tooltip plugin
  $('[data-toggle=tooltip]').tooltip({
    container: 'body'
  });

  // Import account related js files
  var PrenostikUser = require('./app/PrenostikUser');
  var accountsCommon = require('./app/accountsCommon');
  var controller = $('html').attr('class').match(/(.*)-controller/)[1];
  var Analyze, Dataset, Worksheet, analyzeController,
    datasetController, worksheetController;

  // Import Backbone views
  var SnapshotsView = require('./app/views/snapshot');
  var AnalyzeView = require('./app/views/analyze');
  var HomeView = require('./app/views/home');
  var DatasetsView = require('./app/views/dataset');
  var CategoryUpdateView = require('./app/views/categoryUpdate');

  var AnalyzeComponent = require('./app/reactapp/views/analyze');


  // `closeDropdown` ensures the dropdown is not
  // to be left open after view changes from
  // `SnapshotsView` to `DatasetsView`
  var closeDropdown = function(){
      var manageDropdown = $('#manage-dropdown');
      if (manageDropdown.parent().hasClass('open')) {
        $('#manage-dropdown').dropdown('toggle');
      }
  };

  // Approuter extended to manage all frontend routes
  // that are supported by Backbone (ie. has Backbone View)
  var AppRouter = Marionette.AppRouter.extend({
    routes: {
      "(/)": "home",
      "analyze/trending(/:snapshotId)": "trending",
      "manage/snapshots(/:categoryId)": "snapshot",
      "manage/datasets(/:categoryId)": "dataset",
      "manage/categories/update/:categoryType/:id": "updateCategory"
    },

    home: function(){
      var self = this;
      var analyzeView = $('.analyze-view');
      if (analyzeView.length > 0) {
        this.view.prepareRemove(function(result){
          if(result){
            analyzeView.hide();
            analyzeView.siblings().remove();
            self.loadView(new HomeView(socket));
          } else {
            window.router.navigate('analyze/trending');
          }
        });
      } else {
        $('#container').empty();
        this.loadView(new HomeView(socket));
      }
    },

    trending: function(snapshotId) {
      var support = new accountsCommon();
      var currentUser = support.getAuthUser();
      if(!currentUser.canDo('SN_OPEN')){
        snapshotId = null;
      }

      // React.render(<Analyze />, $('#container'));

    },

    snapshot: function(categoryId) {
      var self = this;
      var analyzeView = $('.analyze-view');
      if (analyzeView.length > 0) {
        this.view.prepareRemove(function(result){
          if(result){
            analyzeView.hide();
            analyzeView.siblings().remove();
            self.loadView(new SnapshotsView(socket, categoryId));
            closeDropdown();
          } else{
            window.router.navigate('analyze/trending');
          }
        });
      } else {
        $('#container').empty();
        this.loadView(new SnapshotsView(socket, categoryId));
        closeDropdown();
      }
    },

    dataset: function(categoryId) {
      var self = this;
      var analyzeView = $('.analyze-view');
      if (analyzeView.length > 0) {
        this.view.prepareRemove(function(result){
          if(result){
            analyzeView.hide();
            analyzeView.siblings().remove();
            self.loadView(new DatasetsView(socket, categoryId));
            closeDropdown();
          } else {
            window.router.navigate('analyze/trending');
          }
        });
      } else {
        $('#container').empty();
        this.loadView(new DatasetsView(socket, categoryId));
        closeDropdown();
      }
    },

    updateCategory: function(categoryType, id) {
      this.loadView(new CategoryUpdateView(socket, id, categoryType));
    },


    loadView: function(view) {
      $('#flashContainer').empty();
      this.view && this.view.unbind() && this.view.remove();
      this.view = view;
    }
  });

  //instatiate the AppRouter subclass and bind
  //to window under name `router`
  window.router = new AppRouter();

  // Make sure Controller files are still being used
  // for non-Backbone supported views
  if (controller === 'categories') new (require('./app/categories'))(socket);
	if (controller === 'accounts') new (require('./app/accounts'))(socket);
	if (controller === 'corporate') new (require('./app/corpaccounts'))(socket);
	if (controller === 'users') new (require('./app/login'))(socket);

  if (controller === 'datasets' &&
    window.location.pathname.indexOf('/manage/datasets/add/preview') >= 0) {
    new (require('./app/datasets'))(socket);
  }


  // clear snapshot cache on logout
  $('a[href="/users/logout"]').off().on('click', function(e) {
    e.preventDefault();
    var support = new accountsCommon();
    var currentUser = support.getAuthUser();
    cachedSnapshots = store.get('snapshots:'+currentUser.id);
    if(cachedSnapshots){
      for (k in cachedSnapshots){
        key = k + ':' + cachedSnapshots[k];
        store.remove(key)
      }
    }
    store.remove('snapshots:'+currentUser.id);
    window.location = "/users/logout";
  });

  var forceModalClose = function() {
    $('#openWorksheetModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  };

  // make sure backbone ignores any links that are
  // *NOT* supported by the app's router
  $(document).on('click', "a[href^='/']", function(e) {
    var href, passThrough, isRoot;
    href = $(e.currentTarget).attr('href');
    passThrough = href.indexOf('users/') >= 0 || href.indexOf('manage/categories/add') >= 0 || href.indexOf('corporate/') >= 0 || href.indexOf('manage/datasets/append') >= 0|| href.indexOf('manage/datasets/add') >= 0;
    isRoot = href == "/";
    if (!isRoot && !passThrough && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      var url = href.replace(/^\//, '');
      router.navigate(url, {
        trigger: true
      });
      return false;
    }
  });

  // ### HACK
  // ```
  //   var routeUrl = window.location.pathname.slice(1);
  //   if(routeUrl.split('/').length === 3 && routeUrl.indexOf('analyze/trending/') >= 0){
  //     router.navigate(routeUrl, {trigger: true});
  //   }
  //```


  // Instantiate the Marionette Application
  var Prenostik = new Marionette.Application();

  // Set `div#container` element as the app's region
  Prenostik.addRegions({
    appRegion: '#container'
  });


  // Add pushstate for clean url routes
  Prenostik.on('start', function() {
    Backbone.history.start({
      pushState: true,
    });
  });


  // Finally start the application
  Prenostik.start();

})(jQuery);


