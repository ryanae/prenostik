import React from 'react';
import './App.css';

import { NavLink, Switch, Route } from 'react-router-dom';


const App = () => (
    <div className="app">
        <h1>React Router Demo</h1>
        <Navigation />
        <Main />
    </div>
);

const Navigation = () => (
    <nav>
        <ul>
            <li><NavLink to ="/">Home</NavLink></li>
            <li><NavLink to ="/test">Test</NavLink></li>
        </ul>
    </nav>
);

const Home = () => (
    <div className="home">
        homebody
    </div>
);

const Test = () => (
    <div className="test">
        body text
    </div>
);

const Main = () => (
    <Switch>
        <Route exact path="/" component={Home}></Route>
        <Route path="/test" component={Test}></Route>
    </Switch>
)

export default App;