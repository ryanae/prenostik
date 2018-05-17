/* This is the main/first page for Saved Results */

import React from 'react';

const savedResults = () => (
    
    <div id="savedResults" className="savedResults">
        <div class="row">
            <h1> Results for Untitled Analysis</h1>
        </div>
        <div class="row">
    
            <div class="col">
            <button type="button" class="btn btn-primary btn-block">View</button>
            </div>
    
            <div class="col">
            <button type="button" class="btn btn-primary btn-block">Edit</button> 
            </div>
    
            <div class="col">
            <button type="button" class="btn btn-primary btn-block hidden-print" onclick="printfunction()"><span class="glyphicon glyphicon-print" aria-hidden="true"></span> Print</button>
            </div>
    
            <div class="col">
            <button type="button" class="btn btn-primary btn-block"  data-toggle="modal" data-target="#SaveModal" >Save</button> 
            </div>
        </div>
        <div class="row">   
            <div class="col-sm">
                <div class="panel panel-default"> 
                <div class="panel-body">Put graph here</div>
                </div>
            </div>
    
            <div class="col-sm">
                <div class="panel panel-default"> 
                <div class="panel-body">Put graph here</div>
                </div>
            </div>
        </div>
    
        <div class="row">   
            <div class="col-sm">
                <div class="panel panel-default"> 
                <div class="panel-body">Put graph here</div>
                </div>
            </div>
    
            <div class="col-sm">
                <div class="panel panel-default"> 
                <div class="panel-body">Put graph here</div>
                </div>
            </div>
        </div>
    
        <div class="modal fade" id="SaveModal" tabindex="-1" role="dialog" aria-labelledby="SaveModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="SaveModalTitle">Save Result</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                Where would you like to save?
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>

    </div>
    


);

function printfunction(){ 
    window.print(); 
}
export default savedResults;