		function polarToCartesian(centerX, centerY, semiMajorAxe, semiMinorAxe, angleInDegrees) {
		  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
		  return {
			x: centerX + (semiMajorAxe * Math.cos(angleInRadians)),
			y: centerY + (semiMinorAxe * Math.sin(angleInRadians))
		  };
		}
		function describeArc(x, y, cx,cy, semiMajorAxe, semiMinorAxe, startAngle, endAngle){
			var start = polarToCartesian(cx, cy, semiMajorAxe, semiMinorAxe, endAngle);
			var end = polarToCartesian(cx, cy, semiMajorAxe, semiMinorAxe, startAngle);
			var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
			var d = [
				"M", x, y, 
				"L", start.x, start.y,
				"A", semiMajorAxe, semiMinorAxe, 0, largeArcFlag, 0, end.x, end.y,
				"Z"
			].join(" ");
			return d;       
		}
		
		window.onload = function() {
		// donner en paramètres : coordonnée x du foyer, coordonnée y du foyer, le demi-grand axe, le demi-petit axe l'angle de départ, l'angle de fin du n cercle
		
		var x = 0;
		var y = 0;
		var cx = planets[0][0]['cx']
		var cy = planets[0][0]['cy']
		var semiMajorAxe = planets[0][0]['major'];
		var semiMinorAxe = planets[0][0]['minor'];
		var angle1 = 360;
		var angle2 = 90;
		var angle3 = 80;
		var angle4 = 110;
		var angle5 = 170;
		var angle6 = 250;
		var angle7 = 300;
		
		//  document.getElementById("arc1").setAttribute("d", describeArc(x, y, cx, cy, semiMajorAxe, semiMinorAxe, 0, angle1));

		};