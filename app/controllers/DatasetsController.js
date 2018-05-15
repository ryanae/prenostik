var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var async = require('async');

module.exports = MyController;
Util.inherits(MyController, Controller);

var _injector;

function MyController(injector) {
	Controller.call(this, injector);

	this.app = null;

	this.name = 'Datasets';

    this.file = null;

    this.forceableErrors=[4012,4013,4016,4017];
	injector.injectInto(this);
    _injector = injector;
}

MyController.prototype.index = function(req, res) {
	var self = this;
	var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
    var categoryFilterId = req.query.id;
    var data = {};
	rest.ready(function() {
        if(categoryFilterId && typeof categoryFilterId !== 'undefined'){
          rest.getFilteredDatasets('categoryfilterId', categoryFilterId, function(datasets) {
            res.end(JSON.stringify(datasets));
          });
        } else {
          rest.getDatasets(function(datasets) {
            res.end(JSON.stringify(datasets));
          });
        }
	});
};

MyController.prototype.filter = function(req, res) {
    var self = this;
    var activeId = req.params.id;
    var categoryFilterId = activeId;
	var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
    var data = {};
	rest.ready(function() {
        rest.getFilteredDatasets('categoryfilterId',categoryFilterId,function(datasets) {
            data.datasets = datasets;
            callback(data);
        });
	});
};

MyController.prototype.add = function(req, res) {
	var injector = new Injector();

	var self = this;

	if (req.isPOST()) {
		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {

			var files = req.files.file;
			var names = req.body.name;
			var asyncCallbacks = [];

			var i = 0;
			files.forEach(function(file) {
				var name = names[i];
				if (file.size > 0) {
                    if(!name || name == "")
                    {
                        req.setToast('toast-error', 'You must enter a name for '+file.name+' to upload.');
                    } else {
                        var asyncCallback = function(callback) {
                            var myName = encodeURI(name);
                            var myFile = file;
                            rest.ingest(myName, myFile, function(data) {
                                if(data && data.error){
                                  console.log("ERROR:",data.error.message);
                                  req.setToast('toast-error', 'Uploading Data Set "' + decodeURI(myName) + '" failed.');
                                } else {
                                  req.setToast('toast-success', 'Data Set "' + decodeURI(myName) + '" added successfully!');
                                }
                                callback(null);
                            });
                        };

                        asyncCallbacks.push(asyncCallback);
                    }
				} else {
					req.setToast('toast-error', 'You must select a file to upload.');
				}
				i++;
			});

			if (asyncCallbacks.length) {
				async.parallel(asyncCallbacks, function(result) {
					res.redirect('/manage/datasets');
				});
			} else {
				res.redirect('/manage/datasets/add');
			}
		});
	} else {
		return new RenderAction('add', this, injector, arguments);
	}
};

MyController.prototype.append = function(req, res) {
	var injector = new Injector();

	var self = this;

	if (req.isPOST()) {

		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
        var myArguments = arguments;

		rest.ready(function() {

			var file = req.files.file;
			console.log(req.body);
			var datasetId = req.body.appendFileId;
            var datasetName = req.body.appendFileName;
            var forceAppend = req.body.appendForce;
            if(forceAppend==undefined){
                forceAppend=false;
            }else{
                forceAppend=true;
            }
			var asyncCallbacks = [];

            if (file[0].size > 0) {
                var asyncCallback = function(callback) {
                    var myName = file[0].name;
                    var myId = datasetId;
                    var myFile = file[0];

                    rest.upgest(myId, myFile, forceAppend, function(result) {
                        if(result && result.error.code!=''){
                            result.error.filename = myName;
                            if(self.forceableErrors.indexOf(result.error.code)!=-1){
                                result.error.message+=' You may force the append by clicking the "Force Action" checkbox.';
                                result.error.force = true;
                            }else{
                                result.error.force = false;
                            }

                            req.setToast(result.error.force?'toast-warning':'toast-error','There was a problem while appending, please refer to details above.');
                            req.setFlash('flash-error','Error: '+result.error.code+' ['+result.error.filename+'] - '+result.error.message);
                            callback(result);
                        }else{
                            req.setToast('toast-success', 'Data Set "' + myName + '" appended successfully to '+datasetName+'!');
                            callback(null);
                        }
                    });
                };
                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'You must select a file to append.');
            }

			if (asyncCallbacks.length) {
				async.parallel(asyncCallbacks, function(result) {
                    var myId = datasetId;

                    if(result==null){
                        res.redirect('/manage/datasets');
                    }else{
                        if(result.error.force){
                            //res.redirect('/manage/datasets/forceappend/'+datasetId);
                            injector.addMapping('dataset').toProvider(function(callback) {
                                var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

                                rest.ready(function() {
                                    rest.getDataset(myId, function(dataset) {
                                        callback(dataset);
                                    });
                                });
                            });

                            return new RenderAction('appendForce', self, injector, myArguments);
                        }else{
                            res.redirect('/manage/datasets/append/'+datasetId);
                        }
                    }
				});
			} else {
				res.redirect('/manage/datasets/append/'+datasetId);
			}
		});
	} else {

        injector.addMapping('dataset').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getDataset(req.params.id, function(dataset) {
                    callback(dataset);
                });
            });
        });

		return new RenderAction('append', this, injector, arguments);
	}
};

