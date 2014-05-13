//derk.js

var img = document.createElement("img");
img.src = "1.jpg";
img.id = "current_image";
document.body.appendChild(img);


// Create a raster item using the image tag with id='mona'
var raster = new Raster('current_image');

// Move the raster to the center of the view
raster.position = view.center;