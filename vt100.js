var ctx;
var cvs;

terminal = {
	'width' : 80,
	'height' : 24,
	'csr' : {'x' : 0, 'y': 0, 'on': true, 'interval' : null },
	'text' : {'color' : '#009900', 'font' : '15px courier', 'width' : 9, 'height' : 15 },
	'sel' : {'on' : false, 'sx' : 0, 'sy' : 0, 'ex':0, 'ey' : 0},
	'textBuffer' : [],
	'cvs' : cvs,
	'ctx' : ctx,
	//member functions
	//cursor Fuctions
	'drawCursor' : function(){
	    if(this.csr.on){
		this.ctx.save();
		this.ctx.fillStyle = this.text.color;
		this.ctx.fillRect(this.csr.x, this.csr.y, this.text.width, this.text.height);
		this.ctx.restore();
	    }else{
		this.ctx.clearRect(this.csr.x, this.csr.y, this.text.width, this.text.height);
	    }
	}
	'eraseCursor' : function(){
			this.csr.on = false;
			this.drawCursor();
	},
	'startCursor' : function(){
			this.csr.interval = setInterval('terminal.drawCursor()', 500);
	},
	'stopCursor' : function(){
			clearInterval(this.csr.interval);
			eraseCursor();
	}
	//character functions
	'writeChar' : function( ch, x, y, color ){
			if(!color ) {
			color = this.text.color;
			}
			this.ctx.save();
			//setup context
			this.ctx.font = this.text.font;
			this.ctx.fillStyle = this.text.color;
			this.ctx.textBaseline = 'top';
			//save the text to buffer
			this.textBuffer[y][x] = ch;
			//draw the text
			this.ctx.fillText(ch, x*this.text.width, y*this.text.height);			

			this.ctx.restore();
		    }
	};
	
	}

var term ={
	'width' : 80,
	'height' : 24,
	'csr' : {'x': 0, 'y': 0},
	'font' : '15px courier',
	'textColor' : '#009900',
	'textSize' : {'width' : 9, 'height':15},
	'cursorOn' : true,
	'textBuffer' : [],
	'cursorInterval' : null,
	'selecting' : false,
	'selection' : { 'sx' : 0, 'sy' : 0, 'ex' : 0, 'ey' : 0 }
    };


function drawCursor(){
    if(term.cursorOn){
	ctx.save();
	ctx.fillStyle = term.textColor;
	ctx.fillRect(term.csr.x, 
		    term.csr.y, 
		    term.textSize.width,
		    term.textSize.height);
	ctx.restore();
	term.cursorOn = false;
    }else{
	ctx.clearRect(term.csr.x, 
		    term.csr.y , 
		    term.textSize.width,
		    term.textSize.height);
	term.cursorOn = true;
    }
}

function init(){
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    cvs.width = term.width * term.textSize.width;
    cvs.height = term.height *(term.textSize.height);
    //set up buffers
    term.textBuffer.length = term.height;
    for( i = 0; i < term.textBuffer.length; ++i){
	term.textBuffer[i] = [];
	term.textBuffer[i].length = term.width;
    }
    //setup event handlers
    document.onkeypress = keyboardInput;
    cvs.addEventListener('mousedown',selectEvent, false);
    cvs.addEventListener('mousemove',selectEvent, false);
    cvs.addEventListener('mouseup',selectEvent, false);
    //draw some testing stuff
    startCursor();
    writeChar('>');
}

function startCursor(){
    term.cursorInterval = setInterval('drawCursor()', 500);

}

function stopCursor(){
    clearInterval(term.cursorInterval);
    eraseCursor();
}

function writeChar(msg){
    eraseCursor();
    ctx.save();
    //save value into buffer
    term.textBuffer[term.csr.y/term.textSize.height][term.csr.x/term.textSize.width] = msg;

    //render char to screen
    ctx.textBaseline = 'top';
    ctx.font = term.font;
    ctx.fillStyle = term.textColor;
    ctx.fillText(msg, term.csr.x, term.csr.y);
    term.csr.x += ctx.measureText(msg).width;
    

    ctx.restore();
}

function error(msg){
    document.getElementById('errors').innerHTML += '\n<p>' + msg + '</p>';
}

function eraseCursor(){
term.cursorOn = false;
drawCursor();
}


function keyboardInput( ev ){
    var key = ev.keyCode;
    switch(key){
	case 13:
	    eraseCursor();
	    term.csr.y += term.textSize.height;
	    term.csr.x = 0;
	    writeChar('>');
	    break;
	case 8 : //backspace
	    if(term.csr.x > term.textSize.width){
		eraseCursor();
		term.textBuffer[term.csr.y/term.textSize.height][term.csr.x/term.textSize.width] = '';
		term.csr.x -= term.textSize.width;
	    }
	    break;
	default:
	    key = String.fromCharCode(ev.which);
	    writeChar(key);
    }
}

function selectEvent( ev){
    //if mouse down
	var x = ev.layerX - cvs.offsetTop;
	var y = ev.layerY - cvs.offsetLeft;
    if(!term.selecting && !(ev.type == 'mousedown')){
	return;
    }
    if(ev.type == 'mousedown' && !term.selecting){
	stopCursor();
	term.selecting = true;
	term.selection.sx = x - (x % term.textSize.width);
	term.selection.sy = y - (y % term.textSize.height);
	term.selection.ex = term.selection.sx + term.textSize.width;
	term.selection.ey = term.selection.sy + term.textSize.height;
	ctx.save();
	ctx.fillStyle = term.textColor;
	ctx.fillRect(term.selection.sx, term.selection.sy, term.testSize.width, term.textSize.height);
	ctx.restore();
	ctx.save();
	ctx.textBaseline = 'top';
	ctx.font = term.font;
	ctx.fillText(term.textBuffer[term.selection.sy/term.textSize.height ][term.selection.sx/term.textSize.width],term.selection.sx, term.selection.sy); 
	ctx.restore();
    }else if( ev.type == 'mousemove' && term.selecting ){
	    ctx.clearRect(term.selection.sx, term.selection.sy,
			term.selection.ex - term.selection.sx,
			term.selection.ey - term.selection.sy);
	
	term.selection.ex = x + (term.textSize.width - (x % term.textSize.width));
	term.selection.ey = y + (term.textSize.height - (y % term.textSize.height));
	ctx.save();
	    ctx.fillStyle = term.textColor;
	    ctx.fillRect(term.selection.sx, term.selection.sy,
			term.selection.ex - term.selection.sx,
			term.selection.ey - term.selection.sy);
	ctx.restore();
    }else if( ev.type == 'mouseup'){
	startCursor();
	term.selecting = false;
    }
}

