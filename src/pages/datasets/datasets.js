/* This is the main/first page for view/manage/upload datasets. */

import React, { Component } from 'react';
import './dataset.css';
import {handleFiles} from '../../App.js';
import CsvParse from '@vtex/react-csv-parse'; 


class datasets extends Component {
    constructor(){ 
        super(); 
        this.handleFiles = this.handleFiles.bind(this);
        //this.processData = this.processData(this); 
    };
 
    handleFiles = (files) => {
        // Check for the various File API support.
        if (window.FileReader) {
            // FileReader are supported.
            console.log("read"); 
            this.getAsText(files[0]);
        }
    };

    getAsText(fileToRead) {
        var reader = new FileReader();
        var file_read = document.querySelector("input").files[0];
        
        // Read file into memory as UTF-8      
        reader.readAsText(file_read);
        // Handle errors load
        reader.onload = this.fileReadingFinished;
        reader.onerror = this.errorHandler;
    };


    fileReadingFinished(event) {
        var csv = event.target.result;
        var text = csv + " "; 
        var allTextLines = text.split(/\r\n|\n/);
        var lines = allTextLines.map(data => data.split(';'));
        
    document.getElementById("output").innerHTML=""; 
    document.getElementById("output").innerHTML=lines; 

        
        //document.write(lines); 
    };

    errorHandler(event) {
        if (event.target.error.name === "NotReadableError") {
            alert("Cannot read file!");
        }
    };

    draw (lines){ 
        document.getElementById("output").innerHTML=""; 

    };

    draw_output(lines){ 
        console.log("draw"); 

       document.getElementById("output").innerHTML=""; 
	   var table = document.createElement("table");
	   for (var i = 0; i < lines.length; i++) {
		  var row = table.insertRow(-1);
		  for (var j = 0; j < lines[i].length; j++) {
			 var firstNameCell = row.insertCell(-1);
			 firstNameCell.appendChild(document.createTextNode(lines[i][j]));
		  }
	   }
	   document.getElementById("output").appendChild(table)
    };

    render() {
        return(
            <div>
            <input type="file" onChange={ this.handleFiles }
                accept=".csv"/>
            <div id="output">Output Here</div>
            </div>
        )
    }
}


export default datasets;


