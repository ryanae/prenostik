/* This is the results page that generates from create an analysis */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './result.css';
import sample from '../home/chart-example.png';
import forecastingGraph from './forecastingGraph.png';
import {Bar} from 'react-chartjs-2';
import {Line} from 'react-chartjs-2';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import datasets from './data.json';


//install csvtojson 
//npm install convert-csv-to-json --save

//install csv string
//npm install csv-string

function formatData(sampleData) {
	var avg = 0;
	for (var point in sampleData.points) {
		avg += sampleData.points[point].y;
	}
	avg = avg / sampleData.points.length;
	
	var stdDev = 0;
	
	for (var point in sampleData.points) {
		stdDev += Math.pow((sampleData.points[point].y - avg), 2);
	}
	stdDev = Math.pow(stdDev, 0.5);
	
	for (var point in sampleData.points) {
		var deviation = sampleData.points[point].y;
		deviation -= avg;
		deviation = deviation/stdDev
		sampleData.points[point].y = deviation;
	}
	
	return sampleData;
}

function makeDataset(sampleData) {
	var colors = [
		'rgba(75,192,192,1)',
		'rgba(192,75,192,1)',
		'rgba(192,192,75,1)',
		'rgba(75,75,192,1)',
		'rgba(75,192,75,1)',
		'rgba(192,75,75,1)'
	];
	var dataset = {
		label: sampleData.label,
		fill: false,
		lineTension: 0,
		backgroundColor: colors[sampleData.color],
		borderColor: colors[sampleData.color],
		borderJoinStyle: 'miter',
		pointBorderColor: colors[sampleData.color],
		pointBackgroundColor: '#fff',
		pointBorderWidth: 1,
		pointHoverRadius: 5,
		pointHoverBackgroundColor: colors[sampleData.color],
		pointHoverBorderColor: colors[sampleData.color],
		pointHoverBorderWidth: 5,
		pointRadius: 4,
		pointHitRadius: 10,
		data: sampleData.points
	};
	return dataset;
}


class result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData:{
                labels: ['x', 'y', 'z'],
                datasets: [
                    {
                        label: 'Confidence Index',
                        data: [1, 2, 3]
                    }
                ],
            },
            lines: [],			
			
			lineData: {
				//labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
				datasets: []
			},
			options: {
				title: {text: "This is a test"},
				scales: {
					xAxes: [{
						title: "time",
						type: 'time',
						gridLines: {
							lineWidth: 2
						},
						time: {
							unit: "month",
							unitStepSize: 1,
							displayFormats: {
								month: "MMM YYYY"
							}
						}
					}]
				}
			}
        }
		
		for (var i in datasets) {
			this.state.lineData.datasets.push(makeDataset(formatData(datasets[i])));
		}
		
		
        this.display_lines = this.display_lines.bind(this);
    }
    
    
    display_lines(){ 
        const cached_lines = localStorage.getItem('lines'); 
        if (cached_lines){ 
            console.log("not empty"); 
            this.setState({lines: cached_lines});
            console.log(cached_lines);
        }
        
        var JSON_obj = JSON.parse(cached_lines); 
        //document.getElementById("output").innerHTML=""; 
        //document.getElementById("output").innerHTML=JSON.stringify(JSON_obj[0]["Date"]); 
        
        var Dates = []; 
        var Confidence_Index = [];
        for (var i=0; i<(JSON_obj.length); i++){
            Dates.push(JSON_obj[i]["Date"]); 
            Confidence_Index.push(JSON_obj[i]["Consumer Confidence Index"])
        }
        
        this.state.chartData.labels = Dates; 
        this.state.chartData.datasets[0].data = Confidence_Index;
        
        return;
    }
    
    displayForecastingModel() {
        return (
            <div>
                <div class="row">
                    <div class="col-2">
                        <p>Reference Data</p>
                    </div>
                    <div class="col-8">
                        <Slider defaultValue={50} /> 
                    </div>
                    <div class="col-2">
                        <input type="text" name="reference" placeholder="803"/>
                    </div>
                </div>

                <div class="row">
                    <div class="col-2">
                        <p>Reference Data</p>
                    </div>
                    <div class="col-8">
                        <Slider defaultValue={50} /> 
                    </div>
                    <div class="col-2">
                        <input type="text" name="reference" placeholder="803"/>
                    </div>
                </div>
            </div>
        )
    }
    

    
    render() {
        return (
            <div className="result" onLoad={this.display_lines} >
                <div class="row">
                    <div class="col-8"><h2><b>Results For</b> Untitled Analysis</h2></div>

                        <div class="col-4" id="results-buttons">
                            <button type="button" class="btn btn-link">View Info</button>
                            <button type="button" class="btn btn-link">Edit</button>
                            <button type="button" class="btn btn-link">Print</button>
                            <button type="button" class="btn btn-danger">Save</button>
                        </div>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Best Predictor Model</h5>
            
                                <Bar data={this.state.chartData} />
            
                                <p class="h6 m-3" id="output"> Best Predictors 
                                    <button type="button" class="btn btn-light float-right">See More</button> 
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Correlation Graph</h5>
								<Line data={this.state.lineData} options={this.state.options} />
								
                                <p class="h6 m-3">Correlation <button type="button" class="btn btn-light float-right">See More</button> </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Forecasting</h5>
                                
                                    {this.displayForecastingModel()}
    
                                <p class="h6 m-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <button type="button" class="btn btn-light float-right">See More</button> </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

//ReactDOM.render(<result />, document.getElementById('root'));
export default result;