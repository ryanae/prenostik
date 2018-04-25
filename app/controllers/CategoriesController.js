var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var hbs = require('hbs');
var async = require('async');

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
	Controller.call(this, injector);

	this.app = null;

	this.name = 'Categories';

	injector.injectInto(this);

    hbs.registerHelper(function titleCase (str) {
        if (typeof str === 'undefined') return '';

        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    });

    hbs.registerHelper('equal', function(lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if( lvalue!=rvalue ) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });
}

/*
MyController.prototype.index = function(req, res) {
	var injector = new Injector();

	var self = this;
	injector.addMapping('datasets').toProvider(function(callback) {
		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.getDatasets(function(datasets) {
				callback(datasets);
			});
		});
	});

	return new RenderAction('index', this, injector, arguments);
};
*/
MyController.prototype.add = function(req, res) {
	var injector = new Injector();

	var self = this;

	if (req.isPOST()) {
		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {

			var name = req.body.name;
            var categoryType = req.body.categorytype;
			var asyncCallbacks = [];

            if (name != '') {
                var asyncCallback = function(callback) {
                    var myName = name;
                    var myCategoryType = categoryType;
                    var params = {
                        "name":myName,
                        "categoryType":myCategoryType
                    };
                    rest.saveCategory(params, function(result) {
                        if(result.success){
                            req.setToast('toast-success', 'Category "' + myName + '" added successfully!');
                            callback(null);
                        }else{
                            //req.setToast('toast-error', result.error);
                            req.setToast('toast-error','There was a problem adding category '+myName+'. Error: '+result.error.code+' - '+result.error.message);
                            //req.setFlash('flash-error','Error: '+result.error.code+' ['+result.error.filename+'] - '+result.error.message);
                            callback(result);
                        }
                    });
                };

                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'You must provide a category name.');
            }


			if (asyncCallbacks.length) {
                console.log('asyncCallbacks.length:'+asyncCallbacks.length);
				async.parallel(asyncCallbacks, function(result) {
                    console.log("Create category result: ", result);
                    if(result){
                        console.log(result);
                        res.redirect('/manage/categories/add');
                    }else{
                        console.log("category type:", categoryType);
                        if(categoryType === '1') {
                           res.redirect('/manage/snapshots');
                        } else {
                           res.redirect('/manage/datasets');
                        }
                    }
				});
			} else {
                console.log('redirecting to categories/add');
				res.redirect('/manage/categories/add');
			}
		});
	} else {

        var titleCase = function titleCase (str) {
            if (typeof str === 'undefined') return '';

            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

        injector.addMapping('type').toProvider(function(callback) {
            callback(titleCase(req.params.type));
        });
		return new RenderAction('add', this, injector, arguments);
	}
};

MyController.prototype.update = function(req, res) {
	var injector = new Injector();

	var self = this;

	if (req.isPOST()) {

		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {

			var categoryId = req.body.id,
            name = req.body.name,
            categoryType = req.body.type;

			var asyncCallbacks = [];

            if (name != '') {
                var asyncCallback = function(callback) {
                    var myName = name;
                    var myId = categoryId;
                    var myData = {
                        name: myName,
                        id: myId
                        };
                    rest.updateCategory(myData, function(result) {
                        if(result.success){
                            req.setToast('toast-success', 'Category "' + myName + '" successfully updated!');
                            callback(null);
                        }else{
                //            result.error.filename = myName;
                //            if(result.error.message.indexOf('You may force data.')>=0){
                //                result.error.message = result.error.message.replace('You may force data.','You may force the append by clicking the "Force Append" checkbox.');
                //                result.error.force = true;
                //            }else{
                //                result.error.force = false;
                //            }
                            //TODO: 'toast-warning' shows an info theme rather than a warning theme - odd
                            req.setToast('toast-error','There was a problem while updating the category. Error: '+result.error.code+' - '+result.error.message);
                //            req.setFlash('flash-error','Error: '+result.error.code+' ['+result.error.filename+'] - '+result.error.message);
                            callback(result);
                        }
                    });
                };
                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'You must specify a category name.');
            }

			if (asyncCallbacks.length) {
				async.parallel(asyncCallbacks, function(result) {
                    //console.log('result:',result);
                    if(result==null){
                        if(categoryType === "0" || typeof categoryType === "undefined") {
                          res.redirect('/manage/datasets/'+req.body.id);
                        } else {
                          res.redirect('/manage/snapshots/'+req.body.id);
                        }
                    }else{
                        //if(result.error.force){
                        //    res.redirect('/manage/datasets/forceappend/'+datasetId);
                        //}else{
                            res.redirect('/manage/categories/update/'+categoryId);
                        //}
                    }
				});
			} else {
				res.redirect('/manage/categories/update/'+categoryId);
			}
		});
	} else {

        injector.addMapping('category').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
            rest.ready(function() {
                rest.getCategory(req.params.id, function(category) {
                    callback(category);
                });
            });
        });

		return new RenderAction('update', this, injector, arguments);
	}
};


MyController.prototype.delete = function(req, res) {
	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);
    var categoryType = req.query.type;

	rest.ready(function() {
    rest.deleteItem('category', req.params.id, function() {
      req.setToast('toast-success', 'Category deleted successfully!');
      if(categoryType === 'snapshot') {
        res.redirect('/manage/snapshots');
      } else {
        res.redirect('/manage/datasets');
      }
		});
	});
};

MyController.prototype.get = function(req, res) {
    var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);
    rest.ready(function() {
        rest.getCategory(req.params.id, function(category) {
            res.end(JSON.stringify(category));
        });
    });
};

MyController.prototype.list = function(req, res) {
	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);
    var categoryType = req.query.type;
    var activeId = req.query.activeId;
	var data = {};
	rest.ready(function() {
		rest.getCategories('/type/'+categoryType, function(categories) {
        //Add front end flags
        console.log(categories);

            if(activeId){
                for(i=0;i<categories.length;i++){
                  if(categories[i].id==activeId){
                      categories[i].active = true; //filtered category
                      activeId==-1?categories[i].modify=false:categories[i].modify=true; //uncategorized cannot be modified
                  }
                  if(categories[i].id==-1){
                    categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL
                  };
                }

            } else {
                for(i=0;i<categories.length;i++){
                    if(categories[i].id==-1)
                                   categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL
                }
            }
    		data.categories = categories;
    		res.end(JSON.stringify(data));
		});
	});
};
