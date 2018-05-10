import React from 'react';
import './App.css';
import { NavLink, Switch, Route } from 'react-router-dom';

import home from './pages/home/home.js';
import datasets from './pages/datasets/datasets.js';
import newAnalysis from './pages/analysis/newAnalysis.js';
import savedResults from './pages/saved/savedResults.js';

const App = () => (
    <div className="app" class="container-fluid">
        <div class="row">
            <div class="col-xs-2">
                <Navigation />
            </div>
            <div class="col-xs-10">
                <Main />
            </div>
        </div>
    </div>
);

const Navigation = () => (
        <nav id="sidebar">
            <ul>
                <button type="button" class="btn btn-outline-light btn-block">
                    <NavLink to ="/">Home</NavLink>
                </button>
                <button type="button" class="btn btn-outline-light btn-block">
                    <NavLink to ="/analysis/new">Start New Analysis</NavLink>
                </button>
                <button type="button" class="btn btn-outline-light btn-block">
                    <NavLink to ="/saved-results">Saved Results</NavLink>
                </button>
                <button type="button" class="btn btn-outline-light btn-block">
                    <NavLink to ="/my-datasets">My Datasets</NavLink>
                </button>
            </ul>
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