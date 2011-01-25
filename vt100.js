var ctx;
var cvs;

terminal = {
	'width' : 80,
	'height' : 24,
	'background': 'black',
	'csr' : {'x' : 0, 'y': 0, 'on': true, 'interval' : null },
	'text' : {'color' : '#009900', 'font' : '15px courier', 'width' : 9, 'height' : 15 },
	'sel' : {'on' : false, 'sx' : 0, 'sy' : 0, 'ex':0, 'ey' : 0},
	'textBuffer' : [],
	'cvs' : cvs,
	'ctx' : ctx,
	//member functions
	//cursor Fuctions
	'drawCursor' : function(){
		var tmpx = this.csr.x;
		var tmpy = this.csr.y;
		var c = this.textBuffer[tmpy][tmpx];
	    if(this.csr.on){
		this.ctx.save();
		this.ctx.fillStyle = this.text.color;
		this.ctx.fillRect( tmpx*this.text.width, tmpy * this.text.height, this.text.width, this.text.height );
		if(c){
		   this.writeChar(c, tmpx, tmpy, terminal.background);
		}
		this.ctx.restore();
	    }else{
		this.ctx.clearRect(this.csr.x*this.text.width, this.csr.y*this.text.height, this.text.width, this.text.height);
		if(c){
		   this.writeChar(c, tmpx, tmpy);
		}
	    }
	    this.csr.on = !this.csr.on;
	},
	'eraseCursor' : function(){
	    this.ctx.clearRect(this.csr.x*this.text.width, this.csr.y*this.text.height, this.text.width, this.text.height);
	},
	'startCursor' : function(){
			this.csr.interval = setInterval('terminal.drawCursor()', 500);
	},
	'stopCursor' : function(){
			clearInterval(this.csr.interval);
			eraseCursor();
	},
	//character functions
	'writeChar' : function( ch, x, y, color ){
			var incr = false;
			if(color == undefined ) {
			color = this.text.color;
			}
			if(x == undefined){
			     x = this.csr.x;
			     incr = true;
			     this.eraseCursor();
			}
			if(y == undefined){
			    y = this.csr.y;
			    incr = true;
			}
			this.ctx.save();
			//setup context
			this.ctx.font = this.text.font;
			this.ctx.fillStyle = color;
			this.ctx.textBaseline = 'top';
			//save the text to buffer
			this.textBuffer[y][x] = ch;
			//draw the text
			this.ctx.fillText(ch, x*this.text.width, y*this.text.height);			
			if(incr){
			    this.csr.x++;
			    if(this.csr.x > terminal.width){
				this.csr.x = 0;
				this.csr.y ++;
			    }
			}

			this.ctx.restore();
		    }
	};
	



function init(){
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    cvs.width = terminal.width * terminal.text.width;
    cvs.height = terminal.height *(terminal.text.height);
    terminal.cvs = cvs;
    terminal.ctx = ctx;
    //set up buffers
    terminal.textBuffer.length = terminal.height;
    for( i = 0; i < terminal.textBuffer.length; ++i){
	terminal.textBuffer[i] = [];
	terminal.textBuffer[i].length = terminal.width;
    }
    //setup event handlers
    document.onkeypress = keyboardInput;
    //cvs.addEventListener('mousedown',selectEvent, false);
    //cvs.addEventListener('mousemove',selectEvent, false);
    //cvs.addEventListener('mouseup',selectEvent, false);
    //draw some testing stuff
    terminal.startCursor();
    terminal.writeChar('>');
}


function error(msg){
    document.getElementById('errors').innerHTML += '\n<p>' + msg + '</p>';
}



function keyboardInput( ev ){
    var key = ev.keyCode;
    switch(key){
	case 37:
	    if(terminal.csr.x > 0){
		terminal.csr.on = false;
		terminal.drawCursor();
		terminal.csr.x--;
	    }
	    break;
	case 38:
	    if(terminal.csr.y > 0){
		terminal.csr.on = false;
		terminal.drawCursor();
		terminal.csr.y--;
	    }
	    break;
	case 39:
	    if(terminal.csr.x < terminal.width){
		terminal.csr.on = false;
		terminal.drawCursor();
		terminal.csr.x++;
	    }
	    break;
	case 40:
	    if( terminal.csr.y < terminal.height){
		terminal.csr.on = false;
		terminal.drawCursor();
		terminal.csr.y++;
	    }
	    break;
	case 13:
	    terminal.eraseCursor();
	    terminal.csr.y ++;
	    terminal.csr.x = 0;
	    terminal.writeChar('>');
	    break;
	case 8 : //backspace
	    if(terminal.csr.x > 0){
		terminal.csr.on = false;
		terminal.drawCursor();
		terminal.csr.x--;
		terminal.eraseCursor();
		terminal.textBuffer[terminal.csr.y][terminal.csr.x] = undefined;
	    }
	    break;
	default:
	    key = String.fromCharCode(ev.which);
	    terminal.writeChar(key);
    }
}
/*
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
*/
