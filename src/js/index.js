var vis;
var satellites;
var cursorWindowObj;

var attributes = {
	max: null,
	dotRadius: 1,
	track: 2*Math.PI,
	timeScale: 1,
	paused: false,
	sampleSize: 10,
	sampleMax: 10
};

var earthAttr = {
	radius: 6378.1,
	angle: 0,
	angVel: 7.2921159e-5
}


var satelliteTypes = {};

var green = 'rgba(100, 225, 100, 1)';
var blue = 'rgba(75, 75, 225, 1)';
var red =  'rgba(255, 100, 50, 1)';

var regionColors = {
	low: green,
	med: blue,
	geo: 'yellow',
	high: red
}


function init(){
	vis = vis();
	checkSvgs();
	vis.updatePositions();
	
	cursorWindowObj = new cursorWindow;

	events();
	animate();
	vis.resize(true);
}

function vis(){
	var margin = {top: 20, right: 20, bottom: 30, left: 20};
	
	var svg = d3.select("body")
		.append('svg')
		.style('width', '100%')
		.style('height', '100%');
	
	var defs = svg.append('defs');
	
	var width = parseInt(svg.style('width')) - margin.left - margin.right;
	var height = parseInt(svg.style('height')) - margin.top - margin.bottom;
	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var earthGrp = g.append("g")
		.attr('id', 'earth_group');
	var regionGrp = g.append("g")
		.attr('id', 'regionrings_group');
	var satGrp = g.append("g")
		.attr('id', 'satellite_group');

	var nonGeoGrp = satGrp.append('g');
	var geoGrp = satGrp.append('g');
	var geoGrpWidth;
	var updateGeoGrp = true;
	
	var exponent = 0.5;
	
	var white = '#FFF';
	/*
	var ticks = [];
	
	for(var i = 0; i < 10; i ++){
		ticks.push(Math.pow(attributes.max/10*i, 0.2));
	}*/
	
	var canvas = d3.select('#satcanvas')
		.attr('width', width)
		.attr('height', height + margin.bottom);
		
	$(canvas.node())
		.css('top', margin.top)
		.css('left', margin.left);
		
	var ctx = canvas.node().getContext('2d');
	
	var x = d3.scalePow()
		.exponent(exponent)
		.rangeRound([0, width])
		.domain([-attributes.max, attributes.max]);
	
	var centerx = x(0);
	var centery = height;

	var earthObj = new renderEarth;
	
	var regions = new renderRegions;
	
	var xAxis = new renderAxis;
	
	geoGrpWidth = x(40000);

	
	
	function setExponent(num){
		exponent = num;
		resize();
	}
	
	function renderEarth(){
		this.radius = x(earthAttr.radius) - centerx; 
		var earthSvg = earthGrp.append('svg');
		
		var earthPattern = defs.append('pattern')
			.attr('id', 'earthPattern')
			.attr('patternUnits', 'userSpaceOnUse');
		
		defs.append('filter')
			.attr('id', 'earthDarkBlur')
			.attr('x', '-50%')
			.attr('y', '-50%')
			.attr('width', '200%')
			.attr('height', '200%')
		.append('feGaussianBlur')
			.attr('in', 'SourceGraphic')
			.attr('stdDeviation', 25)
		
		var earthImage = earthPattern.append('image')
			.attr('xlink:href', 'earth.png')
			
		var earthCircle = earthSvg.append('circle')
			.attr('id', 'earthCircleSvg')
			.style('fill', 'url(#earthPattern)')
			.on("mouseover", function() {
				cursorWindowObj.show();
				cursorWindowObj.populate('earth');
			})
			.on("mouseout", function(sat, i, e) {
				cursorWindowObj.hide();
			});
			
		var earthShadow = earthSvg.append('rect')
			.attr('fill', '#000')
			.attr('filter', 'url(#earthDarkBlur)')
			.style('pointer-events', 'none')
		
		function resize(){
			this.radius = x(earthAttr.radius) - centerx;
			radius = this.radius;
			
			earthSvg
				.attr('x', centerx - radius)
				.attr('y', centery - radius)
				.attr('width', radius*2)
				.attr('height', radius*2);
				
			earthPattern
				.attr('width', radius*2)
				.attr('height', radius*2);
				
			earthImage
				.attr('width', radius*2)
				.attr('height', radius*2);
				
			earthCircle
				.attr('cx', radius)
				.attr('cy', radius)
				.attr('r', radius);
				
			earthShadow
				.attr('x', -radius)
				.attr('y', radius - radius*0.2)
				.attr('width', radius*4)
				.attr('height', radius*2);
		}
		
		resize();

		this.earthSvg = earthSvg;
		this.earthImage = earthImage;
		this.resize = resize;
	}
	
	
	function renderRegions(){


	
		var region = {
			low: {
				alt: 160,
				color: regionColors.low,
				opacity: 0.0
			},
			med: {
				alt: 2000,
				color: regionColors.med,
				opacity: 0.0
			},
			geo: {
				alt: 35500,
				color: regionColors.geo,
				opacity: 0.0
			},
			high: {
				alt: 36000,
				color: 'url(#circleGrad)',
				opacity: 0.0
			}
		};

		function init(){

			var grad = defs.append('radialGradient')
				.attr('id', 'circleGrad')
				.attr('cx', '50%')
				.attr('cy', '50%')
				.attr('r', '40%')
				.attr('fx', '50%')
				.attr('fy', '50%');
			
			grad.append('stop')
				.attr('offset', '40%')
				.style('stop-color', regionColors.high);
				
			grad.append('stop')
				.attr('offset', '100%')
				.style('stop-color', 'none');
				
			var lowMedHigh = regionGrp.append('g');
			var geo = regionGrp.append('g');
			
			for(var reg in region){
				
				// so the geo ring region renders above the other three
				if(reg == 'geo'){
					region[reg].svg = geo.append('circle')
				}
				else{
					region[reg].svg = lowMedHigh.append('circle')
				}

				region[reg].svg
					.attr('id', 'region_' + reg)
					.attr('class', 'region_circle')
					.attr('stroke', white)
					.attr('fill', 'none')
					.style('opacity', region[reg].opacity)
					.on("mouseenter", function(sat, i, e) {
						var id = e[0].id.split('_')[1];

						region[id].svg
							.style('opacity', 0.5)
							.attr('stroke', region[id].color)
							
/*						if(id == 'geo'){
							region[id].svg
								.attr('stroke-width', region[id].width*10);
						}*/
						
						cursorWindowObj.show();
						cursorWindowObj.populate(id);
					})
					.on("mouseleave", function(sat, i, e) {
						var id = e[0].id.split('_')[1];
						region[id].svg
							.style('opacity', region[id].opacity)
							.attr('stroke', white)
							
/*						if(id == 'geo'){
							region[id].svg
								.attr('stroke-width', region[id].width);
						}*/
						cursorWindowObj.hide();
					});
			}
			
			resize();
		}
		
		function apply(reg){
			region[reg].svg
				.attr('cx', centerx)
				.attr('cy', centery)
				.attr('r', x(earthAttr.radius + region[reg].alt) - centerx + region[reg].width/2);
				
			if(reg == 'geo'){
				region[reg].svg
					.attr('stroke-width', region[reg].width*10);
			}
			else{
				region[reg].svg
					.attr('stroke-width', region[reg].width);
			}
		}
		
		function resize(){
			region.low.width = x(earthAttr.radius + region.med.alt) - x(earthAttr.radius + region.low.alt);
			region.med.width = x(earthAttr.radius + region.geo.alt) - x(earthAttr.radius + region.med.alt);
			region.geo.width = x(earthAttr.radius + region.high.alt) - x(earthAttr.radius + region.geo.alt);
			region.high.width = width;
			
			for(var reg in region){
				apply(reg);
			}
		}
		
		init();
		
		this.resize = resize;
	}
	
	
	function renderAxis(){
		
		var call = d3.axisBottom(x)
//		.tickValues(d3.ticks(-attributes.max, attributes.max, 20));

		.tickArguments([20, "s"]);
	
		this.call = call;
		
		var axis = g.append("g")
			.call(call)
			.attr("transform", "translate(0," + height + ")")
			.style('pointer-events', 'none');
		
		this.axis = axis;
		
		axis.selectAll('path')
			.attr('stroke', white);
		
		axis.selectAll('line')
			.attr('stroke', white);
		
		axis.selectAll('text')
			.attr('fill', white);
	}
	

	function checkSvg(satellite){
		if(satellite.svg == null){
//			if(satellite.geo == 0){
			if(1){
				satellite.svg = nonGeoGrp.append('_circle');
			}
			else{
				satellite.svg = geoGrp.append('_circle')
			}

			satellite.svg.attr('r', attributes.dotRadius)
				.attr('fill', white)
				.style('pointer-events', 'none');
		}
	}
	
	function setRadius(satellite){
		satellite.radius = x(satellite.average + earthAttr.radius) - centerx;
	}
	
	function setColor(satellite, color, radius){
		satellite.svg
			.attr('r', radius)
			.attr('fill', color)
	}

	function updatePositions(t){
		var sat, x, y;
		t = t || 0;
		
		ctx.clearRect(0, 0, width, height + margin.bottom);
		
		for(var i = 0; i < attributes.sampleSize; i++){
			for(var j = i; j < satellites.length; j += attributes.sampleMax){
				//satellites.length
				
				sat = satellites[j];
				if(sat.svg != null){
				
//					if(sat.geo == 0 || updateGeoGrp){			
					if(1){

						sat.angle += sat.angVel * t;

						if(sat.average > 40000){
							sat.angle = sat.angle % Math.PI;
						}
						else{
							sat.angle = sat.angle % attributes.track;
						}
						
						x = Math.cos(sat.angle) * sat.radius;
						y = Math.sin(sat.angle) * sat.radius;

/*						sat.svg
							.attr('cx', centerx + x)
							.attr('cy', centery - y);*/
						
						ctx.fillStyle = sat.svg.attr('fill');
						ctx.beginPath();
						ctx.arc(
							centerx + x,
							centery - y,
							sat.svg.attr('r'),
							0,
							2*Math.PI
						);
						ctx.closePath();
						ctx.fill();
					}
				}
				else{
					console.log("Satellite " + j + " does not have an SVG");
				}
			}
		}
		
		updateGeoGrp = false;
		
		geoGrp
			.attr('transform', 'rotate(' + -(earthAttr.angle * 180 / Math.PI) + ' ' + centerx + ' ' + centery +')');
	}
	
	function rotateEarth(t){
		t = t || 0;
		earthAttr.angle += earthAttr.angVel * t;
		earthAttr.angle = earthAttr.angle % (Math.PI*2);
		earthObj.earthImage
			.attr('transform', 'rotate( ' + -(earthAttr.angle * 180 / Math.PI) + ' ' + (earthObj.radius) + ' ' + (earthObj.radius) + ' )');
	}
	
	function resize(hack){
		var buffer = 0;
		if(hack){
			buffer = 1;
		}
		width = parseInt(svg.style('width')) - margin.left - margin.right + buffer;
		height = parseInt(svg.style('height')) - margin.top - margin.bottom;
		
		x
			.exponent(exponent)
			.rangeRound([0, width]);
		
		xAxis.call = d3.axisBottom(x)
			.tickArguments([20, "s"]);
			
		xAxis.axis
			.call(xAxis.call)
			.attr("transform", "translate(0," + height + ")");
		
		centerx = x(0);
		centery = height;
		
		earthObj.resize();
		regions.resize();
		checkSvgs();
		
		updateGeoGrp = true;
		
		canvas
			.attr('width', width)
			.attr('height', height + margin.bottom);
			
		$(canvas.node())
			.css('top', margin.top)
			.css('left', margin.left);
	}
	
	return{
		setExponent: setExponent,
		checkSvg: checkSvg,
		setRadius: setRadius,
		setColor: setColor,
		updatePositions: updatePositions,
		rotateEarth: rotateEarth,
		resize: resize
	}
};

