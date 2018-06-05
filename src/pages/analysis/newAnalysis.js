/* This is the main/first page for Create Analysis */


import React, { Component } from 'react';
import {Steps, Button, message, Modal, } from 'antd';
import DatePicker from 'react-datepicker';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import moment from 'moment';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css'
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
  

    };

    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeCorrelation = this.handleChangeCorrelation.bind(this);
    this.handleUpdateStartDate = this.handleUpdateStartDate.bind(this);
    this.handleUpdateEndDate = this.handleUpdateEndDate.bind(this);
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

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  }

  handleCancel = (e) => {
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

  render () {
  	const {current} = this.state;
    const { selectedOption} = this.state;
   
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
    const secondContent = 
    (
      <div class = 'second_content1'>
        <div>
          <h5> Choose Start Date </h5>
          <p> Choose the start date to analyze </p>
          <DatePicker selected = {this.state.startDate} 
                    onChange = {this.handleChangeStartDate}
                    />
          
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
          <input type="datetime" id="start_month" readOnly={true}/>
          <br/>
          <h6>Required End Date </h6>
          <input type="datetime" id="end_month" readOnly={true} />
        </div>
      </div>
    )

  	const firstContent = (
      <div>     
        <div>
          <h3 > Reference Dataset </h3> 
          <button className ="button1" onClick={this.showModal}>
          	<strong>Select Reference Data </strong>
          </button>
          <Modal
            title="Manage Reference Datasets"
            visible = {this.state.visible}
            onOk = {this.handleOk}
            onCancel = {this.handleCancel}
          >
            <strong>My File</strong>
          </Modal>  
        </div>

        <div>
          <br/>
          <h3 > Test Data </h3>
          <button className="button1" onClick={this.showModal}> 
            <strong> Select Test Data </strong>
          </button>

          <Modal
            title="Manage Test Datasets"
            visible = {this.state.visible}
            onOk = {this.handleOk}
            onCancel = {this.handleCancel}
          >
            <strong>My File</strong>
          </Modal>  
        </div>
    
      </div>
    )


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
	            <Button type="primary" onClick={() => message.success('Processing complete!')}>Done</Button>
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