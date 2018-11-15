'use strict'

function updateCursor(event) {
	// revert previous cursor pixel
	draw_mode = "revert";
	paintPixel(cur_posX,cur_posY,"doesn't matter");
	// revert the previewed line	
	if (startEstablishingMorphingRelationship && vertexSelectionStarted) {
		// morphing line preview
		line_DDA(startVertex[startVertex.length-1].x, startVertex[startVertex.length-1].y, cur_posX, cur_posY,"doesn't matter");
	} else if (startNewPoly == false) {
		// edge preview
		let vertexBuffer = polygonBuffer[polygonBuffer.length-1];
		line_DDA(vertexBuffer[vertexBuffer.length-1].x, vertexBuffer[vertexBuffer.length-1].y, cur_posX, cur_posY,"doesn't matter");
	}
	// update cursor position
	cur_posX = Math.floor(event.offsetX/px_size);
	cur_posY = Math.floor(event.offsetY/px_size);
	// preview line
	draw_mode = "preview";
	if (startEstablishingMorphingRelationship && vertexSelectionStarted) {
		// morphing line preview
		line_DDA(startVertex[startVertex.length-1].x, startVertex[startVertex.length-1].y, cur_posX, cur_posY,previewColor);
	} else if (startNewPoly == false) {
		// edge preview
		let vertexBuffer = polygonBuffer[polygonBuffer.length-1];
		line_DDA(vertexBuffer[vertexBuffer.length-1].x, vertexBuffer[vertexBuffer.length-1].y, cur_posX, cur_posY, previewColor);
	}
	// paint cursor
	paintPixel(cur_posX,cur_posY,cur_color,cur_color);
}

