///////////////////////////////////////////////////////////////////////////
/////////////////////////// Main helping functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

// window.onerror = function() {
//     location.reload();
// }
		
//Change x and y location of each planet
d3.timer(function() {       		
		//Move the planet - DO NOT USE TRANSITION
	    //if(100<=time && time<=120){console.log(time,planets[1][0]['y']);}//{console.log(time,"end");}
		d3.selectAll(".planet")
			.attr("cx", locate("x"))
			.attr("cy", locate("y"))
			.attr("transform", function(d) {
				return "rotate(" + (d.theta%360) + "," + d.x + "," + d.y + ")";
			});

		if (!stopColorArea){ //draw area
			colorArea();

			d3.selectAll(".path")
				.data(paths)
				.attr("fill", function(d) {return d.surfaceColor;})
				.attr("d", function(d) {return d.arc;})
				.attr("opacity",0.7); //we update the areas

			time=time+1	;
			var timeMax=surfaceTime[indice][surfaceTime[indice].length-1];
			if(time==timeMax){
				colorAreaOff(); //switch off colorArea
			}
		}	
});

function showSecondLaw() {
	if(!stopEllipse){
	closeFirstLaw();
	}
	if(time>0){
		colorAreaOff();
	}
	d3.select('#K2').style("z-index","1000").transition().duration(300).style('opacity',0.7);
	stopTooltip = true;
	time=0;
	stopColorArea=false; //initialization of the area drawing
}//showSecondLaw

function closeSecondLaw() {
	d3.select('#K2').transition().duration(300).style('opacity',0)
		.call(endall,  function() {
			d3.select('#K2').style("z-index","-1000");	
		}); //we do not switch off the drawing
}//closeSecondLaw

//Show the information box
function showInfo() {
	d3.select('#info1').style("z-index","1000").transition().duration(300).style('opacity',0.7);
	stopTooltip = true;	
	removeEvents();
}//showInfo

function showFirstLaw() {
	closeSecondLaw();
	closeInfo3();
	d3.select('#K1').style("z-index","1000").transition().duration(300).style('opacity',0.7);
	stopTooltip = true;
	showEllipse();
}//showInfo

function showInfo3() {
	d3.select('#K3').style("z-index","1000").transition().duration(300).style('opacity',0.7);
	stopTooltip = true;	
	removeEvents();
}//showInfo

function closeFirstLaw() {
	d3.select('#K1').transition().duration(300).style('opacity',0)
		.call(endall,  function() {
			d3.select('#K1').style("z-index","-1000");	
		});
	showEllipse();	
}//closeInfo


function closeInfo3() {
	d3.select('#K3').transition().duration(300).style('opacity',0)
		.call(endall,  function() {
			d3.select('#K3').style("z-index","-1000");	
		});
	//resetEvents();	
}//closeInfo3 -> thirdLaw unfinished

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Other functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

//--------- Area ----------

function colorArea(){
		var indice =  exaggerated ? 0 : 1;
		var x = 0;
		var y = 0;
		var cx = planets[indice][0]['cx']
		var cy = planets[indice][0]['cy']
		var semiMajorAxe = planets[indice][0]['major'];
		var semiMinorAxe = planets[indice][0]['minor'];
		var indexIn = surfaceTime[indice].lastIndexOf(time); 

		if(planets[indice][0]['x']>cx && planets[indice][0]['y']>cy){
			var phi = math.asin(planets[indice][0]['y']/semiMinorAxe);
		}
		else if(planets[indice][0]['x']<cx){
			var phi=math.PI - math.asin(planets[indice][0]['y']/semiMinorAxe);
			}
		else if(planets[indice][0]['x']>cx && planets[indice][0]['y']<cy){
			var phi=2*math.PI + math.asin(planets[indice][0]['y']/semiMinorAxe);
		}
		var phiDeg = phi*180/math.PI;

		if(time==0){newPhi=phiDeg;}

		if(indexIn==-1){
			paths[surfaceIndex]['arc']=describeArc(x, y, cx, cy, semiMajorAxe, semiMinorAxe, 90+oldPhi, phiDeg+90);
			newPhi=phiDeg;
		}
		else if(indexIn!=-1){
			surfaceIndex+=1;
			//var color=surfaceColor[surfaceIndex];
			paths[surfaceIndex]['arc']=describeArc(x, y, cx, cy, semiMajorAxe, semiMinorAxe, 90+newPhi, phiDeg+90);
			oldPhi=newPhi;
		}
}//colorArea

function colorAreaOff(){
	stopColorArea=true;
	time=0;
	surfaceIndex=-1;
	paths = [{'arc': '','surfaceColor':"yellow"},
			{'arc': '','surfaceColor':"blue"},
			{'arc': '','surfaceColor':"red"},
			{'arc': '','surfaceColor':"pink"},
			{'arc': '','surfaceColor':"green"},
			{'arc': '','surfaceColor':"purple"},
			{'arc': '','surfaceColor':"cyan"}];
	d3.selectAll(".path")
			.data(paths)
			.attr("fill", function(d) {return d.surfaceColor;})//rScale(d.Radius);})
			.attr("d", function(d) {return d.arc;})
			.attr("opacity",0.3);

}//colorAreaOff

