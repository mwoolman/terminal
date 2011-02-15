var debug = false;

var term = undefined;
var altTerm = undefined;
var container = undefined;

var maincvs = undefined;
var altcvs = undefined;

var swaped = false;

var copyBuffer = '';

function terminal(cnvs, height, width){
    terminal.prototype.constructor(cnvs, height, width);
    //add csr info
    var normalColors = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#C0C0C0'];
    var brightColors = ['#808080', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF' ];
    this.colors = normalColors;
    //NOTE: blink.on = true means the cursor is currently not drawn
    this.blink = { on : false, interval: undefined, blinkrate : 500};
    //add text stuff

    this.text = {bgcolor : undefined, color : undefined };
    this.setColors = function( bColors, nColors ){
	if( bColors.length != brightColors.length  || nColors != normalColors.length ){
	    return; //rudimentary checking;
	}else{
	    normalColors = nColors;
	    brightColors = bColors;
	}
    }
    this.getColors = function(){
	return {bright: brightColors, dark: normalColors };
    };
    //members
    this.setBright = function(){
	this.colors = brightColors;
    }
    this.setDark = function(){
	this.colors = normalColors;
    }
    //cursor
    this.drawCursor = function(){
	var x = this.csr.x;
	var y = this.csr.y;
	var c = this.charAt(this.csr.x, this.csr.y);
	var bgcolor = this.text.bgcolor;
	if( bgcolor == undefined){
	    bgcolor = this.background;
	}
	if( this.blink.on){
		this.drawBlock(x,y);
		if( c != undefined) {
			this.writeChar(c,x,y, bgcolor);
		}
	}else{
		this.drawBlock(x,y, bgcolor);
		if( c != undefined ){
			this.writeChar(c,x,y );
		}
	}
	this.blink.on = !this.blink.on;
    };

    this.startCursor = function(){
	if( this.blink.interval == undefined ){
	    this.blink.interval = setInterval('term.drawCursor()', this.blink.blinkrate );
	}
    };

    this.stopCursor = function(){
	    clearInterval(this.blink.interval);
	    this.blink.interval = undefined;
	    if( !this.blink.on ){
	    this.clearCursor();
	    }
	    this.blink.on = true;
    };

    //draw block
    this.drawBlock =  function(x, y, color ){
	    this.drawRegion( x, y, 1, 1, color);
    };
    //print
    this.print = function (msg, color){
	if( msg == undefined ){
		return;
	}
	if( color == undefined){
	    color = this.text.color;
	}
	this.clearCursor();
	var x = this.csr.x;
	var y = this.csr.y;
	if( x + msg.length > this.width ){
	    this.print(msg.substr(0, this.width-x));
	    this.print(msg.substr(this.width-x));
	}else{
	    this.writeStr(msg, x, y, color, this.text.bgcolor );
	    for( var i = 0; i < msg.length; ++i){
		this.incCursor();
	    }
	}
    };
    this.backspace = function(){
	    this.clearCursor();
	    if( this.csr.x > 0 ){
		    this.__proto__.csr.x--;
		    this.__proto__.textBuffer[this.csr.y][this.csr.x] = undefined;
	    }
    };
    this.newline = function (){
	    this.clearCursor();
	    if( this.csr.y < this.height-1){
		    this.__proto__.csr.y++;
		    this.__proto__.csr.x = 0;
	    }else{
		this.__proto__.csr.x = 0;
		this.scrollUp();
	    }
    };
    this.cr = function(){
	this.__proto__.csr.x = 0;
    };
    this.clearCursor = function (){
	if( !this.blink.on ){
	    var c = this.charAt(this.csr.x, this.csr.y);
	    this.clearBlock(this.csr.x, this.csr.y);
	    if( c != undefined ){
		    this.writeChar(c, this.csr.x, this.csr.y);
	    }
	}
    };
    this.cursorTo = function (x, y){
	if(x == undefined || y == undefined ){
	    return;
	}
	if( x < 0 || x >= this.width || y < 0 || y >= this.height ){
	    if(x < 0){
		x = 0;
	    }else if(x >= this.width){
		x = this.width -1;
	    }
	    if(y < 0){
		y = 0;
	    }else if(y >= this.height){
		y = this.height -1;
	    }
	}
	this.clearCursor();
	this.setCursor( x , y);
    };

    
}

terminal.prototype = new terminalGrid;



function init(){
    container = document.getElementById('container');  
    maincvs = document.createElement('canvas');
	//canvas height width
    term = new terminal(maincvs, 24, 80);
    altcvs = document.createElement('canvas');
    altTerm = new terminalGrid(altcvs, 24, 80);
    container.appendChild( maincvs);
    container.appendChild( altcvs);
    altcvs.style.display = 'none';
    //setup event handlers
    document.onkeypress = keyboardInput;
    document.onkeyup = backspaceHandler;
    //register mouse handler for selection
    maincvs.onmousedown = beginSelect;
    altcvs.onmousedown = beginSelect;
    socket.connect();
    term.startCursor();
    document.oncopy = copyTest;
    document.onpaste = pasteFunc; 
    createColorWidget();
}

function pasteFunc(ev){ 
    socket.send(ev.clipboardData.getData('Text')); 
}

function copyTest(ev){
    var el = document.getElementById('copybuff');
    el.value = copyBuffer;
    el.select();
    document.execCommand('copy');
}

function swapBuffers(){
    var tmp = term.__proto__;
	term.__proto__ = altTerm;
	altTerm = tmp;
    if( !swaped){
	maincvs.style.display = 'none';
	altcvs.style.display = 'block';
    }else{
	maincvs.style.display = 'block';
	altcvs.style.display = 'none';
    }
    swaped = !swaped;
}

function error(msg){
    var el = document.createElement('p');
    el.innerHTML = msg;
    document.getElementById('errors').appendChild(el);
}

//create a tokenizer ideally parse stuff more correctly and
//print stuff more efficiently
function tokenize( msg ){
    var state = 'init';
    var token = '';
    var startIdx;
    var tokenList = [];
    var args = [];
    for( var i = 0; i < msg.length ; ++i ){
	if( state == 'init' ){
	    token = '';
	    args = [];
	    startIdx = i;
	    switch( msg.charAt(i) ){
		case '':
		    state = 'escape'
		    break;
		default:
		    i--;
		    state = 'string';
	    }
	}//end init
	else if( state == 'string' ){
	    switch( msg.charAt(i) ){
		case '':
		    tokenList.push({type : 'string', value : msg.substr(startIdx, i-startIdx) });
		    token = '';
		    state = 'escape';
		    startIdx = i;
		    break;
		case '\n':
		    tokenList.push( {type : 'string', value: msg.substr(startIdx, i-startIdx ) } );
		    tokenList.push( {type : 'special-char', value: function() {term.newline(); } } );
		    state = 'init';
		    break;
		case '':
		    tokenList.push( {type : 'string', value: msg.substr(startIdx, i-startIdx ) } );
		    tokenList.push( {type : 'special-char', value: function(){term.backspace(); }} );
		    state = 'init';
		    break;
		case '\r':
		    tokenList.push( {type : 'string', value: msg.substr(startIdx, i-startIdx ) } );
		    tokenList.push( {type : 'special-char', value: function(){term.cr(); }} );
		    state = 'init';
		    break;
		default:
	    }
	}//end string state 
	else if( state == 'escape' ){
	    switch(msg.charAt(i) ){
		case '[' :
		    state = 'vt100';
		    break;
		case '('://am basically ignoring the charset stuff
		case ')':
		    state = 'charset';
		    break;
		case ']':
		    state = 'xterm'
		    break;
		case '=':
		case '>':
		    error("don't know how to deal with " + msg.substr(startIdx) );
		    state = 'init';
		    break;
	    }
	}//end escape
	else if( state == 'xterm' ){
	    switch( msg.charAt(i) ){
		case '0':
		case '1':
		case '2':
		    args.push( parseInt( msg.charAt(i) ));
		    break;
		case ';':
		    state = 'xterm-str';
		    startIdx = i+1;
		    break;
		default:
		    error("saw an xterm sequence I didn't recognize " + msg.substr( startIdx ) );
		    state = 'init';
	    }
	}//end of xterm
	else if( state == 'xterm-str' ){
	    switch( msg.charAt(i) ){
		case '':
		    tokenList.push({type: 'xterm', value : processXterm( msg.substr(startIdx, i-startIdx), args[0]) });
		    state = 'init';
		    break;
		default:
		    break;
	    }
	}//end of xterm-str
	else if ( state == 'charset' ){
	    //don't really care to implement charset
	    // this will be enough to read off one charset designator and
	    //continue tokenizeing
	    state = 'init';
	}else if( state == 'vt100'){
	   switch( msg.charAt(i) ){
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		    token += msg.charAt(i);
		    state = 'vt-argument';
		break;
		case 'f':
		case 'H':
		    tokenList.push( {type: 'set-attr', value : cursorMoveTo(0,0), id: 'move cursor' }); 
		    state= 'init';
		    break;
		case 'r':
		    tokenList.push( {type : 'set-attr', value: resetScrollRegion(), id: 'set scroll region' } );
		    state= 'init';
		    break;
		case 'm':
		    tokenList.push( {type : 'set-attr', value : setDisplay(), id: 'set display properties' } );
		    state= 'init';
		    break;
		case 'K':
		    tokenList.push( {type: 'set-attr', value : clearLine(), id: 'clear line' } );
		    state= 'init';
		    break;
		case 'J':
		    tokenList.push( {type: 'set-attr', value: clearVert(), id: 'clear vert' } );
		    state= 'init';
		    break;
		case 'S':
		    tokenList.push( {type: 'set-attr', value: scroll(1), id: 'scroll up' } );
		    state= 'init';
		    break;
		case 'A':
		    tokenList.push( {type: 'set-attr', value : cursorMove(-1,0), id: 'cursor up' } );
		    state= 'init';
		    break;
		case 'B':
		    tokenList.push( {type: 'set-attr', value : cursorMove(1,0), id: 'cursor down' } );
		    state= 'init';
		    break;
		    
		case 'C':
		    tokenList.push( {type: 'set-attr', value : cursorMove(0,1), id: 'cursor forward' } );
		    state= 'init';
		    break;
		case 'D':
		    tokenList.push( {type: 'set-attr', value : cursorMove(0,-1), id: 'cursor backward' } );
		    state= 'init';
		    break;
		case '?':
		    //am ignoring this for now
		    state = 'hide-show';
		    break;
		
		}
	}//end of vt100
	else if( state == 'hide-show' ){
	    switch( msg.charAt(i) ){
		case 'h':
		case 'l':
		    tokenList.push( {type : 'set-attr', value : hideshow( parseInt(token ), msg.charAt(i) ), id : 'hide show command'} );
		    state = 'init';
		break;
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		    token += msg.charAt(i);
		    break;
		default:
		    error("recieved unexpected hide-show command ( " + msg.substr(startIdx, i-startIdx) + ' )');
		    state = 'init';
		    break;
	    }
	}//end of hide-show
	else if( state == 'vt-argument' ){
	    switch( msg.charAt(i) ){
		case ';':
		    args.push(parseInt(token));
		    token = '';
		    break;
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		    token += msg.charAt(i);
		    break;
		case 'f':
		case 'H':
		    args.push( parseInt(token) );
		    if( args.length == 2 ){
			tokenList.push( {type: 'set-attr', value : cursorMoveTo(args[1]-1, args[0]-1),id: 'move cursor' , args : args});
		    } else if( args.length == 1){
			tokenList.push( {type: 'set-attr', value : cursorMoveTo(0, args[0] -1),id: 'move cursor', args: args });
		    }else{
			error('saw too many arguments to movement token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    } 
		    state = 'init';
		    break;
		case 'r':
		    args.push( parseInt(token) );
		    if( args.length == 2 ){
			tokenList.push( {type : 'set-attr', value: setScrollRegion(args[0], args[1]), id: 'set scroll region' } );
		    }else if( args.length == 1){
			tokenList.push( {type : 'set-attr', value: setScrollRegion(args[0]), id: 'set scroll region' } );
		    }else{
			error('saw too many arguments to scroll region token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'm':
		    args.push( parseInt(token) );
		    tokenList.push( {type : 'set-attr', value : setDisplay(args), id: 'set display ' + args } );
		    state = 'init';
		    break;
		case 'K':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
			tokenList.push( {type: 'set-attr', value : clearLine(args[0]), id: 'clear Line' } );
		    }else{
			error('saw too many arguments to line clear token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'J':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
		    tokenList.push( {type: 'set-attr', value: clearVert(args[0]), id: 'clear vert'} );
		    }else{
			error('saw too many arguments to vertical clear token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'S':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
		    tokenList.push( {type: 'set-attr', value: scroll(args[0]), id: 'scroll up' } );
		    }else{
			error('saw too many arguments to scroll clear token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'A':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
			tokenList.push( {type: 'set-attr', value : cursorMove(-args[0],0), id : 'cursor up' } );
		    }else{
			error('saw too many arguments to a move up token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'B':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
			tokenList.push( {type: 'set-attr', value : cursorMove(args[0],0), id: 'cursor down' } );
		    }else{
			error('saw too many arguments to move down token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'C':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
			tokenList.push( {type: 'set-attr', value : cursorMove(0,args[0]), id: 'cursor forward' } );
		    }else{
			error('saw too many arguments to a move forward token ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
		case 'D':
		    args.push( parseInt(token) );
		    if( args.length == 1 ){
			tokenList.push( {type: 'set-attr', value : cursorMove(0,-args[0]), id: 'cursor backward' } );
		    }else{
			error('saw too many arguments to move backward ' + msg.substr(startIdx, i-startIdx) );
			tokenList.push( {type: 'string', value : msg.substr(startIdx, i-startIdx) } );
		    }
		    state = 'init';
		    break;
	    }
	}//end vt-argument	
	else{
	    error( 'in an unrecognized state ' + state );
	}
    }//end for
    if( state == 'string' ){
	tokenList.push({type: 'string' , value : msg.substr(startIdx ) } );
    }
    return tokenList;
}//end of tokenize

function hideshow( val, hideParam ){
    if( val == 1049 ){
	return function(){
	    if( swaped ){
		altTerm.reset();
	    }
	    swapBuffers( );
	};
    }else if( val == 25 ){
	return function(){
	    if( hideParam == 'l' ){
		term.stopCursor();
	    }else{
		term.startCursor();
	    }
	};
    }else{
	return function() { return ; };
    }	
}	

function processXterm( str, option ){
    return function(){
	if( option == 0 ){
	    document.title = str;
	}//ignore other possibilities
    };
}

function scroll( val ){
    return function() {
	if( val < 0 ){
	    while( val < 0 ){
		term.scrollDown();
		val++;
	    }
	}else{
	    while( val > 0 ){
		term.scrollUp();
		val--;
	    }
	}
	
    };
}

function clearVert( val ){
    if( val == undefined){
	val = 0;
    }
    return function(){
	switch( val ){
	    case 0:
		term.clearRegion(0, term.csr.y, term.width, term.height - term.csr.y);
		break;
	    case 1:
		term.clearRegion(0, 0, term.width, term.csr.y);
		break;
	    case 2:
		term.clearRegion(0,0, term.width, term.height);
		break;
	}	
    };
}

function cursorMove( vert, horiz){
    return function(){
	term.cursorTo(term.csr.x + horiz, term.csr.y + vert );
    };
}

function clearLine( val ){
    if( val == undefined ){
	val = 0;
    }   
    return function(){
	switch( val ){
	    case 0:
		term.clearRegion( term.csr.x, term.csr.y, term.width - term.csr.x, 1 );
		break;
	    case 1:
		term.clearRegion( 0, term.csr.y, term.csr.x, 1 );
		break;
	    case 2:
		term.clearRegion(0, term.csr.y, term.width, 1);
		break;
	    default:
		error('saw invalid parameter to clear line \'' + val + '\'' );
	}
    };
}

    
function setDisplay(args ){
    if( args == undefined ){
	return function(){
	    term.text.color = undefined;
	    term.text.bgcolor = undefined;
	};
    }else{
	return function(){
	    for( idx in args ){
		switch(Math.floor(args[idx]/10)){
		    case 0:
			switch(args[idx]){
			    case 0:
				term.text.color = undefined;
				term.text.bgcolor = undefined;
				term.text.attr = undefined;
				//reset attrs
				break;
			    case 1:
				term.setBright();
				//bright
				break;
			    case 2:
				term.setDark();
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
			term.text.color = term.colors[args[idx]%10];
			break;
		    case 4:
			term.text.bgcolor = term.colors[args[idx]%10];
			break;
		    default:
			break;
		}//end switch
	    }//end for
	};//end function
    }
}

function resetScrollRegion( ){
    error(' attempted to reset scroll region' );
    return setScrollRegion( 0, term.height );
}

function setScrollRegion( start, end ){
    if( end == undefined ){
	end = term.height;
    }
    if( start == undefined ){
	start = 0;
    }
    return function(){
	term.setScrollRegion( start-1, end );
    };
}

function cursorMoveTo(col, row){
    return function(){
	term.cursorTo( col, row );
    };
}


var socket = new io.Socket(null, {port:8081 }); 


function processTokens( tokens ){
    for( idx in tokens ){
	if( tokens[idx].type == 'string' ){
	    term.print( tokens[idx].value );
	}else if( tokens[idx].type == 'xterm' ){
	    tokens[idx].value();
	}else if( tokens[idx].type == 'set-attr'){
	    tokens[idx].value();
	}else if( tokens[idx].type == 'special-char'){
	    tokens[idx].value();
	}else{
	    error('saw an unrecognized token of type \'' + tokens[idx].type + '\'');
	}
    }
		document.getElementById('coords').innerHTML = "x: " + term.csr.x + " y: " + term.csr.y;
}

socket.on('message', function (msg){
	if( debug ){
	    error( 'csr x: ' + term.csr.x + ' y: ' + term.csr.y);
	    error(msg);
	}
	tokens = tokenize(msg );
	processTokens( tokens );
});

function enableDebug(){
    debug = true;
}

function disableDebug(){
    debug = false;
}


function sendbackspace(){
	    socket.send('');
}

function sendEscape(){
	socket.send('');
}

function backspaceHandler( ev ) {
    var key = ev.keyCode;
    switch( key ) {
	case 8:
	    socket.send('');
	    break;
	default:
	    break;
    }
}


function endSelection( ev ){
    term.cvs.onmousemove = undefined;
    term.cvs.onmouseup = undefined;
    var coords = term.getCoords( ev.x, ev.y );
    term.endSel( coords.x, coords.y );
}

function enlargeSelection( ev ){
    var coords = term.getCoords( ev.x, ev.y );
    term.endSel( coords.x, coords.y );
}

function beginSelect( ev ){
    //if( ev.button ==2 ){
//	socket.send(copyBuffer);
    //}else{
	var coords = term.getCoords( ev.x, ev.y );
	term.beginSel( coords.x, coords.y);
	term.cvs.onmousemove = enlargeSelection;
	term.cvs.onmouseup = endSelection;
	term.cvs.onclick = undefined;
    //}
}

function keyboardInput( ev ){
    var key = ev.keyCode;
    switch(key){
	case 16:
	case 17:
	    break;//saw a shift
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
	    socket.send('\n');
	    break;
	case 8 : //backspace
	    socket.send('');
	    break;
	default:
	    key = String.fromCharCode(ev.which);
	    socket.send(key);
	    //term.print(key);
    }
}
