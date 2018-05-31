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



		this.state = {
			current : 0, visible : false, 
		};
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

  render () {
  	const {current} = this.state;

	const firstContent = (
	      <div>     
	        <div>
	          <h3> Reference Dataset </h3> 
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
            </Modal>  
	        </div>

          <div>
            <br />
            <h3> Test Data </h3>
            <button className="button1"> 
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