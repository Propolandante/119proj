//derk.js

// global variables
var img_number = 4; //there is no "image 0", this is incremented before loading each image
var img_count = 5; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";
var raster; // image to be displayed
var imageLayer = project.activeLayer; // this layer holds the raster
var pinLayer = new Layer(); // all pins and text labels go in this label
var relationshipLayer = new Layer();
var tempArrowLayer = new Layer();
var typing = false; // true if text box is active (nothing else should happen until this is false again)
var userReport = [null,null,null,null,null]; // holds all of the user's imgData. userReport[0] will be empty
var userDefine = [];
var vector; // this is the vector the user draws with
var vectorStart, vectorPrevious;
var vectorItem;
var drawingRelFrom = null;
var startPt = null;
var instr;
var md;
var dragging = false;

//load initial image in imageLayer
loadNextImage();

//load pins from JSON data to display over image
loadPins();

displayText();

relationshipLayer.activate();

function imageRelationshipData(id)
{
	this.imageId = id;
	this.relationships = [];
}

function relationship(from, to)
{
	this.from_id = from.objectId;
	this.from_name = from.children['text'].content;
	this.to_id = to.objectId;
	this.to_name = to.children['text'].content;
	this.text = "";
}


/////// HANDLE CLICKS /////////

function onMouseDown(event) {
	
	//mousedown = true
	md = true;
	
	
	//check to see if user clicked on a pin
	
	var pins = pinLayer.children;
	var sd = 100000; // shortest distance
	var closestPin = null;
	
	if(!typing)
	{
		for(i = 0; i < pins.length; i++)
		{
			if (pins[i].children['pin'].contains(event.point))
			{
				// if it is on multiple pins, choose the closest one
				
				//console.log("pins["+i+"]("+pins[i].id+") CLICKED");
				if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				{
					
					sd = event.point.getDistance(pins[i].children['pin'].position);
					closestPin = pins[i];
					startPt = pins[i].children['pin'] ;
					startPt.strokeColor = 'yellow';
					startPt.strokeWidth = 3;
					
				}
			}
		}
		 if(closestPin) //if there is a pin, then we are now drawing a relationship from it
		 {
		 	drawingRelFrom = closestPin;
		 	
		 	//start drawing new vector
			vectorStart = drawingRelFrom.children['pin'].position;
			processVector(event.point, true);
		 	
		 	
		 	closestPin = null; // reset closestPin (might be unnecessary)
		 	sd = 10000; // reset the shortest distance (might be unnecessary)
		 }
		 else
		 {
		 	startPt.strokeColor = 'yellow';
			startPt.strokeWidth = 3;
		 	console.log (" there is no pin under mouse's position ");
		 }
	}
	
}

// function onMouseDrag(event) {
// 	
	// //update vector
	// dragging = true;
	// updateInstructions(null);
	// processVector(event.point, event.modifiers.shift);
// }

function onMouseUp(event) {
	
	
	//mousedown = false
	md = false;
	dragging = false;
	
	
	updateInstructions(null);
	
	if (startPt)
	{
		startPt.strokeColor = 'black';
		startPt.strokeWidth = 1;
		//startPt = null;
	}
	
	//check to see if user dragged to ANOTHER pin
	
	var pins = pinLayer.children;
	var sd = 100000; // shortest distance
	var closestPin = null;
	
	for(i = 0; i < pins.length; i++)
	{
		//excluding the pin we're drawing a relationship FROM
		if (pins[i].children['pin'].contains(event.point) && pins[i] != drawingRelFrom)
		{
			// if it is on multiple pins, choose the closest one
			if (event.point.getDistance(pins[i].children['pin'].position) < sd)
			{
				sd = event.point.getDistance(pins[i].children['pin'].position);
				closestPin = pins[i];
			}
		}
	}
	 if(closestPin) //if there is a pin, then we are now drawing a relationship from it
	 {
	 		 	
	 	//draw the vector TO this pin's position
	 	processVector(closestPin.children['pin'].position, false);
		vectorPrevious = vector;
		
		createRelationship(drawingRelFrom, closestPin);
	 	
	 	closestPin = null; // reset closestPin (might be unnecessary)
	 	sd = 10000; // reset the shortest distance (might be unnecessary)
	 }
	 else
	 {
	 	if(vectorItem)
	 	{
	 		vectorItem.remove();
	 	}
	 }
	
	
	
	
	
	
}

