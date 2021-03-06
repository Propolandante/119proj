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
var userDefine = [];


//load initial image in imageLayer
loadNextImage();

displayText();

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
		//console.log("pins: " + pins.length);
		
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
		 	
		 	//If holding SHIFT, delete this pin
		 	if (event.modifiers.shift)
			{
				//nullify JSON data for this pin
				//NOTE: we can not delete this JSON data since it is in the middle of the array,
				//and deleting it would mess up all of the objectIndex values. Instead it will be 
				//set to null and skipped later on.
				userReport[img_number].objects[draggingPin.objectIndex] = null;
				
				//remove the pin entirely
				draggingPin.remove();
				draggingPin = null;
			}
		 	
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
	
	var inBounds = false;
	
	//check to make sure mouse is within the image boundaries	
	
	if(raster.contains(event.point))
	{
		inBounds = true;
	}
	
	
	//if I was dragging a pin before, that pin is no longer DRAGGING
	if(draggingPin && inBounds)
	{
		//update JSON coordinate info for dragged pin
		
		userReport[img_number].objects[draggingPin.objectIndex].x = event.point.x;
		userReport[img_number].objects[draggingPin.objectIndex].y = event.point.y;
		
		//console.log the new position
		// console.log("Updated pin " + draggingPin.id + " to new position (" 
		// + userReport[img_number].objects[draggingPin.objectIndex].x + "," 
		// + userReport[img_number].objects[draggingPin.objectIndex].y + ")");
		
		//this pin is no longer being dragged
		draggingPin.dragging = false;
		//we are no longer dragging a pin
		draggingPin = null;
	}
	else if (draggingPin && !inBounds)
	{
		// console.log("Since it was dragged off the image, we are deleting everything about pin " + draggingPin.id);
		
		//nullify JSON data for this pin
		//NOTE: we can not delete this JSON data since it is in the middle of the array,
		//and deleting it would mess up all of the objectIndex values. Instead it will be 
		//set to null and skipped later on.
		userReport[img_number].objects[draggingPin.objectIndex] = null;
		
		//remove the pin entirely
		draggingPin.remove();
		
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

function displayText() {
	
	imageLayer.activate();
	
	var title = new PointText(new Point(450, 40));
	title.content = "Phase I - Label All Objects";
	
	title.style = {
    	fontFamily: 'Helvetica',
    	fontWeight: 'bold',
    	fontSize: 40,
    	fillColor: 'blue',
    	justification: 'center'
	};
	
	var instr = new PointText(new Point(450, 670));
	instr.content = "Click on an object to label it. Click and drag labels to move them around.\nTo delete a label, drag it off of the image. When you're finished, click the Next Image button to proceed.";
	
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
	
	var textBox = document.getElementById('tags');
	if ( textBox )
	{
		typing = false;
		textBox.parentElement.removeChild(textBox);
	}
		
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
		if( objectLabel.children['text'] )
		{
			objectLabel.children['text'].visible = true;
		    objectLabel.children['rect'].visible = true;
			
		}
	};
	pin.onMouseLeave = function(event) 
	{
		// this.scale(0.625);
		//console.log("unhover");
	
  		
		if(objectLabel.children['text'])
		{
			objectLabel.children['text'].visible = false;
			objectLabel.children['rect'].visible = false;
		
		}
	};
	
	pin.selected = false;
	
};

function makeTags(x, y, tagText){
	//console.log ("path " + event.item);
	//var fullname = prompt("Object name.", " ");
	//zxcMakeTextBox(event.point.x, event.point.y);
	

	var text = new PointText(x, y + 25);
	text.content = tagText;
	text.data.home = tagText;
	

	if (sources.indexOf(tagText) == -1 && userDefine.indexOf(tagText) == -1)
	{
		userDefine.push(tagText);
	}

	text.style = {
    	fontFamily: 'Courier New',
    	fontWeight: 'bold',
    	fontSize: 22,
    	fillColor: 'blue',
    	justification: 'center',
    	/// ---- add strok letting the string stands up
    	//strokeColor: 'red',
    	//strokeWidth: 1,
	};
	//text.visible = false; /// ---- so that the text will show up right after enter key is pressed
	text.name = "text";
	
	return text;
};

