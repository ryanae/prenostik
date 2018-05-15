var toast = require('../../lib/toast'),
    hbs = require('hbsfy/runtime'),
    _ = require('underscore'),
    Q = require('q'),
    Backbone = require('backbone');
Backbone.$ = $;

var Categories = require('../collections/categories');
var Snapshots = require('../collections/snapshots');

var snapshots = new Snapshots();
var categories = new Categories();

//templates
var worksheetsTpl = require('../../../templates/worksheets.hbs');
var categoryPane = require('../../../templates/wk-category-pane.hbs');

var SnapshotsView = Backbone.View.extend({

  el: $('#container'),

  template: worksheetsTpl,

  events: {
    'click .btn-select-all': 'toggleSelectAll',
    'click .btn-multidelete': 'multiDelete',
    'click .btn-categorize': 'assignCategory',
    'click .btn-rename': 'renameSnapshot',
    'click .btn-delete': 'onDeleteClick',
    'click .btn-delete-category': 'onCategoryDeleteClick',
    'click .btn-edit': 'onCategoryEditClick',
    'click #categorizeSubmit': 'onCategorySelect',
    'click .dataset-dropdown': 'toggleLinkedDatasets'
  },

  initialize: function(socket, filterId) {
    _.bindAll(this, 'render', 'addAll');
    this.socket = socket;
    this.filterId = filterId;
    this.render();
  },

  remove: function() {
      this.$el.empty().off(); /* off to unbind the events */
      this.stopListening();
      return this;
  },

  render: function() {
    $.isLoading({ text: "Loading Snapshot List View"});
    var self = this;

    var opts = {
      reset: true,
      success: self.addAll
    }

    var categoryOpts = {
      data: {type: 1},
      reset: true,
    }

    if(this.filterId) {
      opts.data = $.param({id: self.filterId});
      categoryOpts.data.activeId = self.filterId;
    }

    self.initializeSnapshots(opts.data, function(snapshotData){
      self.initializeCategories(categoryOpts.data, function(categoryData){
        categories.reset(categoryData.categories);
        snapshots.reset(snapshotData);
        self.addAll();
        $.isLoading('hide');
      });
    });

  },

  initializeCategories: function(data, cb){
    $.ajax({
      url: '/api/categories',
      dataType: 'json',
      data: data,
      success: function(response) {
        cb(response);
      }
    })

  },

  initializeSnapshots: function(data, cb){
    $.ajax({
      url: '/api/snapshots',
      dataType: 'json',
      data: data,
      success: function(response) {
        cb(response);
      }
    })
  },

  addAll: function(){
    var self = this;
    var snapshotData = snapshots.toJSON()
    var categoryData = categories.toJSON()
    var data = {
      'worksheets': snapshotData,
      'categories': categoryData
    };
    var html = this.template(data);
    $('#container').html(html);
    $('html').attr('class', 'worksheets-controller');

    var activeElem = $('#category-pane .active');
    var headerPane = $('.header-pane');
    if (activeElem.length === 0) {
      $('li.nav-header').addClass('active');
    }
    if (headerPane.length === 0) {
      $('.span9').prepend('<div class="flat-well well-small header-pane"><h4 style="margin:0">All Categories</h4></div>');
    }

    self.setupTable();
    self.delegateEvents(self.events);
  },

  applyRowEvent: function () {
    var self = this;
    $('.header-fixed > tbody > tr').off().on('click', function(e) {
        e.preventDefault();
        if($(this).hasClass('selected-rows')){
          $(this).removeClass('selected-rows');
        } else {
          $(this).addClass('selected-rows');
        }
        $('.selected-rows').draggable({
          //option: { disabled: false },
          helper: self.onDragCategory,
          cursorAt: {
            left: -5,
            bottom: 5
          },
          cursor: 'move',
          distance: 10,
          delay: 100,
          scope: 'category',
          revert: 'invalid'
        });

    });
  },

  setupTable: function() {
    var self = this;

    //Initialize table manipulation
    $('.table.no.worksheets').dataTable({
      "bPaginate": false,
      "bLengthChange": false,
      "bFilter": true,
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "aoColumns": [
        /* Name */ null,
        /* Created */ null,
        /* Actions */ {
          "bSearchable": false,
          "bSortable": false
        }
      ],
      "sDom": "<'row-fluid tabletool-pane'<'span8'T><'span4'f>r>t<'row-fluid'<'span6'i><'span6'p>>", //"sDom": 'T<"clear">lfrtip',
      "oTableTools": {
        "sRowSelect": "multi",
        "sSwfPath": "/img/tabletools/copy_csv_xls_pdf.swf",
        "aButtons": [ //"select_all", "select_none",
          /*{
           "sExtends":    "text",
           "sButtonText": "<i class='icon-edit'></i> Categorize",
           "sButtonClass": "btn btn-primary",
           "fnInit": function ( nButton, oConfig ) {
           $(nButton).removeClass('DTTT_button');
           },
           "fnClick": multiCategorize
           },*/
          {
            "sExtends": "text",
            "sButtonText": "<i class='icon-edit'></i> Categorize",
            "sButtonClass": "btn btn-primary",
            "fnInit": function(nButton, oConfig) {
              $(nButton).removeClass('DTTT_button');
            },
            "fnClick": self.assignCategory
          },
          {
            "sExtends": "text",
            "sButtonText": "<i class='icon-remove-sign'></i> Delete",
            "sButtonClass": "btn btn-danger",
            "fnInit": function(nButton, oConfig) {
              $(nButton).removeClass('DTTT_button');
            },
            "fnClick": self.multiDelete
          },
          {
            "sExtends": "text",
            "sButtonText": "<i class='icon-plus-sign'></i> Select All",
            "sButtonClass": "btn btn-primary",
            "fnInit": function(nButton, oConfig) {
              $(nButton).removeClass('DTTT_button');
            },
            "fnClick": self.toggleSelectAll,
            "fnSelect": function(nButton, oConfig, nRow) {
              $("tbody tr:not('.DTTT_selected')").draggable("disable");
              $("tbody tr.DTTT_selected").draggable("enable");
              //refreshDraggable();
            }
          }
        ]
      }
    });

    $('.dataTables_wrapper .DTTT_container').addClass('btn-group');

    $('.header-fixed').tablesorter();


    /*$('.tool-pane,.tabletool-pane,table.worksheets thead').affix({
      offset: {
        top: 100
      }
    });*/

    $(document).scroll(function() {
      var _top = $(document).scrollTop();
      if (_top > 100) {
        self.adjustColumnHeaders();
      }
    });

    //resize header column widths when resizing
    $(window).resize(function() {
      //When we use bootstrap affix on the thead, the column headers are no longer "connected" to the tbody td's,
      //so we set up this handler to resize the header columns widths
      //todo: A bit hacky, is there a better way?
      self.adjustColumnHeaders();
    });

    $('div#category-pane .ui-droppable').droppable({
      scope: 'category',
      activeClass: 'active',
      hoverClass: 'dropHover', //icon-plus-sign
      tolerance: 'pointer',
      drop: self.onDropCategory
    });

    $('div#category-pane .ui-droppable').removeData('backbone-view');
    $('div#category-pane .ui-droppable').data('backbone-view', self);
    /*$("tr.ui-draggable").draggable({
      //option: { disabled: false },
      helper: self.onDragCategory,
      cursorAt: {
        left: -5,
        bottom: 5
      },
      cursor: 'move',
      distance: 10,
      delay: 100,
      scope: 'category',
      revert: 'invalid'
    });*/

    $.expr[':'].Contains = function(a,i,m){
      return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };


    $('.search').change(function () {
        var filter = $(this).val();
        console.log(filter);
        if (filter) {
          $('table.worksheets > tbody > tr').find("td:not(:Contains(" + filter + "))").parent().hide();
          $('table.worksheets > tbody > tr').find("td:Contains(" + filter + ")").parent().show();
        } else {
          $('table.worksheets > tbody').find("tr").show();
        }
      }).keyup(function () {
        $(this).change();
      });

    self.applyRowEvent();

  },

  adjustColumnHeaders: function() {
    $("table.worksheets thead.affix th").each(function(index) {
      $(this).css('width', $("table.worksheets tbody tr:first-child td").eq(index).css("width"));
    });
  },

  multiDelete: function(e) {
    e.preventDefault();
    var self = this;
    var selectedRows = $('.selected-rows');
    var worksheets = _.map(selectedRows, function(value){
        return parseInt(value.id);
    });
    var snapshotList = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].childNodes[1].innerText + "</li>";
    }, '');
    snapshotList = "<ul class='alert' id=''>" + snapshotList + "</ul>"
    var html = '<p class="lead text-center">Are you sure you want to delete the selected Snapshots(s)?</p>' + snapshotList;
    console.log('sent to server', worksheets);
    var data = { worksheetIds: worksheets };
    bootbox.confirm(html, function(result){
        if (result) {
          $.ajax({
            url: '/api/snapshots/multidelete',
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: 'json',
            beforeSend: function(){
              $.isLoading({text: 'Deleting Snapshots'});
            },
            complete: function(){
              $.isLoading('hide');
            },
            success: function(response){
              if(response.success ){
                  toast.notifySuccess('Success', 'Snapshots deleted successfully.');
                  var categoryOpts = {
                    data: {type: 1},
                    reset: true,
                  }
                  self.initializeCategories(categoryOpts.data, function(categoryData){
                      categories.reset(categoryData.categories);
                      self.addAll();
                      _.each(worksheets, function(value, key, list){
                          $('#'+value).remove();
                      });
                  });
              } else {
                // show error toast
                var error_res = response.error;
                if(typeof error_res === "undefined" || !error_res){
                  toast.notifyError('Error', 'Could not delete selected Snapshot(s).')
                } else {
                  var message = error_res.error.message;
                  toast.notifyError('Error', message)
                }
              }
            },
            error: function(err){
               console.log(err);
            }
          });
        } else {

        }
    });
  },

  assignCategory: function() {
    var categories = $('div#category-pane  ul li a.ui-droppable');
    var selectList = _.reduce(categories, function(memo, value) {
      var categoryId = value.href.substring(value.href.lastIndexOf('/') + 1);
      return memo + "<option value='" + categoryId + "'>" + value.firstChild.nodeValue + "</option>";
    }, '');
    selectList = "<select id='categorySelect'><option value=''>select category...</option>" + selectList + "</select>";

    //append select list
    if ($('#categoryListContainer select')) {
      $('#categoryListContainer').replaceWith(selectList);
    } else {
      $('#categoryListContainer').append(selectList);
    }
    $('#categorizeModal').modal('show');
  },

  onCategorySelect: function() {
    var self = this;
    var worksheetsTable = TableTools.fnGetInstance($('table.worksheets').attr('id'));
    var selectedRows = worksheetsTable.fnGetSelected();
    /* perform operations on TR elements in the aSelectedTrs array */
    var dataList = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    //return $("<ul class='alert'' id='' data-datasetids=''>"+datalist+"</ul>");
    dataList = "<ul class='alert'' id='' data-worksheetids=''>" + dataList + "</ul>";

    var categoryId = $('#categorySelect').val();
    var worksheets = _.map(selectedRows, function(value) {
      return {
        'id': parseInt(value.id),
        'categoryId': parseInt(categoryId)
      };
    });

    var categoryName = $("#categorySelect option:selected").text();
    var html = '<p class="lead text-center">Are you sure you want to re-categorize the following snapshots as "' + categoryName + '"?</p><ul>' + dataList + '</ul>';
    bootbox.confirm(html, function(result){
      if(result) {
        $('#categorizeModal').modal('hide');
        self.multiCategoizeSend(worksheets);
        setTimeout(function() {
          window.location.reload();
        }, 500);
      }
    });
  },

  multiCategorizeSend: function(worksheets) {
    var self = this;
    var href = "/api/snapshots/multiupdate";
    //snapshots.set(worksheets);
    // toast.notifySuccess('Success', 'Worksheets updated successfully.');
    // //update the category list
    // var html = hbs.handlebars.compile($('#wk-category-pane-template').html())(response);
    // $(".wk-category-pane").html(html);
    //todo: duplicated - encapsulate
    /*$('div#category-pane .ui-droppable').droppable({
      scope: 'category',
      activeClass: 'active',
      hoverClass: 'dropHover', //icon-plus-sign
      tolerance: 'pointer',
      drop: self.onDropCategory
    });*/

    $.ajax({
      url: href,
      data: {
        "worksheets": JSON.stringify(worksheets)
      },
      method: 'post',
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          toast.notifySuccess('Success', 'Worksheets updated successfully.');
          //update the category list
          var html = categoryPane(response);
          $(".wk-category-pane").html(html);
          //todo: duplicated - encapsulate
          $('div#category-pane .ui-droppable').droppable({
            scope: 'category',
            activeClass: 'active',
            hoverClass: 'dropHover', //icon-plus-sign
            tolerance: 'pointer',
            drop: self.onDropCategory
          });
        } else {
          toast.notifyError('Error', 'Error: ' + response.error.code + ' - ' + response.error.message);
        }
      },
      error: function(response) {
        //todo: handle error condition gracefully
      }
    });
  },

  onDropCategory: function(event, ui) {
    var self = this;
    var categoryId = this.href.substring(this.href.lastIndexOf('/') + 1);
    var worksheets = _.map(ui.helper.find('li'), function(value) {
      return {
        'id': parseInt(value.id),
        'categoryId': parseInt(categoryId)
      };
    });


    var snapshotsView = $('div#category-pane .ui-droppable').data('backbone-view');

    if (worksheets.length > 0) {
      var html = '<p class="modal-text lead text-center">Are you sure you want to re-categorize the following snapshots?</p><ul class="snapshot-list">' + ui.helper.html() + '</ul>';
      bootbox.confirm(html, function(result) {
          if (result) {
              snapshotsView.multiCategorizeSend(worksheets);
              setTimeout(function() {
                window.location.reload();
              }, 500);
          }
      });
    }
  },

  onDragCategory: function(event) {
    //make a list of selected items
    var selectedRows = $('.selected-rows');
    var datalist = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].childNodes[1].innerText + "</li>";
    }, '');
    console.log("Data list", datalist);
    return $("<ul class='alert'' id='' data-worksheetids=''>" + datalist + "</ul>");
  },

  toggleSelectAll: function(e){
    e.preventDefault();
    //select all of the visible rows without selecting filtered ones that are not visible
    if($('.btn-select-all').find('i').hasClass('icon-plus-sign')) {
      $('table > tbody > tr').each(function(i, elem) {
          if($(elem).is(':visible')) {
            $(elem).addClass('selected-rows');
          }
      });
      $('.btn-select-all').html("<i class='icon-minus-sign'></i> Deselect All");
    } else {
      $('table > tbody > tr').each(function(i, elem) {
          if($(elem).is(':visible')) {
            $(elem).removeClass('selected-rows');
          }
       });
      $('.btn-select-all').html("<i class='icon-plus-sign'></i> Select All");
    }
  },

  onCategoryDeleteClick: function(e) {
    var col1 = $(e.currentTarget).closest('h4').text();
    var href = $(e.currentTarget).attr('href');

    var html = '<p class="lead text-center">Are you sure you want to delete the following category?</p>';
    html += '<dl class="dl-horizontal">';
    html += '  <dt>Name</dt>';
    html += '  <dd>' + col1 + '</dd>';
    html += '</dl>';

    bootbox.confirm(html, function(result) {
      if (result) {
        window.location = href;
      }
    });

    e.preventDefault();
  },

  onDeleteClick: function(e) {
    var self = this;
    e.stopImmediatePropagation();
    e.preventDefault();
    var col1 = $(e.currentTarget).closest('tr').find('.name').text();
    var col2 = $(e.currentTarget).closest('tr').find('td:nth-child(2)').text();
    var href = $(e.currentTarget).attr('href');

    var html = '<p class="lead text-center">Are you sure you want to delete the following snapshot?</p>';
    html += '<dl class="dl-horizontal">';
    html += '  <dt>Name</dt>';
    html += '  <dd>' + col1 + '</dd>';
    html += '  <dt>Created</dt>';
    html += '  <dd>' + col2 + '</dd>';
    html += '</dl>';

    bootbox.confirm(html, function(result) {
      if (result) {
        var worksheetId = $(e.currentTarget).closest('tr').attr('id');
        $.ajax({
          url: '/api/snapshots/delete/'+worksheetId,
          method: 'get',
          dataType: 'json',
          success: function(response) {
            toast.notifySuccess('Success', response.message);

            var categoryOpts = {
              data: {type: 1},
              reset: true,
            }

            self.initializeCategories(categoryOpts.data, function(categoryData){
                categories.reset(categoryData.categories);
                self.addAll();
                $('#'+worksheetId).remove();
            });

          },

          error: function(res) {
            console.error(res);
          }

        });
      }
    });

    e.preventDefault();
  },

  toggleLinkedDatasets: function(e) {
      e.stopImmediatePropagation();
      $(e.currentTarget).siblings('.assigned-dataset-list').toggle();
  },

  onCategoryEditClick: function(e) {
    e.preventDefault();
    // TODO permissions check
    var href = $(e.currentTarget).attr('href');
    window.location = href;
  },

  renameSnapshot: function(e) {
    var self = this;
    e.preventDefault();

    var worksheetId = $(e.currentTarget).closest('tr').attr('id');
    var currentName = $(e.currentTarget).closest('tr').find('.name').text()


    var getSnapshots = function(){
      var deferred = Q.defer();
      var worksheetNames = [];

      $.ajax({
        url: '/api/snapshots/list',
        dataType: 'json',
        beforeSend: function() {
          $.isLoading({
            text: "Loading All Snapshot Names",
            position:'overlay'});
        },
        complete: function(){
          $.isLoading('hide');
        },
        error: function(msg){
          deferred.reject(msg);
        },
        success: function(response) {
          for (var j = 0; j < response.length; j++) {
            var obj1 = response[j];
            worksheetNames.push(obj1.name);
          }
          deferred.resolve(worksheetNames);
        }
      });
      return deferred.promise;
    };

    getSnapshots().then(function(worksheetNames){
        var div = bootbox.prompt('Rename/Copy Snapshot', 'Cancel', 'Rename', function(tabName, cloneRequest) {
          if(!cloneRequest){
            if (_.contains(worksheetNames, tabName)) {
              toastr.error("Snapshot Name Already Exists", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
              return;
            }
          }

          if (tabName === null) {
            tabName = currentName;
          } else if(cloneRequest){

            if(tabName == currentName){
              var newTabName;
              var counter = 1;
              while(1){
                newTabName = tabName + ' ('+ counter +')';
                if(worksheetNames.indexOf(newTabName) === -1){
                  tabName = newTabName;
                  break;
                }
                counter++;
              }
            }

            $.ajax({
              url: '/api/snapshots/clone/' + worksheetId,
              data: {
                name: tabName
              },
              method: 'post',
              dataType: 'json',
              beforeSend: function() {
                $.isLoading({
                  text: "Copying Snapshot", 
                  position:'overlay'});
              },
              complete: function(){
                $.isLoading('hide');
              },
              success: function(response) {
                if (response.id) {
                  toast.notifySuccess('Success', 'Snapshot cloned successfully.');
                  self.render();
                } else {
                  toast.notifyError('Error', 'Unable to clone snapshot:' + response.error);
                }
              }
            });

          } else {

            $.ajax({
              url: '/api/snapshots/update',
              data: {
                id: worksheetId,
                name: tabName
              },
              method: 'post',
              dataType: 'json',
              success: function(response) {
                if (response.success) {
                  $('#'+worksheetId).find('.name').text(tabName);
                  toast.notifySuccess('Success', 'Snapshot updated successfully.');
                } else {
                  toast.notifyError('Error', 'Unable to update worksheet:' + response.error);
                }
              }
            });
          }
        }, currentName, 'Copy');

        $(div).find('input').css({
          'margin-top': '5px',
          'margin-bottom': '80px'
        });

        setTimeout(function(){
          $(div).find('input').autocomplete({
            source: function(request, response) {
              var results = $.ui.autocomplete.filter(worksheetNames, request.term);
              response(results.slice(0, 5));
            }
          });
        }, 500);

    });

  }

});

module.exports = SnapshotsView;
