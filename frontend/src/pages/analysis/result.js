/* This is the results page that generates from create an analysis */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './result.css';
import sample from '../home/chart-example.png';
import forecastingGraph from './forecastingGraph.png';
import {Bar} from 'react-chartjs-2';
import {Line} from 'react-chartjs-2';
import Slider, { Range, createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import datasets from './data.json';


const SliderWithTooltip = createSliderWithTooltip(Slider); 
function log(value){ 
    console.log(value); 
    this.setState({
        forecast:value
    })
}

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
            //Stores lines from newAnalysis page
            lines: [],
            
            //Data for generating Forecasting sliders
            forecast:"50",
            reference:"T1 Sales",
            
            //Data for generating Best Predictor Graph
            chartData:{
                labels: ['x', 'y', 'z'],
                datasets: [
                    {
                        label: 'Confidence Index',
                        data: [1, 2, 3]
                    }
                ],
            },
            
            //Data for generating Correlation Graph
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
        
        //Data for generating forecast sliders
        this.forecast_data= [
            {name: "T1 Sales", coefficient: 1, max: 25256, curr_val:50}, 
            {name: "CCI", coefficient:206.814, max:111, curr_val:50 },
            {name: "Web3", coefficient:8.118, max:1700, curr_val:50 },
            {name: "Web4", coefficient:-9.683, max:667, curr_val:50 },
            {name: "Company2 GoogleUS Search", coefficient:-105.600, max:43, curr_val:50 },
            {name: "SP500", coefficient:2.802, max:2285, curr_val:50 }
        ];
        this.slide_val = "50";
        
        
        this.display_lines = this.display_lines.bind(this);
        this.percentFormatter = this.percentFormatter.bind(this);   
        this.updateRef = this.updateRef.bind(this);

    }
    
    
    display_lines(){
        console.log('HERE!!'); 
        //Gets lines stored in localStorage from the newAnalysis page
        const cached_lines = localStorage.getItem('lines'); 
        if (cached_lines){ 
            console.log("not empty"); 
            this.setState({lines: cached_lines});
            console.log(cached_lines);
        }
        
        //Parses stored lines and creates a bar graph based on the "Consumer Confidence Index"
        var JSON_obj = JSON.parse(cached_lines);         
        var Dates = []; 
        var Confidence_Index = [];
        for (var i=0; i<(JSON_obj.length); i++){
            Dates.push(JSON_obj[i]["Date"]); 
            Confidence_Index.push(JSON_obj[i]["Consumer Confidence Index"]);
        }
        
        this.state.chartData.labels = Dates; 
        this.state.chartData.datasets[0].data = Confidence_Index;
        console.log("CHART DATA", this.state.chartData); 
        
        
        return;
    }
    
    
    onChangeSlide1 = (e) =>{
        console.log('ONCHANGESLIDE');
        this.setState({slider_value: +e.target.value});
        this.slide_val=e; 
    }

    percentFormatter(e) { 
        //Formats the tooltip to display the percentage value
        this.slide_val=e;
        return `${e}%`;
    }

    updateSlide(val, dataset){ 
        console.log(dataset["name"]);
        //Change value of text box if dataset is not the reference data -- does not currently updaate
        if (dataset["name"] != this.state.reference){
            var calculated_val = (val * 0.01) * dataset["max"] ;
            dataset["curr_val"] = calculated_val; 
            document.getElementById("text"+dataset["name"]).value = Math.round(calculated_val); 
            console.log(document.getElementById("text"+dataset["name"]).value);
        }
        //If dataset is the reference data, it can't be changed
        else { 
        }     
        //calls to update the reference data
        this.updateRef(); 
    }

    updateRef(){ 
        //calculates the reference value based on changes on other sliders
        //Reference value is summation of the coefficient * curr_val of all elements in forecast_data except for the first one-which is the reference data
        var reference_val = 0; 
        for (var i=1; i<this.forecast_data.length; i++){ 
            reference_val += this.forecast_data[i]["coefficient"] * this.forecast_data[i]["curr_val"];
        }
        
        //Updates the value in the text box of the reference data
        this.forecast_data[0]["curr_val"] = Math.round(reference_val);
        document.getElementById("textref").value = Math.round(reference_val); 

        //Updates the slider
        var percent_val = (reference_val / this.forecast_data[0]["max"] ) * 100;         
        this.forecast_data[0]["curr_val"] = percent_val;
        this.setState({forecast: percent_val});
        document.getElementsByClassName("col-8")[1].value = this.forecast_data[0]["curr_val"]; 
    }
    
    updateText(val, dataset){ 
        //Changes position of the slider based on the val given
        console.log("UPDATE TEXT");
    }