function onMouseMove(event){
	
{
	
	if(md)
	{
		dragging = true;
	}
	
	if(dragging)
	{
		updateInstructions(null);
		processVector(event.point, event.modifiers.shift);
	}
			
	//check to see if we are hovering over an existing pin
	var pins = pinLayer.children;
	var sd = 10000;
	var lastIndex = null;
	var closestPin = null;
	
	
	//initialize all pins to NOT showing
	for(i = 0; i < pins.length; i++)
	{
		pins[i].children['text'].visible = false;
	}
	
	
	//initialize all relationship lines to NOT showing
	for(i=0;i<relationshipLayer.children.length;i++)
	{
		
		relationshipLayer.children[i].visible = false;
		
	}
		
		
		
		
		
		for(i = 0; i < pins.length; i++)
		{
			//if we are hovering over this pin
			if (pins[i].children['pin'].contains(event.point))
			{
				// check to see if it is the closest pin (we don't want to highlight two pins at once)
				if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				{
					// if we are overwriting a pin that used to be the closest one
					// if(lastIndex)
					// {
						// if(pins[lastIndex].children['text'])
						// {
					 		// //hide text of this pin
							// pins[lastIndex].children['text'].visible = false;
					    	// //pins[lastIndex].children['rect'].visible = false;
// 					 	
					 	// }
					// }
					
					// mark the current pin to be the closest one
					sd = event.point.getDistance(pins[i].children['pin'].position);
					closestPin = pins[i];
					//remember what index this is at, in case we need to hide the text later
					lastIndex = i;
				}
			}
			//if we are NOT hovering over this pin
			else
			{
				// if(pins[i].children['text'])
			 	// {
			 		// //hide text of this pin
					// pins[i].children['text'].visible = false;
			    	// //pins[i].children['rect'].visible = false;
// 			    	
// 			 	
			 	// }
		    	pins[i].sendToBack();
			}
		}
		if(closestPin) //if there is a pin, then this pin is now DRAGGING
		{
		 	closestPin.bringToFront();
		 	
		 	if(closestPin.children['text'])
		 	{
		 		//show text of this pin
				closestPin.children['text'].visible = true;
		    	//closestPin.children['rect'].visible = true;
		    	
		    	//display any relationships coming from the pin's object
				for(i=0;i<relationshipLayer.children.length;i++)
				{
					var fromId = relationshipLayer.children[i].from.objectId;
					
					if(fromId == closestPin.objectId)
					{
						relationshipLayer.children[i].visible = true;
					}
				}
		 	
		 	}
		 	
		 	updateInstructions(closestPin);
		 	
		 	closestPin = null; // reset closestPin (might be unnecessary)
		 	sd = 10000; // reset the shortest distance (might be unnecessary)
		 }
		 else
		 {
		 	updateInstructions(null);
		 }
	}
	
}


//clicking the button loads the next image
document.getElementById("nextImage").onclick = loadNextImage;

function displayText() {
	
	imageLayer.activate();
	
	var title = new PointText(new Point(450, 40));
	title.content = "Phase II - Label All Relationships";
	
	title.style = {
    	fontFamily: 'Helvetica',
    	fontWeight: 'bold',
    	fontSize: 40,
    	fillColor: 'blue',
    	justification: 'center'
	};
	
	instr = new PointText(new Point(450, 670));
	instr.content = "Click and drag an arrow from one object to another to label a relationship. This demonstration only has one example image.\nData collected from Phase I will be used as object data in Phase II.";
	
	instr.style = {
    	fontFamily: 'Helvetica',
    	fontSize: 16,
    	fillColor: 'blue',
    	justification: 'center'
	};
}

