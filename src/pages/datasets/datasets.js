/* This is the main/first page for view/manage/upload datasets. */

import React, { Component } from 'react';
import './datasets.css';

class datasets extends Component {
    displayMyFiles() {
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
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
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
                        <div class="col"> Sample Result </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample Result </div>
                        <div class="col"> Result </div>
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
                        <div class="col"> Sample 324245 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample 1231245 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample 314545 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample 2343 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample 12312 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample 12312 </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
                </div>
            </div>
        )
    }
    
    selectedFile() {
        
    }
    render() {
        return (
            <div className="datasets">
                <h2>My Datasets</h2>

                <div class="card bg-light mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col" id="my-files-col">
                                <h5 class="card-title">My Files</h5>
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-secondary" type="button">Search</button>
                                        </div>
                                    </div>
            
                                  {this.displayMyFiles()}
            
                            </div>
                            <div class="col">
                                <div>
                                    <h5 class="card-title">Selected Files</h5>
                                    <div>
                                    
                                        <div class="collapse" id="expanded-category-1">
                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
            
                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file gray-bg">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>

                    <div class="row entry-file">
                        <div class="col"> Sample File </div>
                        <div class="col"> Result </div>
                        <div class="col"> 01-03-18 </div>
                        <div class="col"> Username </div>
                    </div>
                </div>
                                        
                                        
                                    </div>
            
        
            
            
                                    <button type="button" class="btn btn-dark" value="Select All">Select All</button>
                                    <button type="button" class="btn btn-dark" value="Move to Category">Move to Category</button>
                                    <button type="button" class="btn btn-danger" value="Deselect All">Deselect All</button>
                                </div>
            
                            </div>
                        </div>
                  </div>
                </div>

            </div>
        )
    }
}

export default datasets;