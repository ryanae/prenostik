var request = require('request');
var _ = require('underscore')._;
var restless = require('restless'); //({ proxy: "http://127.0.0.1:8888" });
var dateFormat = require('dateformat');
var urlFunc = require('url');
var fs = require('fs');
var RestComponent = require('./CommonRest');
var zlib = require('zlib');
var FormData = require('form-data');
var shortid = require('shortid');
var Immutable = require('immutable');
var PrenostikUser = require('../../../public/js/app/PrenostikUser');


RestComponent.prototype.performPostRequestIncludingFile = function(path, file, auth, cb) {

	var options = {multipart: true};

	console.log('performPostRequestIncludingFile for ' + path);

	if (typeof auth === "object") {
		options = _.extend(options, {username: auth[0], password: auth[1]});
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			options = _.extend(options, {username: this.session.user.username, password: this.session.user.password});
		}
		cb = auth;
	}

	options = _.extend(options, {
		data: {
			file: restless.file(file.path, null, file.size, null, file.type)
		}
	});

	var urlString = process.env.REST_ENDPOINT + path;
	var parsedUrl = urlFunc.parse(urlString, true);
	var columndefs = null;
	if(parsedUrl.query){
		columndefs = parsedUrl.query.columndefs;
	}

	if(columndefs && typeof columndefs !== "undefined"){
		options.data.columndefs = columndefs
		var urlString = parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname;
		columns = JSON.parse(columndefs).columndefs;
		if(Object.keys(columns).length > 30) {
			urlString += "?async=1";
		}
	}

	restless.post(urlString, options, function(err, body, resp) {
		  if(err){
				console.log(err);
			}

		  console.log('Response status code:', resp.statusCode);
		  cb(body);
	});

	/*var options = {};

	console.log('performPostRequestIncludingFile for ' + path);

	if (typeof auth === "object") {
		auth_obj = {username: auth[0], password: auth[1], sendImmediately: true};
	} else {
		if (typeof this.session !== "undefined" && typeof this.session.user !== "undefined") {
			auth_obj = {username: this.session.user.username, password: this.session.user.password, sendImmediately: true};
		}
		cb = auth;
	}

	var request_options = {
		url: process.env.REST_ENDPOINT + path,
		headers: {
			'Accept': '',
			'Content-Type': 'multipart/form-data',
		},
		auth: auth_obj,
		method: "POST",
		timeout: 3 * 60 * 1000,
		body: JSON.stringify({
				file: {
					"path": file.path,
					"fileSize": file.size,
					"contentType": file.type,
				}
		}),
	};

	console.log(request_options);

	request(request_options, function(err, resp, body){
		console.log(body);
	});*/
};

RestComponent.prototype.getDatasets = function(cb) {
		console.log('PrenostikRest::getDatasets...');//LH

    this.performGetRequest('dataset', function(err, res, body) {
		var datasets = [];
		console.log("STATUS CODE:", res.statusCode);
		console.log(err);
		// console.log("Datasets", body);


		// if(typeof body === 'string') {
		// 	console.log(body);
		// 	body = JSON.parse(body);
		// }
		for (var i in body) {
			var dataset = body[i];


			var createdDate = "",
			modifiedDate = "",
			assignedWorksheets = [];

			if(dataset.createDate){
			  createdDate = dateFormat(new Date(dataset.createDate), 'UTC:yyyy-mm-dd');
			}

			if(dataset.modifiedDate){
			  modifiedDate = dateFormat(new Date(dataset.modifiedDate), 'UTC:yyyy-mm-dd');
			}

			if(dataset.assignedWorksheets){
				 for(var i = 0; i < dataset.assignedWorksheets.length; i++){
				 		var assignedWorksheet = dataset.assignedWorksheets[i];
						assignedWorksheet = decodeURIComponent(assignedWorksheet);
						assignedWorksheets.push(assignedWorksheet);
				}

			}

			try{

				var obj = {
	                id: dataset.id,
	                name: unescape(dataset.name),
	                start: dataset.startDate,
	                startFormatted: dateFormat(new Date(dataset.startDate), 'UTC:yyyy-mm-dd'),
	                end: dataset.endDate,
	                endFormatted: dateFormat(new Date(dataset.endDate), 'UTC:yyyy-mm-dd'),
									createdBy: {
										firstname: dataset.createdBy.firstname,
										lastname: dataset.createdBy.lastname,
									},
									assignedWorksheets: assignedWorksheets,
									modifiedBy: dataset.modifiedBy,
									createdDate: createdDate,
									modifiedDate: modifiedDate,
	                numDataPoints: dataset.totalDatapoints,
	                categoryName: dataset.categoryName,
	                shift: dataset.shift
				};

				//obj.selectedReference = (_.indexOf([3], obj.id) !== -1) ? true : false;
				//obj.selectedTest = (_.indexOf([34, 36, 37], obj.id) !== -1) ? true : false;
				datasets.push(obj);
			} catch(e) {
				console.log(dataset);
				console.log(e);

			}
		}

		cb(datasets);
	});
};

