// Tree configuration
var branches = [];

var w = 1024;
var h = 800;

var centre = { x: (w/2.0), y: (h/2.0) }

var startAngle;
var seed;
var pointOnEdge;

var da = 0.5; // Angle delta
var dl = 0.87; // Length delta (factor)
var ar = 1.; // Randomness
var maxDepth = 5;
var branchLength = 200;

var branchWidth = "1.5px";//1
var branchColor = "#ff8da1"

var outerRadius = Math.min(w, h) / 2 - 10;
var innerRadius = outerRadius - 24;

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var layout = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

var path = d3.svg.chord()
    .radius(innerRadius);


var dt = 200;//time interval 
var t = dt;//timer

//popup window
// window.onload = function() {
//                 register_popup("show", "hide", "popup", "obscuring-layer");
//             }

//resetSeed();

function calculateAngle(x1,y1,x2,y2) { // calculate angle between two points
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	return Math.atan2(deltaX,deltaY);
}

function resetSeed() { // reset seed
	pointOnEdge = randomPointOnEdge();
	startAngle = calculateAngle(pointOnEdge.x,pointOnEdge.y,centre.x,centre.y);
	var newAudioNode = new AudioNode(context);
	seed = {i: 0, x: pointOnEdge.x, y: h - pointOnEdge.y, a: startAngle, l: branchLength, d:0,audioNode:newAudioNode};
}

function randomPointOnEdge() { // only generates points on the  rectangular edge of the canvas
	var p = Math.random();
	var edgeOffset = 0; // this decides how far the root is of the edge.

	var x = 0;
	var y = 0;

	if (p < 0.25) {
		x = Math.random() * (h-edgeOffset);
		y = edgeOffset;
	} else if (p < 0.5) {
		x = Math.random() * (w-edgeOffset);
		y = h;
	} else if (p < 0.75) {
		x = edgeOffset;
		y = Math.random() * (h-edgeOffset);
	} else {
		x = w-edgeOffset;
		y = Math.random() * (h-edgeOffset);
	}
	return { x: x , y: y };
}

// Tree creation functions
function branch(b) {
	var end = endPt(b), daR, newB;

	branches.push(b);

	if (b.d === maxDepth) {
		return;
	}

	// Left branch
	daR = ar * Math.random() - ar * 0.5;
	newB = {
		i: branches.length,
		x: end.x,
		y: end.y,
		a: b.a - da + daR,
		l: b.l * dl ,
		d: b.d + 1,
		parent: b.i,
		audioNode: new AudioNode(context)
	};
	branch(newB);

	// Right branch
		daR = ar * Math.random() - ar * 0.5;
		newB = {
			i: branches.length,
			x: end.x, 
			y: end.y, 
			a: b.a + da + daR, 
			l: b.l * dl, 
			d: b.d + 1,
			parent: b.i,
			audioNode: new AudioNode(context)
		};
		branch(newB);
}

function regenerate(initialise) {
	branches = [];
	resetSeed();
	branch(seed);
	initialise ? create() : update();
}

function endPt(b) {
	// Return endpoint of branch
	var x = b.x + b.l * Math.sin( b.a );
	var y = b.y - b.l * Math.cos( b.a );
	return {x: x, y: y};
}


// D3 functions
function x1(d) {return d.x;}
function y1(d) {return d.y;}
function x2(d) {return endPt(d).x;}
function y2(d) {return endPt(d).y;}
function highlightParents(d) {
	var colour = d3.event.type === 'mouseover' ? 'green' : branchColor;
	var depth = d.d;
	for(var i = 0; i <= depth; i++) {
		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}	
}

function highlightAndPlayParents(d) {
	var endBranch = d;
	var depth = d.d;
	for(var i = 0; i <= depth; i++) {

		d3.select('#id-'+parseInt(d.i)).style('stroke', 'red');
		d = branches[d.parent];
	} 
	treeSchedular.currentBranch = endBranch;
	treeSchedular.startBranch = endBranch;
	treeSchedular.schedule();
}

function create() {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.enter()
		.append('line')
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2)
		.style('stroke-width', branchWidth)
		.style('stroke', branchColor)
		.style('stroke-opacity',.6)
		.attr('id', function(d) {return 'id-'+d.i;})
		.on('mouseover', highlightParents)
		.on('mouseout', highlightParents)
		.on('click',function(d) {
			highlightAndPlayParents(d);
		} );


	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.enter()
		.append('circle')
		.attr('cx',x1)
		.attr('cy',y1)
		.attr("r", function(d) {
			var value = Math.random()*70;
  			return Math.sqrt(value);
			})
		.style("fill","black")
		.style('stroke',"#d3d3d3")
		.style('stroke-width',2)
		.style('fill-opacity',0.25)
		//.attr('id', function(d) {return 'id-'+d.i;});
}

