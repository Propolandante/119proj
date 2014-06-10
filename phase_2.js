//derk.js

// global variables
var img_number = 0; //there is no "image 0", this is incremented before loading each image
var img_count = 4; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/2_images/";
var raster; // image to be displayed
var imageLayer = project.activeLayer; // this layer holds the raster
var pinLayer = new Layer(); // all pins and text labels go in this label
var relationshipLayer = new Layer();
var tempArrowLayer = new Layer();
var typing = false; // true if text box is active (nothing else should happen until this is false again)
var userReport = [null]; // holds all of the user's imgData. userReport[0] will be empty
var userDefine = [];
var vector; // this is the vector the user draws with
var vectorStart;
var vectorItem; // dynamically drawn vector
var drawingRelFrom = null; // pin we're currently drawing a reltionship FROM'
var startPin = null;
var instr; // user instructions
var md; // mousedown
var dragging = false;
var permVec; // don't hide this vector until user is done labelling relationship 

var totalCounter = 0;
var helperCounter = 0;

var minRequired = 3;

displayText();

//load initial image in imageLayer
loadNextImage();



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
	if(!typing)
	{
		md = true;
	}
	
	
	
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
					
					
				}
			}
		}
		 if(closestPin) //if there is a pin, then we are now drawing a relationship from it
		 {
		 	// startPin = closestPin.children['pin'] ;
			// startPin.strokeColor = 'yellow';
			// startPin.strokeWidth = 3;
		 	
		 	drawingRelFrom = closestPin;
		 	
		 	drawingRelFrom.children['pin'].strokeColor = 'yellow';
		 	drawingRelFrom.children['pin'].strokeWidth = 3;
		 	
		 	//start drawing new vector
			vectorStart = drawingRelFrom.children['pin'].position;
			processVector(event.point);
		 	
		 	
		 	closestPin = null; // reset closestPin (might be unnecessary)
		 	sd = 10000; // reset the shortest distance (might be unnecessary)
		 }
		 else
		 {
		 	
		 	if(drawingRelFrom)
		 	{
		 		drawingRelFrom.children['pin'].strokeColor = 'black';
			 	drawingRelFrom.children['pin'].strokeWidth = 1;
			 	drawingRelFrom = null;
			}
		 	
		 	
		 	vectorStart = null;
		 	
		 	// startPin.strokeColor = 'yellow';
			// startPin.strokeWidth = 3;
		 	// console.log (" there is no pin under mouse's position ");
		 }
	}
	
}