MyController.prototype.update = function(req, res) {
	var injector = new Injector();

	var self = this;

	if (req.isPOST()) {

		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {

			var datasetId = parseInt(req.body.datasetId);
            var datasetName = req.body.datasetName;
            var datasetCategory = req.body.categoryId;
            if(datasetCategory){
                if(typeof datasetCategory == 'string'){
                    //single value
                    datasetCategory = parseInt(datasetCategory);
                //}else{  //deprecated code block - multiUpdate method created
                    //multiple categories not supported at this time
                    //datasetCategory = parseInt(datasetCategory[0]);
                    //for(var i=0; i<datasetCategory.length;i++) datasetCategory[i] = +datasetCategory[i];
                }
            }else{
                datasetCategory = '';
            }

			var asyncCallbacks = [];

            if (datasetName != '') {
                var asyncCallback = function(callback) {
                    var myName = encodeURI(datasetName);
                    var myId = datasetId;
                    var myCategory = datasetCategory;
                    var formData = {id:myId, name:myName};
                    if(myCategory!=-1){
                        formData.categoryId=myCategory;
                    }
                    //console.log('formData:',formData);
                    rest.updateDataset(formData, function(result) {
                        if(result.error && result.error.code!=''){
                            req.setToast('toast-error','Error: '+result.error.code+' - '+result.error.message);
                            callback(result);
                        }else{
                            req.setToast('toast-success', 'Data Set "' + decodeURI(myName) + '" successfully updated!');
                            callback(null);
                        }
                    });
                };
                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'You must specify a dataset name.');
            }

			if (asyncCallbacks.length) {
				async.parallel(asyncCallbacks, function(result) {
                    if(result==null){
                        res.redirect('/manage/datasets');
                    }else{
                        res.redirect('/manage/datasets/update/'+datasetId);
                    }
				});
			} else {
				res.redirect('/manage/datasets/update/'+datasetId);
			}
		});
	} else {

        var datasetCategories = [-1]; //default value is unassigned
        injector.addMapping('dataset').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getDataset(req.params.id, function(dataset) {
                    if(dataset.categories.length>0){
                        datasetCategories[0] = dataset.categories[0].id;
                    }
                    callback(dataset);
                });
            });
        });

        injector.addMapping('categories').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getCategories('/type/0', function(categories) {
                    //Add frontend modifications
                    for(i=0;i<categories.length;i++){
                        //for(j=0;j<datasetCategories.length;j++){
                        if(categories[i].id==datasetCategories[0]){
                            categories[i].selectedReference = true;
                        }
                        //}
                        if(categories[i].id==-1){categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL};
                    }
                    callback(categories);
                });
            });
        });

		return new RenderAction('update', this, injector, arguments);
	}
};