function loadNextImage() {
	
	//delete everything. Well, the info is stored in the JSON structures but visually it will disappear
	pinLayer.removeChildren();
	//switch to imageLayer since we're changing the image
	imageLayer.activate();
	
	if(raster != null) // if there is already an image
	{
		
		raster.remove(); // remove it
	}
	
	//create a standard JavaScript image
	var img = document.createElement("img");
	document.body.appendChild(img);
	
	///increment counter to load next image
	if (img_number < img_count)
	{
		img_number++;
	}
	else
	{
		//img_number = 1;
		console.log("No more images, task complete!");
		
		// DO SOMETHING TO SHOW THAT THE TASK IS OVER
		
		return;
	}
	//load JavaScript image from source
	img.src = img_directory + img_number + ".jpg";
	img.id = "image_" + img_number;
	
	//create PaperJS raster of JavaScript image
	raster = new Raster(img.id);
	raster.name = "image";
	// get rid of JavaScript image
	img.remove();
	
	//position the raster
	raster.position = new Point(450,350);
	
	//lower image opacity for better text visibility
	raster.opacity = 0.85;
	
	//revert back to pin layer
	pinLayer.activate();
	
	//start new imageData Object in userReport array
	userReport.push(new imageRelationshipData(img_number));
};

function loadPins() {
	
	pinLayer.activate();
	
	var pinSize = 7;
	
	for (i = 0; i < imageObjectData.objects.length; i++)
	{
		//if objects[i] is NULL, skip it!
		if(!imageObjectData.objects[i])
		{
			//skip to next object
			break;
		}
		
		// console.log("Creating pin for #" + imageObjectData.objects[i].objectId + ", " + imageObjectData.objects[i].name);
		
		var pin = new Path.Circle(new Point(imageObjectData.objects[i].x, imageObjectData.objects[i].y), pinSize);
		
		// set pin colors
		pin.strokeColor = 'black';
		pin.fillColor = 'blue';
		pin.name = "pin";
		
		//group pin and text together
		var objectLabel = new Group();
		objectLabel.name = "objectLabel";
		objectLabel.objectId = imageObjectData.objects[i].objectId;
		console.log("this is object " + objectLabel.objectId);
		objectLabel.addChild(pin);
		// console.log("Creating pinText for " + imageObjectData.objects[i].name);
		objectLabel.addChild(makeObjectTags(imageObjectData.objects[i].x, imageObjectData.objects[i].y, imageObjectData.objects[i].name));
		
		// //define pin behavior on mouseOver
		// pin.onMouseEnter = function(event) 
		// {
			// //bring pin to front in case of overlap
			// this.parent.bringToFront();
// 			
			// //grow pin to emphasize which one is selected and hint that it can be dragged
			// // this.scale(1.6);
			// //console.log("hover");
// 			
			// //display text
			// if(this.parent.children['text'])
			// {
				// this.parent.children['text'].visible = true;
			// }
// 			
			// //display any relationships coming from the pin's object
			// for(i=0;i<relationshipLayer.children.length;i++)
			// {
				// var fromId = relationshipLayer.children[i].from.objectId;
// 				
				// if(fromId == this.parent.objectId)
				// {
					// relationshipLayer.children[i].visible = true;
				// }
			// }
// 			
		// };
		// pin.onMouseLeave = function(event) 
		// {
			// // this.scale(0.625);
			// //console.log("unhover");
// 			
			// if(this.parent.children['text'])
			// {
				// this.parent.children['text'].visible = false;
			// }
// 			
			// for(i=0;i<relationshipLayer.children.length;i++)
			// {
				// relationshipLayer.children[i].visible = false;
			// }
		// };
		
		pin.selected = false;
		
		// console.log("pins in layer = " + pinLayer.children.length);
		// console.log("text in objectLabel = " + objectLabel.children['text'].content);
		
	}
};