function registerVertex(event) {
	if (startEstablishingMorphingRelationship == false) {
		// still in the process of polygon creation
		let vertexDuplicate = false;
		// checkign for vertex duplicaition
		if (polygonBuffer.length > 0) {
			let vertexBuffer = polygonBuffer[polygonBuffer.length-1];
			for (let i = vertexBuffer.length-1; i >= 0; i--) {
				if(cur_posX == vertexBuffer[i].x && cur_posY == vertexBuffer[i].y) {
					vertexDuplicate = true;
					break
				}
			}
		}
		if (!vertexDuplicate) {
			// no more than 2 polygons
			if (!(polygonBuffer.length == 2 &&  startNewPoly == true)) {
				// polygon creation process
				if (startNewPoly && polygonBuffer.length < 2) {
					// new polygon
					startNewPoly = false;
					let vertexBuffer = [];
					vertexBuffer.push({x : cur_posX , y : cur_posY});
					polygonBuffer.push(vertexBuffer);
				} else if (startNewPoly == false && polygonBuffer.length <= 2) {
					// continue polygon creation
					let vertexBuffer = polygonBuffer[polygonBuffer.length-1];
					// draw the edge
					draw_mode = "set";
					line_DDA(vertexBuffer[vertexBuffer.length-1].x, vertexBuffer[vertexBuffer.length-1].y, cur_posX, cur_posY,draw_color);
					vertexBuffer.push({x : cur_posX , y : cur_posY});
				}
			} else {
				alert("!! Only 2 polygons !!\n> Press 'space bar' to start establishing morphing relationship");
			}
		} else {
			alert("Duplicaite Vertex");
		}
	} else if (startEstablishingMorphingRelationship != "over") {
		// polygon creation is over and establishment of morphing relationship b/w vertices can be started
		if (vertexSelectionStarted == false) {
			// start vertex selected
			for (var i = 0; i < polygonBuffer[0].length; i++) {
				if (cur_posX == polygonBuffer[0][i].x && cur_posY == polygonBuffer[0][i].y && startVertexSelectedForMorphing[i] == false) {
					vertexSelectionStarted = true;
					// copying a reference of the vertex object form polygon buffer to start vertex buffer
					startVertex[startVertex.length] = polygonBuffer[0][i];
					startVertexSelectedForMorphing[i] = true;
					uniqueStartVerticesAvailableForSelection--;
					break;
				}
			}
			// when no.of end vertices > no.of start vertices, then multiple end vertices can be related to a single start vertex
			if (vertexSelectionStarted == false && uniqueStartVerticesAvailableForSelection == 0 && uniqueEndVerticesAvailableForSelection > 0) {
				if (warnAboutDuplicateVertex) {
					alert("> duplicate of ith vertex is generated between ith and (i-1)th vertex\n> new duplicates are more closer to (i-1)th vertex i.e as the duplicates of same vertex (ith) increases, the newely created duplicates are closer to (i-1)th vertex");
					warnAboutDuplicateVertex = false;
				}
				for (let i = 0; i < polygonBuffer[0].length; i++) {
					if (cur_posX == polygonBuffer[0][i].x && cur_posY == polygonBuffer[0][i].y) {
						// ith vertex is gonna be mapped to another end vertex
						// creating a new vertex with contents of ith vertex
						startVertex.push({ x : polygonBuffer[0][i].x, y : polygonBuffer[0][i].y, duplicate : true});
						// now im inserting this new vertex into polygon buffer before it's parent vertex
						polygonBuffer[0].splice(i,0,startVertex[startVertex.length-1]);
						// this new vertex already comes with a morphing relationship
						startVertexSelectedForMorphing.splice(i,0,true);	
						draw_mode = "set";		
						line_DDA(startVertex[startVertex.length-1].x, startVertex[startVertex.length-1].y, cur_posX, cur_posY, previewColor);
						vertexSelectionStarted = true;
						break;
					}
				}
			}
		} else {
			for (var i = 0; i < polygonBuffer[1].length; i++) {
				if (cur_posX == polygonBuffer[1][i].x && cur_posY == polygonBuffer[1][i].y && endVertexSelectedForMorphing[i] == false) {
					// copying a reference of the vertex object form polygon buffer to end vertex buffer
					endVertex[endVertex.length] = polygonBuffer[1][i];
					endVertexSelectedForMorphing[i] = true;
					uniqueEndVerticesAvailableForSelection--;
					// drawing the relationship line
					draw_mode = "set";		
					line_DDA(startVertex[startVertex.length-1].x, startVertex[startVertex.length-1].y, cur_posX, cur_posY, previewColor);
					// coloring the vertices to make them visible even when a relationship line runs over
					for (let vertexBuffer = startVertex, i = vertexBuffer.length-1; i >= 0; i--) {
						paintPixel(vertexBuffer[i].x, vertexBuffer[i].y, startVertexColor);
					}
					for (let vertexBuffer = endVertex, i = vertexBuffer.length-1; i >= 0; i--) {
						paintPixel(vertexBuffer[i].x, vertexBuffer[i].y, endVertexColor);
					}
					vertexSelectionStarted = false;
					break;
				}
			}
			// when no.of end vertices < no.of start vertices, then multiple start vertices can be related to a single end vertex
			if (uniqueEndVerticesAvailableForSelection == 0 && startVertex.length != endVertex.length) {
				for (let vertexBuffer = endVertex, i = 0; i < vertexBuffer.length; i++) {
					if (cur_posX == vertexBuffer[i].x && cur_posY == vertexBuffer[i].y) {
						// copying a reference of the vertex object form end vertex buffer to end vertex buffer
						// this vertex in end vertex buffer is already a reference to the one in polygon vertex
						endVertex[endVertex.length] = endVertex[i];		
						// drawing the relationship line
						draw_mode = "set";		
						line_DDA(startVertex[startVertex.length-1].x, startVertex[startVertex.length-1].y, cur_posX, cur_posY, previewColor);
						// coloring the vertices to make them visible even when a relationship line runs over		
						for (let anotherVertexBuffer = startVertex, i = anotherVertexBuffer.length-1; i >= 0; i--) {
							paintPixel(anotherVertexBuffer[i].x, anotherVertexBuffer[i].y, startVertexColor);
						}
						for (let anotherVertexBuffer = endVertex, i = anotherVertexBuffer.length-1; i >= 0; i--) {
							paintPixel(anotherVertexBuffer[i].x, anotherVertexBuffer[i].y, endVertexColor);
						}
						vertexSelectionStarted = false;
						break;
					}
				}
			}
		}
		if (uniqueStartVerticesAvailableForSelection == 0 && uniqueEndVerticesAvailableForSelection == 0 && startVertex.length == endVertex.length) {
			// relationship establishment is over once all the start and end vertices are selected
			startEstablishingMorphingRelationship = "over";
			alert("Press 'space' to morph");
		}
	}
}

