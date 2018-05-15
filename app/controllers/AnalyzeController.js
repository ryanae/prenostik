var Util = require('util');
var Controller = require('../../lib/Controller');
var Injector = require('medic-injector').Injector;
var RenderAction = require('../../lib/RenderAction');
var hbs = require('hbs');
var moment = require('moment');

module.exports = MyController;
Util.inherits(MyController, Controller);

function MyController(injector) {
	Controller.call(this, injector);

	this.app = null;

	this.name = 'Analyze';

	injector.injectInto(this);

    hbs.registerHelper('YYYY-MM-DD', function(date) {
        return moment(date).utc().format('YYYY-MM-DD');
    });
}

MyController.prototype.trending = function(req, res) {
	var injector = new Injector();

	var self = this;
	injector.addMapping('datasets').toProvider(function(callback) {
		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.getDatasets(function(datasets) {
                //remove nulls to help sorting...
                for(i=0;i<datasets.length;i++){
                    if(!datasets[i].categoryName){
                        datasets[i].categoryName='ZZZZZZ';  //force uncategorized to the end
                    }
                }
                //sort by category and name
                datasets.sort(function(a, b) {
                    if(1==2){
                        //case sensitivity does not seem to be working 
                        result = a.categoryName.localeCompare(b.categoryName, {sensitivity: "accent", numeric: "true"});
                        if(result==0){
                            result = a.name.localeCompare(b.name, {sensitivity: "accent", numeric: "true"});
                            console.log('result='+result);
                        }
                        return result;
                    }else{
                        acategoryName=a.categoryName.toLowerCase();
                        bcategoryName=b.categoryName.toLowerCase();
                        aname=a.name.toLowerCase();
                        bname=b.name.toLowerCase();
                        if (acategoryName > bcategoryName){
                            return 1;}
                        if (acategoryName < bcategoryName){
                            return -1;}
                        // a.categoryName must be equal to b.categoryName
                        if (aname > bname){
                            return 1;}
                        if (aname < bname){
                            return -1;}
                        // a.name must be equal to b.name
                        return 0;
                    }
                });
                
                var prevCategory = '';
                //set flags and use the uncategorized label
                for(i=0;i<datasets.length;i++){
                    if(datasets[i].categoryName=='ZZZZZZ'){datasets[i].categoryName=process.env.UNASSIGNED_CATEGORY_LABEL;}
                    if(datasets[i].categoryName != prevCategory){
                        datasets[i].optGroup=true;
                        prevCategory=datasets[i].categoryName;
                    }
                }
				callback(datasets);
			});
		});
	});
    //injector.addMapping('categories').toProvider(function(callback) {
	//	var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

	//	rest.ready(function() {
	//		rest.getCategories(function(categories) {
    //            console.log('categories[0]:',categories[0]);
	//			callback(categories);
	//		});
	//	});
	//});

	return new RenderAction('trending', this, injector, arguments);
};

MyController.prototype.saveWorksheet = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.saveWorksheet(req.body, function(response) {

			res.end(JSON.stringify(response));
		});
	});
};

MyController.prototype.getWorksheets = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.getWorksheets(function(worksheets) {

			res.end(JSON.stringify(worksheets));
		});
	});
};

MyController.prototype.getWorksheet = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.getWorksheet(req.params.id, function(worksheet) {
			res.end(JSON.stringify(worksheet));
		});
	});
};

MyController.prototype.deleteWorksheet = function(req, res) {

	var rest = new (require('./components/PrenostikRest'))(this.app, req.session.id);

	rest.ready(function() {
		rest.deleteWorksheet(req.params.id, function() {
			req.setToast('toast-success', 'Snapshot deleted successfully!');
			res.redirect('/manage/projects');
		});
	});
};


MyController.prototype.renderTrending = function(req, res) {
    var self = this;

		var rest = new (require('./components/PrenostikRest'))(self.app, req.session.id);

		rest.ready(function() {
			rest.getDatasets(function(datasets) {
                //remove nulls to help sorting...
                for(i=0;i<datasets.length;i++){
                    if(!datasets[i].categoryName){
                        datasets[i].categoryName='ZZZZZZ';  //force uncategorized to the end
                    }
                }
                //sort by category and name
                datasets.sort(function(a, b) {
                    if(1==2){
                        //case sensitivity does not seem to be working 
                        result = a.categoryName.localeCompare(b.categoryName, {sensitivity: "accent", numeric: "true"});
                        if(result==0){
                            result = a.name.localeCompare(b.name, {sensitivity: "accent", numeric: "true"});
                            console.log('result='+result);
                        }
                        return result;
                    }else{
                        acategoryName=a.categoryName.toLowerCase();
                        bcategoryName=b.categoryName.toLowerCase();
                        aname=a.name.toLowerCase();
                        bname=b.name.toLowerCase();
                        if (acategoryName > bcategoryName){
                            return 1;}
                        if (acategoryName < bcategoryName){
                            return -1;}
                        // a.categoryName must be equal to b.categoryName
                        if (aname > bname){
                            return 1;}
                        if (aname < bname){
                            return -1;}
                        // a.name must be equal to b.name
                        return 0;
                    }
                });
                
                var prevCategory = '';
                //set flags and use the uncategorized label
                for(i=0;i<datasets.length;i++){
                    if(datasets[i].categoryName=='ZZZZZZ'){datasets[i].categoryName=process.env.UNASSIGNED_CATEGORY_LABEL;}
                    if(datasets[i].categoryName != prevCategory){
                        datasets[i].optGroup=true;
                        prevCategory=datasets[i].categoryName;
                    }
                }
				res.end(JSON.stringify(datasets));
			});
		});
};
