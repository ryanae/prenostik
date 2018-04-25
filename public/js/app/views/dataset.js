var toast = require('../../lib/toast'),
    hbs = require('hbsfy/runtime'),
    _ = require('underscore'),
    Backbone = require('backbone');

Backbone.$ = $;

var Categories = require('../collections/categories');
var Datasets = require('../collections/datasets');

var datasets = new Datasets();
var categories = new Categories();

var _mcEnabled = false;

//templates
var datasetsTpl = require('../../../templates/datasets.hbs');
var categoryPane = require('../../../templates/category-pane.hbs');

var DatasetView = Backbone.View.extend({
  el: $('#container'),

  template: datasetsTpl,

  events: {
    'click .btn-delete': 'onDeleteClick',
    'click .btn-categorize': 'assignCategory',
    'click .btn-multidelete': 'multiDelete',
    'click .btn-select-all': 'toggleSelectAll',
    'click .btn-delete-category': 'onCategoryDeleteClick',
    'click .btn-choose-file': 'onChooseFileClick',
    'change input.input-file' : 'onFileChange',
    'click #btn-continue': 'onContinueClicked',
    'click #btn-cancel': 'onCancelClick',
    'click #mc-submit' : 'onUploadMC',
    'click #categorizeSubmit' : 'onCategorySelect',
    'click .btn-add': 'addDataset',
    'click .btn-remove': 'removeDataset',
    'click #checkboxLabel': 'checkForceAction',
    'click #mcUploadButton': 'openUploadModal',
    'click .snapshot-dropdown': 'toggleLinkedSnapshots',
    'click .btn-edit':'onCategoryEditClick'
  },

  initialize: function(socket, filterId) {
    _.bindAll(this, 'render', 'addAll');
    this.socket = socket;
    this.fileCount = 0;
    this.filterId = filterId
    this.render();

  },

  remove: function() {
      this.$el.empty().off(); /* off to unbind the events */
      this.stopListening();
      return this;
  },

  render: function () {
    $.isLoading({ text: "Loading Data Set List View"});
    var self = this;

    var opts = {
      reset: true,
      success: self.addAll
    }

    var categoryOpts = {
      data: {type: 0},
      reset: true,
    };

    if(this.filterId){
      opts.data = $.param({id: self.filterId});
      categoryOpts.data.activeId = self.filterId;
    }

    self.initializeDatasets(opts.data, function(datasetData){
      self.initializeCategories(categoryOpts.data, function(categoryData){
        categories.reset(categoryData.categories);
        datasets.reset(datasetData);
        self.addAll();
        $.isLoading('hide');
      });
    });

    return this;
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

  initializeDatasets: function(data, cb){
    $.ajax({
      url: '/api/datasets',
      dataType: 'json',
      data: data,
      success: function(response) {
        cb(response);
      }
    })
  },

  addAll: function () {
    var datasetData = datasets.toJSON()
    var categoryData = categories.toJSON()
    var data = {
      'datasets': datasetData,
      'categories': categoryData
    };
    var html = this.template(data);
    $('#container').html(html);
    $('html').attr('class', 'datasets-controller');
    var activeElem = $('#category-pane .active');
    var headerPane = $('.header-pane');

    if(activeElem.length === 0){
      $('li.nav-header').addClass('active');
    }

    if(headerPane.length === 0) {
      $('.span9').prepend('<div class="flat-well well-small header-pane"><h4 style="margin:0">All Categories</h4></div>');
    }
    this.setupTable();
    this.delegateEvents(this.events);

  },

  applyRowEvent: function () {
    var self = this;
    $('.header-fixed > tbody > tr').off().on('click', function(e) {
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

    $('div#category-pane .ui-droppable').droppable({
      scope: 'category',
      activeClass: 'active',
      hoverClass: 'dropHover', //icon-plus-sign
      tolerance: 'pointer',
      drop: self.onDropCategory
    });

    $('div#category-pane .ui-droppable').removeData('backbone-view');
    $('div#category-pane .ui-droppable').data('backbone-view', self);

    $('.table.no.datasets').dataTable({
      "bPaginate": false,
      //"sScrollY": "300px",
      "bLengthChange": false,
      "bFilter": true,
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "aoColumns": [
        /* Name */ null,
        /* #Points */ null,
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

    $('.header-fixed').tablesorter({
      textExtraction: function(node){
        return $(node).clone().children().remove().end().text();
      }
    });

    //utilize bootstrap affix plugin to keep tools at hand
    /*$('.tool-pane,.tabletool-pane,table.datasets thead').affix({
      offset: {
        top: 100
      }
    });*/

    var previewTable = $('.table.datasets-preview').dataTable({
      "bPaginate": false,
      //"sScrollY": "300px",
      "bLengthChange": false,
      "bFilter": true,
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "aoColumnDefs": [
        {
          "bSearchable": false,
          "bSortable": false,
          "aTargets": [2]
        }
      ],
      "sDom": "<'row-fluid'<'span8'><'span4'f>r>t<'row-fluid'<'span6'i><'span6'p>>" //"sDom": 'T<"clear">lfrtip',
    });

    $(document).scroll(function() {
      var _top = $(document).scrollTop();
      if (_top > 100) {
        self.adjustColumnHeaders();
      }
    });

    $(window).resize(function() {
      self.adjustColumnHeaders();
    });

    var test = $('input[name=dataset_name]');
    if (test.length > 0) {
      $(".dataOptions").hide();
      $.ajax({
        url: '/api/datasets/get',
        dataType: 'json',
        success: function(response) {
          buildInputs(response);
        }
      });
    }
    var buildInputs = function(datasets) {
      var datasetNames = [];
      var datasetMap = {};
      if (datasets.length > 0) {
        for (var j = 0; j < datasets.length; j++) {
          var obj1 = datasets[j];
          datasetNames.push(obj1.name);
          datasetMap[obj1.name] = obj1.id;
        }
      }

      var test = $('input[name=dataset_name]');
      var form = $('#addMCDatasetForm');

      // $.noConflict();
      var dId;
      for (var i = 0; i < test.length; i++) {
        var obj = test[i];
        obj.count = i + 1;
        if (form) {
          dId = $('<input>').attr({
            type: 'hidden',
            id: '#datasetId' + obj.count,
            name: 'datasetId'
          }).appendTo('form');
        }
        var inputObject = $("#dataset_name" + obj.count);
        if (_.contains(datasetNames, inputObject.val())) {
          $("#col" + obj.count + " .dataOptions").show();
          dId.val(datasetMap[inputObject.val()]);
        }

        inputObject.autocomplete(
        {
          source: datasetNames
        });
        inputObject.on("input", function(e) {
          if (_.contains(datasetNames, $(e.target).val())) {
            $(e.target).parent().find(".dataOptions").show();
            $('input[id=#datasetId' + e.target.count + ']').val(datasetMap[$(e.target).val()]);
          } else {
            $(e.target).parent().find(".dataOptions").hide();
            $('input[id=#datasetId' + e.target.count + ']').val(null);
          }
          if ($(e.target).hasClass('error')) {
            $(e.target).removeClass('error').parent().find('.error-message').remove();
          }
        });
        inputObject.on("autocompleteselect", function(e, ui) {
          if (_.contains(datasetNames, ui.item.value)) {
            $(e.target).parent().find(".dataOptions").show();
            $('input[id=#datasetId' + e.target.count + ']').val(datasetMap[ui.item.value]);
          } else {
            $(e.target).parent().find(".dataOptions").hide();
            $('input[id=#datasetId' + e.target.count + ']').val(null);
          }
        });
      }
    };

    $.expr[':'].Contains = function(a,i,m){
      return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };



    $('.search').change(function () {
        var filter = $(this).val();
        console.log(filter);
        if (filter) {
          $('table.datasets > tbody > tr').find("td:not(:Contains(" + filter + "))").parent().hide();
          $('table.datasets > tbody > tr').find("td:Contains(" + filter + ")").parent().show();
        } else {
          $('table.datasets > tbody').find("tr").show();
        }
    }).keyup(function () {
      $(this).change();
    });

    self.applyRowEvent();
  },

  adjustColumnHeaders: function() {
    $("table.datasets thead.affix th").each(function(index) {
      $(this).css('width', $("table.datasets tbody tr:first-child td").eq(index).css("width"));
    });
  },

  toggleSelectAll: function(e) {
    e.preventDefault();
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
  multiDelete: function(e) {
    e.preventDefault();
    var selectedRows = $('.selected-rows');
    var datasets = _.map(selectedRows, function(value){
        return parseInt(value.id);
    });
    var datasetListItems = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + $(value.children[0].childNodes[0]).text().trim() + "</li>";
    }, '');

    var datasetList = "<ul class='alert' id=''>" + datasetListItems + "</ul>"
    var html = '<p class="lead text-center">Are you sure you want to delete the selected Dataset(s)?</p>' + datasetList;
    var data = {ids: datasets};
    bootbox.confirm(html, function(result){
        if (result) {
          $.ajax({
            url: '/api/datasets/multidelete',
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function(){
              $.isLoading({text: 'Deleting Datasets'});
            },
            complete: function(){
              $.isLoading('hide');
            },
            success: function(response){
              if(response.success ){
                 toast.notifySuccess('Success', 'Datasets deleted successfully.');
                 _.each(datasets, function(value, key, list){
                   $('#'+value).remove();
                 });
              } else {
                // show error toast
                var error_res = response.error;
                if(typeof error_res === "undefined" || !error_res){
                  toast.notifyError('Error', 'Could not delete selected Dataset(s).')
                  console.log(error_res);
                } else if(error_res.hasOwnProperty('error')) {
                  var message = error_res.error.message;
                  toast.notifyError('Error', message)
                } else {
                  toast.notifyError('Error', error_res);
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

  assignCategory: function(e) {
    e.preventDefault();
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
    var selectedRows = $('.selected-rows');
    /* perform operations on TR elements in the aSelectedTrs array */
    var dataList = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    //return $("<ul class='alert'' id='' data-datasetids=''>"+datalist+"</ul>");
    dataList = "<ul class='alert'' id='' data-datasetids=''>" + dataList + "</ul>";

    var categoryId = $('#categorySelect').val();
    var datasets = _.map(selectedRows, function(value) {
      return {
        'id': parseInt(value.id),
        'categoryId': parseInt(categoryId)
      };
    });

    var categoryName = $("#categorySelect option:selected").text();
    var html = '<p class="lead text-center">Are you sure you want to re-categorize the following data sets as "' + categoryName + '"?</p><ul>' + dataList + '</ul>';
    bootbox.confirm(html, function(result) {
        if (result) {
            $('#categorizeModal').modal('hide');
            self.multiCategorizeSend(datasets);
            setTimeout(function() {
              window.location.reload();
            }, 500);
        } else {
            //show the select dialog

        }
    });
  },

  openUploadModal: function(e) {
    console.log('called');
    e.preventDefault();
    $('#myModal').modal();
  },

  multiCategorizeSend: function(datasets) {
    var href = "/api/datasets/multiupdate";
    datasets = JSON.stringify(datasets);
    $.ajax({
      url: href,
      data: {
        "datasets": datasets
      },
      method: 'post',
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          toast.notifySuccess('Success', 'Datasets updated successfully.');
          //update the category list
          var html = categoryPane(response);
          $("#category-pane").html(html);
          //todo: duplicated - encapsulate
          $('div#category-pane .ui-droppable').droppable({
            scope: 'category',
            activeClass: 'active',
            hoverClass: 'dropHover', //icon-plus-sign
            tolerance: 'pointer',
            drop: onDropCategory
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

    var categoryId = this.href.substring(this.href.lastIndexOf('/') + 1);
    var datasets = _.map(ui.helper.find('li'), function(value) {
      return {
        'id': parseInt(value.id),
        'categoryId': parseInt(categoryId)
      };
    });

    var datasetsView = $('div#category-pane .ui-droppable').data('backbone-view');

    if (datasets.length > 0) {
      var html = '<p class="lead text-center">Are you sure you want to re-categorize the following data sets?</p><ul class="dataset-list">' + ui.helper.html() + '</ul>';
      bootbox.confirm(html, function(result) {
          if (result) {
              datasetsView.multiCategorizeSend(datasets);
              setTimeout(function() {
                window.location.reload();
              }, 500);
          }
      });
    }
  },

  onDragCategory: function(event) {
    var selectedRows = $('.selected-rows');
    var datalist = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    console.log("Data list", datalist);
    return $("<ul class='alert'' id='' data-datasetids=''>" + datalist + "</ul>");  
  },

  onCancelClick: function(e) {
    window.location = "/manage/datasets";
  },

  onContinueClicked: function(e) {
    e.preventDefault();
    var $checkbox = $('#checkboxLabel');
    if($checkbox.hasClass('checked') && !$('#appendForce').prop('checked')){
      $('#appendForce').prop('checked', true);
    }

    var form = $('#addMCDatasetForm');
    if (form) {
      var abort = false;
      var inputComponents = $('input[name=dataset_name]');
      for (var i = 0; i < inputComponents.length; i++) {
        var obj = inputComponents[i];
        if (obj.value === "") {
          if (!$(obj).hasClass('error')) {
            $(obj).addClass('error').after('<small class="label input-label-important error error-message"><i class="icon-warning-sign"></i>Please enter a name.</small>');
          }
          abort = true;
        } else {
          if ($(obj).hasClass('error')) {
            $(obj).removeClass('error').parent().find('.error-message').remove();
          }
        }
      }
      if (abort) {
        return false;
      } else {
        $('#datasetLoader').show();
      }
    }
    e.target.form.submit();
  },

  onChooseFileClick: function(e) {
    e.preventDefault();
    var inputFile = $('input.input-file');
    console.log(inputFile.length);
    $(inputFile[0]).show();
    $(inputFile[0]).css('visibility', 'hidden');
    $(inputFile[0]).trigger('click');
    //$(this).closest('.row-container').find('input.input-file').trigger('click');
    console.log('click triggered');
  },

  onFileChange: function(e) {
    var filename = $(e.target).val().replace(/^.*[\\\/]/, '');
    $(e.target).closest('.row-container').find('input[name=file_clone]').val(filename);
  },

  onCategoryDeleteClick: function(e) {
    var col1 = $(e.currentTarget).closest('h4').text();
    var href = $(e.currentTarget).attr('href');
    console.log(href);

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
    e.stopImmediatePropagation();
    e.preventDefault();
    var col1 = $(e.target).closest('tr').find('td:nth-child(1)').text();
    var col2 = $(e.target).closest('tr').find('td:nth-child(2)').text();
    var href = $(e.target).attr('href');

    var linkedSnapshots = $(e.target).closest('tr').find('.snapshot-dropdown');

    if(linkedSnapshots.length > 0){
        toast.notifyWarning('Warning', "Dataset cannot be deleted because of linked Snapshots.");
        return false;
    }

    var splitText = "Date Range:";
    var html = '<p class="lead text-center">Are you sure you want to delete the following data set?</p>';
    html += '<dl class="dl-horizontal">';
    html += '  <dt>Name</dt>';
    html += '  <dd>' + col1.substring(0, col1.search(splitText)) + '</dd>';
    html += '  <dt>Date Range</dd>';
    html += '  <dd>' + col1.substring(col1.search(splitText) + splitText.length) + '</dd>';
    html += '  <dt># of Data Points</dt>';
    html += '  <dd>' + col2 + '</dd>';
    html += '</dl>';

    bootbox.confirm(html, function(result) {
    	if (result) {
        var datasetId = $(e.target).closest('tr').attr('id'); 
        $.ajax({
          url: '/api/datasets/delete/'+datasetId,
          method: 'get',
          dataType: 'json',
          success: function(response) {
            toast.notifySuccess('Success', response.message);
            $('#'+datasetId).remove();
          },

          error: function(res) {
            console.error(res);
          }

        });
    	}
    });

    e.preventDefault();
  },

  onUploadMC: function(e) {
    e.preventDefault();
    $('#addDatasetForm').submit();
  },

  onxCategorySelect: function(e) {
    var datasetsTable = TableTools.fnGetInstance($('.table.datasets').attr('id'));
    var selectedRows = datasetsTable.fnGetSelected();
    /* perform operations on TR elements in the aSelectedTrs array */
    var dataList = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    //return $("<ul class='alert'' id='' data-datasetids=''>"+datalist+"</ul>");
    dataList = "<ul class='alert'' id='' data-datasetids=''>" + dataList + "</ul>";

    var categories = $('div#category-pane  ul li a.ui-droppable');
    var selectList = _.reduce(categories, function(memo, value) {
      var categoryId = value.href.substring(value.href.lastIndexOf('/') + 1);
      return memo + "<option value='" + categoryId + "'>" + value.firstChild.nodeValue + "</option>";
    }, '');
    selectList = "<select><option value=''>select category...</option>" + selectList + "</select>";

    //var categoryId = this.href.substring(this.href.lastIndexOf('/')+1);
    var categoryId = "";
    var categoryName = "";
    var html = '<p class="lead text-center">Are you sure you want to re-categorize the test following data sets as' + categoryName + '?</p><ul>' + dataList + '</ul>';
    bootbox.confirm(html, function(result) {
      if (result) {
        $('#categorizeModal').modal('hide');
        console.log('multiCategorizeSend');
        //multiCategorizeSend(datasets);
      } else {
        //show the select dialog

      }
    });
  },

  addDataset: function(e) {
    this.fileCount++;
    //e.preventDefault();
    var $source = $('#source').clone();
    $('.rows').append($source);

    $source.find('input[name=_name]').attr('name', 'name[' + this.fileCount + ']');
    $source.find('input[name=_file]').attr('name', 'file[' + this.fileCount + ']');
    $source.slideDown('fast');
  },

  removeDataset: function(e) {
    e.preventDefault();
    $(e.target).closest('.row-container').slideUp('fast', function() {
      $(e.target).remove();
    });
  },

  checkForceAction: function() {
    if($(this).hasClass('checked')){
      $(this).removeClass('checked');
    } else {
      $(this).addClass('checked');
    }
  },

  toggleLinkedSnapshots: function(e) {
      e.stopImmediatePropagation();
      $(e.target).siblings('.assigned-snapshot-list').toggle();
  },

  onCategoryEditClick: function(e) {
    e.preventDefault();
    // TODO permissions check
    var href = $(e.currentTarget).attr('href');
    window.location = href;
  }
});

module.exports = DatasetView;
