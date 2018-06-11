/* This is the main/first page for Create Analysis */


import React, { Component } from 'react';
import {Steps, Button, message, Modal, } from 'antd';
import DatePicker from 'react-datepicker';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import moment from 'moment';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css';
import './newAnalysis.css'; 



const Step = Steps.Step;

class newAnalysis extends Component {
	constructor (props) {
		super (props);

    var startDate =moment();
    var endDate = moment();
    var selectedOption = 0;
    

		this.state = {
			current : 0, visible : false,
            startDate : startDate,
            endDate : endDate,
            selectedOption :selectedOption,
            lines:[]
    };
    
    //For handling parameters
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeCorrelation = this.handleChangeCorrelation.bind(this);
    this.handleUpdateStartDate = this.handleUpdateStartDate.bind(this);
    this.handleUpdateEndDate = this.handleUpdateEndDate.bind(this);
        
    //For opening and parsing files    
    this.handleFiles = this.handleFiles.bind(this);
    this.fileReadingFinished = this.fileReadingFinished.bind(this); 
    this.show_list = this.show_list.bind(this); 
	}


  next() {
    //Goes to the next page
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    //Goes to the previous page
    const current = this.state.current - 1;
    this.setState({ current });
  }

  showModal = () => {
    //Opens modal for fileupload
    this.setState({
      visible: true,
    });
  }

  handleOk = (e) => {
    //Handles OK click on modal and closes the modal
    this.setState({
      visible: false,
    });
      
    //Display list of files that were uploaded
    var file_read = document.querySelector("input").files[0];   
    document.getElementById("file_read").innerHTML=file_read.name; 
  }

  handleCancel = (e) => {
    //Handles Cancel on modal and closes the modal
    this.setState({ 
      visible: false,
    });
  }  

  showModal_test = () => {
    //Opens modal for fileupload for Test Data
    this.setState({
      visible: true,
    });
    this.show_list(); 
  }

  handleOk_test = (e) => {
    //Handles OK on modal  for Test Data and closes the modal

    this.setState({
      visible: false,
    });
      
    //Display list of files that were uploaded
    var path_list = localStorage.getItem("pathlist"); 
    if (path_list != null)
        document.getElementById("test_file_read").innerHTML = JSON.stringify(path_list); 
  }

  handleCancel_test = (e) => {
     //Handles Cancel on modal for Test Data and closes the modal

      this.setState({ 
      visible: false,
    });
  }
  
  
  handleUpdateStartDate ( date, selected) {
    var newdate = new Date (date);
    newdate.setMonth(newdate.getMonth() + selected);
    document.getElementById('start_month').value = newdate.toLocaleDateString();
  }

  handleUpdateEndDate(date,selected) {
    var newdate = new Date (date);
    newdate.setMonth(newdate.getMonth() + selected);
    document.getElementById('end_month').value = newdate.toLocaleDateString();
  }

  handleChangeStartDate (date) {
    this.handleUpdateStartDate(date, this.state.selectedOption);
    this.setState({ startDate : date});
  }
   
  handleChangeEndDate (date) {
    this.handleUpdateEndDate (date,this.state.selectedOption);
    this.setState({ endDate : date});
  }

  handleChangeCorrelation (e) {
    let selected = parseInt (e.target.value,10) ;
    this.handleUpdateStartDate(this.state.startDate, selected);
    this.handleUpdateEndDate(this.state.endDate, selected);
    this.setState({ selectedOption: selected});  
  }

  handleRequiredStartDate () {
    let start = this.state.startDate;
    let select = this.state.selectedOption;
    start.add(parseInt (select), 'M');
    this.setState({start_m : start})
  }

//Handles Setting data
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

