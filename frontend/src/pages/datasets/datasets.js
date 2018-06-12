/* This is the main/first page for view/manage/upload datasets. */


import React from 'react';

var datasetList = [];
var selectedList = [];


class datasets extends React.Component {
	constructor(props) {
		super();
		
		// This contains the info about the dataset, in name and ctime attributes.
		this.datasetDetailsList = [];
		
		// This contains the path of each dataset.
		this.datasetPathList = [];
                        		
		super(props);
		this.getFiles();
		this.state = { 
            pathlist : []
        };
        
		this.handleUploadImage = this.handleUploadImage.bind(this);
		this.getFiles = this.getFiles.bind(this);
	}
	
	getFiles() {
		fetch('http://localhost:8001/getFiles', {
			method: 'POST',
		}).then((response) => {
			response.json().then((body) => {
				this.datasetDetailsList = body.file;
				                
				this.datasetPathList = [];
				for (var i in this.datasetDetailsList) {
					this.datasetPathList.push("http://localhost:8001/public/"+this.datasetDetailsList[i]);
				}
                localStorage.setItem("pathlist", JSON.stringify(this.datasetDetailsList));
				this.forceUpdate();
			});

		});

	}
	
	handleUploadImage(ev) {
		ev.preventDefault();

		const data2 = new FormData();
		data2.append('file', this.uploadInput.files[0]);
		data2.append('filename', this.fileName.value);
	
        if (this.uploadInput.files[0] == null) {
			return;
		}
		
		if (this.fileName.value == '') {
			return;
		}
        
		fetch('http://localhost:8001/upload', {
			method: 'POST',
			body: data2,
		}).then((response) => {
			response.json().then((body) => {
				this.getFiles();
			});
		});
	}

	render() {
		return (
            <div class="card bg-light mb-3 text-center">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <h3> Datasets </h3>
                            <div class="input-group mb-3">
                                <input ref={(ref) => { this.fileName = ref; }} type="text" class="form-control w-75" placeholder="Search through my datasets" aria-label="Search through my datasets" aria-describedby="basic-addon2"/>
                                <div class="input-group-append">
                                    <button class="btn btn-success" type="button">Search</button>
                                </div>
                            </div>
                            <div>
                                {this.datasetDetailsList.map((dataset) => {return (
                                 
                                <div class="list-group">
                                    <a class="list-group-item list-group-item-action">
                                        {dataset}
                                    </a>
                                </div>)})}
                            </div>
                        </div>

                        <div class="col-6">
                            <h3>Selected Files</h3>
                                    
                        </div>
                    </div>
                <div class="row">
                    <div class="col-6">
                        <form onSubmit={this.handleUploadImage}>
                            <div class="card bg-light text-center my-3 pt-3">
                                <div class="card-body">
                                    <div>
                                        <input ref={(ref) => { this.uploadInput = ref; }} type="file"/>

                                        <div>
                                            <button class="btn btn-success">Upload</button>
                                            <h5> or Drag and Drop!</h5>
                                            <p> .csv files only </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
        </div>
    </div>
    );
	}
}

export default datasets;