//derk.js

// global variables
var img_number = 0; //there is no "image 0", this is incremented before loading each image
var img_count = 10; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";
var draggingPin = null; // pin being dragged
var raster; // image to be displayed
var imageLayer = project.activeLayer; // this layer holds the raster
var pinLayer = new Layer(); // all pins and text labels go in this label
var typing = false; // true if text box is active (nothing else should happen until this is false again)
var userReport = [null]; // holds all of the user's imgData. userReport[0] will be empty

//load initial image in imageLayer
loadNextImage();

//switch to pinLayer for pin placement
pinLayer.activate();


function imageData(id)
{
	this.imageId = id;
	this.objects = [];
}

function objectData(x,y,id)
{
	this.x = x;
	this.y = y;
	this.objectId = id;
	this.name = "";
}


/////// HANDLE CLICKS /////////

function onMouseDown(event) {
	
	var inBounds = false;
	
	//check to make sure click is within the image boundaries	
	
	if(raster.contains(event.point))
	{
		inBounds = true;
	}
	
	//check to see if the click is on a pin
		
	var pins = pinLayer.children;
	
	var sd = 100000; // shortest distance
	var closestPin = null;
	
	if(inBounds && !typing)
	{
		for(i = 0; i < pins.length; i++)
		{
			if (pins[i].children['pin'].contains(event.point))
			{
				//console.log("pins["+i+"]("+pins[i].id+") CLICKED");
				if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				{
					// if it is on multiple pins, choose the closest one
					sd = event.point.getDistance(pins[i].children['pin'].position);
					closestPin = pins[i];
				}
			}
			else
			{
				//console.log("pins["+i+"]("+pins[i].id+") NOT");
			}
		}
		 if(closestPin) //if there is a pin, then this pin is now DRAGGING
		 {
		 	draggingPin = closestPin;
		 	draggingPin.dragging = true;
		 	
		 	// console.log("id check: " + draggingPin.id + " vs " + closestPin.id);
		 	// console.log("draggingPin selected, object ID is " + draggingPin.id);
		 	
		 	closestPin = null; // reset closestPin (might be unnecessary)
		 	sd = 10000; // reset the shortest distance (might be unnecessary)
		 }
		 else //if there is no pin, create a pin
		 {
		 	createPin(event);
		 }	
	}		
}

function onMouseUp(event) {
	
	//if I was dragging a pin before, that pin is no longer DRAGGING
	if(draggingPin)
	{
		//update JSON coordinate info for dragged pin
		
		userReport[img_number].objects[draggingPin.objectIndex].x = event.point.x;
		userReport[img_number].objects[draggingPin.objectIndex].y = event.point.y;
		
		//console.log the new position
		console.log("Updated pin " + draggingPin.id + " to new position (" 
		+ userReport[img_number].objects[draggingPin.objectIndex].x + "," 
		+ userReport[img_number].objects[draggingPin.objectIndex].y + ")");
		
		//this pin is no longer being dragged
		draggingPin.dragging = false;
		//we are no longer dragging a pin
		draggingPin = null;
	}
	
};

function onMouseMove(event) {
	
	//if I am DRAGGING a pin, move the pin's position to the position of the mouse
	if(draggingPin)
	{
		if(draggingPin.dragging)
		{
			draggingPin.position += event.delta;
		}
		else
		{
			// this should never happen
			console.log("Uh, oh, draggingPin isn't dragging!");
		}
	}
}

function onKeyDown(event) {
	if(event.key == 'delete')
	{
		// if mouse is hovering over a pin, delete it
	}
}

//clicking the button loads the next image
document.getElementById("nextImage").onclick = loadNextImage;

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
	userReport.push(new imageData(img_number));
};

