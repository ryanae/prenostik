/* This is the main/first page for view/manage/upload datasets. */

import React from 'react';

const datasets = () => (
    <div className="datasets">
        datasheets page
    
    <input type="file" id="excelfile" />  
    <input type="button" id="viewfile" value="Export To Table" onclick="ExportToTable()" />  
      <br />  
      <br />  
    <table id="exceltable">  
    </table> 
    </div>
);

export default datasets;

/*function*/