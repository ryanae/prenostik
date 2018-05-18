/* This is the main/first page for the Home page. */

import React from 'react';
import './home.css';
import sample from './chart-example.png';
import { NavLink, Switch, Route } from 'react-router-dom';

const home = () => (
    <div className="home">
        <h2>Home - Recent Activity</h2>
        
        <div class="row">
            <div class="col">  
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Sample Result 1</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <NavLink to ="/analysis/result">
                <button type="button" class="btn btn-dark float-right">Open</button> </NavLink> </p>
                    </div>
                </div>
    
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Sample Result 1</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <NavLink to ="/analysis/result">
                <button type="button" class="btn btn-dark float-right">Open</button> </NavLink></p>
                    </div>
                </div>
            </div>
            
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Sample Result Nickname</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <NavLink to ="/analysis/result">
                <button type="button" class="btn btn-dark float-right">Open</button> </NavLink></p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Sample Result 1</h5>
                        <img class="m-1 embed-responsive" src={sample}></img>
                        <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <NavLink to ="/analysis/result">
                <button type="button" class="btn btn-dark float-right">Open</button> </NavLink></p>
                    </div>
                </div>
            </div>
        </div>
    
    </div>
);

export default home;