/* This is the main/first page for view/manage/upload datasets. */


import React from 'react';

var datasetList = [];


class datasets extends React.Component {
	constructor(props) {
		super(props);
		this.getFiles();
		this.handleUploadImage = this.handleUploadImage.bind(this);
		this.getFiles = this.getFiles.bind(this);
	}
	
	getFiles() {
		fetch('http://localhost:8001/getFiles', {
			method: 'POST',
		}).then((response) => {
			response.json().then((body) => {
				datasetList = body.file;
				this.forceUpdate();
			});
		});
	} 
	
	handleUploadImage(ev) {
		ev.preventDefault();

		const data2 = new FormData();
		data2.append('file', this.uploadInput.files[0]);
		data2.append('filename', this.fileName.value);

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
			<form onSubmit={this.handleUploadImage}>
			<div>
				<input ref={(ref) => { this.uploadInput = ref; }} type="file" />
			</div>
			<div>
				<input ref={(ref) => { this.fileName = ref; }} type="text" placeholder="Enter desired file name" />
			</div>
			<br />
			<div>
				<button>Upload</button>
			</div>
			<div className="datasets">
				<h3> Datasets </h3>
				<div>
					{datasetList.map((dataset) => {
                        return (<div class="row">{dataset}</div>)
						//return <img src={`http://localhost:8001/public/${dataset}`} alt={dataset} />
					})}
				</div>
			</div>
		</form>
		);
	}
}

export default datasets;