function update() {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.transition()
		.duration(100)
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2);

	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.transition()
		.duration(100)
		.attr('cx',x1)
		.attr('cy',y1)
		.attr("r", function(d) {
			var value = Math.random()*70;
  			return Math.sqrt(value);
			})
		.style("fill","black")
		.style('stroke',"#d3d3d3")
		.style('stroke-width',2)
		.style('fill-opacity',0.25)

}


var timer = setInterval(function(){
   	t += dt;  
   	//console.log(t);
   	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.transition()
		.attr('cx',x1)
		.attr('cy',y1)
		.attr("r", function(d) {
			var value = Math.random()*50;
  			return Math.sqrt(value);
			})
		.style("fill","black")
		.style('stroke',"#d3d3d3")
		.style('stroke-width',2)
		.style('fill-opacity',0.25)
}, dt);

d3.selectAll('.regenerate')
	.on('click', regenerate);

d3.selectAll('.stopAllBuffers')
	.on('click', stopAllBuffers);

function init() {
  context = new webkitAudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      'BowieMono.wav',
      'Chic_will you cry.mp3',
      'sound1.mp3',
      'sound2.mp3',
      'sound3.mp3',
      'sound4.mp3',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
	bufferProvider = new BufferProvider(bufferList);
	console.log(" bufferProvidercount " + bufferProvider.totalNumberOfBuffers);

	resetSeed();
	regenerate(true);
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                console.log(buffer);
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },function(error) { console.error ('decodeAudioData error', error);
        	}    
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error, is this file not located in httpdocs of a server ?');        
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

function AudioNode(context) {
	this.buffer = bufferProvider.provideBuffer();
	this.context = context;
	this.source = null;
	this.gainer = null;
	this.delay = null;
	this.fbgain = null;

	this.chainType = null;
}

AudioNode.prototype.playBuffer = function() {
	if (this.source) {
		this.source.noteOff(0); // release any playing nodes
	}
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer; // assign buffer

	this.gainer = context.createGainNode(); // create a gain node
	this.gainer.gain.value = 0.5; 

	this.source.connect(this.gainer);
	this.gainer.connect(context.destination); // source -> gain -> output
	
	this.source.loop = true; // loop
	var randomDuration = (Math.random() * 0.5) + 0.25; 
	var randomOffset = Math.random() * 4;
	this.source.noteGrainOn(0,randomOffset,randomDuration); // start playing now, with offset and random duration
}

AudioNode.prototype.playBufferWithDelayFX = function() {

	if (this.source) {
		this.source.noteOff(0); // release any playing nodes
	}
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer; // assign buffer

	this.gainer = context.createGainNode(); // create a gain node
	this.gainer.gain.value = 0.1; 

	this.delay = context.createDelayNode(1.0); // create a delay node, max delay 3 seconds;
	this.delay.delayTime.value = 0.1;

	this.fbgain = context.createGainNode();
	this.fbgain.gain.value = 0.75;

	/*
	connection scheme:

	source -> gainer -> output
	gainer -> delay -> fbgain -> delay
	delay -> output
	*/

	this.source.connect(this.gainer);
	this.gainer.connect(this.delay);
	this.delay.connect(this.fbgain);
	this.fbgain.connect(this.delay);
	this.gainer.connect(context.destination); 
	this.delay.connect(context.destination);

	
	this.source.loop = true; // loop
	var randomDuration = (Math.random() * 0.5) + 0.25; 
	var randomOffset = Math.random() * 4;
	this.source.noteGrainOn(0,randomOffset,randomDuration); // start playing now, with offset and random duration
}

AudioNode.prototype.playBufferWithDelayBankFX = function() {
	if (this.source) {
		this.source.noteOff(0); // release any playing nodes
	}
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer; // assign buffer

	var gainer = context.createGainNode(); // create a gain node
	gainer.gain.value = 0.1; 

	var delaybank = new DelayBankNode();

	this.source.connect(gainer);
	gainer.connect(delaybank.input);
	delaybank.connect(context.destination);

	this.source.loop = true; // loop
	var randomDuration = (Math.random() * 0.5) + 0.25; 
	var randomOffset = Math.random() * 4;
	this.source.noteGrainOn(0,randomOffset,randomDuration); // start playing now, with offset and random duration
}