RestComponent.prototype.getDataset = function(id, cb) {
	this.performGetRequest('dataset/' + id, function(err, res, body) {
		var dataset = body;

		var data = {
			id: dataset.id,
			name: unescape(dataset.name),
			start: dataset.startDate,
			//startFormatted: dateFormat(new Date(dataset.startDate), 'yyyy-mm-dd'),
			end: dataset.endDate,
			//endFormatted: dateFormat(new Date(dataset.endDate), 'yyyy-mm-dd'),
      //numDataPoints: dataset.totalDatapoints,
      categories: dataset.categories
      //shift: dataset.shift
		};
		cb(data);
	});
};

RestComponent.prototype.getFilteredDatasets = function(filtType, filtValue, cb) {

    var url = encodeURI('dataset'
		+ '?'+filtType+'=' + filtValue
	);
    /*Patterns
     /dataset?categoryfilterId=1   filtered by a category
     /dataset?categoryfilterId=-1    you'll get back all unassigned datasets
     /dataset                        returns all datasets unfiltered.
     */

    this.performGetRequest(url, function(err, res, body) {
		var datasets = [];

		for (var i in body) {
			var dataset = body[i];

			var createdDate = "";
			var modifiedDate = "";
			var assignedWorksheets = [];

			if(dataset.createDate){
			  createdDate = dateFormat(new Date(dataset.createDate), 'UTC:yyyy-mm-dd');
			}

			if(dataset.modifiedDate){
			  modifiedDate = dateFormat(new Date(dataset.modifiedDate), 'UTC:yyyy-mm-dd');
			}

			if(dataset.assignedWorksheets){
				 for(var i = 0; i < dataset.assignedWorksheets.length; i++){
				 		var assignedWorksheet = dataset.assignedWorksheets[i];
						assignedWorksheet = decodeURIComponent(assignedWorksheet);
						assignedWorksheets.push(assignedWorksheet);
				}

			}

			var obj = {
                id: dataset.id,
                name: unescape(dataset.name),
                start: dataset.startDate,
                startFormatted: dateFormat(new Date(dataset.startDate), 'UTC:yyyy-mm-dd'),
                end: dataset.endDate,
                endFormatted: dateFormat(new Date(dataset.endDate), 'UTC:yyyy-mm-dd'),
								createdBy: {
									firstname: dataset.createdBy.firstname,
									lastname: dataset.createdBy.lastname,
								},
								assignedWorksheets: assignedWorksheets,
								modifiedBy: dataset.modifiedBy,
								createdDate: createdDate,
								modifiedDate: modifiedDate,
                numDataPoints: dataset.totalDatapoints,
                categoryName: dataset.categoryName,
                shift: dataset.shift
			};
            datasets.push(obj);

		}

		cb(datasets);
	});
};

