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
                            <div class="col-5">
                                <h5 class="card-title">Recent Results</h5>

                            </div>
                            <div class="col-7">
                                <h5 class="card-title">My Files</h5>
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
            
                <div class="row">
                    <div class="col">
                    <button type="button" class="btn btn-primary btn-block" id="save-result-btn">View</button>
                    </div>

                    <div class="col">
                    <button type="button" class="btn btn-primary btn-block" id="save-result-btn">Edit</button> 
                    </div>

                    <div class="col">
                    <button type="button" class="btn btn-primary btn-block hidden-print" id="save-result-btn" onclick="printfunction()"><span class="glyphicon glyphicon-print" aria-hidden="true"></span> Print</button>
                    </div>

                    <div class="col">
                    <button type="button" class="btn btn-primary btn-block"  id="save-result-btn" data-toggle="modal" data-target="#SaveModal" >Save</button> 
                    </div>
                </div>

                <div class="modal fade" id="SaveModal" tabindex="-1" role="dialog" aria-labelledby="SaveModalCenterTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="SaveModalTitle">Save Result</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                            </div>
                            <div class="modal-body">
                                Where would you like to save?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
        )
    }
    
}

function printfunction(){ 
    window.print(); 
}
export default savedResults;