AudioNode.prototype.playBufferWithFilterFX = function() {
	if (this.source) {
		this.source.noteOff(0); // release any playing nodes
	}
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer; // assign buffer

	this.gainer = context.createGainNode(); // create a gain node
	this.gainer.gain.value = 0.1; 

	var freq1,freq2;

	freq1 = mtof(Math.random()*127);
	freq2 = mtof(Math.random()*127);

	console.log("freq1 & freq2"+freq1+" "+freq2);

	this.LPF = context.createBiquadFilter();
	this.LPF.type = 0;
	this.LPF.frequency.value = Math.max(freq1,freq2);
	this.LPF.Q = 10;

	this.HPF = context.createBiquadFilter();
	this.HPF.type = 1;
	this.HPF.frequency.value = Math.min(freq1,freq2);
	this.HPF.Q = 10;

	// source -> gain -> LPF -> HPF -> output
	this.source.connect(this.gainer);
	this.gainer.connect(this.LPF);
	this.LPF.connect(this.HPF);
	this.HPF.connect(context.destination);
	
	this.source.loop = true; // loop
	var randomDuration = (Math.random() * 0.5) + 0.25; 
	var randomOffset = Math.random() * 4;
	this.source.noteGrainOn(0,randomOffset,randomDuration); // start playing now, with offset and random duration
}



AudioNode.prototype.stop = function() {
	if(this.source) {
		this.source.noteOff(0);
	} 
}

function stopAllBuffers() {
	clearTimeout(treeSchedular.timer);
	treeSchedular.previousBranch.audioNode.stop();
	treeSchedular.currentBranch.audioNode.stop();
	/*
	var i;
	var amount = branches.length;
	for (i=0 ; i<amount ; i++) {
		branches[i].audioNode.stop();
	}
	*/
}

function BufferProvider(bufferlist) { // this takes care of providing a buffer to every AudioNode
	this.providerBufferList = bufferlist;
	this.count = 0;
	
	this.totalNumberOfBuffers = bufferlist.length;
}

BufferProvider.prototype.provideBuffer = function () {
	var current = this.count;
	this.count = (this.count + 1) % this.totalNumberOfBuffers;
	return this.providerBufferList[current];
}

function TreeSchedular () {
	this.startBranch = null;
	this.currentBranch = null;
	this.previousBranch = null;
	this.timer = null;
}

TreeSchedular.prototype.schedule = function () {

	if (this.previousBranch) {
		this.previousBranch.audioNode.stop(); // stop the previous branch from playing
	};
	//this.currentBranch.audioNode.playBufferWithFilterFX(); // play the current branch buffer.
	//this.currentBranch.audioNode.playBuffer(); // play the current branch buffer.
	this.currentBranch.audioNode.playBufferWithDelayBankFX();

	this.previousBranch = this.currentBranch;
	this.currentBranch = branches[this.currentBranch.parent]; // assign the parrent as current branch

	if (this.currentBranch) { // if there is a parent, schedule next playing'
		this.timer = setTimeout(function() {
			treeSchedular.schedule();
		} , beatDur);
	} else {
		this.timer = setTimeout( function() {
			treeSchedular.currentBranch = treeSchedular.startBranch;
			treeSchedular.schedule();
		}, beatDur);	
	}
}

function mtof (midiNoteNumber) {
	return 440 * (Math.pow(2.0, (midiNoteNumber-69.0) /12.0 ));
}

function DelayBankNode () {
	this.input = context.createGainNode();
	this.output = context.createGainNode();

	this.delayBank = new Array(0);
	this.gainBank = new Array(0);

	var amount = 5;

	/*
				/----- gain --> delay ---\
	input ------------ gain --> delay -------> output
				\----- gain --> delay ---/

	*/

	for (var i = 0; i < amount ; i++) {
		this.gainBank.push(context.createGainNode());
		this.gainBank[i].gain.value = 1.0;

		this.delayBank.push(context.createDelayNode(1.0));
		this.input.connect(this.gainBank[i]);

		this.gainBank[i].connect(this.delayBank[i])
		this.delayBank[i].connect(this.output);

		this.delayBank[i].delayTime.value = Math.random() * 0.7;
	}

	this.output.gain.value = 1;
}

DelayBankNode.prototype.connect = function(target) {
	this.output.connect(target);
}

DelayBankNode.prototype.disconnect = function() {
	this.output.disconnect();
}

var beatDur = 1500;
var treeSchedular = new TreeSchedular();

var context;
var bufferLoader;
var bufferProvider;

window.onload = init;