RestComponent.prototype.deleteDataset = function(id, cb) {
    this.performDeleteRequest('dataset/' + id, function(err, res, body) {
    	cb(body);
    });
    //cb();
};

RestComponent.prototype.multiDeleteDataset = function(ids, cb) {
	ids = _.map(ids, function (id) {
			return parseInt(id);
	});

	response_obj = {
		success: null,
		error: null
	}

  this.performRawDeleteRequest('dataset/jsonArray', ids, function(err, res, body) {
		if(err) console.log(err);
		if(typeof body === 'undefined'){
		  response_obj.success = 'Deleted successfully!';
		} else {
			response_obj.error = body;
		}
		cb(response_obj);
	})
};

RestComponent.prototype.updateDataset = function(data, cb) {

    var formData;
    var url = 'dataset';
    if(data.datasets){
        //update multiple datasets (array/collection format expected)
        formData = data.datasets;
        url = url + '/jsonArray';
    }else{
        //update single dataset (json format expected)
        var formData = {
            id:data.id,
            categoryId:data.categoryId,
            name:data.name
        }
    }
    //console.log('formData:',formData);

     this.performRawPutRequest(url, formData, function(err, res, body) {

		//console.log('res.statusCode:'+res.statusCode);
		//console.log('----');
		//console.log(body);
		//console.log('----');
    //console.log('err:'+err);

	  console.log(url, res.statusCode);

		if (res.statusCode != 200 && res.statusCode != 201) {
            cb({success: false, error: body.error});
		} else {
			var dataset = {
				success: true,
				id: body,
				name: data.name
			};
			cb(dataset);
		}

	});
};

RestComponent.prototype.saveWorksheet = function(data, cb) {
	
	var options = data.options;
	if(typeof options === 'string'){
		options = JSON.parse(options);
	}
	console.log('PrenostikRest::saveWorksheet...', data);

	var formData = {
		name: data.name,
		basedatasetid: options.referenceData,
		startdate: options.startDate,
		enddate: options.endDate,
		relativedatasetids: options.testIDs.join('|'),
		unit: options.shiftType,
		shiftrange: options.shiftRange,
		categoryid:-1
	};

	var outputFilename = '/tmp/'+ shortid.generate()+'.json'
	var self = this;
    // JSON.stringify(data.rawResults, null, 4)
 	fs.writeFile(outputFilename, data.rawResults, function(err) {
 		if(err) cb(err);

 		formData.data = fs.createReadStream(outputFilename);
 		var stat = fs.statSync(outputFilename);
		self.performPostRequest('worksheet/multipart', formData, stat.size, function(err, res, body) {
			fs.unlinkSync(outputFilename);
			if (res.statusCode != 200 && res.statusCode != 201) {
				cb({
						success: false,
						error: 'Error status: ' + res.statusCode});
			} else {
				var worksheet = {
					success: true,
					id: body,
					name: formData.name
				};

				cb(worksheet);
			}
		});

 	});

};

