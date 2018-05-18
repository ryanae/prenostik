/* Home page */

import React, { Component } from 'react';
import sample from "./sample.jpg";



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
                                    <h5 class="card-title">Sample Result</h5>
                                    <img class="m-1 embed-responsive" src={sample}></img>
                                    <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <a href="#" class="btn btn-dark float-right">Open</a></p>
                                </div>
                            </div>
                        </div>
            
                        <div class="col">
                            <div class="card w-auto">
                                <div class="card-body">
                                    <h5 class="card-title">Sample Result</h5>
                                    <img class="m-1 embed-responsive" src={sample}></img>
                                    <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <a href="#" class="btn btn-dark float-right">Open</a></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p></p>

                    <div class="row">
                        <div class="col">
                            <div class="card w-auto">
                                <div class="card-body">
                                    <h5 class="card-title">Sample Result</h5>
                                    <img class="m-1 embed-responsive" src={sample}></img>
                                    <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <a href="#" class="btn btn-dark float-right">Open</a></p>
                                </div>
                            </div>
                        </div>

                        <div class="col">
                            <div class="card w-auto">
                                <div class="card-body">
                                    <h5 class="card-title">Sample Result</h5>
                                    <img class="m-1 embed-responsive" src={sample}></img>
                                    <p class="h6 m-3"><strong>Last Edited</strong> 10/10/10 <a href="#" class="btn btn-dark float-right">Open</a></p>
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