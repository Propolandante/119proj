/**
 * @author brittany
 */

var img = document.createElement("img");
img.src = "http://people.ucsc.edu/~bkwest/images/10.jpg";
img.id = "image";
//img.visible = false;
document.body.appendChild(img);



// Create a raster item using the image tag with id='mona'
var raster = new Raster('image');
//document.body.appendChild(raster);

img.remove();	

// Move the raster to the center of the view
raster.position = view.center;


// Scale the raster by 50%
//raster.scale(0.5);

// Rotate the raster by 45 degrees:
//aster.rotate(45);

function onMouseDown(event) {
	var input = document.createElement("input");
	input.type = "text";
	input.className = "input"; // set the CSS class
	document.body.appendChild(input); // put it into the DOM
}

