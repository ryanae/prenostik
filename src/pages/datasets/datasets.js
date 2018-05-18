/* This is the main/first page for view/manage/upload datasets. */

import React from 'react';

const datasets = () => (
    <div className="datasets">
        <h2>My Datasets</h2>

        <div class="row">
            <div class="col"><h3> My files</h3></div>

            <div class="col">
                <button type="button" class="btn" id="search">Search</button>
                <button type="button" class="btn" id="selectfiles">Selected Files</button>
            </div>
        </div>
        

        <div class="row">   
            <div class="col-sm">
                <div class="panel panel-default"> 
                <div class="panel-body">Name-------------Type-------------Data-------------Created Owner</div>
                </div>
            </div>

        </div>
        <div class="row">
            <div class="col">
            <button type="button" class="btn btn-primary btn-block" id="save-result-btn">Upload files</button>
            </div>
        </div>

    </div>
);

export default datasets;