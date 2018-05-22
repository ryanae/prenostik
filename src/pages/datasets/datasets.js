/* This is the main/first page for view/manage/upload datasets. */

import React from 'react';
import './dataset.css';
import {handleFiles} from './csv_file.js';
import {read_file} from './csv_file.js'; 
import {window_test} from './csv_file.js';
import CsvParse from '@vtex/react-csv-parse'; 



const datasets = () => (
    <div className="datasets">
        datasheets page
    
    <p> Choose your file: </p>
    <input id="csv" type="file"></input>

    <input type="button" id="csvSubmit" value="Submit" onclick={()=>window_test()}
    accept=".csv"/> 
    
    
    <output id="out">
        file contents here 
    </output>

    
    
    <input type="file" id="csvFileInput" onChange={handleFiles(this.files)} accept=".csv"/>  
    <output id="output">
        output test 2
    </output>
    
      <br />  
      <br />  
    
    </div>
);


export default datasets;


