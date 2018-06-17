//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = (w.innerWidth || e.clientWidth || g.clientWidth) - 50,
	y = (w.innerHeight|| e.clientHeight|| g.clientHeight) - 50;



///////////////////////////////////////////////////////////////////////////
///////////////////////// Initiate elements ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

var stopTooltip = false;	
//Planet orbit variables
//The larger this is the more accurate the speed is
var resolution = 100, //the higher it is, the slower the planet is because resolution is a true coefficient related to equations.
	speedUp = 100, //decrease it to raise speed
	au = 149597871, //km
	radiusSun = 695800, //km
	radiusJupiter = 69911, //km
	phi=0,
	radiusSizer = 8, //Size increaser of radii of planets
	planetOpacity = 1,
	stopEllipse=true, //ellipse isn't higlighted
	exaggerated=true, //the orbit is exaggerated
	indice = exaggerated ? 0:1;
	oldPhi=0,
	newPhi=0,  //oldPhi and newOhi are used in colorArea
	time=0, //used in d3.timer to draw areas
	stopColorArea=true, //area coloring starts when it is false
	surfaceIndex=-1, //index used for paths (look below)
	surfaceTime=[[0, 94, 94+95, 2*94+95, 2*95+2*94, 3*94+2*95, 3*95+3*94, 4*94+3*95+1],
	[0, 16, 2*16, 3*16, 4*16, 5*16, 6*16, 7*16]];//surface divided in 7 araes delimited with specific time : 662/7. Be careful 662/7 is not a round nomber.

var planets = [
[{ "major":316.389, "minor":268.297125798491, "e":0.53, "focus":167.68617, "r":484.07517,
  "cx":167.68617, "cy":0, "x":484.07517, "y":0, "theta": 0, "ID":580, "Radius":0.97, "period":13.2406, 
  "speed":150.139, "name":"CoRoT-10 b", "discovered":2010, "class":"G", "temp":5075}],
[{ "major":110.3079, "minor":109.850220659647, "e":0.091, "focus":10.0380189000001, 
  "r":120.3459189, "cx":10.0380189000001, "cy":0, "x":120.3459189, "y":0, "theta": 0, "ID":2, "Radius":1.281, 
  "period":2.243752, "speed":308.8955, "name":"WASP-14 b", "discovered":2009, "class":"F", "temp":6475}]
];  //2 planets : 1st one is exaggerated and 2nd one isn't

var paths = [{'arc': '','surfaceColor':"yellow"},
{'arc': '','surfaceColor':"blue"},
{'arc': '','surfaceColor':"red"},
{'arc': '','surfaceColor':"pink"},
{'arc': '','surfaceColor':"green"},
{'arc': '','surfaceColor':"purple"},
{'arc': '','surfaceColor':"cyan"}]; //used to draw areas

//Create SVG
var svg = d3.select("#planetarium").append("svg")
	.attr("width", x)
	.attr("height", y);

//Create a container for everything with the centre in the middle
var container = svg.append("g").attr("class","container")
					.attr("transform", "translate(" + x/2 + "," + y/2 + ")")
  
//Create star in the Middle - scaled to the orbits
//Radius of our Sun in these coordinates (taking into account size of circle inside image)
var slider = document.getElementById("sunSlider");
var output = document.getElementById("sunValue");
output.innerHTML = slider.value;
var coeff=1;


var ImageWidth = coeff*radiusSun/au * 5000 * (2.7/1.5);
var sunsvg = container.
append("svg:image")
	.attr("x", -ImageWidth)
	.attr("y", -ImageWidth)
	.attr("class", "sun")
	.attr("xlink:href", "sun.png")
	.attr("width", ImageWidth*2)
	.attr("height", ImageWidth*2)
	.attr("text-anchor", "middle");	


slider.oninput = function() {
output.innerHTML = this.value;
coeff=this.value/100;
ImageWidth = coeff*radiusSun/au * 5000 * (2.7/1.5);
sunsvg
	.attr("x", -ImageWidth)
	.attr("y", -ImageWidth)
	.attr("class", "sun")
	.attr("xlink:href", "sun.png")
	.attr("width", ImageWidth*2)
	.attr("height", ImageWidth*2)
;
}
//Format with 2 decimals
var formatSI = d3.format(".2f");

