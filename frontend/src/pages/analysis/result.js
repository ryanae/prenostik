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


const SliderWithTooltip = createSliderWithTooltip(Slider); 
function log(value){ 
    console.log(value); 
    this.setState({
        forecast:value
    })
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
			data: {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
				datasets: [
					{
					  label: 'Relative Value',
					  fill: false,
					  lineTension: 0,
					  backgroundColor: 'rgba(75,192,192,0.4)',
					  borderColor: 'rgba(75,192,192,1)',
					  borderCapStyle: 'butt',
					  borderDash: [],
					  borderDashOffset: 0.0,
					  borderJoinStyle: 'miter',
					  pointBorderColor: 'rgba(75,192,192,1)',
					  pointBackgroundColor: '#fff',
					  pointBorderWidth: 1,
					  pointHoverRadius: 5,
					  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
					  pointHoverBorderColor: 'rgba(220,220,220,1)',
					  pointHoverBorderWidth: 5,
					  pointRadius: 5,
					  pointHitRadius: 20,
					  data: [65, 59, 80, 81, 56, 55, 40]
					},
					{
					  label: 'Relative Value2',
					  fill: false,
					  lineTension: 0,
					  backgroundColor: 'rgba(75,192,192,0.4)',
					  borderColor: 'rgba(75,192,192,1)',
					  borderCapStyle: 'butt',
					  borderDash: [],
					  borderDashOffset: 0.0,
					  borderJoinStyle: 'miter',
					  pointBorderColor: 'rgba(75,192,192,1)',
					  pointBackgroundColor: '#fff',
					  pointBorderWidth: 1,
					  pointHoverRadius: 5,
					  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
					  pointHoverBorderColor: 'rgba(220,220,220,1)',
					  pointHoverBorderWidth: 5,
					  pointRadius: 5,
					  pointHitRadius: 20,
					  data: [33,45,82]
					}
				]
			}
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
            Confidence_Index.push(JSON_obj[i]["Consumer Confidence Index"])
        }
        
        this.state.chartData.labels = Dates; 
        this.state.chartData.datasets[0].data = Confidence_Index;
        
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
    id: slider11 -> slider for the reference data
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
                            <p>T1 Sales1</p>
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
								<Line data={this.state.data} />
								
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