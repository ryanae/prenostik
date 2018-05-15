var toast = require('../lib/toast');


var Categories = function(socket) {
  this.socket = socket;
  this.init();
};

Categories.prototype.init = function() {
  $(document).on('click', '#btn-cancel', this.onCancelClick);
  $(document).on('click', '#btn-continue', this.onContinueClick);
  // var categoryType = window.location.hash;
  // if (categoryType) {
  //   $('input[name=categorytype]').val(1);
  // }
  var addForm = $('#addCategoryForm');
  if (addForm) {
    var inputCategory = $('input[name=name]');
    var categoryTypeVal = $('input[name=categorytype]').val();
    $.getJSON('/api/categories/list', {
      type: categoryTypeVal
    }, function(data) {
      var categoryList = _.uniq(_.pluck(data.categories, 'name'));
      inputCategory.autocomplete({
        source: categoryList
      });
    });
  }

  var updateForm = $('#updateCategoryForm');
  if (updateForm) {
    setupAutocomplete();
  }
};

Categories.prototype.onCancelClick = function(e) {
  if (e.target.attributes.href) {
    //TODO:This not getting correctly...
    //window.location = e.target.attributes.href;
    history.go(-1);
  } else {
    history.go(-1);
  }
};

Categories.prototype.onContinueClick = function(e) {
  e.preventDefault();
  var categoryType;
  var updateForm = $('#updateCategoryForm');
  if (updateForm && updateForm.length > 0) {
    var categoryName = $('input[name=name]').val();
    var categoryId = $('input[name=id]').val();
    categoryType = $('input[name=type]').val();
    $.getJSON('/api/categories/list', {
      type: categoryType
    }, function(data) {
      var filteredCategories = _.filter(data.categories, function(category) {
        return category.id !== categoryId;
      });
      var categoryList = _.pluck(filteredCategories, 'name');
      if (_.contains(categoryList, categoryName)) {
        toast.notifyError('Error', 'Category name already in use. <br/> Please rename.');
        return false;
      } else {
        e.target.form.submit();
      }
    });
  }
  var addForm = $('#addCategoryForm');
  if (addForm && addForm.length > 0) {
    var inputCategory = $('input[name=name]');
    categoryType = $('input[name=categorytype]').val();
    console.log('grabbing list');
    $.getJSON('/api/categories/list', {
      type: categoryType
    }, function(data) {
      var categoryList = _.pluck(data.categories, 'name');
      console.log(categoryList);
      if (_.contains(categoryList, inputCategory.val())) {
        toast.notifyError('Error', 'Category name already in use. <br/> Please rename.');
        return false;
      } else {
        e.target.form.submit();
      }
    });
  }
};


var setupAutocomplete = function() {
  var inputCategory = $('input[name=name]');
  var categoryType = $('input[name=type]').val();
  if (inputCategory.length > 0) {
    var categoryId = $('input[name=id]').val();
    $.getJSON('/api/categories/list', {
      type: categoryType
    }, function(data) {
      var filteredCategories = _.filter(data.categories, function(category) {
        return category.id !== categoryId;
      });
      var categoryList = _.pluck(filteredCategories, 'name');
      inputCategory.autocomplete({
        source: categoryList
      });
    });
  }
};

module.exports = Categories;
