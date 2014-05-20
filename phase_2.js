//derk.js

// global variables
var img_number = 4; //there is no "image 0", this is incremented before loading each image
var img_count = 5; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";
//var draggingPin = null; // pin being dragged
var raster; // image to be displayed
var imageLayer = project.activeLayer; // this layer holds the raster
var pinLayer = new Layer(); // all pins and text labels go in this label
var relationshipLayer = new Layer();
//var typing = false; // true if text box is active (nothing else should happen until this is false again)
var userReport = [null]; // holds all of the user's imgData. userReport[0] will be empty
var userDefine = [];

//load initial image in imageLayer
loadNextImage();

//load pins from JSON data to display over image
loadPins();

function imageRelationshipData(id)
{
	this.imageId = id;
	this.relationships = [];
}

function relationship(to, from, rel)
{
	this.to = to.objectId;
	this.from = from.objectId;
	this.text = rel;
}


/////// HANDLE CLICKS /////////

function onMouseDown(event) {
	
	
}

function onMouseUp(event) {
	
	
};

function onMouseMove(event) {
	
	
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
		objectLabel.addChild(pin);
		// console.log("Creating pinText for " + imageObjectData.objects[i].name);
		objectLabel.addChild(makeTags(imageObjectData.objects[i].x, imageObjectData.objects[i].y, imageObjectData.objects[i].name));
		
		//define pin behavior on mouseOver
		pin.onMouseEnter = function(event) 
		{
			//bring pin to front in case of overlap
			this.parent.bringToFront();
			
			//grow pin to emphasize which one is selected and hint that it can be dragged
			// this.scale(1.6);
			//console.log("hover");
			
			//display text
			if(this.parent.children['text'])
			{
				this.parent.children['text'].visible = true;
			}
		};
		pin.onMouseLeave = function(event) 
		{
			// this.scale(0.625);
			//console.log("unhover");
			
			if(this.parent.children['text'])
			{
				this.parent.children['text'].visible = false;
			}
		};
		
		pin.selected = false;
		
		// console.log("pins in layer = " + pinLayer.children.length);
		// console.log("text in objectLabel = " + objectLabel.children['text'].content);
		
	}
	
	
	
	
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
	
	console.log("text reads " + text.content);
	
	return text;
};