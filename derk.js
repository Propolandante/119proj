//derk.js

var img_number = 0;
var img_count = 10; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";



var raster;

var imageLayer = project.activeLayer;
var pinLayer = new Layer();

//load initial image in imageLayer
loadNextImage();

//switch to pinLayer for pin placement
pinLayer.activate();

// Create a new path once, when the script is executed:
var hitOptions, pin;

function onMouseDown(event) {
	pin = null;	
	var hitResult = project.hitTest(event.point, hitOptions);  
	
	//if hitResult is not a pin
	if (!hitResult || hitResult.item.name == "image"){ 
		var pinSize = 5;
		// var rectangle = new Rectangle(event.point.x-(pinSize/2),event.point.y-(pinSize/2),pinSize,pinSize);
		// var cornerSize = new Size(10, 10);
		var pin = new Path.Circle(event.point, pinSize);
		
		
		var obj = new Group();
		obj.addChild(pin);
		obj.addChild( makeTags(event,pin) );
		
		
		pin.strokeColor = 'black';
		pin.fillColor = 'blue';
		pin.onMouseEnter = function(event) {
			obj.bringToFront();
			this.scale(1.6);
			obj.children['text'].visible = true;
			};
		pin.onMouseLeave = function(event) {
			this.scale(0.625);
			obj.children['text'].visible = false;
			};
		
		pin.selected = false;
		
		// var obj = new Group();
		// obj.addChild(pin);
		// obj.addChild( makeTags(event,pin) );
	} 
}

function onMouseMove(event) {
	project.activeLayer.selected = false; // deselect all object
	
	if (event.item && event.item.name != "image"){	
		//event.item.selected = true;
		pin = event.item;
	}
	else{
		pin = null; // release the previous selected object
	}
}

function onMouseDrag(event) {
	if (pin) {
		pin.position += event.delta;
	}
}

function onKeyDown(event) {
	if (event.key == 'delete'){ // while delete key is pressed
		if(pin){
			pin.remove();
		}
	}
}


/////// HANDLE CLICKS /////////



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
	raster.position.x = view.center.x;
	raster.position.y = raster.height/2 + 10;
	
	//revert back to pin layer
	pinLayer.activate();
};

function makeTags(event){
	//console.log ("path " + event.item);
	var fullname = prompt("Object name.", " ");
	var text = new PointText(event.point.x,event.point.y+25);
	text.content = fullname;
	text.style = {
    	fontFamily: 'Courier New',
    	fontWeight: 'bold',
    	fontSize: 18,
    	fillColor: 'blue',
    	justification: 'center'
	};
	text.visible = false;
	text.name = "text";
	// text.addChild(event.item); 
	// event.item.addChile(text)  
	
	// var group = new Group(); // it seems that parenting only works for Group object
	// group.addChild(text);
	// console.log ("path child " + group.children[0]);
	
	return text;
};
