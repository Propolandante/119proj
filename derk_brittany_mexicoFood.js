//derk.js


var img_number = 0;
var img_count = 10; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";

var raster; // image to be displayed


var imageLayer = project.activeLayer;
var pinLayer = new Layer(); // all pins and text labels go in this label

var userDefine = [];
//load initial image in imageLayer
loadNextImage();

//switch to pinLayer for pin placement
pinLayer.activate();

var draggingPin = null;

/////// HANDLE CLICKS /////////

var mousePosX,mousePosY;
var enteredText;

var typing = false;

function onMouseDown(event) {
	
	console.log("onMouseDown");
	
	var inBounds = false;
	
	//check to make sure click is within the image boundaries	
	
	if(raster.contains(event.point))
	{
		inBounds = true;
	}
	
	//check to see if the click is on a pin
		
	var pins = pinLayer.children;
	console.log("pins: " + pins.length);
	
	var sd = 100000; // shortest distance
	var closestPin = null;
	
	if(inBounds && !typing)
	{
		for(i = 0; i < pins.length; i++)
		{
			if (pins[i].children['pin'].contains(event.point))
			{
				console.log("pins["+i+"]("+pins[i].id+") CLICKED");
				if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				{
					// if it is on multiple pins, choose the closest one
					
					sd = event.point.getDistance(pins[i].children['pin'].position);
					console.log("sd = " + sd);
					closestPin = pins[i];
					console.log("closestPin = pins[" + i + "]");
				}
			}
			else
			{
				console.log("pins["+i+"]("+pins[i].id+") NOT");
			}
		}
		 if(closestPin) //if there is a pin, then this pin is now DRAGGING
		 {
		 	draggingPin = closestPin;
		 	draggingPin.dragging = true;
		 	
		 	if (event.modifiers.shift)
			{
				console.log ("****disable other console please****");
				draggingPin.remove();
			}
		 	// console.log("id check: " + draggingPin.id + " vs " + closestPin.id);
		 	console.log("draggingPin selected, object ID is " + draggingPin.id);
		 	
		 	closestPin = null; // reset closestPin (might be unnecessary)
		 	sd = 10000; // reset the shortest distance (might be unnecessary)
		 }
		 else if(inBounds)//if there is no pin, create a pin
		 {
		 	console.log("Creating a pin");
		 	createPin(event);
		 }
	
	
	}
	
	
		
}

function onMouseUp(event) {
	
	//if I was dragging a pin before, that pin is no longer DRAGGING
	if(draggingPin)
	{
		draggingPin.dragging = false;
	}
	draggingPin = null;
	//console.log("No draggingPin");
	
};

function onMouseMove(event) {
	
	//if I am DRAGGING a pin, move the pin's position to the position of the mouse
	if(draggingPin)
	{
		
		//console.log("We have a draggingPin");
		if(draggingPin.dragging)
		{
			draggingPin.position += event.delta;
		}
		else
		{
			console.log("Uh, oh, draggingPin isn't dragging!");
		}
	}
	
		
	
}

 function onKeyDown(event) {
 	
	// if (event.key == 'delete'){ // while delete key is pressed
// 		
		// var pins = pinLayer.children;
		// var sd = 100000; // shortest distance
		// var closestPin = null;
// 		
		// console.log("event.point: "+ event.lastPoint);
// 		
		// //check to see if hovering over a pin
		// for(i = 0; i < pins.length; i++)
		// {
			// if (pins[i].children['pin'].contains(event.point))
			// {
				// console.log("pins["+i+"]("+pins[i].id+") CLICKED");
				// if (event.point.getDistance(pins[i].children['pin'].position) < sd)
				// {
					// // if it is on multiple pins, choose the closest one
// 					
					// sd = event.point.getDistance(pins[i].children['pin'].position);
					// console.log("sd = " + sd);
					// closestPin = pins[i];
					// console.log("closestPin = pins[" + i + "]");
				// }
			// }
			// else
			// {
				// console.log("pins["+i+"]("+pins[i].id+") NOT");
			// }
		// }
	// }
}


//clicking the button loads the next image
document.getElementById("nextImage").onclick = loadNextImage;