function createPin(event) {
	var pinSize = 7;
	var pin = new Path.Circle(event.point, pinSize);
	
	//console.log("pin radius: "+pin.radius);
	
	// set pin colors
	pin.strokeColor = 'black';
	pin.fillColor = 'blue';
	pin.name = "pin";
	pin.dragging = false;
	
	//console.log("pin is drawn");
	
	//group pin and text together
	var objectLabel = new Group();
	objectLabel.name = "objectLabel";
	objectLabel.addChild(pin);
	
	//start new objectData Object in this imageData's objects[] array
	//oh god why is everything named 'object
	userReport[img_number].objects.push(new objectData(event.point.x, event.point.y, objectLabel.id));
	console.log("new object #" + userReport[img_number].objects.slice(-1)[0].objectId + " at (" + userReport[img_number].objects.slice(-1)[0].x + "," + userReport[img_number].objects.slice(-1)[0].y + ")");
	objectLabel.objectIndex = userReport[img_number].objects.length - 1;
	//console.log("Setting objectLabel.objectIndex to " + objectLabel.objectIndex);
	
	//console.log("Creating text box now");
	zxcMakeTextBox(event, objectLabel);
	
	
	//console.log("group id: "+objectLabel.id);
	
	//define pin behavior on mouseOver
	pin.onMouseEnter = function(event) 
	{
		//bring pin to front in case of overlap
		objectLabel.bringToFront();
		
		//grow pin to emphasize which one is selected and hint that it can be dragged
		// this.scale(1.6);
		//console.log("hover");
		
		//display text
		if(objectLabel.children['text'])
		{
			objectLabel.children['text'].visible = true;
		}
	};
	pin.onMouseLeave = function(event) 
	{
		// this.scale(0.625);
		//console.log("unhover");
		
		if(objectLabel.children['text'])
		{
			objectLabel.children['text'].visible = false;
		}
	};
	
	pin.selected = false;
};

function makeTags(x, y, tagText){
	//console.log ("path " + event.item);
	//var fullname = prompt("Object name.", " ");
	//zxcMakeTextBox(event.point.x, event.point.y);
	
	var text = new PointText(x, y+25);
	text.content = tagText;
	text.style = {
    	fontFamily: 'Courier New',
    	fontWeight: 'bold',
    	fontSize: 18,
    	fillColor: 'blue',
    	justification: 'center'
	};
	text.visible = false;
	text.name = "text";
	
	return text;
};

function zxcMakeTextBox(event, group){
	
	console.log ("Text box created at (" + event.point.x + "," + event.point.y + ")");
	
	//set typing to TRUE to prevent user from creating new pins
	typing = true;
	
	
  	zxcTextBox = document.createElement('INPUT'); 
  	zxcTextBox.type='text'; // same as create  <input  type="text" > in html
  	
  	zxcTextBox.size=10;
  	
  	document.getElementsByTagName('BODY')[0].appendChild(zxcTextBox);
  	
  	// ****** 
  	// codes about styles/css
  	
  	zxcTextBox.style.position ='absolute';
  	zxcTextBox.style.left     = event.point.x+'px';
  	zxcTextBox.style.top      = event.point.y+'px';
  	zxcTextBox.style.fontSize = (12)+'px';      
  	
  	// ******
  	
  	// after created, if the mouse is on the textbox, textbox will be highlighted
  	zxcTextBox.focus(); 
  
    
    // press enter to finish typing
  	zxcTextBox.onkeydown = function(event){ 
  		//console.log ("before enter " + zxcTextBox.value);  		
  		if (event.keyCode == '13')
  		{
  			///console.log("ENTER HAS BEEN PRESSED");
  			userReport[img_number].objects.slice(-1)[0].name = zxcTextBox.value;
  			console.log("Object number " + userReport[img_number].objects.slice(-1)[0].objectId + " is named " + userReport[img_number].objects.slice(-1)[0].name);
  			
  			var x = event.point.x;
			var y = event.point.y;
  			group.addChild(makeTags(x, y, zxcTextBox.value));
  			
  			// console.log("textGroup id =  " + group.id);
  			//text = zxcTextBox.value;
  			//console.log("text: " + text);
  			this.style.visibility='hidden';
  			
  			//set typing back to FALSE to allow user to make pins again
  			typing = false; 
  		//	imageLayer.activate();
  		}
  	};
   //onblur --- mouse click to somewhere else that does not foucs on create obj (textbox)
   //zxcTextBox.onblur = function(){ this.style.visibility='hidden'; }
   
};