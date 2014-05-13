//derk.js

var img_number = 0;
var img_count = 10; // total number of images in directory
var img_directory = "http://people.ucsc.edu/~djdonahu/119proj/images/";


var raster;

loadNextImage();

// press enter to go to next image
// function onKeyDown(event) {
	// if (event.key == "enter")
	// {
		// loadNextImage();
	// }
// 	
// }

//clicking the button loads the next image
document.getElementById("nextImage").onclick = loadNextImage;



function loadNextImage() {
	
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
	
	// get rid of JavaScript image
	img.remove();
	
	//position the raster
	raster.position.x = view.center.x;
	raster.position.y = raster.height/2 + 10;
};