RestComponent.prototype.updateWorksheet = function(data, cb) {

    var formData;
    var url = 'worksheet';

	var dataArray = [];
	var has_no_data = false;

    if(data.worksheets){
    	var parsedData = JSON.parse(data.worksheets);
	    for(var i = 0; i < parsedData.length; i++) {
	      var worksheetData = {
	        id: parsedData[i].id,
	        category: {
	          id: parsedData[i].categoryId
	        }
	      }
	      dataArray.push(worksheetData);
	    }

    } else {
		var worksheetData = {
		  id:data.id,
		  category: {
		    id: data.categoryId
		  }
		}
		if(!data.id) {
			// This worksheet doesn't exist in database yet
			cb({success: false, error: 'Worksheet does not exist'});
		}
		if(data.name){worksheetData.name = data.name}

		if(!data.data){
			has_no_data = true;
		}

		worksheetData.data = data.data;
		dataArray.push(worksheetData);
    }

    if(has_no_data){
    	console.log("Sending as raw put", JSON.stringify(data));
    	this.performRawPutRequest('worksheet', JSON.stringify(data), function(err, res, body){
			if (res.statusCode != 200 && res.statusCode != 201) {
				cb({success: false,
					statusCode: res.statusCode,
					error: body});
			} else {
				var worksheet = {
					success: true,
					id: body,
					name: data.name
				};
				cb(worksheet);
			}
    	});

    } else {
	    var outputFilename = '/tmp/'+ shortid.generate()+'.json'
		var self = this;

		fs.writeFile(outputFilename, JSON.stringify(dataArray, null, 4), function (err) {
			if(err) cb(err);
			formData = {'data': fs.createReadStream(outputFilename)};
			var stat = fs.statSync(outputFilename);
			self.performPostRequest('worksheet/update/multipart', formData, stat.size, function(err, res, body) {

				fs.unlinkSync(outputFilename);

				if (res.statusCode != 200 && res.statusCode != 201) {
					cb({success: false,
						statusCode: res.statusCode,
						error: body});
				} else {
					var worksheet = {
						success: true,
						id: body,
						name: data.name
					};
					cb(worksheet);
				}

			});

		});

    }


};

RestComponent.prototype.getWorksheets = function(cb) {
	this.performGetRequest('worksheet', function(err, res, body) {
		var worksheets = [];

		for (var i in body) {
			var worksheet = body[i];

			if (typeof worksheet.relativeDatasetIds === 'undefined') {
				relativeDatasetIds = [];
			} else {
				relativeDatasetIds = worksheet.relativeDatasetIds;
			}

			if(typeof worksheet.startDate === 'undefined' || worksheet.startDate === '')
					continue;

			var createdDate = "";
			var modifiedDate = "";
			var assignedDatasets = []

			if(worksheet.createDate){
			  createdDate = dateFormat(new Date(worksheet.createDate), 'UTC:yyyy-mm-dd');
			}

			if(worksheet.modifiedDate){
			  modifiedDate = dateFormat(new Date(worksheet.modifiedDate), 'UTC:yyyy-mm-dd');
			}

			if(worksheet.assignedDatasets.length){

				for(var i = 0; i < worksheet.assignedDatasets.length; i++){
					var assignedDataset = worksheet.assignedDatasets[i];
					assignedDataset = decodeURIComponent(assignedDataset);
					assignedDatasets.push(assignedDataset);
				}
			}

			var worksheetData = {
				id: worksheet.id,
				name: worksheet.name,
				start: worksheet.startDate,
				startFormatted: dateFormat(new Date(worksheet.startDate), 'UTC:yyyy-mm-dd'),
				end: worksheet.endDate,
				endFormatted: dateFormat(new Date(worksheet.endDate), 'UTC:yyyy-mm-dd'),
				createdBy: {
					firstname: worksheet.createdBy.firstname,
					lastname: worksheet.createdBy.lastname,
				},
				assignedDatasets: assignedDatasets,
				modifiedBy: worksheet.modifiedBy,
				baseDatasetId: worksheet.baseDatasetId,
				relativeDatasetIds: relativeDatasetIds,
				created: worksheet.createDate,
				modifiedDate: modifiedDate,
				createdFormatted: dateFormat(new Date(worksheet.createDate), 'UTC:yyyy-mm-dd')
			};

			worksheets.push(worksheetData);
		}

		cb(worksheets);
	});
};

