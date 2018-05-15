var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var async = require('async');

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
	Controller.call(this, injector);

	this.app = null;

	this.name = 'Worksheets';

	injector.injectInto(this);
}

MyController.prototype.index = function(req, res) {
  var self = this;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var categoryFilterId = req.query.id;
  console.log(categoryFilterId);
  var data = {}
  rest.ready(function() {
    if(categoryFilterId && typeof categoryFilterId !== 'undefined'){
      rest.getFilteredWorksheets('categoryfilterId', categoryFilterId, function(worksheets) {
        data.worksheets = worksheets;
        res.end(JSON.stringify(worksheets));
      });
    } else {
      rest.getWorksheets(function(worksheets) {
        data.worksheets = worksheets;
        res.end(JSON.stringify(worksheets));
      });
    }
  });
};


MyController.prototype.filter = function(req, res) {
  var self = this;
  var activeId = req.query.id
  var categoryFilterId = activeId;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var data = {};

  rest.ready(function() {
      rest.getFilteredWorksheets('categoryfilterId', categoryFilterId, function(worksheets) {
        data.worksheets = worksheets;
        res.end(JSON.stringify(data));
      });
  });
};

MyController.prototype.add = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
    delete req.body.chartOptions;
		rest.saveWorksheet(req.body, function(response) {
			res.end(JSON.stringify(response));
		});
	});
};