function checkSvgs(){
	for(var i = 0; i < attributes.sampleSize; i++){
		for(var j = i; j < satellites.length; j += attributes.sampleMax){
			vis.checkSvg(satellites[j]);
			vis.setRadius(satellites[j]);
		}
	}
}

function setColors(sats, color, radius){
	var satColor;
	sats.forEach(function(sat){
		
		satColor = color || satellites[sat].color;
		
		vis.checkSvg(satellites[sat]);
		vis.setColor(satellites[sat], satColor, radius);
	})
}

function cursorWindow(){
	var dom, titleDom, altDom, numDom, spdDom;
	
	var width;
	var height;
	var top;
	var mousePadding = 20;
	var rightPadding = 1;
	
	function show(){
		dom.css('display', 'block');
	}
	
	function hide(){
		dom.css('display', 'none');
	}
	
	function setDimensions(){
		width = parseInt(dom.css('width'));
		height = parseInt(dom.css('height'));
	}
	
	function moveto(x, y){
		x = window.innerWidth - x - rightPadding < width + mousePadding ? window.innerWidth - width - rightPadding : x + mousePadding;
		y = y < mousePadding + height + top ? top : y - mousePadding - height;
		
		dom.css({
			'top': y,
			'left': x
		});
	}
	
	function populate(region){

		var obj = orbits[region];

		if(region == 'earth'){
			titleDom.text('Planet: ' + obj.title);
			numDom.text('');
			altDom.html('Radius: ' + obj.alt);
			spdDom.text('Surface Speed @Equator: ' + obj.aveSpeed + ' km/s');
		}
		else{
			titleDom.text('Orbit: ' + obj.title);
			numDom.text('Satellites: ' + obj.num);
			altDom.html('Altitude: ' + obj.alt);
			spdDom.text('Average Orbital Speed: ' + obj.aveSpeed + ' km/s');
			
		}
		setDimensions();
	}
	
	function resize(){
		top = parseInt($('#panel').css('height')) + parseInt($('#panel').css('padding-bottom'));
	}
	
	function init(){
		dom = $('#cursorwindow');
		titleDom = $('#cursorwindow_title');
		altDom = $('#cursorwindow_alt');
		spdDom = $('#cursorwindow_speed');
		numDom = $('#cursorwindow_num');
		
		top = parseInt($('#panel').css('height')) + parseInt($('#panel').css('padding-bottom'));
		
		setDimensions();
	}
	
	init();

	this.show = show;
	this.hide = hide;
	this.moveto = moveto;
	this.populate = populate;
	this.resize = resize;
}

