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
var resolution = 1, //perhaps make slider?
	speedUp = 400,
	au = 149597871, //km
	radiusSun = 695800, //km
	radiusJupiter = 69911, //km
	phi = 0, //rotation of ellipses
	radiusSizer = 6, //Size increaser of radii of planets
	planetOpacity = 0.6;

//Create SVG
var svg = d3.select("#planetarium").append("svg")
	.attr("width", x)
	.attr("height", y);

//Create a container for everything with the centre in the middle
var container = svg.append("g").attr("class","container")
					.attr("transform", "translate(" + x/2 + "," + y/2 + ")")
  
//Create star in the Middle - scaled to the orbits
//Radius of our Sun in these coordinates (taking into account size of circle inside image)
var ImageWidth = radiusSun/au * 5000 * (2.7/1.5);
container.
append("svg:image")
	.attr("x", -ImageWidth)
	.attr("y", -ImageWidth)
	.attr("class", "sun")
	.attr("xlink:href", "sun.png")
	.attr("width", ImageWidth*2)
	.attr("height", ImageWidth*2)
	.attr("text-anchor", "middle");	

//d3.json("exoplanets.json", function(error, planets) {

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create Scales ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Create color gradient for planets based on the temperature of the star that they orbit
var colors = ["#FB1108","#FD150B","#FA7806","#FBE426","#FCFB8F","#F3F5E7","#C7E4EA","#ABD6E6","#9AD2E1","#42A1C1","#1C5FA5", "#172484"];
var colorScale = d3.scale.linear()
	  .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000]) // Temperatures
	  .range(colors);
	
//Set scale for radius of circles
var rScale = d3.scale.linear()
	.range([1, 20])
	.domain([0, d3.max(planets, function(d) { return d.Radius; })]);	

//Format with 2 decimals
var formatSI = d3.format(".2f");

//Create the gradients for the planet fill
var gradientChoice = "Temp";
//createGradients();

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Plot and move planets /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Drawing a line for the orbit
var orbitsContainer = container.append("g").attr("class","orbitsContainer");
var orbit = orbitsContainer.selectAll("g.orbit")
				.data(planets).enter().append("ellipse")
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
var planet = planetContainer.selectAll("g.planet")
				.data(planets).enter()
				//.append("g")
				//.attr("class", "planetWrap")					
				.append("circle")
				.attr("class", "planet")
				.attr("r", function(d) {return radiusSizer*d.Radius;})//rScale(d.Radius);})
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;})
				.style("fill", "blue") //function(d){return "url(#gradientRadial-" + d.ID + ")";})
				.style("opacity", planetOpacity)
				.style("stroke-opacity", 0)
				.style("stroke-width", "3px")
				.style("stroke", "white")
				.on("mouseover", function(d, i) {
					stopTooltip = false					
					showTooltip(d);
					showEllipse(d, i, 0.8);
				})
				.on("mouseout", function(d, i) {
					showEllipse(d, i, 0);
				});

//Remove tooltip when clicking anywhere in body
d3.select("svg")
	.on("click", function(d) {stopTooltip = true;});

///////////////////////////////////////////////////////////////////////////
//////////////////////// Set up pointer events ////////////////////////////
///////////////////////////////////////////////////////////////////////////	
//Reload page
d3.select("#reset").on("click", function(e) {location.reload();});

//Show information
d3.select("#info").on("click", showInfo);

//Remove info
d3.select("#infoClose").on("click", closeInfo);

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