displayForecastingModel() {
    /*
    id: T1Sales11 -> slider for the reference data
        minimumValue = 0
        maximumValue = 1000
        step = 1
        tipFormatter = #%
        value = state.forecast 
        onchange = updateSlide (value, forecast_data[0])
    id: textref -> text box for the reference data 
    id: dataset["name"] -> sliders for rest of data 
        minimumValue = 0
        maximumValue = 1000
        step = 1
        tipFormatter = #%
        value = forecast_data["curr_val"] 
        onchange = updateSlide (value, element in forecast_data)
    id: text+dataset["name"] -> text box for the rest of the data
    */
        return (
            <div>
                    <div class="row"> 
                        <div class="col-2">
                            <p>T1 Sales</p>
                        </div>
                        <div class="col-8" id="slider11">
                            <SliderWithTooltip id="T1Sales11" minimumValue={0} maximumValue={1000} step={1} tipFormatter={this.percentFormatter} tipProps={{overlayClassName: 'foo"'}} value={this.state.forecast} onChange={val=>this.updateSlide(val,this.forecast_data[0])}  />

                        </div> 
                            <div class = "col-2">
                            <input  type="text" id="textref" value={Math.round(this.forecast_data[0]["max"]/2)} onChange={val => this.updateText(val, this.forecast_data[0])}/>
                            <p>Max: {Math.round(this.forecast_data[0]["max"])} <span ></span> <br/>
                            Coefficient: {this.forecast_data[0]["coefficient"]} <span ></span></p>
                        </div>
                    </div>
                {this.forecast_data.slice(1).map((dataset) => { 
                return(
                    <div class="row"> 
                        <div class="col-2">
                            <p>{dataset["name"]}</p>
                        </div>
                        <div class="col-8" id="slider1">
                            <SliderWithTooltip id={dataset["name"]} minimumValue={0} maximumValue={1000} step={1} tipFormatter={this.percentFormatter} tipProps={{overlayClassName: 'foo"'}} onChange={val=>this.updateSlide(val,dataset)} defaultValue={dataset["curr_val"]}/>

                        </div> 
                            <div class = "col-2">
                            <input  type="text" id={"text"+dataset["name"]} value={Math.round(dataset["max"]/2)} onChange={val => this.updateText(val, dataset)}/>
                            <p>Max: {Math.round(dataset["max"])}<span ></span> <br/>
                            Coefficient: {dataset["coefficient"]}<span ></span></p>
                        </div>
                    </div>
                 
                 
                 )})} 
            </div>
        )
    }

    
    
    /* 
    Displays the Best Predictor, Correlation, and Forecasting graphs
    
    Bugs: 
    The Best Predictor graph should refresh onLoad, however, it does not do this all the time because the window
    loads too quickly and onLoad is unable to fire in time. The current solution to this is having a refresh
    button to update the data in the graph. 
    
    
    Note: the See More buttons are not functional
    */ 
    render() {
        return (
            <div className="result" onLoad={this.display_lines}>
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
            
                                <p class="h6 m-3" id="output"> Most Influential 
                                    <button type="button" class="btn btn-light float-right"  onClick={this.display_lines}>Refresh</button> 
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
    
                                <p class="h6 m-3"><button type="button" class="btn btn-light float-right">See More</button> </p>
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