function makeObjectTags(x, y, tagText){
	//console.log ("path " + event.item);
	//var fullname = prompt("Object name.", " ");
	//zxcMakeTextBox(event.point.x, event.point.y);
	
	var text = new PointText(x, y+25);
	text.content = tagText;
	
	if (sources.indexOf(tagText) == -1 && userDefine.indexOf(tagText) == -1)
	{
		userDefine.push(tagText);
	}

	
	text.style = {
    	fontFamily: 'Courier New',
    	fontWeight: 'bold',
    	fontSize: 22,
    	fillColor: 'blue',
    	justification: 'center'
	};
	text.visible = false;
	text.name = "text";
	
	return text;
};

function makeRelTags(x, y, tagText){
	//console.log ("path " + event.item);
	//var fullname = prompt("Object name.", " ");
	//zxcMakeTextBox(event.point.x, event.point.y);
	
	var text = new PointText(x, y);
	text.content = tagText;
	
	if (sources.indexOf(tagText) == -1 && userDefine.indexOf(tagText) == -1)
	{
		userDefine.push(tagText);
	}

	
	text.style = {
    	fontFamily: 'Courier New',
    	fontWeight: 'bold',
    	fontSize: 22,
    	fillColor: 'red',
    	justification: 'center'
	};
	text.visible = true;
	text.name = "text";
	
	console.log("text reads " + text.content);
	
	return text;
};

function processVector(point, drag) {
	vector = point - vectorStart;
	drawVector(drag);
}

function drawVector(drag) {
	
	tempArrowLayer.activate();
	
	//clear previous vector items
	
	if (vectorItem)
		vectorItem.remove();
	
	var arrowVector = vector.normalize(10);
	var end = vectorStart + vector;
	vectorItem = new Group([
		new Path([vectorStart, end]),
		new Path([
			end + arrowVector.rotate(135),
			end,
			end + arrowVector.rotate(-135)
		])
	]);
	vectorItem.strokeWidth = 5;
	vectorItem.strokeColor = '#e4141b';
	
	relationshipLayer.activate();
	
}

function createRelationship(g_from, g_to)
{
	if (vectorItem)
		vectorItem.remove();
	
	
	//add new relationship to this image's relationship array
	userReport[img_number].relationships.push(new relationship(g_from, g_to));
	console.log("From " + userReport[img_number].relationships.slice(-1)[0].from_name + " to " + userReport[img_number].relationships.slice(-1)[0].to_name);
	
	//create new group to arrow and text
	relLabel = new Group();
	
	//create subgroup to hold arrow path objects
	var arrowVector = vector.normalize(10);
	var end = vectorStart + vector;
	relArrow = new Group([
		new Path([vectorStart, end]),
		new Path([
			end + arrowVector.rotate(135),
			end,
			end + arrowVector.rotate(-135)
		])
	]);
	
	relArrow.strokeWidth = 2;
	relArrow.strokeColor = '#ffff00';
	relArrow.visible = true;
	
	
	//add new subgroup to main group	
	relLabel.addChild(relArrow);
	relLabel.from = g_from;
	relLabel.to = g_to;
	relLabel.visible = false;
	
	
	zxcMakeTextBox(relLabel);
	
}