MyController.prototype.multiUpdate = function(req, res) {

    var injector = new Injector();
    var self = this;
    var worksheetCategories = [-1]; //default value is unassigned

    if (req.isPOST()) {

        var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
        rest.ready(function() {

            var jsonData = req.body;

            var asyncCallbacks = [];

            if (jsonData.worksheets.length>0) {
                var asyncCallback = function(callback) {
                    var formData = jsonData;
                    rest.updateWorksheet(formData, function(result) {
                        console.log('result:',result);
                        if(result.error && result.error.code!=''){
                            req.setToast('toast-error','Error: '+result.error.code+' - '+result.error.message);
                            callback(result);
                        }else{
                            callback(result);
                        }
                    });
                };
                asyncCallbacks.push(asyncCallback);
            } else {
                req.setToast('toast-error', 'Worksheets not detected in request.');
            }

            if (asyncCallbacks.length) {
                async.parallel(asyncCallbacks, function(result) {
                    if(result.success){
                        rest.getCategories('/type/1', function(categories) {
                            console.log('categories',categories);
                            for(var i=0;i<categories.length;i++){
                                if(categories[i].id==worksheetCategories[0]){
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
                res.redirect('/manage/snapshots');
            }
        });
    } else {

        injector.addMapping('worksheets').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getWorksheet(req.params.id, function(worksheet) {
                    if(worksheet.categories.length>0){
                        worksheetCategories[0] = worksheet.categories[0].id;
                    }
                    callback(worksheet);
                });
            });
        });

        injector.addMapping('categories').toProvider(function(callback) {
            var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

            rest.ready(function() {
                rest.getCategories('/type/1', function(categories) {
                    //Add frontend modifications
                    for(var i=0;i<categories.length;i++){
                        if(categories[i].id==worksheetCategories[0]){
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

MyController.prototype.update = function(req, res) {
	//var injector = new Injector();

	if (req.isPOST()) {

		var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

		rest.ready(function() {
			      var worksheetId = parseInt(req.body.id);
            var worksheetName = req.body.name;
            var worksheetData = req.body.data;
            //var asyncCallbacks = [];

            if (worksheetName != '' || worksheetData != '') {
                //var asyncCallback = function(callback) {
                    var myId = worksheetId;
                    var formData = {id:myId};
                    var myData = worksheetData;
                    var myName = worksheetName;

                    if(myName!='' && typeof myName !== 'undefined'){
                      formData.name = myName;
                    }

                    if(myData !='' && typeof myData !== 'undefined'){
                      formData.data = myData;
                    }

                    console.log(formData);

                    rest.updateWorksheet(formData, function(result) {
                        console.log('WorksheetsController result:',result);
                        if(result.error && result.error.code!=''){
                            //req.setToast('toast-error','Error: '+result.error.code+' - '+result.error.message);
                            res.end(JSON.stringify(result));
                            //callback(result);
                        }else{
                            //req.setToast('toast-success', 'Worksheet "' + myName + '" successfully updated!');
                            res.end(JSON.stringify(result));
                            //callback(null);
                        }
                    });

                //};
                //asyncCallbacks.push(asyncCallback);
            } else {
                //req.setToast('toast-error', 'You must specify a dataset name.');
                res.end(JSON.stringify({success:false,error:'You must specify a dataset name.'}));
            }
            /*
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
            */
		});
	} else {

        //No Worksheet update interface at this time

	}
};






MyController.prototype.list = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.getWorksheets(function(worksheets) {
			res.end(JSON.stringify(worksheets));
		});
	});
};

MyController.prototype.get = function(req, res) {
	//console.log("WorksheetsController::get...");
	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);
  var dataparams = req.query.dataparams;
	//console.log("WorksheetsController::get::dataparams", dataparams);
	rest.ready(function() {
		rest.getWorksheet(req.params.id, dataparams, function(worksheet) {
      if(worksheet.error){
        console.log(worksheet)
        res.end(JSON.stringify(worksheet));
      } else {
        rest.getForecasts(req.params.id, function(forecasts){
          worksheet.data.forecasts = forecasts;
          delete worksheet.data.chartOptions;
          res.end(JSON.stringify(worksheet));
        })
      }
		});
	});
};

MyController.prototype.delete = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
        //TODO: rest.deleteItem('worksheet', req.params.id, function() {
		rest.deleteWorksheet(req.params.id, function() {
      res.end(JSON.stringify({
        'status': 'success',
        'message': 'Snapshot deleted successfully!'
      }))
			// req.setToast('toast-success', 'Snapshot deleted successfully!');
			// res.redirect('/manage/snapshots');
		});
	});
};

MyController.prototype.multiDelete = function(req, res) {
   var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	 rest.ready(function() {

      var data = req.body;
      console.log('Request Body', data);
	  	rest.deleteMultiWorksheets(data.worksheetIds, function(response) {
				res.end(JSON.stringify(response));
			})
	 });
};

MyController.prototype.renderSnapshots = function(req, res) {
  var self = this;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var data = {}
  rest.ready(function() {
    rest.getWorksheets(function(worksheets) {
      data.worksheets = worksheets;
      rest.getCategories('/type/1', function(categories) {
                //Add front end flags
                console.log('categories:', categories);
                for(i=0;i<categories.length;i++){
                    if(categories[i].id==-1){categories[i].name=process.env.UNASSIGNED_CATEGORY_LABEL};
                }
        data.categories = categories;
        res.end(JSON.stringify(data));
      });
    });
  });
};


MyController.prototype.renderSnapshotsFilter = function(req, res) {
  var self = this;
  var activeId = req.query.id
  var categoryFilterId = activeId;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var data = {};

  rest.ready(function() {
    rest.getCategories('/type/1', function(categories) {
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
      rest.getFilteredWorksheets('categoryfilterId', categoryFilterId, function(worksheets) {
        data.worksheets = worksheets;
        res.end(JSON.stringify(data));
      });
    });
  });
};


MyController.prototype.listForecasts = function(req, res) {
  var self = this;
  var snapshotId = req.params.id;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

  rest.ready(function(){
    rest.getForecasts(function(forecasts){
      res.end(JSON.stringify(forecasts));
    });
  })
};

MyController.prototype.addForecast = function(req, res) {
  var self = this;
  var snapshotId = req.params.id;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var data = req.body;
  rest.ready(function(){
    rest.saveForecast(data, snapshotId, function(response){
      res.end(JSON.stringify(response));
    });
  })
};

MyController.prototype.deleteForecast = function(req, res) {
  var self = this;
  var snapshotId = req.params.id;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);
  var forecastId = req.params.forecastId;

  rest.ready(function(){
    rest.deleteForecast(snapshotId, forecastId, function(){
      response = {
        success: true
      }
      res.end(JSON.stringify(response));
    });
  });
};

MyController.prototype.saveForecast = function(req, res) {
  var self = this;
  var snapshotId = req.params.id;
  var forecastId = req.params.forecastId;
  var data = req.body;
  data.id = forecastId;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

  rest.ready(function(){
    rest.updateForecast(data, snapshotId, function(){
        response = {
          success: true
        }
        res.end(JSON.stringify(response));
    });
  });
};

MyController.prototype.clone = function(req, res) {
  var self = this;
  var snapshotId = req.params.id;
  var data = req.body;
  var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

  rest.ready(function(){
    rest.cloneWorksheet(data, snapshotId, function(response){
      console.log(response);
      res.end(JSON.stringify(response));
    });
  });
};

