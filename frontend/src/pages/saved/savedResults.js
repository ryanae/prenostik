/* This is the main/first page for Saved Results */

import React, { Component } from 'react';
import './savedResults.css';
import { NavLink } from 'react-router-dom';
import sample from '../home/chart-example.png';

class savedResults extends Component {
    constructor(props) {
        super(props);
    }
    
    displayEntries() {
        return(
            <div class="entries">
                <div class="row" id="entry-labels">
                    <div class="col"> Name </div>
                    <div class="col"> Type </div>
                    <div class="col"> Date Created </div>
                    <div class="col"> Owner </div>
                </div>

                <div class="row entry-category" data-toggle="collapse" href="#expanded-category-1">
                    <div class="col"> Sample Folder </div>
                    <div class="col"> Category </div>
                    <div class="col"> 05-15-18 </div>
                    <div class="col"> Username </div>
                </div>
            
                <div class="collapse" id="expanded-category-1">
                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
                </div>


                <div class="row entry-category" data-toggle="collapse" href="#expanded-category-2">
                    <div class="col"> Sample Folder </div>
                    <div class="col"> Category </div>
                    <div class="col"> 05-15-18 </div>
                    <div class="col"> Username </div>
                </div>
            
                <div class="collapse" id="expanded-category-2">
                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
                </div>
            
                <div class="row entry-category" data-toggle="collapse" href="#expanded-category-3">
                    <div class="col"> Uncategorized </div>
                    <div class="col"> Category </div>
                    <div class="col"> 05-15-18 </div>
                    <div class="col"> Username </div>
                </div>
            
                <div class="collapse" id="expanded-category-3">
                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> .csv File </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
                </div>
            </div>
        )
    }
    
    render() {
        return (
            <div className="savedResults">
                <h2> Saved Results</h2>
                
                <div class="card bg-light mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-5" id="recent-results">
                                <h5 class="card-title">Recent Results</h5>
                                    <div class="recent-entries">
                                        <div class="card home-card">
                                            <div class="card-body home-card-body">
                                                <NavLink to ="/analysis/result"> <h5 class="card-title home-card-title">Sample Result 1</h5> </NavLink>
                                                <img class="m-1 embed-responsive" src={sample}></img>
                                                <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <NavLink to ="/analysis/result">
                                        <button type="button" class="home-card-btn btn btn-dark float-right">Open</button> </NavLink> </p>
                                            </div>
                                        </div>
                                    </div>

                            </div>
                            <div class="col-7" id="my-datasets">
                                <h5 class="card-title">My Datasets</h5>
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" placeholder="Search my datasets" aria-label="Search my datasets" aria-describedby="basic-addon2" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-secondary" type="button">Search</button>
                                        </div>
                                    </div>
                                    {this.displayEntries()}
                            </div>
                        </div>
                    </div>
                </div>
            

                </div>
        )
    }
    
}


                                
export default savedResults;