        //Stores the lines into local storage 'lines' so the results page can retrieve it
        
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
        window.location = 'result';
    }


    show_list (){ 
        //Shows the list of current available files
        var path_list = JSON.parse(localStorage.getItem("pathlist")); 
        console.log("path", path_list); 
        var table = ""; 
        for(var i=0; i<path_list.length; i++){ 
            table += "<p>" + path_list[i] + "</p>"; 
        }
        
        
        document.getElementById("test_data").innerHTML = table; 
    }

  render () {
  	const {current} = this.state;
    const { selectedOption} = this.state;
   


    /*
    First page of New Analysis
    Upload and select Test and Reference Data
    */
    const firstContent = (
	      <div>     
	        <div>
	          <h3> Reference Dataset </h3> 

	          <button className ="button1" onClick={this.showModal}>
	          	<strong>Select Reference Data </strong>
	          </button>
              <div id="file_read"></div>

            <Modal
                id="DataModal"
                title="Manage Datasets"
                visible = {this.state.visible}
                onOk = {this.handleOk}
                onCancel = {this.handleCancel}
            >

            <strong>My File</strong>
        
        
            <input type="file" onChange={ this.handleFiles }
                accept=".csv"/>
            <p id="output">Output Here</p>
        
        
            </Modal>  
            <br />
	        </div>

          <div>
            <br />
            <h3> Test Data </h3>
            <button className="button1" onClick={this.show_list}> 
              <strong> Select Test Data </strong>
            </button> 

            <div id="test_data"></div>

    
          </div>
	    
	      </div>
	    )

    /*
    Second page of New Analysis 
    Select parameters for generating the graph
    */
    const secondContent = 
    (
      <div class = 'second_content1'>
        <div>
          <h5> Choose Start Date </h5>
          <p> Choose the start date to analyze </p>
          <DatePicker selected = {this.state.startDate} 
                    onChange = {this.handleChangeStartDate}
                    maxDate = {this.state.endDate}/>
          
          <br />
          <h5> Choose End Date </h5>
          <p> Choosing the end date to analyze </p>
          <DatePicker selected = {this.state.endDate}
                      onChange = {this.handleChangeEndDate} 
                      minDate = {this.state.startDate}/>
          <br />
        </div>

        <div>
          <h6> Choose Correlation Offsets </h6>
          <p>The measure of difference between the selected start and end date and actual time frame in datasets </p>
          <select
            style={{ width: 200 }}
            value = {this.state.selectedOption}
            onChange= {this.handleChangeCorrelation}>
              <option value = "0" >---Select--- </option>
              <option value = "3" >3 Months  </option>
              <option value = "6" >6 Months  </option>
              <option value = "12" >1 Year   </option>
              <option value = "18" >18 Months </option>
              <option value = "24" >2 Years   </option>          
          </select>
          <h6>Required Start Date</h6>
          <input type="datetime" id="start_month" />
          <br/>
          <h6>Required End Date </h6>
          <input type="datetime" id="end_month" />
        </div>
      </div>
    )
        
    
    /*
    Confirm the Reference and Test Datasets as well as the Parameters
    */
    const thirdContent =
    (
      <div class="third_content">
        <h5> Selected Reference Datasets </h5>

        <h6> Analysis Start Date </h6>
        <p> {moment(this.state.startDate).format('LL')}</p>

        <h6> Analysis End Date </h6>
        <p> {moment(this.state.endDate).format('LL')}</p>

        <h6> Correlation Offsets </h6>
        <p> {this.state.selectedOption} months </p>


      </div>)


    const steps = [{
      title: 'Step 1: Datasets',
      content: firstContent,
    }, {
      title: 'Step 2: Time Frame',
      content: secondContent,
    }, {
      title: 'Step 3: Confirmation',
      content: thirdContent,
    }]; 



    /* 
    Clicks and shows each content based on step
    On click of the Done button, the result window will be displayed
    */
    return (
    	<div className="newAnalysis">
            <div class="container-fluid" id="newAnalysisContainer">
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
    	</div>
    	);
    }
}  	
  
ReactDOM.render(<newAnalysis />, document.getElementById('root'));
export default newAnalysis;