function zxcMakeTextBox(group){

	
	// console.log ("Text box created at (" + event.point.x + "," + event.point.y + ")");
	
	//set typing to TRUE to prevent user from drawing new relationships
	typing = true;
	updateInstructions(null);
	
	var x = vectorStart.x + (vector.x / 2);
	var y = vectorStart.y + (vector.y / 2);
	
  	var textBoxClosed = false;
    var zxcTextBox = document.createElement('INPUT'); // "input" works also
    zxcMakeTextBox.value = null;
	$(zxcTextBox).attr({
    	'type': 'text',
    	'id': "tags",
    	'class': 'text-field valid',   //--- can use another style that was set up in .css file
   		'placeholder':"what's the relationship?", //--- ghost string 
	});
  	
  	var combine = sources.concat(userDefine);
 
	
  	// zxcTextBox = document.createElement('INPUT'); 
  	// zxcTextBox.type='text'; // same as create  <input  type="text" > in html
  	
  	// zxcTextBox.size=10;
  	
  	document.getElementsByTagName('BODY')[0].appendChild(zxcTextBox);
  	
  	var t = $('#tags').autocomplete({ 
  		source: function( request, response ) {
  			if (!textBoxClosed ) // if the textBox is closed, autocomplete will not be executed
  			{
    			var matches = $.map( combine, function(acItem) {
      				if ( acItem.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) 
      				{
        				return acItem;
       				}
    			});
  			}
    	response(matches);
  		}
	});
  	
  	// ****** 
  	// codes about styles/css
  	
  	zxcTextBox.style.position ='absolute';
  	zxcTextBox.style.left     = x+'px';
  	zxcTextBox.style.top      = y+'px';
  	//zxcTextBox.style.fontSize = (12)+'px';      
  	
  	// ******
  	
  	// after created, if the mouse is on the textbox, textbox will be highlighted
  	zxcTextBox.focus(); 
  
    
    // press enter to finish typing
  	zxcTextBox.onkeydown = function(event){ 
  		//console.log ("before enter " + zxcTextBox.value);  		
  		if (event.keyCode == '13')
  		{
  			textBoxClosed = true;
  			// console.log("ENTER HAS BEEN PRESSED");
  			
  			var input = zxcTextBox.value;
  			
  			//if the user pressed ENTER without typing anything
  			if (!input)
  			{
  				// console.log("Since nothing was typed in the text box, we are deleting everything about this pin:");
  				
  				//delete the pin JSON data
  				userReport[img_number].relationships.pop();
  				// console.log("JSON data (hopefully) deleted.");
  				
  				//as well as the pin and objectLabel group!
  				group.remove();
  				// console.log("objectLabel group and children (hopefully) removed.");
  				
  				$('#tags').autocomplete("close");
  			
	  			this.parentElement.removeChild(this);
	  			
	  			//set typing back to FALSE to allow user to make pins again
	  			typing = false;
				updateInstructions(null);				
  			}
  			
  			
  			//if the popUp hasn't had a chance to load
  			
  			userReport[img_number].relationships.slice(-1)[0].text = zxcTextBox.value;
  			console.log(userReport[img_number].relationships.slice(-1)[0].from_name + " is " + userReport[img_number].relationships.slice(-1)[0].text + " " + userReport[img_number].relationships.slice(-1)[0].to_name);
  			
  			group.addChild(makeRelTags(x, y, zxcTextBox.value));
  			
  			
  			console.log("Relationships: " + relationshipLayer.children.length);
  			
  			$('#tags').autocomplete("close");
  			
  			this.parentElement.removeChild(this);
  			
  			
  			//set typing back to FALSE to allow user to make pins again
  			typing = false;
			updateInstructions(null);			
  		//	imageLayer.activate();
  		}
  		
  		
  	};
   //onblur --- mouse click to somewhere else that does not foucs on create obj (textbox)
   //zxcTextBox.onblur = function(){ this.style.visibility='hidden'; }
   
};

function updateInstructions(event){
	//console.log("drawrelfrom "+drawingRelFrom);
	if(typing) instr.content = "Enter a name for this relationship.";
	else if(dragging) instr.content = "Drag this object to another object define a relationship.";
	else instr.content = "Click and drag an arrow from one object to another to label a relationship. This demonstration only has one example image.\nData collected from Phase I will be used as object data in Phase II.";
}
