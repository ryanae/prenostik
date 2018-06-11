/* This is the main/first page for view/manage/upload datasets. */


import React from 'react';

var datasetList = [];


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
        //Retrieves files stored in the backend public folder
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
	
        if (this.uploadInput.files[0] == null) {
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
        /*
            On file upload, the file is stored in the backend server
            All file names in the backend server is stored in datasetDetailsList and each are displayed
            in a table format.
        */
		return (
			<form onSubmit={this.handleUploadImage}>
			<div>
                <h3> Datasets </h3>
				<input ref={(ref) => { this.uploadInput = ref; }} type="file" />
				<button>Upload</button>
			</div>
            <br />
			<div>
				<div>
					<table class="table table-light table-hover">
                        <thead>
                            <tr>
                            <th> File Name </th>
                            </tr>
                        </thead>
                    <tbody>
                    {this.datasetDetailsList.map((dataset) => {
                        return (
                            <tr>
                                <td>{dataset}</td>
                            </tr>
                        )					
                    })}
                    </tbody>
                    </table>
				</div>
			</div>
		</form>
		);
	}
}

export default datasets;