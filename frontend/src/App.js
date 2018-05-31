import React from 'react';
import './App.css';
import { NavLink, Switch, Route } from 'react-router-dom';

import home from './pages/home/home.js';
import datasets from './pages/datasets/datasets.js';
import newAnalysis from './pages/analysis/newAnalysis.js';
import savedResults from './pages/saved/savedResults.js';

import homeIcon from './icons/home.svg';
import userIcon from './img/user.jpg';

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
                        <div class="nav-icon"> <img src={homeIcon} alt={'homeIcon'}/> </div> 

                        <div class="nav-label">Start New Analysis</div>
                    </button>
                </NavLink>

                <NavLink to ="/saved-results">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} alt={'homeIcon'}/> </div> 

                        <div class="nav-label">Saved Results</div>
                    </button>
                </NavLink>

                <NavLink to ="/my-datasets">
                    <button type="button" class="nav-btn btn btn-block">
                        <div class="nav-icon"> <img src={homeIcon} alt={'homeIcon'}/> </div> 

                        <div class="nav-label">My Datasets</div>                
                </button>
                </NavLink>

                <div class="collapse-button">
                    <button type="button" class="nav-btn btn btn-outline-light btn-block">
                        <img src={homeIcon} alt={'homeIcon'}/>
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