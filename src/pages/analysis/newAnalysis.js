import React, { Component } from 'react';
import {Steps, Button, message, Modal, } from 'antd';
import Calendar from 'react-calendar';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import moment from 'moment';
import 'antd/dist/antd.css';
import 'react-select/dist/react-select.css'
import './newAnalysis.css'; 

const Step = Steps.Step;

class newAnalysis extends Component {
	constructor (props) {
		super (props);



		this.state = {
			current : 0, visible : false, 
            lines:[]
		};
        
        //For opening and parsing files
        this.handleFiles = this.handleFiles.bind(this);
        this.fileReadingFinished = this.fileReadingFinished.bind(this); 
	}

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  showModalTest = () => {
    this.setState({
      visible: true,
    });
  }
  
  //Handles OK click on Modal 
  handleOk = (e) => {
    this.setState({
      visible: false,
    });
      
    //Display list of files that were uploaded
    var file_read = document.querySelector("input").files[0];   
    document.getElementById("file_read").innerHTML=file_read.name; 
  }

  //Handles Cancel click on Modal
  handleCancel = (e) => {
    this.setState({ 
      visible: false,
    });
  } 
  
  
  //Handles setting data
  handleData = data => { 
        this.setState({data})
    };
    

    //Handles opening file
    handleFiles = (files) => {
        // Check for the various File API support.
        if (window.FileReader) {
            // FileReader are supported.
            console.log("read"); 
            this.getAsText(files[0]);
        }
    };


    //Opens file and reads as string
    getAsText(fileToRead) {
        var reader = new FileReader();
        var file_read = document.querySelector("input").files[0];
        
        // Read file into memory as UTF-8      
        reader.readAsText(file_read);
        // Handle errors load
        reader.onload = this.fileReadingFinished;
        reader.onerror = this.errorHandler;
    };

    //Processes string from file into JSON object
    fileReadingFinished(event) {
        var csv = event.target.result;
        var text = csv + " "; 
        var allTextLines = text.split(/\r\n|\n/);
        var lines = allTextLines.map(data => data.split(';'));
        
        document.getElementById("output").innerHTML=""; 
        document.getElementById("output").innerHTML=text; 

        var CSV = require('csv-string'); 
        //var arr = CSV.parse(lines); 


        var s_line = csv.split("\n"); 
        document.getElementById("output").innerHTML=s_line[0]; 

        var result = []; 
        var headers = s_line[0].split(",");
        document.getElementById("output").innerHTML=headers[0]; 

        for (var i = 1; i<s_line.length; i++){ 
            var json_obj = {};
            var curr_line = s_line[i].split(","); 
            for(var j=0; j<headers.length; j++){ 
                json_obj[headers[j]] = curr_line[j];
                document.getElementById("output").innerHTML=curr_line[j]; 
            }
            result.push(json_obj);
        }

        document.getElementById("output").innerHTML=JSON.stringify(result);

        //stores the lines into local storage 'lines' so the results page can retrieve it
        
        localStorage.setItem('lines', JSON.stringify(result)); 
        console.log(localStorage.getItem('lines')); 

        this.setState({lines: lines})
    };

    errorHandler(event) {
        if (event.target.error.name === "NotReadableError") {
            alert("Cannot read file!");
        }
    };

    //Go to Result page when completed
    result_analysis(event){ 
        message.success('Processing complete!');
        //event.preventDefault(); 
        window.location = 'result';
    }


  render () {
  	const {current} = this.state;

	const firstContent = (
	      <div>     
	        <div>
	          <h3> Reference Dataset </h3> 
                <p id="file_read">File Read</p>
	          <button className ="button1" onClick={this.showModal}>
	          	<strong>Select Reference Data </strong>
	          </button>
            <Modal
              title="Manage Datasets"
              visible = {this.state.visible}
              onOk = {this.handleOk}
              onCancel = {this.handleCancel}
            >

            <strong>My File</strong>
        
        
            <input type="file" onChange={ this.handleFiles }
                accept=".csv"/>
            <div id="output">Output Here</div>
        
        
            </Modal>  
	        </div>

          <div>
            <br />
            <h3> Test Data </h3>
            <p id="test_file_read>"> Test File Read</p>
            <button className="button1" onClick={this.showModalTest}> 
              <strong> Select Test Data </strong>
            </button> 
          </div>
	    
	      </div>
	    )

    const steps = [{
      title: 'First',
      content: firstContent,
    }, {
      title: 'Second',
      content: 'secondContent',
    }, {
      title: 'Last',
      content: 'Last-content',
    }]; 


    return (
    	<div>
    		<Steps current={current}>
	          {steps.map(item => <Step key={item.title} title={item.title} />)}
	        </Steps>
	        <div className="steps-content">{steps[this.state.current].content}</div>
	        <div className="steps-action">
	          {
	            this.state.current < steps.length - 1
	            &&
	            <Button type="primary" onClick={() => this.next()}>Next</Button>
	          }
	          {
	            this.state.current === steps.length - 1
	            &&
	            <Button type="primary" onClick={() => this.result_analysis()}>Done</Button>
	          }
	          {
	            this.state.current > 0
	            &&
	            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
	              Previous
	            </Button>
	          }
	        </div>
    	</div>
    	);
    }
}  	
  
ReactDOM.render(<newAnalysis />, document.getElementById('root'));
export default newAnalysis;