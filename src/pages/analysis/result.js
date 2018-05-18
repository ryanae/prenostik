/* This is the results page that generates from create an analysis */

import React from 'react';
import './result.css';
import sample from '../home/chart-example.png';

const result = () => (
    <div className="result">
        <div class="row">
            <div class="col-7"><h2><b>Results For</b> Untitled Analysis</h2></div>

                <div class="col-4">
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
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3">Lorem ipsum <button type="button" class="btn btn-light float-right">See More</button> </p>
                    </div>
                </div>
            </div>

            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Correlation Graph</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3">Lorem ipsum <button type="button" class="btn btn-light float-right">See More</button> </p>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Forecasting</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <button type="button" class="btn btn-light float-right">See More</button> </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default result;