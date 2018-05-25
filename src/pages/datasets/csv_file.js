var fileInput = document.getElementById("csv"),

readFile = function () {
    var reader = new FileReader();
    reader.onload = function () {
        document.getElementById('out').innerHTML = reader.result;
    };
    // start reading the file. When it is done, calls the onload event defined above.
    reader.readAsBinaryString(fileInput.files[0]);
};

if (fileInput){ 
fileInput.addEventListener('change', readFile);
}


export function window_test(){ 
    window.alert("testing"); 

}



export function read_file(){ 
    var fileInput = document.getElementById("csv"); 
    var reader = new FileReader(); 
    reader.onload = function(){ 
        document.getElementById('out').innerHTML = reader.result;
    };
    
    if (fileInput != null){ 
    return reader.readAsBinaryString(fileInput.files[0]); 
    }
}








export function handleFiles(files){ 
    if (window.FileReader){ 
        console.log("TESTING HERE!!!");
        //file reader is supported
        if (files){ 
            console.log("GOT THE FILE!"); 
            getAsText(files[0]); 
        }
    } else { 
        console.log("ERROR!!!"); 
    }
}

export function getAsText (fileToRead){ 
            console.log("TESTING HERE!!!2");

    var reader = new FileReader();
    reader.readAsText(fileToRead); 
    reader.onload = loadHandler; 
    reader.onerror = errorHandler; 
}

export function loadHandler(event){ 
            console.log("TESTING HERE!!!3");

    var csv = event.target.result; 
    processData(csv); 
}

export function processData(csv){ 
            console.log("TESTING HERE!!!4");

    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    for (var i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
            var tarr = [];
            for (var j=0; j<data.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
    }
    console.log(lines);
    drawOutput(lines); 
}

export function errorHandler(evt) {
    if(evt.target.error.name === "NotReadableError") {
        alert("Cannot read file !");
    }
}

export function drawOutput(lines){
	//Clear previous data
            console.log("TESTING HERE!!!5");

	document.getElementById("output").innerHTML = "";
	var table = document.createElement("table");
	for (var i = 0; i < lines.length; i++) {
		var row = table.insertRow(-1);
		for (var j = 0; j < lines[i].length; j++) {
			var firstNameCell = row.insertCell(-1);
			firstNameCell.appendChild(document.createTextNode(lines[i][j]));
		}
	}
	document.getElementById("output").appendChild(table);
}