function describeArc(x, y, cx,cy, semiMajorAxe, semiMinorAxe, startAngle, endAngle){
	var start = polarToCartesian(cx, cy, semiMajorAxe, semiMinorAxe, endAngle);
	var end = polarToCartesian(cx, cy, semiMajorAxe, semiMinorAxe, startAngle);
	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	var d = [
		"M", x, y,  //starting point
		"L", start.x, start.y, //draw a Line from M to (start.x,start.y)
		"A", semiMajorAxe, semiMinorAxe, 0, largeArcFlag, 0, end.x, end.y, //draw an elliptical arc of largeArcFlag degrees going from (start.x,start.y) to (end.x,end.y)
		"Z" //draw a Line from (end.x,end.y); we close the curve
	].join(" "); //create a string
	return d;       
}//describeArc

//-------------- Find new coordinates ------------

//Calculate the new x or y position per planet
function locate(coord) {
	return function(d){
		var k = 360 * d.major * d.minor / (d.period * resolution * speedUp);
		
		for (var i = 0; i < resolution; i++) {
			d.theta += k / (d.r * d.r);
			d.r = d.major * (1 - d.e * d.e) / (1 - d.e * Math.cos(toRadians(d.theta)));   
		}// for
				
		var x1 = d.r * Math.cos(toRadians(d.theta)) - d.focus;
		var y1 = d.r * Math.sin(toRadians(d.theta));
		
		if (d.theta > 360) {d.theta -= 360;}
				
		if (coord == "x") {
			//New x coordinates
			newX = d.cx + x1 * Math.cos(toRadians(phi)) - y1 * Math.sin(toRadians(phi));
			d.x = newX;
			return newX;
		} else if (coord == "y") {
			newY = d.cy + x1 * Math.sin(toRadians(phi)) + y1 * Math.cos(toRadians(phi));
			d.y = newY; 
			return newY;
		}
	};
}//function locate

//---------------- Polar, cartesian, degrees, radians --------------//

function polarToCartesian(centerX, centerY, semiMajorAxe, semiMinorAxe, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
	x: centerX + (semiMajorAxe * Math.cos(angleInRadians)),
	y: centerY + (semiMinorAxe * Math.sin(angleInRadians))
  }; //return cartesian coordinates
}//polarToCartesian

//Turn degrees into radians
function toRadians(angleDeg) { return angleDeg * (Math.PI / 180);}
function toDegrees(angleRad) { return angleRad * (180 / Math.PI);}


//----------- Orbit -------------//
	
function planetChangeOrbit(){
	var indiceChangeOrbit = exaggerated ? 1 : 0; //new index variable, which is the opposite of indice

	d3.selectAll(".orbit")
		.data(planets[indiceChangeOrbit])
		.attr("cx", function(d) {return d.cx;})
		.attr("cy", function(d) {return d.cy;})
		.attr("rx", function(d) {return d.major;})
		.attr("ry", function(d) {return d.minor;}); //update orbit

	d3.select(".planet")
		.data(planets[indiceChangeOrbit]); //update planet

	planets[indiceChangeOrbit][0]['theta']=0; //restart
	exaggerated = !exaggerated;
	indice = 1-indice;

	//Reset path
	colorAreaOff(); //switch off colorArea in case it was switched on
}//planetChangeOrbit


//Show the total orbit of the hovered over planet
function showEllipse() {
		var opacity = stopEllipse ? 0.8 : 0;
		var duration = (opacity == 0) ? 2000 : 100; //If the opacity is zero slowly remove the orbit line
		
		//Highlight the chosen planet
		svg.selectAll(".planet")
			.transition().duration(duration)
			.style("stroke-opacity", opacity * 1.3);
		
		//Select the orbit with the same index as the planet
		svg.selectAll(".orbit")
			.transition().duration(duration)
			.style("stroke-opacity", opacity)
			.style("fill-opacity", opacity/4);

		stopEllipse=!stopEllipse;
}//showEllipse	


//-------------------- Unused functions ---------------// 
/////////////////////// Except updateWindow, maybe... //////////

//Taken from https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
//Calls a function only after the total transition ends
function endall(transition, callback) { 
	var n = 0; 
	transition 
		.each(function() { ++n; }) 
		.each("end", function() { if (!--n) callback.apply(this, arguments); }); 
}

//Outline taken from http://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
function updateWindow(){
	x = (w.innerWidth || e.clientWidth || g.clientWidth) - 50;
	y = (w.innerHeight|| e.clientHeight|| g.clientHeight) - 50;

	svg.attr("width", x).attr("height", y);
	d3.selectAll(".container").attr("transform", "translate(" + x/2 + "," + y/2 + ")");
	d3.selectAll(".legendContainer").attr("transform", "translate(" + 30 + "," + (y - 90) + ")");
	d3.select("#crazy").style("left", (x/2 - 112/2 + 6) + "px").style("top", (y/2 - 100) + "px");
	//d3.selectAll(".introWrapper").attr("transform", "translate(" + -x/2 + "," + -y/2 + ")");
}//updateWindow


//Remove all events
function removeEvents() {
	//Remove event listeners during examples
	d3.selectAll('.planet').on('mouseover', null).on('mouseout', null);
	d3.selectAll('.legend').on('mouseover', null).on('mouseout', null);
	d3.select("svg").on("click", null);
}//function removeEvents

//Reset all events
function resetEvents() {
	//Replace planet events
		d3.selectAll('.planet')
		.on("mouseover", function(d, i) {
			stopTooltip = false					
			showTooltip(d);
			stopEllipse = true;
			showEllipse();
		})
		.on("mouseout", function(d, i) {
			stopEllipse = false;
			showEllipse();
		});
		
	//Replace click event
	d3.select("svg")
		.on("click", function(d) {stopTooltip = true;});
}