MyController.prototype.multiUpdate = function(req, res) {

    var injector = new Injector();
    var self = this;
    var datasetCategories = [-1]; //default value is unassigned

    if (req.isPOST()) {

        var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
        rest.ready(function() {

            var jsonData = req.body;

            var asyncCallbacks = [];

            if (jsonData.datasets.length>0) {
                var asyncCallback = function(callback) {
                    var formData = jsonData;
										console.log("JSON data:", jsonData);
                    rest.updateDataset(formData, function(result) {
                        console.log('result:',result);
                        if(result.error && result.error.code!=''){
                            req.setToast('toast-error','Error: '+result.error.code+' - '+result.error.message);
                            callback(result);
                        }else{
                            //req.setToast('toast-success', 'Datasets successfully updated!');
                            callback(result);
                        }
                    });
                };
                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'Datasets not detected in request.');
            }

            if (asyncCallbacks.length) {
                async.parallel(asyncCallbacks, function(result) {
                    if(result.success){
                        rest.getCategories('/type/0', function(categories) {
                            console.log('cagtegories',categories);
                            for(var i=0;i<categories.length;i++){
                                if(categories[i].id==datasetCategories[0]){
                                    categories[i].selectedReference = true;
                                }
                                if(categories[i].id==-1){categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL};
                            }
                            result.categories = categories;
                            res.end(JSON.stringify(result));
                        });
                    }else{
                        res.end(JSON.stringify(result));
                    }
                });
            } else {
                res.redirect('/manage/datasets');
            }
        });
    } else {

        injector.addMapping('dataset').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getDataset(req.params.id, function(dataset) {
                    if(dataset.categories.length>0){
                        datasetCategories[0] = dataset.categories[0].id;
                    }
                    callback(dataset);
                });
            });
        });

        injector.addMapping('categories').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getCategories('/type/0', function(categories) {
                    //Add frontend modifications
                    for(var i=0;i<categories.length;i++){
                        if(categories[i].id==datasetCategories[0]){
                            categories[i].selectedReference = true;
                        }
                        if(categories[i].id==-1){categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL};
                    }
                    callback(categories);
                });
            });
        });

        return new RenderAction('update', this, injector, arguments);
    }
};

MyController.prototype.delete = function(req, res) {
	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		//TODO: rest.deleteItem('dataset', req.params.id, function() {
        rest.deleteDataset(req.params.id, function(response) {
            if(!response) {
                res.end(JSON.stringify({
                    'status': 'success',
                    'message': 'Data Set deleted successfully!'
                }))
            }
            //req.setToast('toast-warning', 'Data Sets deletion temporarily disconnected from the REST Server!');
            //res.redirect('/manage/datasets');
        });
    });
};

MyController.prototype.multiDelete = function(req, res) {
    var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	 rest.ready(function() {
        var data = req.body;
        console.log('Request Body', data);
	  	rest.multiDeleteDataset(data.ids, function(response) {
				res.end(JSON.stringify(response));
			})
	 });
};

MyController.prototype.previewMultiColumn = function(req, res) {
    var injector = new Injector();

    var self = this;

		var verifyRows = function(rows) {
			for(var x = 0; x < rows.length; x++) {
				 var row = rows[x];
				 var columns = row.columns;
				 for(var c = 0; c < columns.length; c++){
					 var dObj = columns[c];
					 if (dObj.value === 'No Data')
					   return false;
				}
			}
			return true;
		};

    if (req.isPOST()) {
        if(this.app.file != null)
        {
            this.app.file = null;
        }
        console.log(req.files);
        this.app.file = req.files.file[0];
        injector.addMapping('previewData').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                var file = req.files.file[0];
                if (file && file.size > 0) {
                    rest.previewMultiColumn(file, function (data) {
                        data.fileName = file.name;
                        if(data.rows && data.rows.length > 0 )
                        {
						    var is_valid = verifyRows(data.rows);
                            data.header = data.rows.shift();
                            if(data.header && data.header.columns)
                            {
                                for(var j=0; j<data.header.columns.length; j++)
                                {
                                    data.header.columns[j].editable = (j !== 0);
                                }
                            }
                        }

						if(!is_valid) {
							req.setToast('toast-error', 'One or more rows have missing or invalid values');
						}
						data.is_valid = is_valid;
						console.log(data.is_valid);
                        callback(data);
                    });
                } else {
                    req.setToast('toast-error', 'You must select a file to upload.');
                    res.redirect('/manage/datasets');
                }
            });
        });
        injector.addMapping('datasets').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getDatasets(function(datasets) {
                    callback(datasets);
                });
            });
        });
    };

    return new RenderAction('preview', this, injector, arguments);
};

