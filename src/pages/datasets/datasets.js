/* This is the main/first page for view/manage/upload datasets. */

import React from 'react';
import './datasets.css';

const datasets = () => (
    <div className="datasets">
        <h2>My Datasets</h2>

        <div class="card bg-light mb-3">
          <div class="card-body">
                <div class="row">
                    <div class="col" id="my-files-col">
                        <h5 class="card-title">My Files</h5>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button">Button</button>
                                </div>
                            </div>
    
                    </div>
    
                    <div class="col">
                        <h5 class="card-title">Selected Files</h5>
                    </div>
                </div>
          </div>
        </div>

    </div>
);

export default datasets;