RestComponent.prototype.getWorksheet = function(id, dataparams, cb) {
	//this.performGetRequest('worksheet/' + id, function(err, res, body) {
	var url ='worksheet/' + id; 
	console.log('URL', url);
	console.log('params', dataparams);
	if(dataparams){
		url += dataparams;
	}
	this.performGetRequest(url, function(err, res, body) {//get existing firsttime, or post save first time
		console.log("PrenostikRest::getWorksheet...");

		var worksheet = body;
		console.log(res.headers);

 		if(typeof worksheet === 'string'){
 			try{
	 			console.log('Worksheet type: ', typeof worksheet);
	 			worksheet = JSON.parse(worksheet);
	 			console.log('Worksheet type is still: ', typeof worksheet);
	 			if(typeof worksheet === 'string'){
		 			worksheet = JSON.parse(worksheet);
	 			}
	 			console.log('Worksheet type: ', typeof worksheet);
 			} catch (e){
 				// fs.writeFileSync('bad.json', worksheet);
 				cb({error: e.name + ': ' + e.message})
 			}
 		}

 		if(worksheet.data === 'undefined') {
 			worksheet.data = '';
 		}

 		try{

			var data = {
				id: worksheet.id,
				name: worksheet.name,
				start: worksheet.startDate,
				startFormatted: dateFormat(new Date(worksheet.startDate), 'UTC:yyyy-mm-dd'),
				end: worksheet.endDate,
				endFormatted: dateFormat(new Date(worksheet.endDate), 'UTC:yyyy-mm-dd'),
				baseDatasetId: worksheet.baseDatasetId,
				relativeDatasetIds: worksheet.relativeDatasetIds == null ? [] : worksheet.relativeDatasetIds.split('|'),
				data: worksheet.data === '' ? '' : JSON.parse(worksheet.data),
				created: worksheet.createDate,
				createdFormatted: dateFormat(new Date(worksheet.createDate), 'UTC:yyyy-mm-dd'),
				shiftRange: worksheet.shiftRange,
				unit: worksheet.unit
			};

			console.log(data.data.datapoints.length + ' total datapoints')

			cb(data);
		} catch(e) {
			cb({error: e.name + ': ' + e.message})
		}
	});
};



RestComponent.prototype.getFilteredWorksheets = function(filtType, filtValue, cb) {

    var url = encodeURI('worksheet'
		+ '?'+filtType+'=' + filtValue
	);
    /*Patterns
     /worksheet?categoryfilterId=1   filtered by a category
     /worksheet?categoryfilterId=-1    you'll get back all unassigned datasets
     /worksheet                        returns all datasets unfiltered.
     */

    this.performGetRequest(url, function(err, res, body) {
		var worksheets = [];

		for (var i in body) {
			var worksheet = body[i];

			var createdDate = "";
			var modifiedDate = "";
			var assignedDatasets = [];

			if(worksheet.createDate){
			  createdDate = dateFormat(new Date(worksheet.createDate), 'UTC:yyyy-mm-dd');
			}

			if(worksheet.modifiedDate){
			  modifiedDate = dateFormat(new Date(worksheet.modifiedDate), 'UTC:yyyy-mm-dd');
			}

			if(worksheet.assignedDatasets.length){

				for(var i = 0; i < worksheet.assignedDatasets.length; i++){
					var assignedDataset = worksheet.assignedDatasets[i];
					assignedDataset = decodeURIComponent(assignedDataset);
					assignedDatasets.push(assignedDataset);
				}
			}

			var obj = {
                id: worksheet.id,
                name: worksheet.name,
                start: worksheet.startDate,
                startFormatted: dateFormat(new Date(worksheet.startDate), 'UTC:yyyy-mm-dd'),
                end: worksheet.endDate,
                endFormatted: dateFormat(new Date(worksheet.endDate), 'UTC:yyyy-mm-dd'),
								createdBy: {
									firstname: worksheet.createdBy.firstname,
									lastname: worksheet.createdBy.lastname,
								},
				        assignedDatasets: assignedDatasets,
								modifiedBy: worksheet.modifiedBy,
                baseDatasetId: worksheet.baseDatasetId,
                relativeDatasetIds: worksheet.relativeDatasetIds == null ? [] : worksheet.relativeDatasetIds.split('|'),
                data: JSON.parse(worksheet.data),
                created: worksheet.createDate,
								modifiedDate: modifiedDate,
                createdFormatted: dateFormat(new Date(worksheet.createDate), 'UTC:yyyy-mm-dd'),
                shiftRange: worksheet.shiftRange,
                unit: worksheet.unit
			};
            worksheets.push(obj);

		}

		cb(worksheets);
	});
};

