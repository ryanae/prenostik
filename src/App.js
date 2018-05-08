import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom'; 
import './App.css';

/* Import pages*/
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import ManageUploads from './pages/ManageUploads.jsx';
import CreateAnalysis from './pages/CreateAnalysis.jsx';
import Results from './pages/Results.jsx';

class App extends Component {
  render() {
    return (
        <Router>
            <div class="wrapper">
                <nav id="sidebar-wrapper">
                    <ul class="sidebar-nav">
                        <a href="/">Home</a>
                        <a href="/create/analysis">Start New Analysis</a>
                        <a href="/results">Saved Results</a>
                        <a href="/upload">Upload Data Sets</a>
                        <a href="/upload/manage">Manage Data Sets</a>
                    </ul>
                </nav>

                <Route exact path="/" component={Home}/>
                <Route exact path="/create/analysis" component={CreateAnalysis}/>
                <Route exact path="/results" component={Results}/>
                <Route exact path="/upload" component={Upload}/>
                <Route exact path="/upload/manage" component={ManageUploads}/>
            </div>
        </Router>
        
    );
  }
}

export default App;
