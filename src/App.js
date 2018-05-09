import React from 'react';
import './App.css';
import { NavLink, Switch, Route } from 'react-router-dom';

import home from './pages/home/home.js';
import datasheets from './pages/datasets/datasets.js';
import newAnalysis from './pages/analysis/newAnalysis.js';
import savedResults from './pages/saved/savedResults.js';

const App = () => (
    <div className="app">
        <Navigation />
        <Main />
    </div>
);

const Navigation = () => (
    <nav id="sidebar">
        <ul>
            <li><NavLink to ="/">Home</NavLink></li>
            <li><NavLink to ="/analysis/new">Start New Analysis</NavLink></li>
            <li><NavLink to ="/saved-results">Saved Results</NavLink></li>
            <li><NavLink to ="/my-datasheets">My Datasets</NavLink></li>
        </ul>
    </nav>
);

const Main = () => (
    <Switch>
        <Route exact path="/" component={home}></Route>
        <Route path="/analysis/new" component={newAnalysis}></Route>
        <Route path="/my-datasheets" component={datasheets}></Route>
        <Route path="/saved-results" component={savedResults}></Route>
    </Switch>
)

export default App;