RestComponent.prototype.deleteWorksheet = function(id, cb) {
	this.performDeleteRequest('worksheet/' + id, function(err, res, body) {
		cb();
	});
};

RestComponent.prototype.deleteMultiWorksheets = function(ids, cb) {
	console.log('passed IDS', ids);
	ids = _.map(ids, function (id) {
			return parseInt(id);
	});

	response_obj = {
		success: null,
		error: null
	}

	console.log('IDS to delete', ids);
    this.performRawDeleteRequest('worksheet/jsonArray', ids, function(err, res, body) {
		if(err) console.log(err);
		if(typeof body === 'undefined'){
		  response_obj.success = 'Deleted successfully!';
		} else {
			response_obj.error = body;
		}
		cb(response_obj);
	})
};

RestComponent.prototype.autoCorrelate = function(referenceData, testIDs, shiftRange, shiftType, startDate, endDate, cb) {
	shiftRange = shiftRange || 0;

	if (referenceData && testIDs && testIDs.length) {
		var url = encodeURI('dataset/autocorrelate'
			+ '?basedatasetid=' + referenceData
			+ '&startdate=' + startDate
			+ '&enddate=' + endDate
			+ '&relativedatasetids=' + testIDs.join('|')
			+ '&unit=' + shiftType
			+ '&shiftrange=' + parseInt(shiftRange)
		);

		console.log('AUTOCORRELATE URL', url);

		this.performGetRequest(url, function(err, res, body) {
			console.log(res.statusCode);
			// console.log('------------line-----------');
			// console.log('calling ', url);
			// console.log(body);
			// console.log('------------end-----------');
			cb(body);
		});
	} else {
		cb(null);
	}
};

RestComponent.prototype.autoFactorReduce = function(referenceData, testIDs, shiftRange, shiftType, startDate, endDate, cb) {
	shiftRange = shiftRange || 0;

	if (referenceData && testIDs && testIDs.length) {
		var url = encodeURI('dataset/autofactorreduce'
			+ '?basedatasetid=' + referenceData
			+ '&startdate=' + startDate
			+ '&enddate=' + endDate
			+ '&relativedatasetids=' + testIDs.join('|')
			+ '&unit=' + shiftType
			+ '&shiftrange=' + shiftRange
		);

		this.performGetRequest(url, function(err, res, body) {
			cb(body);
		});
	} else {
		cb(null);
	}
};

/*
Its passed false for the unshifted dataset (shift == 0) and true for the shifted call.
So really all you need to do is have it pass true (1) for the unshifted call and you’ll
get back the data not shifted and interpolated. so no server changes are needed unless you see some other issue.
I tried it locally on my machine by hardcoding the server to always interpolate, showed Patrick and seemed to work.
 */
RestComponent.prototype.dataPoint = function(referenceData, testIDs, shiftType, startDate, endDate, shifts, intPoints, cb) {
    shifts = shifts || 0;
    intPoints = intPoints || 0;

	if (referenceData && testIDs && testIDs.length) {

		var url = encodeURI('datapoint/'
			+ '?basedatasetid=' + referenceData
			+ '&startdate=' + startDate
			+ '&enddate=' + endDate
			+ '&relativedatasetids=' + testIDs.join('|')
			+ '&unit=' + shiftType
			+ '&shifts=' + shifts
            + '&retinterpolatedpoints=' + intPoints
		);

		this.performGetRequest(url, function(err, res, body) {
			cb(body);
		});
	} else {
		cb(null);
	}
};

RestComponent.prototype.ingest = function(name, file, cb) {
	var url = encodeURI('ingest/'
		+ '?mode=a'
		+ '&datasetname=' + name
	);

	this.performPostRequestIncludingFile(url, file, cb);
};

