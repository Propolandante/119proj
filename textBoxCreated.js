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



//// -------------------------------------
// source -- http://www.webdeveloper.com/forum/showthread.php?73586-text-box-follows-mouse-click

// zxc -- A metasyntactic variable is a placeholder name used in computer science, 
//        a word without meaning intended to be substituted 
//        by some objects pertaining to the context where it is used
// definition from web

///----------------------------------------

var mousePosX,mousePosY;
var text;

function zxcMakeTextBox(x,y){
	
	console.log (" x --" + x + "*** y ***" + y);
	mousePosX = x; 
	mousePosY = y;
	
  	zxcTextBox = document.createElement('INPUT'); 
  	zxcTextBox.type='text'; // same as create  <input  type="text" > in html
  	
  	zxcTextBox.size=10;
  	
  	document.getElementsByTagName('BODY')[0].appendChild(zxcTextBox);
  	
  	// ****** 
  	// codes about styles/css
  	
  	zxcTextBox.style.position ='absolute';
  	zxcTextBox.style.left     = mousePosX+'px';
  	zxcTextBox.style.top      = mousePosY+'px';
  	zxcTextBox.style.fontSize = (12)+'px';      
  	
  	// ******
  	
  	// after created, if the mouse is on the textbox, textbox will be highlighted
  	zxcTextBox.focus(); 
  
    
    // press enter to finish typing
  	zxcTextBox.onkeydown = function(event){ 
  		console.log ("before enter " + zxcTextBox.value);
  		if (event.keyCode == '13') { // '13' is enter key
  			text = zxcTextBox.value;
  			this.style.visibility='hidden'; 
  		//	imageLayer.activate();
  		}
  	};
   //onblur --- mouse click to somewhere else that does not foucs on create obj (textbox)
   //zxcTextBox.onblur = function(){ this.style.visibility='hidden'; }
   
}

function onMouseDown(event) {
	
	console.log ("event is " + event);
	zxcMakeTextBox(event.point.x, event.point.y);
	/*
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
	//	obj.addChild( zxcMakeTextBox(event));
		
		
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
	//*/
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
	
	var fullname = text;
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



