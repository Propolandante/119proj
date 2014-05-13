// Create a new path once, when the script is executed:
var hitOptions, path; 
// path       --- movable object
/* hitOptions --- can be a struct such as
				  hitOptions = {
					segments: true,
					stroke: true,
					fill: true,
					tolerance: 5
				};
//              used for checking whether path is hit
//*/


function onMouseDown(event) {
	path = null;	
	var hitResult = project.hitTest(event.point, hitOptions);  
	
	if (!hitResult){ // if no object gets hit, create one	
		var rectangle = new Rectangle(event.point.x-10,event.point.y-10,20,20);
		var cornerSize = new Size(20, 20);
		var path = new Path.RoundRectangle(rectangle, cornerSize);
		path.fillColor = 'black';
		path.selected = false;
	}
}

function onMouseMove(event) {
	project.activeLayer.selected = false; // deselect all object
	
	if (event.item){	
		event.item.selected = true;
		path = event.item;
	}
	else{
		path = null; // release the previous selected object
	}
}

function onMouseDrag(event) {
	if (path) {
		path.position += event.delta;
	}
}

function onKeyDown(event) {
	if (event.key == 'delete'){ // while delete key is pressed
		if(path){
			path.remove();
		}
	}
}