function loadNextImage() {
	
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
		img_number = 1;
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
	///raster.position.x = view.center.x;
	//raster.position.y = view.center.y;
	//raster.position.y = raster.height/2 + 10;
	raster.position = new Point(450,350);
	
	//lower image opacity for better text visibility
	raster.opacity = 0.85;
	
	//revert back to pin layer
	pinLayer.activate();
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
	
	console.log("pin is drawn");
	
	//group pin and text together
	var objectLabel = new Group();
	objectLabel.name = "objectLabel";
	objectLabel.addChild(pin);
	//objectLabel.addChild( makeTags(event,pin) );
	console.log("Creating text box now");
	zxcMakeTextBox(event, objectLabel);
	
	
	console.log("group id: "+objectLabel.id);
	
	//define pin behavior on mouseOver
	pin.onMouseEnter = function(event) 
	{
		console.log ("tell em" + event);
		
		
		//bring pin to front in case of overlap
		objectLabel.bringToFront();
		
		//grow pin to emphasize which one is selected and hint that it can be dragged
		// this.scale(1.6);
		console.log("hover");
		
		//if (event.key == 'delete')
		
		//display text
		if(objectLabel.children['text'])
		{
			objectLabel.children['text'].visible = true;
			
			//console.log ( "loooooookkkkk " + objectLabel.children['text'].visible);
		}
	};
	pin.onMouseLeave = function(event) 
	{
		// this.scale(0.625);
		console.log("unhover");
		
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
	
	if (sources.indexOf(tagText) == -1 && userDefine.indexOf(tagText) == -1)
	{
		userDefine.push(tagText);
	}

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
	//raster.opacity = typingOpacity;
	
	typing = true;
	var x = event.point.x;
	var y = event.point.y;
	var popUp = false;
  	
    var zxcTextBox = document.createElement('INPUT'); // "input" works also
   
	$(zxcTextBox).attr({
    	'type': 'text',
    	'id': "tags",
    	'class': 'text-field valid',        //--- can use another style that was set up in .css file
   		'placeholder':"what's the object?", //--- ghost string 
	});
	
	//zxcMakeTextBox.type = "text";
	//zxcMakeTextBox.id = "tags";
	//zxcMakeTextBox.class = "text-field valid";
	//zxcMakeTextBox.type = "text";
	
  	
  	var combine = sources.concat(userDefine);
 
  	document.getElementsByTagName('BODY')[0].appendChild(zxcTextBox);  
  
	var t = $('#tags').autocomplete({ 
		
  		source: function( request, response ) {
  			popUp = true;
    		var matches = $.map( combine, function(acItem) {
      		if ( acItem.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) 
      		{	
        		return acItem;
       		}
    		});
    	response(matches);
  		}
	});
	
	//console.log ("what do you have: " + t.left);
	
  	//***** 
  	// codes about styles/css
  	zxcTextBox.style.position ='absolute';
  	zxcTextBox.style.left     = event.point.x+'px';
  	zxcTextBox.style.top      = event.point.y+'px';
  
  	// ****** */
  	
  	// after created, if the mouse is on the textbox, textbox will be highlighted
  	zxcTextBox.focus(); 
  
    
    // press enter to finish typing
  	zxcTextBox.onkeydown = function(event){ 
  		console.log ("before enter " + zxcTextBox.value);
  		
  		if (event.keyCode == '13' )
  		{
  			var input = zxcTextBox.value;
  			if ( !input || !popUp)
  				return;
  				
  			popUp = false;
  			console.log("ENTER HAS BEEN PRESSED");
  			group.addChild(makeTags(x, y, zxcTextBox.value));
  			console.log("textGroup id =  " + group.id);
  			//text = zxcTextBox.value;
  			//console.log("text: " + text);
  			//this.style.visibility='hidden';
  			$('#tags').autocomplete("close");
  			
  			//$( ".selector" ).autocomplete( "close" );
  			console.log("?");
  			this.parentElement.removeChild(this); // without removing child, the autocomplete thing will only work at the first time
  			typing = false; 
  		}
  	};
   //onblur --- mouse click to somewhere else that does not foucs on create obj (textbox)
   //zxcTextBox.onblur = function(){ this.style.visibility='hidden'; }
   
}