function zxcMakeTextBox(event, group){
	
	// console.log ("Text box created at (" + event.point.x + "," + event.point.y + ")");
	
	//set typing to TRUE to prevent user from creating new pins
	typing = true;
	
	var x = event.point.x;
	var y = event.point.y;
	
	//var popUp = false;
	var textBoxClosed = false;
  	
    var zxcTextBox = document.createElement('INPUT'); // "input" works also
    zxcMakeTextBox.value = null;
	$(zxcTextBox).attr({
    	'type': 'text',
    	'id': "tags",
    	'class': 'text-field valid',   //--- can use another style that was set up in .css file
   		'placeholder':"what's the object?", //--- ghost string 
	});
  	
  	var combine = sources.concat(userDefine);
 
	
  	// zxcTextBox = document.createElement('INPUT'); 
  	// zxcTextBox.type='text'; // same as create  <input  type="text" > in html
  	
  	// zxcTextBox.size=10;
  	
  	document.getElementsByTagName('BODY')[0].appendChild(zxcTextBox);
  	
  	// ---- about autocomplete
  	// calls .map after the source: function
	// this statement : acItem.toUpperCase().indexOf(request.term.toUpperCase()
	// returns one match string if what user typed matches from the given source-string (combine)
	// then calls .map again, search for the next string
	// after all matching strings are found (go through combined array), calls response function
	// to finish autocomplete.
  
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
  	zxcTextBox.style.left     = event.point.x+'px';
  	zxcTextBox.style.top      = event.point.y+'px';
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
  				userReport[img_number].objects.pop();
  				// console.log("JSON data (hopefully) deleted.");
  				
  				//as well as the pin and objectLabel group!
  				group.remove();
  				// console.log("objectLabel group and children (hopefully) removed.");
  				
  				
  				$('#tags').autocomplete("close");
  			
	  			this.parentElement.removeChild(this);
	  			
	  			//set typing back to FALSE to allow user to make pins again
	  			typing = false; 
  			}
  			
  			
  			userReport[img_number].objects.slice(-1)[0].name = zxcTextBox.value;
  			console.log("Object number " + userReport[img_number].objects.slice(-1)[0].objectId + " is named " + userReport[img_number].objects.slice(-1)[0].name);
  			
  			group.addChild(makeTags(x, y, zxcTextBox.value));
  			
		  	var from = new Point(group.children['pin'].position.x-group.children['text'].data.home.length*8, 
		  	                     group.children['pin'].position.y+8);
			var to   = new Point(group.children['pin'].position.x+group.children['text'].data.home.length*8, 
			                   group.children['pin'].position.y+30);
			var rect = new Path.Rectangle(from, to);
		//	var path = new Path.Rectangle(rect);
			rect.fillColor = 'red';
			rect.blendMode = 'luminosity';
			rect.name = 'rect';
			
			group.addChild(rect);
		
  		
  			// console.log("textGroup id =  " + group.id);
  			//text = zxcTextBox.value;
  			//console.log("text: " + text);
  			//this.style.visibility='hidden';
  			
  			$('#tags').autocomplete("close");
  			
  			this.parentElement.removeChild(this);
  			
  			
  			//set typing back to FALSE to allow user to make pins again
  			typing = false; 
  		//	imageLayer.activate();
  		}
  		
  			console.log ( "---" + group.children['pin'].position.x + "   " + group.children['pin'].position.y);
  		//	if (objectLabel.children['text'])
  			
  	};
  	
  	
   //onblur --- mouse click to somewhere else that does not foucs on create obj (textbox)
   //zxcTextBox.onblur = function(){ this.style.visibility='hidden'; }
   
};