var toast = require('../lib/toast');
var hbs = require('hbs');
var PrenostikUser = require('./PrenostikUser');
var accountsCommon = require('./accountsCommon');

var Datasets = function(socket) {
  this.socket = socket;
  this.init();
};

var fileCount = 0;
var _mcEnabled = false;

Datasets.prototype.init = function() {

  $('#btn-continue').prop('disabled', true)
  $('.btn-delete').on('click', this.onDeleteClick);
  $('.btn-delete-category').on('click', this.onCategoryDeleteClick);

  var activeElem = $('#category-pane .active');
  var headerPane = $('.header-pane');
  if (activeElem.length === 0) {
    $('li.nav-header').addClass('active');
  }
  if (headerPane.length === 0) {
    $('.span9').prepend('<div class="flat-well well-small header-pane" data-spy="affix"><h4 style="margin:0">All Categories</h4></div>');
  }

  $(document).off('click', '.btn-choose-file')
    .on('click', '.btn-choose-file', this.onChooseFileClick);
  $(document).off('change', 'input.input-file')
    .on('change', 'input.input-file', this.onFileChange);
  $(document).off('click', '#btn-continue')
    .on('click', '#btn-continue', this.onContinueClicked);
  $(document).off('click', '#btn-cancel')
    .on('click', '#btn-cancel', this.onCancelClick);
  $(document).off('click', '#mc-submit')
    .on('click', '#mc-submit', this.onUploadMC);
  $(document).off('click', '#categorizeSubmit')
    .on('click', '#categorizeSubmit', onCategorySelect);

  $(document).on('click', '.btn-add', function(e) {
    fileCount++;
    e.preventDefault();
    var $source = $('#source').clone();
    $('.rows').append($source);

    $source.find('input[name=_name]').attr('name', 'name[' + fileCount + ']');
    $source.find('input[name=_file]').attr('name', 'file[' + fileCount + ']');
    $source.slideDown('fast');
  });

  $(document).on('click', '.btn-remove', function(e) {
    e.preventDefault();
    $(this).closest('.row-container').slideUp('fast', function() {
      $(this).remove();
    });
  });

  $('#checkboxLabel').off('click').on('click', function(e){
    if($(this).hasClass('checked')){
      $(this).removeClass('checked');
    } else {
      $(this).addClass('checked');
    }
    //e.preventDefault();
  });

  $('.snapshot-dropdown').off().on('click', function(e){
      e.stopPropagation()
      $(this).siblings('.assigned-snapshot-list').toggle();
  });

  $('.header-fixed').tablesorter({
    textExtraction: function(node){
      return $(node).clone().children().remove().end().text();
    }
  });

  var applyRowEvent = function () {

    $('.header-fixed > tbody > tr').off().on('click', function(e) {
        if($(this).hasClass('selected-rows')){
          $(this).removeClass('selected-rows');
        } else {
          $(this).addClass('selected-rows');
        }

        //$('tr.ui-draggable:not(.selected-rows)').draggable('disable');
        $('.selected-rows').draggable({
            //option: { disabled: false },
            helper: onDragCategory,
            cursorAt: {
              left: -5,
              bottom: 5
            },
            cursor: 'crosshair',
            distance: 10,
            delay: 100,
            scope: 'category',
            revert: 'invalid'
          });
    });

  };

  //Initialize table manipulation
  $('.table.nodatasets').dataTable({
    "bPaginate": false,
    //"sScrollY": "300px",
    "bLengthChange": false,
    "bFilter": true,
    "bSort": true,
    "bInfo": false,
    "bAutoWidth": false,
    "aoColumns": [
      /* Name */ null,
      /* Owner */ null,
      /* CreateDate */ null,
      /* ModifiedBy */ null,
      /* ModifiedDate */ null,
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
        {
          "sExtends": "text",
          "sButtonText": "<i class='icon-edit'></i> Categorize",
          "sButtonClass": "btn btn-primary",
          "fnInit": function(nButton, oConfig) {
            $(nButton).removeClass('DTTT_button');
          },
          "fnClick": assignCategory
        },
        {
          "sExtends": "text",
          "sButtonText": "<i class='icon-remove-sign'></i> Delete",
          "sButtonClass": "btn btn-danger",
          "fnInit": function(nButton, oConfig) {
            $(nButton).removeClass('DTTT_button');
          },
          "fnClick": multiDelete
        },
        {
          "sExtends": "text",
          "sButtonText": "<i class='icon-plus-sign'></i> Select All",
          "sButtonClass": "btn btn-primary",
          "fnInit": function(nButton, oConfig) {
            $(nButton).removeClass('DTTT_button');
          },
          "fnClick": toggleSelectAll,
          "fnSelect": function(nButton, oConfig, nRow) {
            $("tbody tr:not('.DTTT_selected')").draggable("disable");
            $("tbody tr.DTTT_selected").draggable("enable");
            //refreshDraggable();
          }
        }
      ]
    }
  });

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
  if (previewTable.length > 0) {
    //previewTable.fnSort( [ [1,'asc'] ] );
  }
  //apply bootstrap flavor to TableTools toolbar
  $('.dataTables_wrapper .DTTT_container').addClass('btn-group');

  //utilize bootstrap affix plugin to keep tools at hand
  /*$('.tool-pane,.tabletool-pane,table.datasets thead').affix({
    offset: {
      top: 100
    }
  });*/

  $('.search').change(function () {
    var filter = $(this).val();
    console.log(filter);
    if (filter) {
      $('table.datasets > tbody > tr').find("td:not(:contains(" + filter + "))").parent().hide();
      $('table.datasets > tbody > tr').find("td:contains(" + filter + ")").parent().show();
    } else {
      $('table.datasets > tbody').find("tr").show();
    }
  }).keyup(function () {
    $(this).change();
  });

  $('.btn-categorize').off().on('click', function(e) {
      e.preventDefault();
      assignCategory();
  });

  $('.btn-multidelete').off().on('click', function (e) {
      e.preventDefault();
      multiDelete();
  });

  $('.btn-select-all').off().on('click', function (e) {
      e.preventDefault();
      toggleSelectAll();
  });



  function adjustColumnHeaders() {
    $("table.datasets thead.affix th").each(function(index) {
      $(this).css('width', $("table.datasets tbody tr:first-child td").eq(index).css("width"));
    });
  }

  $(document).scroll(function() {
    var _top = $(document).scrollTop();
    if (_top > 100) {
      adjustColumnHeaders();
    }
  });

  //resize header column widths when resizing
  $(window).resize(function() {
    //When we use bootstrap affix on the thead, the column headers are no longer "connected" to the tbody td's,
    //so we set up this handler to resize the header columns widths
    //todo: A bit hacky, is there a better way?
    adjustColumnHeaders();
  });





  function toggleSelectAll() {
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
  }

  function assignCategory() {
    //alternative to drag and drop
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
  }

  function onCategorySelect() {

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
            multiCategorizeSend(datasets);
            setTimeout(function() {
              window.location.reload();
            }, 500);
        } else {
            //show the select dialog

        }
    });
  }

  function multiCategorizeSend(datasets) {
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
          var html = hbs.handlebars.compile($('#category-pane-template').html())(response);
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
  }

  function multiDelete() {
    var selectedRows = $('.selected-rows');
    var dataList = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    var datasets = _.map(selectedRows, function(value){
        return parseInt(value.id);
    });
    dataList = "<ul class='alert' id=''>" + dataList + "</ul>";
    var html = '<p class="lead text-center">Are you sure you want to delete the selected dataset(s)?</p>'+dataList;
    bootbox.confirm(html, function(result) {
      if (result) {
        var opts = {
          lines: 13, // The number of lines to draw
          length: 20, // The length of each line
          width: 10, // The line thickness
          radius: 30, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: '50%', // Top position relative to parent
          left: '50%' // Left position relative to parent
        };
        var target = document.body;
        var spinner = new Spinner(opts).spin(target);

        $.ajax({
          url: '/api/datasets/multidelete',
          method: 'POST',
          data: { ids: datasets },
          dataType: 'JSON',
          complete: function() {
            spinner.stop();
          },
          success: function(response){
            if(response.success){
               toast.notifySuccess('Success', 'Datasets deleted successfully.');
               _.each(datasets, function(value, key, list){
                 $('#'+value).remove();
               });
            } else {
              // show error toast
              var error_res = response.error;
              if(typeof error_res === "undefined" || !error_res){
                toast.notifyError('Error', 'Could not delete selected dataset(s).')
                console.log(error_res);
              } else {
                var message = error_res;
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
  }

  $('div#category-pane .ui-droppable').off().droppable({
    scope: 'category',
    activeClass: 'active',
    hoverClass: 'dropHover', //icon-plus-sign
    tolerance: 'pointer',
    drop: onDropCategory
  });

  function onDropCategory(event, ui) {
    console.log('called drop');
    var categoryId = this.href.substring(this.href.lastIndexOf('/') + 1);
    var datasets = _.map(ui.helper.find('li'), function(value) {
      return {
        'id': parseInt(value.id),
        'categoryId': parseInt(categoryId)
      };
    });

    if (datasets.length > 0) {
      var html = '<p class="lead text-center">Are you sure you want to re-categorize the following data sets?</p><ul class="dataset-list">' + ui.helper.html() + '</ul>';
      bootbox.confirm(html, function(result) {
          if (result) {
              multiCategorizeSend(datasets);
              setTimeout(function() {
                window.location.reload();
              }, 500);
          }
      });
    }
  }

  /*$("tr.ui-draggable").draggable({
    //option: { disabled: false },
    helper: onDragCategory,
    cursorAt: {
      left: -5,
      bottom: 5
    },
    cursor: 'crosshair',
    distance: 10,
    delay: 100,
    scope: 'category',
    revert: 'invalid'
  });*/

  function onDragCategory(event) {
    //make a list of selected items
    var selectedRows = $('.selected-rows');
    var datalist = _.reduce(selectedRows, function(memo, value) {
      return memo + "<li id='" + value.id + "'>" + value.children[0].firstChild.nodeValue + "</li>";
    }, '');
    return $("<ul class='alert'' id='' data-datasetids=''>" + datalist + "</ul>");
  }

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

    $.noConflict();
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

      $('#btn-continue').prop('disabled', false);
    }
  };


  applyRowEvent();
};

Datasets.prototype.onCancelClick = function(e) {
  //todo: within append workflow - history does not work correctly when going through an error and force progression use case
  //suggest use of a direct link that always goes back to the index view
  window.location = "/manage/datasets";
};

Datasets.prototype.onContinueClicked = function(e) {
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
};

Datasets.prototype.onChooseFileClick = function(e) {
  $(this).closest('.row-container').find('input.input-file').trigger('click');
  e.preventDefault();
};

Datasets.prototype.onFileChange = function(e) {
  var filename = $(this).val().replace(/^.*[\\\/]/, '');
  $(this).closest('.row-container').find('input[name=file_clone]').val(filename);

};

Datasets.prototype.onCategoryDeleteClick = function(e) {
  var col1 = $(this).closest('h4').text();
  var href = $(this).attr('href');

  var support = new accountsCommon();
  var currentUser = support.getAuthUser();

  if(!currentUser.canDo('DS_CATDELETE')){
    e.preventDefault();
    return false;
  }

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
};

Datasets.prototype.onDeleteClick = function(e) {
  var col1 = $(this).closest('tr').find('td:nth-child(1)').text();
  var col2 = $(this).closest('tr').find('td:nth-child(2)').text();
  var href = $(this).attr('href');

  var support = new accountsCommon();
  var currentUser = support.getAuthUser();

  /*if(!currentUser.canDo('DS_DELETE')){
    e.preventDefault();
    return false;
  }*/
  var linkedSnapshots = $(this).closest('tr').find('.snapshot-dropdown');

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
  		window.location = href;
  	}
  });

  e.preventDefault();
};

Datasets.prototype.onUploadMC = function(e) {
  e.preventDefault();
  var inputFile = $(this).closest('.modal-content').find('input.input-file');
  var fileName = inputFile.val();
  if(fileName.length > 1 && fileName.slice(-3) !== 'csv') {
      toast.notifyError('Error', 'Please check your file format and upload again')
  } else {
      $('#addDatasetForm').submit();
  }
};

Datasets.prototype.onxCategorySelect = function(e) {

  var selectedRows = $('.selected-rows');
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
};


module.exports = Datasets;
