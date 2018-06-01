/* This is the main/first page for Create Analysis */


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

    var startDate = new Date();
    var endDate = new Date();
    var selectedOption = '';
    

		this.state = {
			current : 0, visible : false,
      startDate : startDate,
      endDate : endDate,
      selectedOption :selectedOption,
   

    };

    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeCorrelation = this.handleChangeCorrelation.bind(this);

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

  handleChangeStartDate (date) {
    this.setState({ startDate : date});
  }
   
  handleChangeEndDate (date) {
    this.setState({ endDate : date});
  }

  handleChangeCorrelation (e) {
    this.setState({selectedOption: e.target.value});  
  }

  handleConversion (string) {
    var num =  Number.parseInt(string,10);
    this.setState ({selectedOption : num});
  }
  render () {
  	const {current} = this.state;
    const { selectedOption} = this.state;

    const secondContent = 
    (
      <div class = 'row'>
        <form class = 'column'>
          <h5> Choose Start Date </h5>
          <Calendar value = {this.state.startDate} 
                    onChange = {this.handleChangeStartDate}/>
          <p> Choose the start date to analyze </p>

          <h5> Choose End Date </h5>
          <Calendar value = {this.state.endDate}
                      onChange = {this.handleChangeEndDate} />

          <p> Choosing the end date to analyze </p>
        </form>

        <form class = 'column'>
          <h5> Choose Correlation Offsets </h5>
          <select
            style={{ width: 200 }}
         
            value = {this.state.selectedOption}
            onChange= {this.handleChangeCorrelation}>
              <option value = " 0" >---Select--- </option>
              <option value = " 3" >3 Months  </option>
              <option value = " 6" >6 Months  </option>
              <option value = "12" >1 Year   </option>
              <option value = "18" >18 Months </option>
              <option value = "24" >2 Years   </option>          
          </select>
          
          <br />
          <h5>Required Start Date</h5>

          <br/>
          <h5>Required End Date </h5>
          
        </form>
      </div>
    )

  	const firstContent = (
      <div>     
        <div>
          <h3> Reference Dataset </h3> 
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
          <h3> Test Data </h3>
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
      title: 'First',
      content: firstContent,
    }, {
      title: 'Second',
      content: secondContent,
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