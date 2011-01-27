
function createTerminal( cnvs, height, width ){
	var ctx = cnvs.getContext('2d');
	if( height == undefined){
		height = 24;
	}
	if( width == undefined ){
		width = 80;
	}
	cvs.width = width;
	cvs.height = height;

	var textBuff = [];
	textBuff.length = height;
	for( i = 0; i < height ; i++){
		textBuff[i] = [];
		textBuff[i].length = width;
	}
	//create terminal structure

	var t =	{
	'width' : width,
	'height' : height,
	'background': 'black',
	'csr' : {'x' : 0, 'y': 0 },
	'text' : {'color' : '#009900', 'font' : '15px courier', 'width' : 9, 'height' : 15 },
	'sel' : {'on' : false, 'sx' : 0, 'sy' : 0, 'ex':0, 'ey' : 0},
	'textBuffer' : textBuff,
	'cvs' : cnvs,
	'ctx' : ctx,
	//member functions
	//cursor Fuctions
	'drawBlock' : function(x, y, color ){
		if( color == undefined){
			color = this.text.color;
		}
		if( y == undefined){
			y = this.csr.y;
		}
		if( x == undefined){
			x  = this.csr.x;
		}
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x*this.text.width, y * this.text.height, this.text.width, this.text.height);
		this.ctx.restore();
	},
	'clearBlock' : function(x, y){
		//default to clearing the cursor position
		if(x == undefined ){
			x  = this.csr.x;
		}
		if( y == undefined){ 
			y  = this.csr.y;
		}
		//clear the rectangle
	    this.ctx.clearRect(x*this.text.width, y*this.text.height, this.text.width, this.text.height);
	},
	//character functions
	'writeChar' : function( ch, x, y, color ){
			if(color == undefined ) {
			color = this.text.color;
			}
			if(x == undefined){
			     x = this.csr.x;
			}
			if(y == undefined){
			    y = this.csr.y;
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
			this.ctx.restore();
		    },
		'incCursor' : function () {
			this.csr.x++;
			if ( this.csr.x >= this.width ){
				this.csr.x = 0;
				this.csr.y++;
			}
		},
		'setCursor' : function (x,y ){
			if( x == undefined || y == undefined ){
				return;
			}else{
				this.csr.x = x;
				this.csr.y = y;
			}
		},
		'resize' : function ( height, width ){
			if( width == undefined || height == undefined){
				return;
			}
			this.cvs.width = width * this.text.width;
			this.cvs.height = height * this.text.height;
			this.width = width;
			this.height = height;
		},
		'charAt' : function (x,y) {
			if( x == undefined || y == undefined){
				return undefined;
			}
			if( x < 0 || x > this.width || y < 0 || y > height ){
				return undefined;
			}
			return this.textBuffer[y][x];
		}
	};
	t.resize(height, width);
	return t;
}


term = {
		't' : undefined,
		'csr' : {
				'x' : 0, 
				'y': 0, 
				'on' : false, 
				'interval' : undefined, 
				'blinkrate' : 500},
		'drawCursor' : function(){
			var x = this.csr.x;
			var y = this.csr.y;
			var c = this.t.charAt(this.csr.x, this.csr.y);
		 	if( this.csr.on){
				this.t.drawBlock(x,y);
				if( c != undefined) {
					this.t.writeChar(c,x,y, this.t.background);
				}
			}else{
				this.t.clearBlock(x,y);
				if( c != undefined ){
					this.t.writeChar(c,x,y );
				}
			}
			this.csr.on = !this.csr.on;
		},
		//dont like this, get rid of if not needed
		'incCursor' : function(){
			this.t.incCursor();
			this.csr.x = this.t.csr.x;
			this.csr.y = this.t.csr.y;
		},
		'print' : function (msg, color){
			if( msg == undefined ){
				return;
			}
			this.clearCursor();
			var	x = this.csr.x;
			var	y = this.csr.y;
			for( i = 0; i < msg.length; ++i ){
				this.t.writeChar( msg.charAt(i), x+i, y, color );
				this.incCursor();
			}
		},
		'backspace' : function(){
			this.clearCursor();
			if( this.csr.x > 0 ){
				this.csr.x--;
				this.t.csr.x--;
				this.t.textBuffer[this.csr.y][this.csr.x] = undefined;
			}
		},
		'newline' : function (){
			this.clearCursor();
			if( this.csr.y < this.t.height){
				this.csr.y++;
				this.csr.x = 0;
				this.t.csr.x = 0;
				this.t.csr.y++;
			}
			this.print('>');
		},
		'clearCursor' : function (){
			var c = this.t.charAt(this.csr.x, this.csr.y);
			this.t.clearBlock(this.csr.x, this.csr.y);
			if( c != undefined ){
				this.t.writeChar(c, this.csr.x, this.csr.y);
			}
		},
		'cursorTo' : function (x, y){
			if(x == undefined || y == undefined ){
				return;
			}
			if( x < 0 || x > this.t.width || y < 0 || y > this.t.height ){
				return;
			}
			this.clearCursor();
			this.t.csr.x = x;
			this.t.csr.y = y;
			this.csr.x = x;
			this.csr.y = y;
		}

	};
	

function startCursor(){
	term.csr.interval = setInterval('term.drawCursor()', term.csr.blinkrate );
	
}

function stopCursor(){
	clearInterval(term.csr.interval);
	term.clearCursor();
}


function init(){
    cvs = document.getElementById('cvs');
	//canvas height width
	term.t = createTerminal(cvs, 24, 80);
    //setup event handlers
    document.onkeypress = keyboardInput;
    //cvs.addEventListener('mousedown',selectEvent, false);
    //cvs.addEventListener('mousemove',selectEvent, false);
    //cvs.addEventListener('mouseup',selectEvent, false);
    //draw some testing stuff
    term.print('>');
	startCursor();
}


function error(msg){
    document.getElementById('errors').innerHTML += '\n<p>' + msg + '</p>';
}



function keyboardInput( ev ){
    var key = ev.keyCode;
    switch(key){
	case 37:
		term.cursorTo( term.csr.x - 1, term.csr.y);
	    break;
	case 38:
		term.cursorTo( term.csr.x, term.csr.y - 1);
	    break;
	case 39:
		term.cursorTo( term.csr.x + 1, term.csr.y);
	    break;
	case 40:
		term.cursorTo( term.csr.x, term.csr.y + 1);
	    break;
	case 13:
		term.newline();
	    break;
	case 8 : //backspace
		term.backspace();
	    break;
	default:
	    key = String.fromCharCode(ev.which);
	    term.print(key);
    }
}
