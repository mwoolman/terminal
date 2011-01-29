


term = {
		't' : undefined,
		'csr' : {
				'x' : 0, 
				'y': 0, 
				'on' : false, 
				'interval' : undefined, 
				'blinkrate' : 500},
		'text' : {'color' : undefined, 'bgcolor' : undefined},
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
			if( color == undefined){
			    color = this.text.color;
			}
			this.clearCursor();
			var	x = this.csr.x;
			var	y = this.csr.y;
			for( i = 0; i < msg.length; ++i ){
				if( this.text.bgcolor != undefined ){
				    this.t.drawBlock(x+i, y, this.text.bgcolor);
				}
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
			if( this.csr.y < this.t.height-1){
				this.csr.y++;
				this.csr.x = 0;
				this.t.csr.x = 0;
				this.t.csr.y++;
			}else{
			    this.csr.x = 0;
			    this.t.csr.x = 0;
			    this.t.scrollUp();
			}
			//this.print('>');
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
    //term.print('>');
 //   	startCursor();
	printData();
}
var strs = data.split('\n');
var line = 0;
function printData(){
	renderVt100(strs[line]);
	line++;
	if(line < strs.length){
		setTimeout('printData()', 500);
	}
}


function error(msg){
    document.getElementById('errors').innerHTML += '\n<p>' + msg + '</p>';
}


function processEscape(msg){
    var state = 'invalid';
    var token = '';
    var args = [];
    var lastidx = 0;
    for( var idx in msg.split('')){
	switch(msg.charAt(idx)){
	    case '[':
		break;
	    case '0':
	    case '1':
	    case '2':
	    case '3':
	    case '4':
	    case '5':
	    case '6':
	    case '9':
		token += msg.charAt(idx);
		break;
	    case ';':
		args.push(parseInt(token));
		token = '';
		break;
		case 'm':
		state = 'done';
		args.push(parseInt(token));
		token = msg.charAt(idx);
		break;	
	    default:
		state = 'done';
	}
	if( state == 'done' ){
	    lastidx = Number(idx)+1;
	    break;
	}
    }
    if( token == 'm'){
	var colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
	for( idx in args ){
	    switch(Math.floor(args[idx]/10)){
		case 0:
		    switch(args[idx]){
			case 0:
			    term.text.color = undefined;
			    term.text.bgcolor = undefined;
			    //reset attrs
			    break;
			case 1:
			    //bright
			    break;
			case 2:
			    //dim
			    break;
			case 4:
			    //underscore
			    break;
			case 5:
			    //blink
			    break;
			case 7:
			    //Reverse
			    break;
			case 8:
			    //Hidden
			    break;
		    }
		    break;
		case 3:
		    term.text.color = colors[args[idx]%10];
		    break;
		case 4:
		    term.text.bgcolor = colors[args[idx]%10];
		    break;
		default:
		    break;
	    }
	}
    }
    return lastidx;   
}
    
function renderVt100(msg){
    for(var i = 0; i < msg.length; i++){
	var curr = msg.charAt(i);
	if( msg.charAt(i) == '' ){
	    //error("msg is : " + msg );
	    //error("i is " + i + " before processing Escape");
	    i += Number( processEscape(msg.substr(i+1)));
	    var newcurr = msg.charAt(i);
	    //error("i is " + i + " after processing Escape");
	}else{
	term.print(msg.charAt(i));
	}
    }
    term.newline();
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
		term.print('>');
	    break;
	case 8 : //backspace
		term.backspace();
	    break;
	default:
	    key = String.fromCharCode(ev.which);
	    term.print(key);
    }
}
