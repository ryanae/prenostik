/* This is the main/first page for Create Analysis */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Steps, Button, message, Modal, } from 'antd';

const Step = Steps.Step;

class newAnalysis extends Component {
	constructor (props) {
		super (props);

		this.state = {
			current : 0,
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

  render () {
  	const {current} = this.state;

    const steps = [{
      title: 'First',
      content: 'firstContent',
    }, {
      title: 'Second',
      content: 'secondContent',
    }, {
      title: 'Last',
      content: 'Last-content',
    }]; 


    return (
    	<div>

    	</div>
    	);
    }
}  	
  
ReactDOM.render(<newAnalysis />, document.getElementById('root'));
export default newAnalysis;