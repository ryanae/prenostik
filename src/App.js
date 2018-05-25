import React, { Component } from 'react';
import './App.css';
import { NavLink, Switch, Route } from 'react-router-dom';

import home from './pages/home/home.js';
import datasets from './pages/datasets/datasets.js';
import newAnalysis from './pages/analysis/newAnalysis.js';
import savedResults from './pages/saved/savedResults.js';

import homeIcon from './icons/home.svg';
import userIcon from './img/user.jpg';

function toggleSidebar() {
    var sidebar = document.getElementByClassName("sidebar");
    sidebar.style.background = "#000";
}

class App extends Component { 
    constructor(){ 
        super(); 
        this.handleFiles = this.handleFiles.bind(this);
        //this.processData = this.processData(this); 
    };
 
    handleFiles = (files) => {
        // Check for the various File API support.
        if (window.FileReader) {
            // FileReader are supported.
            console.log("read"); 
            this.getAsText(files[0]);
        }
    };

    getAsText(fileToRead) {
        var reader = new FileReader();
        var file_read = document.querySelector("input").files[0];
        
        // Read file into memory as UTF-8      
        reader.readAsText(file_read);
        // Handle errors load
        reader.onload = this.fileReadingFinished;
        reader.onerror = this.errorHandler;
    };


    fileReadingFinished(event) {
        var csv = event.target.result;
        var text = csv + " "; 
        var allTextLines = text.split(/\r\n|\n/);
        var lines = allTextLines.map(data => data.split(';'));
        
    document.getElementById("output").innerHTML=""; 
    document.getElementById("output").innerHTML=lines; 

        
        //document.write(lines); 
    };

    errorHandler(event) {
        if (event.target.error.name === "NotReadableError") {
            alert("Cannot read file!");
        }
    };

    render(){ 
        return( 
            <div className="app" class="container-fluid">
                <div class="row">
                    <div class="col sidebar">
                        <Navigation />
                    </div>

                    <div class="col content">
                        <Main />
                    </div>
                </div>
            </div>
        )
    }
};



const Navigation = () => (
        <nav id="sidebar">
            <NavLink to ="/">
                <div class="nav-header"> 
                    <h1>Pre<strong>nostik</strong></h1> 
                    <h2><strong>P</strong></h2>
                </div>
            </NavLink>
    
            <div class="user-info">
                <img src={userIcon}/>
                <h3>User Name</h3>
                <h4>company name </h4>
            </div>
    
            <div class="nav-links">
                <NavLink to ="/">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} /> </div> 

                        <div class="nav-label">Home</div>
                    </button>
                </NavLink>

                <NavLink to ="/analysis/new">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} /> </div> 

                        <div class="nav-label">Start New Analysis</div>
                    </button>
                </NavLink>

                <NavLink to ="/saved-results">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} /> </div> 

                        <div class="nav-label">Saved Results</div>
                    </button>
                </NavLink>

                <NavLink to ="/my-datasets">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} /> </div> 

                        <div class="nav-label">My Datasets</div>                
                </button>
                </NavLink>

                <div class="collapse-button">
                    <button type="button" class="nav-btn btn btn-outline-light btn-block">
                        <img src={homeIcon} />
                    </button>
                </div>
            </div>
    
        </nav>
);

const Main = () => (
    <div id="main">
        <Switch>
            <Route exact path="/" component={home}></Route>
            <Route path="/analysis/new" component={newAnalysis}></Route>
            <Route path="/my-datasets" component={datasets}></Route>
            <Route path="/saved-results" component={savedResults}></Route>
        </Switch>
    </div>
)

export default App;