(function loadData(){
	$.getJSON("satellitedata.json", function(data){
		satellites = data;

		var max = 0;
		var sgp = 3.986E14;	// standard gravitational parameter for earth
		
		var r;

		var lows, meds, geos, highs;
		var la, ma, ga, ha;
		
		lows = meds = geos = highs = 0;
		la = ma = ga = ha = 0;
		
		var types = [
			{ outkey: 'operator', inkey: 'countryOperator'},
			{ outkey: 'users', inkey: 'users'},
			{ outkey: 'purpose', inkey: 'detailedPurpose'},
			{ outkey: 'rocket', inkey: 'launchVehicle'}
		]
		
		types.forEach(function(sat){
			satelliteTypes[sat.outkey] = {};
		})
		
		satellites.forEach(function(sat, index){
			sat.average = (sat.perigree + sat.apogee) / 2;

			r = (sat.average + earthAttr.radius) * 1000;
			
			max = sat.average > max ? sat.average : max;
			
			sat.orbSpeed = Math.sqrt(sgp / r);
			sat.angVel = sat.orbSpeed / r;
			sat.svg = null;
			
			if(sat.average < 2000){
				lows++;
				la += sat.orbSpeed;
				sat.geo = 0;
				sat.color = regionColors.low;
			}
			else if(sat.average >=2000 && sat.average < 35600){
				meds++;
				ma += sat.orbSpeed;
				sat.geo = 0;
				sat.color = regionColors.med;
			}
			else if(sat.average >= 35600 && sat.average < 35900){
				geos++;
				ga += sat.orbSpeed;
				sat.geo = 1;
				sat.color = regionColors.geo;
			}
			else if(sat.average >= 35900){
				highs++;
				ha += sat.orbSpeed;
				sat.geo = 0;
				sat.color = regionColors.high;
			}
			
			types.forEach(function(type){
				var pass = false;
				
				if(type.outkey == 'purpose' && sat[type.inkey] == ''){
					satellites[index][type.inkey] = sat['purpose'].split(/,|\//);
				}
				else{
					satellites[index][type.inkey] = sat[type.inkey].split(/,|\//);
				}
				
				satellites[index][type.inkey].forEach(function(key){
					key = key.trim();

					if(key == ''){
						key = "[unspecified]"
					}
					else if(key == 'Mil'){
						key = "Military";
					}
					else if(key == 'Gov'){
						key = "Government";
					}
					else if(key == 'Commerical'){
						key = "Commercial";
					}
					
					if(satelliteTypes[type.outkey].hasOwnProperty(key) == false){
						satelliteTypes[type.outkey][key] = {};
						satelliteTypes[type.outkey][key].num = 1;
						satelliteTypes[type.outkey][key].sats = [];
						satelliteTypes[type.outkey][key].sats.push(index);
					}
					else{
						satelliteTypes[type.outkey][key].num ++;
						satelliteTypes[type.outkey][key].sats.push(index);
					}
				})
			});

			if(sat.average > 40000){
				sat.angle = Math.random() * Math.PI;
			}
			else{
				sat.angle = Math.random() * attributes.track;
			}
		});

		attributes.max = max;

		orbits.low.num = lows;
		orbits.med.num = meds;
		orbits.geo.num = geos;
		orbits.high.num = highs;
		
		orbits.earth.aveSpeed = 0.465;
		orbits.low.aveSpeed = ( (la / lows) / 1000).toPrecision(3);
		orbits.med.aveSpeed = ( (ma / meds) / 1000).toPrecision(3);
		orbits.geo.aveSpeed = ( (ga / geos) / 1000).toPrecision(3);
		orbits.high.aveSpeed = ( (ha / highs) / 1000).toPrecision(3);

		
		
		
		
		types.forEach(function(type){
			var table = $('.color_list-table[data-table="' + type.outkey + '"]');
			
			var keys = [];
			
			for(var key in satelliteTypes[type.outkey]){
				keys.push(key);
			}
			
			keys.sort();
			
			keys.forEach(function(key, i){
				var opacity = i % 2 == 0 ? 0.1 : 0.05;
				table.append(
					'<tr class="color-row"' +
					'data-type="' + type.outkey + '" ' +
					'data-key="' + key + '" ' +
					'style="background-color:rgba(255,255,255,' + opacity + ')">' +
					'<td>' + key + '</td><td>' + satelliteTypes[type.outkey][key].num + '</td>' +
					'</tr>'
				);
			})
		})

		
		
		
		init();
	})
	.fail(function(e, error) {
		console.log( "error: " + error);
	});
})()

function events(){
	$(window).resize(function(){
		vis.resize();
		cursorWindowObj.resize();
	});
	
	$('.region_circle, #earthCircleSvg').mousemove(function(event){
		cursorWindowObj.moveto(event.pageX, event.pageY);
	});
	
	$('#collapse').click(function(){

		if($(this).attr('data-collapse') == 'false'){
			var left = parseInt($('#controls').css('width'));
			$('#controls').css('left', -left*2);
			$(this)
				.attr('data-collapse', true)
				.css('top', '0px');
			$(this).find('i').css('transform', 'rotate(180deg)');
			
		}
		else{
			var left = parseInt($('#controls').css('width'));
			$('#controls').css('left', '0px');
			$(this)
				.attr('data-collapse', false)
				.css('top', 'calc(50% - 25px)');
			$(this).find('i').css('transform', 'rotate(0deg)');
		}
	});
	
	$('.control_button[data-speed]').click(function(){
		var speed = $(this).attr('data-speed');
		if(speed == 'pause'){
			attributes.paused = true;
			
			$(this)
				.addClass('control_button-active')
			.parent()
				.find('.control_speed[data-speed="play"]')
				.removeClass('control_button-active');
		}
		else if(speed == 'play'){
			attributes.paused = false;
			
			$(this)
				.addClass('control_button-active')
			.parent()
				.find('.control_speed[data-speed="pause"]')
				.removeClass('control_button-active');
		}
		else if(speed == 'add'){
			attributes.timeScale = attributes.timeScale * 1.2;
			$('#speed_bar-speed').text(parseFloat((attributes.timeScale * 1000).toPrecision(3)) + 'x')
		}
		else if(speed == 'remove'){
			attributes.timeScale = attributes.timeScale / 1.2;
			$('#speed_bar-speed').text(parseFloat((attributes.timeScale * 1000).toPrecision(3)) + 'x')
		}
	})
	
	$('.control_button[data-exponent]').click(function(){
		$(this).parent().find('.control_button').removeClass('control_button-active');
		$(this).addClass('control_button-active');
		
		vis.setExponent( Number($(this).attr('data-exponent')) );
		if(attributes.paused){
			vis.updatePositions(0);
			vis.rotateEarth(0);
		}
	});
	
	$('.control_button[data-color]').click(function(){
		$(this).parent().parent().find('.control_button').removeClass('control_button-active');
		$(this).addClass('control_button-active');
		
		var type = $(this).attr('data-color');
		
		$('.color_list-table[data-table]').css('display', 'none');

		if(type == 'none'){
			$('.color_list-table[data-table]').parent().parent().css('width', '0px');
			
			if(lastType && lastKey){
				setColors(satelliteTypes[lastType][lastKey].sats, 'white', 1);
			}
		}
		else{
			$('.color_list-table[data-table]').parent().parent().css('width', '100%');
			$('.color_list-table[data-table="' + $(this).attr('data-color') + '"]').css('display', 'block');
		}
	});
	
	$('.color-row').mouseenter(function(){
		var type = $(this).attr('data-type');
		var key = $(this).attr('data-key');

		if(lastType && lastKey){
			setColors(satelliteTypes[lastType][lastKey].sats, 'white', 1);	
		}
		
		lastType = type;
		lastKey = key;
		
		setColors(satelliteTypes[type][key].sats, null, 4);
	});
	
/*	$('.color-row').mouseleave(function(){
		if(lastType && lastKey){
			setColors(satelliteTypes[lastType][lastKey].sats, 'white', 1);
		}
	});*/
}

var lastType, lastKey;

var start = 0;
var tick = 0;
var prev = 0;
var average = [], b = 0, a = 0;
function animate(time){
	requestAnimationFrame(animate);
	
	tick = (time - prev);
	prev = performance.now();
//	console.log(tick);
	
	b = performance.now();
	
	
	if(!attributes.paused){
		vis.updatePositions(tick * attributes.timeScale);
		vis.rotateEarth(tick * attributes.timeScale);
	}

	
	a = performance.now();
	/*
//	console.log(a-b);
	if(average.length < 10)
		average.push(tick);
	else{
		var sum = 0;
		average.forEach((d)=>{sum += d});
//		console.log(sum/average.length);
		average = [];
	}
	
*/
}