function onMouseUp(event) {
	
	
	//mousedown = false
	md = false;
	dragging = false;
	
	
	updateInstructions(null);
	
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
	 	processVector(closestPin.children['pin'].position);
		
		createRelationship(drawingRelFrom, closestPin);
	 	
	 	closestPin = null; // reset closestPin (might be unnecessary)
	 	sd = 10000; // reset the shortest distance (might be unnecessary)
	 	
	 	drawingRelFrom.children['pin'].strokeColor = 'black';
	 	drawingRelFrom.children['pin'].strokeWidth = 1;
	 	drawingRelFrom = null;
	 	
	 }
	 else
	 {
	 	if(vectorItem)
	 	{
	 		vectorItem.remove();
	 	}
	 	
	 	if(drawingRelFrom)
	 	{
	 		drawingRelFrom.children['pin'].strokeColor = 'black';
		 	drawingRelFrom.children['pin'].strokeWidth = 1;
		 	drawingRelFrom = null;
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
		if(vectorStart)
		{
			processVector(event.point);
		}
		
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
		
		if(pins[i] != drawingRelFrom)
		{
			pins[i].children['pin'].strokeColor = 'black';
			pins[i].children['pin'].strokeWidth = 1;
		}
		
	}
	
	
	//initialize all relationship lines to transparent
	for(i=0;i<relationshipLayer.children.length;i++)
	{
		if(relationshipLayer.children[i] != permVec)
		{
			relationshipLayer.children[i].children['vec'].opacity = 0.45;
			relationshipLayer.children[i].children['text'].visible = false;
		}
		
		
	}
		
		for(i = 0; i < pins.length; i++)
		{
			//if we are hovering over this pin
			if (pins[i].children['pin'].contains(event.point))
			{
				// check to see if it is the closest pin (we don't want to highlight two pins at once)
				if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				{
					
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
		    	
		    	
		    	if(drawingRelFrom)
		    	{
		    		closestPin.children['pin'].strokeColor = 'yellow';
		    		closestPin.children['pin'].strokeWidth = 3;
		    	}
		    	
		    	
		    	//display any relationships coming from the pin's object
				for(i=0;i<relationshipLayer.children.length;i++)
				{
					var fromId = relationshipLayer.children[i].from.objectId;
					
					
					//if there's a match and we're not currently creating a relationship
					if(fromId == closestPin.objectId)
					{
						
						//increase opacity of highlighted vectors
						relationshipLayer.children[i].children['vec'].opacity = 1.0;
						relationshipLayer.children[i].children['text'].visible = true;
						
						//also show the text of the object that the relationship is TO
						
						relationshipLayer.children[i].to.children['text'].visible = true;
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
	relationshipLayer.removeChildren();
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
	
	//load pins from JSON data to display over image
	loadPins();
	
	//start new imageData Object in userReport array
	userReport.push(new imageRelationshipData(img_number));
	
	totalCounter = totalCounter + helperCounter ;
	
	
	$('#nextImage').attr('disabled', 'disabled');
	
	$('#nextImage').attr('value',  0 +" / " + minRequired + "\nYou must label \na minimum of "+ minRequired +" relationships\n" );
	
	relationshipLayer.activate();
	
};

function loadPins() {
	
	pinLayer.activate();
	
	console.log("Loading pins for image " + img_number);
	
	var pinSize = 7;
	
	//console.log("length: " + imageObjectData.images[img_number].objects.length);
	
	for (i = 0; i < imageObjectData.images[img_number].objects.length; i++)
	{
		//console.log(i);
		//if objects[i] is NULL, skip it!
		if(imageObjectData.images[img_number].objects[i] != null)
		{
			
			//console.log("Creating pin for " + i);
		
		
			// console.log("Creating pin for #" + imageObjectData.objects[i].objectId + ", " + imageObjectData.objects[i].name);
			
			var pin = new Path.Circle(new Point(imageObjectData.images[img_number].objects[i].x, imageObjectData.images[img_number].objects[i].y), pinSize);
			
			// set pin colors
			pin.strokeColor = 'black';
			pin.fillColor = getRandomColor();
			pin.name = "pin";
			
			//group pin and text together
			var objectLabel = new Group();
			objectLabel.name = "objectLabel";
			objectLabel.objectId = imageObjectData.images[img_number].objects[i].objectId;
			//console.log("this is object " + objectLabel.objectId);
			objectLabel.addChild(pin);
			// console.log("Creating pinText for " + imageObjectData.objects[i].name);
			objectLabel.addChild(makeObjectTags(imageObjectData.images[img_number].objects[i].x, imageObjectData.images[img_number].objects[i].y, imageObjectData.images[img_number].objects[i].name));
			
			pin.selected = false;
			
			// console.log("pins in layer = " + pinLayer.children.length);
			// console.log("text in objectLabel = " + objectLabel.children['text'].content);
			
			for(a = 0; a < pinLayer.children.length; a++)
			{
				if (objectLabel.children['text'].content == pinLayer.children[i].children['text'].content)
				{
					pin.fillColor = pinLayer.children[i].children['pin'].fillColor;
				}
			}
		}
		else
		{
			//console.log("null object at " + i);
		}
		
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

function processVector(point) {
	vector = point - vectorStart;
	drawVector();
}

function drawVector() {
	
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
	var arrowVector = vector.normalize(15);
	var end = vectorStart + vector;
	relArrow = new Group([
		new Path([vectorStart, end]),
		new Path([
			end + arrowVector.rotate(135),
			end,
			end + arrowVector.rotate(-135)
		])
	]);
	
	
	relArrow.name = 'vec';
	relArrow.strokeWidth = 2;
	relArrow.strokeColor = '#ffff00';
	relArrow.visible = true;
	relArrow.opacity = .45;
	
	
	//add new subgroup to main group	
	relLabel.addChild(relArrow);
	relLabel.from = g_from;
	relLabel.to = g_to;
	//relLabel.visible = false;
	
	permVec = relLabel;
	
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
  		if (event.keyCode == '13' || event.keyCode == '27')
  		{
  			textBoxClosed = true;
  			// console.log("ENTER HAS BEEN PRESSED");
  			if (event.keyCode == '13') {
  			var input = zxcTextBox.value;
  			}
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
  			
  			if(permVec)
  			{
  				permVec.children['vec'].opacity = 1.0;
  				permVec = null;
  			}
  			
  			if (relationshipLayer.children.length)
				helperCounter = relationshipLayer.children.length;
			
			checkMinimum();
  			
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


function checkMinimum() {
	
	var temp = helperCounter + totalCounter;

	if(relationshipLayer.children.length < minRequired) {
		$('#nextImage').attr('disabled', 'disabled');
		//$('#nextImage').attr('value', "you must label a minimum of five objecets\n" + pinLayer.children.length  +"/ " + minRequired);
		$('#nextImage').attr('value',  relationshipLayer.children.length  +" / " + minRequired + "\nYou must label \na minimum of "+minRequired +" relationships\n" );
		$('#counterText').attr('value', "You have labelled " + temp + " Relationship(s)!");
		console.log("num pins: " + relationshipLayer.children.length + " < " + "minReq: " + minRequired );
		console.log("button is disabled");
	} else {
		$('#nextImage').removeAttr('disabled');
		$('#nextImage').attr('value', 'Continue/Next');
		$('#counterText').attr('value', "You have labelled " + temp + " Relationship(s)!");
		//$('#nextImage').value ( "YES I DO!");
		
		console.log("num pins: " + relationshipLayer.children.length + " > " + "minReq: " + minRequired );
		console.log("button is enabled");
	}
};

function updateInstructions(event){
	//console.log("drawrelfrom "+drawingRelFrom);
	if(typing) instr.content = "Enter a name for this relationship.";
	else if(dragging) instr.content = "Drag this object to another object define a relationship.";
	else instr.content = "Click and drag an arrow from one object to another to label a relationship. This demonstration only has one example image.\nData collected from Phase I will be used as object data in Phase II.";
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// random jquery stuff for the tutorial
$('.expand-one').click(function(){
    $('.content-one').slideToggle('slow');
});