RestComponent.prototype.upgest = function(id, file, force, cb) {
    if(force==undefined){
        force = false;
    }

	var url = encodeURI('ingest/'
		+ '?mode=u'
		+ '&datasetid=' + id
        + '&force=' + force.toString()
	);

	this.performPostRequestIncludingFile(url, file, cb);
};

RestComponent.prototype.ingestMultiColumn = function(columndef, file, cb) {
    var url = 'ingest/multicolumn/'
        + '?columndefs=' + encodeURIComponent(columndef);
    this.performPostRequestIncludingFile(url, file, cb);
};

RestComponent.prototype.previewMultiColumn = function(file, cb) {
    var url = encodeURI('ingest/preprocess');

    this.performPostRequestIncludingFile(url, file, cb);
};

RestComponent.prototype.saveCategory = function(data, cb) {

	var formData = {
        name:data.name,
        categoryType:data.categoryType,
        };
    //Todo: the data key above may be extraneous - not sure why it is there

    formData = JSON.stringify(formData);

	this.performRawPostRequest('category', formData, function(err, res, body) {
        //console.log('back in saveCategory...')
        //console.log('res.statusCode',res.statusCode);
        //console.log('err:',err);
        //console.log('body'+body);
		if (res.statusCode != 200 && res.statusCode != 201) {
			cb({success: false, error: 'Invalid status code received from server.'});
		} else {
			console.log("Save Category Body:", body);
			var category = {
				success: true,
				id: body,
				name: formData.name
			};
			cb(category);
		}
	});

};

RestComponent.prototype.updateCategory = function(data, cb) {

	var formData = {
		name: data.name,
        id: data.id
	};

	formData = JSON.stringify(formData);
	this.performRawPutRequest('category', formData, function(err, res, body) {

		// console.log(res);
		// console.log('----');
		// console.log(body);
		// console.log('----');
  //       console.log('err:'+err);

		if (res.statusCode != 200 && res.statusCode != 201) {
			cb({success: false, error: 'Invalid status code received from server.'});
		} else {
			var category = {
				success: true,
				id: body,
				name: formData.name
			};
            //console.log('update Category success result:',category);
			cb(category);
		}

	});
};

RestComponent.prototype.getCategories = function(type, cb) {

	this.performGetRequest('category'+type, function(err, res, body) {
		var categories = [];
		for (var i in body) {
			var category = body[i];
      //console.log(category);

			var obj = {
                id: category.id,
                name: category.name,
                count: category.count,
                categoryType: category.categoryType
            };
			categories.push(obj);
		}

		cb(categories);
	});
};

RestComponent.prototype.getCategory = function(id, cb) {
	this.performGetRequest('category/' + id, function(err, res, body) {
		var category = body;

		var data = {
            id: category.id,
            name: category.name,
            count: category.count,
            categoryType: category.categoryType
		};

		cb(data);
	});
};

RestComponent.prototype.deleteItem = function(modelName, id, cb) {
	this.performDeleteRequest(modelName+'/'+id, function(err, res, body) {
		cb();
	});
};

RestComponent.prototype.saveForecast = function(data, id, cb) {
	this.performRawPostRequest('/worksheet/' + id + '/forecast', data, function(err, res, body){
		cb(body);
	});
};

RestComponent.prototype.updateForecast = function(data, id, cb) {
	this.performRawPutRequest('worksheet/' + id + '/forecast', data, function(err, res, body){
		cb(body);
	});
};

RestComponent.prototype.getForecasts = function(id, cb) {
	this.performGetRequest('worksheet/'+ id+ '/forecast', function(err, res, body) {
		cb(body);
	});
}

RestComponent.prototype.deleteForecast = function(id, forecastId, cb) {
	this.performDeleteRequest('worksheet/'+ id+ '/forecast/'+forecastId, function(err, res, body) {
		cb(body);
	});
}


RestComponent.prototype.cloneWorksheet = function(data, id, cb) {
	this.performRawPostRequest('worksheet/clone/'+ id+'?name='+data.name, {}, function(err, res, body) {
		cb(body);
	});
}

var exports = module.exports = RestComponent;