///////////////////////////////////////////////////////////////////////////   // dist OF= 
/////////////////////////// Plot and move planets /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Drawing a line for the orbit
var orbitsContainer = container.append("g").attr("class","orbitsContainer");
var orbit = orbitsContainer.selectAll("g.orbit")
				.data(planets[indice]).enter().append("ellipse")
				.attr("class", "orbit")
				.attr("cx", function(d) {return d.cx;})
				.attr("cy", function(d) {return d.cy;})
				.attr("rx", function(d) {return d.major;})
				.attr("ry", function(d) {return d.minor;})
				.style("fill", "#3E5968")
				.style("fill-opacity", 0)
				.style("stroke", "white")
				.style("stroke-opacity", 0);	

//Drawing the planets			
var planetContainer = container.append("g").attr("class","planetContainer");
var planet = planetContainer.selectAll("circle")
				.data(planets[indice]).enter()
				//.append("g")
				//.attr("class", "planetWrap")					
				.append("circle")
				.attr("class", "planet")
				.attr("r", function(d) {return radiusSizer*d.Radius;})//rScale(d.Radius);})
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;})
				.style("fill", "white") //function(d){return "url(#gradientRadial-" + d.ID + ")";})
				.style("opacity", planetOpacity)
				.style("stroke-opacity", 0)
				.style("stroke-width", "3px")
				.style("stroke", "white")
				.on("mouseover", function(d, i) {
					stopTooltip = false					
					showTooltip(d);
				});


//Remove tooltip when clicking anywhere in body
d3.select("svg")
	.on("click", function(d) {stopTooltip = true;});

//Path
var pathContainer = container.append("g").attr("class","pathContainer");
var path = pathContainer.selectAll("g.path")
				.data(paths).enter()
				.append("path")
				.attr("class","path")
				.attr("fill", function(d) {return d.surfaceColor;})//rScale(d.Radius);})
				.attr("d", function(d) {return d.arc;})
				.attr("opacity",0);

///////////////////////////////////////////////////////////////////////////
//////////////////////// Set up pointer events ////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Change orbit to exagerated or realistic
d3.select("#exagerate").on("click", planetChangeOrbit);

//Reload page
d3.select("#reset").on("click", function(e) {location.reload();});

//Show information
d3.select("#info").on("click", showInfo);

//Remove info
d3.select("#infoClose").on("click", closeInfo);

//Show information
d3.select("#info").on("click", showInfo);
d3.select("#keplerI").on("click", showFirstLaw);
d3.select("#keplerII").on("click", showSecondLaw);
d3.select("#keplerIII").on("click", showInfo3);

//Remove info
d3.select("#infoClose").on("click", closeInfo);
d3.select("#infoClose1").on("click", closeFirstLaw);
d3.select("#infoClose2").on("click", closeSecondLaw);
d3.select("#infoClose3").on("click", closeInfo3);

//Skip intro
d3.select("#remove")
	.on("click", function(e) {
	
		//Remove all non needed text
		d3.select(".introWrapper").transition().style("opacity", 0);
		d3.select("#start").transition().style("opacity", 0);
		d3.select(".explanation").transition().style("opacity", 0);
		d3.select(".progressWrapper").transition().style("opacity", 0);
		
		//Make skip intro less visible, since now it doesn't work any more
		d3.select("#remove")
			.transition().duration(1000)
			.style("pointer-events", "none")
			.style("opacity",0.3);
		
		//Legend visible
		d3.select(".legendContainer").transition().style("opacity", 1);
		//Bring all planets back
		dim(delayTime = 0);
		bringBack(opacity = planetOpacity, delayTime=1);
		
		//Reset any event listeners
		resetEvents();
	});

//Scale planets accordingly
var scale = false;
d3.select("#scale")
	.on("click", function(e) {
			
	if (scale == false) {
		d3.select("#scale").text("unscale planets");

		d3.selectAll(".planet")
			.transition().duration(2000)
			.attr("r", function(d) {
				var newRadius = radiusJupiter/au*3000*d.Radius;
				if  (newRadius < 1) {return 0;}
				else {return newRadius;}
			});
		
		scale = true;
	} else if (scale == true) {
		d3.select("#scale").text("scale planets");

		d3.selectAll(".planet")
			.transition().duration(2000)
			.attr("r", function(d) {return radiusSizer * d.Radius;});	
		
		scale = false;			
	}//else if
});
