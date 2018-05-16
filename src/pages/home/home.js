/* Home page */

import React, { Component } from 'react';



class Home extends Component {
    render() {
        
        return (
            <div>
                <h3 class="m-3">Recent Activity</h3>
                <div class="container">
                    <div class="row">
                        <div class="col">  
                            <div class="card w-auto">
                            <div class="card-body">
                                <h6 class="card-title">Sample Result</h6>
                                <img class="m-2" src="sample.jpg"></img>
                              <p class="h6"><strong>Last Edited</strong> <a href="#" class="btn btn-success float-right">Open</a></p>
                            
                        </div>
            </div>
                        </div>
                        <div class="col">
                              <div class="card w-auto">
                            <div class="card-body">
                                <h6 class="card-title">Sample Result</h6>
                                <img class="m-2" src="#"></img>
                              <p class="h6"><strong>Last Edited</strong> <a href="#" class="btn btn-success float-right">Open</a></p>
                            
                        </div>
            </div>
                        </div>
        
                      
                        
                        
                        
                        
                        
                    </div>
                </div>
            </div>
        );
        
    }
}

export default Home