addEventListener('keydown', function (event) {
	if (event.keyCode == 13 && startNewPoly == false && polygonBuffer.length <= 2) {
		if (polygonBuffer[polygonBuffer.length-1].length > 2) {
			// finish polygon on pressing the 'return' key
			startNewPoly = true;
			// revert the previewed line
			draw_mode = "revert";
			let vertexBuffer = polygonBuffer[polygonBuffer.length-1];
			line_DDA(vertexBuffer[vertexBuffer.length-1].x, vertexBuffer[vertexBuffer.length-1].y, cur_posX, cur_posY,"doesn't matter");
			// paint cursor
			draw_mode = "preview";
			paintPixel(cur_posX,cur_posY,cur_color,cur_color);
			// closing the polygon
			draw_mode = "set";
			line_DDA(vertexBuffer[vertexBuffer.length-1].x, vertexBuffer[vertexBuffer.length-1].y, vertexBuffer[0].x, vertexBuffer[0].y, draw_color);
			//
			if (polygonBuffer.length == 2) {
				alert("> you can start establishing morphing relationship between the vertices (blue --> red)\n> press 'space' to morph once relationship is established");
				startEstablishingMorphingRelationship = true;
				// coloring the vertices, to make the vertices visible
				draw_mode = "set";
				for (vertexBuffer = polygonBuffer[0], i = vertexBuffer.length-1; i >= 0; i--) {
					paintPixel(vertexBuffer[i].x, vertexBuffer[i].y, startVertexColor);
				}
				for (vertexBuffer = polygonBuffer[1], i = vertexBuffer.length-1; i >= 0; i--) {
					paintPixel(vertexBuffer[i].x, vertexBuffer[i].y, endVertexColor);
				}			
				// updating the flag variables for use in morphing relationship establishment
				startVertexSelectedForMorphing = [];
				endVertexSelectedForMorphing = [];
				for (var i = 0; i < polygonBuffer[0].length; i++) {
					startVertexSelectedForMorphing.push(false);
				}
				for (var i = 0; i < polygonBuffer[1].length; i++) {
					endVertexSelectedForMorphing.push(false);
				}
				uniqueStartVerticesAvailableForSelection = polygonBuffer[0].length;
				uniqueEndVerticesAvailableForSelection = polygonBuffer[1].length;
			} 
		} else {
			alert("!! select a minimum 3 vertices before closing the polygon !!");
		}
	} else if (event.keyCode == 32) {
		// 'space' key is pressed
		if (startEstablishingMorphingRelationship == "over" && morphingAnimation == false) {			
			// morphing logic
			// finding the steps required to animate each relation
			let translationStepsReqd = [];
			for (var i = 0; i < startVertex.length; i++) {
				let dx = endVertex[i].x-startVertex[i].x, dy = endVertex[i].y-startVertex[i].y;
				let total_steps = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy) ;
				translationStepsReqd.push(total_steps);
			}			
			// finding the maximum translation steps required out of all translations
			maxTranslationStepsReqd = translationStepsReqd[0];
			for (var i = 0; i < translationStepsReqd.length; i++) {
				if (maxTranslationStepsReqd < translationStepsReqd[i]) {
					maxTranslationStepsReqd = translationStepsReqd[i];
				}
			}			
			// now that total translation steps required is found, we can now decide the speed of each translation
			for (var i = 0; i < startVertex.length; i++) {
				let dx = endVertex[i].x-startVertex[i].x, dy = endVertex[i].y-startVertex[i].y;
				translationStep.push({x:dx/maxTranslationStepsReqd, y:dy/maxTranslationStepsReqd});
			}
			// clearing the screen and displaying only the initial and final polygon
			clearScreen();
			draw_mode = "set"
			drawPoly(polygonBuffer[0],draw_color);
			drawPoly(polygonBuffer[1],previewColor);
			// morphing animation
			morphingAnimation = setInterval(function () {
				draw_mode = "set";				
				// clearing the polygon formed in previous iteration
				clearPoly(polygonBuffer[0]);
				// updating the vertex co-ordinates
				for (var j = 0; j < startVertex.length; j++) {
					startVertex[j].x += translationStep[j].x;
					startVertex[j].y += translationStep[j].y;
				}
				drawPoly(polygonBuffer[1],previewColor);
				// drawing the updated polygon
				drawPoly(polygonBuffer[0],draw_color);
				// decrease the counter			
				maxTranslationStepsReqd--;
				// stop the animation once reached
				if(maxTranslationStepsReqd == 0){
					clearInterval(morphingAnimation);
					morphingAnimation = "over";
				}				
			}, 25);
		}			
	}
});