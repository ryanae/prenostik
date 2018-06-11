import React from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import home from './pages/home/home.js';
import datasets from './pages/datasets/datasets.js';
import savedResults from './pages/saved/savedResults.js';
import newAnalysis from './pages/analysis/newAnalysis.js';
import result from './pages/analysis/result.js';
import homeIcon from './icons/home.svg';
import newIcon from './icons/add.svg';
import resultsIcon from './icons/save.svg';
import datasetsIcon from './icons/folder.svg';
import collapseIcon from './icons/left-arrow.svg';
import userIcon from './img/user.jpg';
import './App.css';

const App = () => (
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
);

const Navigation = () => (
        <nav id="sidebar">
            <NavLink to ="/">
                <div class="nav-header"> <h1>Pre<strong>nostik</strong></h1> </div>
            </NavLink>
    
            <div class="user-info">
                <img src={userIcon} alt={'userIcon'}/>
                <h3>User Name</h3>
                <h4>company name </h4>
            </div>
    
            <div class="nav-links">
                <NavLink to ="/">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} alt={'homeIcon'}/> </div> 

                        <div class="nav-label">Home</div>
                    </button>
                </NavLink>

                <NavLink to ="/analysis/new">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={newIcon} alt={'newIcon'}/> </div> 

                        <div class="nav-label">Start New Analysis</div>
                    </button>
                </NavLink>

                <NavLink to ="/saved-results">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={resultsIcon} alt={'resultsIcon'}/> </div> 

                        <div class="nav-label">Saved Results</div>
                    </button>
                </NavLink>

                <NavLink to ="/my-datasets">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={datasetsIcon} alt={'datasetsIcon'}/> </div> 

                        <div class="nav-label">My Datasets</div>                
                </button>
                </NavLink>

                <div class="collapse-button">
                    <button type="button" class="nav-btn btn btn-outline-light btn-block">
                        <img src={collapseIcon} alt={'collapseIcon'}/>
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
            <Route path="/analysis/result" component={result}></Route>
            <Route path="/my-datasets" component={datasets}></Route>
            <Route path="/saved-results" component={savedResults}></Route>
        </Switch>
    </div>
)

export default App;