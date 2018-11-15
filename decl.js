'use strict'

let cur_posX = 0;
let cur_posY = 0;
let cur_color = "#555555";

let px_size = 7;

// flag variable to indicate whether a polygon is being created or new one should be started
let startNewPoly = true;
// array holding the polygon's vertices, every row is a polygon
let polygonBuffer = [];
// array holding the info abt whether an vertex has been selected for morphing or not
let startVertexSelectedForMorphing;
let endVertexSelectedForMorphing;
// flag variable to have a count of the no of unique vertices available for morphing
let uniqueStartVerticesAvailableForSelection;
let uniqueEndVerticesAvailableForSelection;

// vertex selecion has started to establish morphing relationship
let vertexSelectionStarted = false;
// array holding the start and end vertices of every relaitionship
let startVertex = [];
let endVertex = [];

let morphingAnimation = false;

// array holding the step distance required per iteration for every relationship
let translationStep = [];
// var to hold the maximum steps required for any relationship
let maxTranslationStepsReqd;

let warnAboutDuplicateVertex = true;

// this flag is set to ture once the 'space bar' is pressed after the polygons are decided
let startEstablishingMorphingRelationship = false;

let previewColor = "#333333";

let startVertexColor = "blue";
let endVertexColor = "red";

let draw_color = "green";
let draw_mode = "set"; // set, preview, revert

// simulating monitor pixels for with current pixel size
let px_color = [];
for (var x = 0; x < canvas.width/px_size; x++) {
	var col = [];
	for (var y = 0; y < canvas.height/px_size; y++) {
		col.push("black");
	}
	px_color.push(col);
}

function paintPixel(x,y,color) {
	if (draw_mode == "revert") {
		color = px_color[x][y];
	}

	context.fillStyle = color;
	context.fillRect(x*px_size, y*px_size, px_size, px_size);
	
	if (draw_mode == "set") {
		px_color[x][y] = color;
	}
}

function line_DDA(x1,y1,x2,y2,color) {
	x1 = Math.floor(x1+0.5);
	y1 = Math.floor(y1+0.5);
	x2 = Math.floor(x2+0.5);
	y2 = Math.floor(y2+0.5);
	let dx = x2-x1, dy = y2-y1;
	let total_steps = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy) ;
	let stepX = dx/total_steps, stepY = dy/total_steps;
	let x = x1, y = y1;

	// rounding of nearest integer
	paintPixel(Math.floor(x+0.5),Math.floor(y+0.5),color);

	for (var i = 0; i < total_steps; i++) {
		x += stepX;
		y += stepY;
		paintPixel(Math.floor(x+0.5),Math.floor(y+0.5),color);		
	}
}

function clearScreen() {
	context.clearRect(0,0,canvas.width,canvas.height);
}

function drawPoly(vertexBuffer,color) {
	for (var j = 0; j < vertexBuffer.length-1; j++) {
		line_DDA((vertexBuffer[j].x), (vertexBuffer[j].y), (vertexBuffer[j+1].x), (vertexBuffer[j+1].y), color);
	}
	line_DDA((vertexBuffer[0].x), (vertexBuffer[0].y), (vertexBuffer[vertexBuffer.length-1].x), (vertexBuffer[vertexBuffer.length-1].y), color);
}

function clearPoly(vertexBuffer) {
	drawPoly(vertexBuffer,"black");
}

function dispCursorPos() {
	context.clearRect(0,0,40,20);
	context.fillStyle = "#ffffff";
	context.font = "10px Arial";
	context.fillText("X : "+cur_posX,5,10);
	context.fillText("Y : "+cur_posY,5,20);
}