MyController.prototype.ingestMultiColumn = function(req, res) {
    var self = this;
    if (req.isPOST()) {
        var columndefs = [];
        console.log(req.body);
        if(req.body.dataset_name instanceof Array)
        {
            for (var i = 0; i < req.body.dataset_name.length; i++) {
                var object = {};
                var datasetId = req.body.datasetId[i];
                if(datasetId)
                {
                    object.datasetId = datasetId;
                    object.mode = req.body["mode"+(i+1)];
                } else {
                    object.datasetName = encodeURI(req.body.dataset_name[i]);
                    object.mode = "a";
                }
                columndefs.push(object);
            }
        } else {
            var singleItem = {};
            var datasetId = req.body.datasetId;
            if(datasetId)
            {
                singleItem.datasetId = datasetId;
                singleItem.mode = req.body["mode1"];
            } else {
                singleItem.datasetName = encodeURI(req.body.dataset_name);
                singleItem.mode = "a";
            }
            columndefs.push(singleItem);
        }
        var output = '{"columndefs":' + JSON.stringify(columndefs) + '}';
        var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

        rest.ready(function () {
            rest.ingestMultiColumn(output, self.app.file, function (result) {
                if(result && result.error && result.error.code!=''){
                    if(result.error.message.indexOf('You may force data.')>=0){
                        result.error.message = result.error.message.replace('You may force data.','Force option coming soon.');
                        result.error.force = true;
                    }else{
                        result.error.force = false;
                    }
                    req.setToast(result.error.force?'toast-warning':'toast-error','There was a problem.');
                    req.setFlash('flash-error','Error: '+result.error.code+' - '+decodeURI(result.error.message));
                    res.redirect('/manage/datasets');
                }else{
                    if(result instanceof Array && result.length > 0)
                    {
                        for(var i=0; i<result.length; i++)
                        {
                            req.setToast('toast-success', decodeURI(result[i].name)+' updated with '+result[i].totalDatapoints+' datapoints.');
                        }
                    } else {
						req.setFlash('flash-success', 'Data set has been uploaded and is now processing. Please check back soon to see your data sets listed here');
                        req.setToast('toast-success', 'Success!');
                    }
                    res.redirect('/manage/datasets');
                }
            });
        });
    }
};

MyController.prototype.getDatasets = function(req, res){
    var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

    rest.ready(function() {
        rest.getDatasets(function(dataset) {
            res.end(JSON.stringify(dataset));
        });
    });
}

MyController.prototype.renderDatasets = function(req, res){
	var self = this;
  var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);
  var data = {}

  rest.ready(function() {
    rest.getDatasets(function(datasets) {
      data.datasets = datasets;
			rest.getCategories('/type/0', function(categories) {
                //Add front end flags
                for(i=0;i<categories.length;i++){
                    if(categories[i].id==-1){categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL};
                }
        data.categories = categories;
        res.end(JSON.stringify(data));
			});
    });
  });
};


MyController.prototype.renderDatasetsFilter = function(req, res) {
  var self = this;
  var activeId = req.query.id;
  var categoryFilterId = activeId;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var data = {};

  rest.ready(function() {
    rest.getCategories('/type/0', function(categories) {
      for(i=0;i<categories.length;i++){
          if(categories[i].id==activeId){
              categories[i].active = true; //filtered category
              activeId==-1?categories[i].modify=false:categories[i].modify=true; //uncategorized cannot be modified
          }
          if(categories[i].id==-1){
            categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL
          };
      }
      data.categories = categories;
      rest.getFilteredDatasets('categoryfilterId', categoryFilterId, function(datasets) {
        data.datasets = datasets;
        res.end(JSON.stringify(data));
      });
    });
  });
};
