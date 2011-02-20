
function terminalGrid( cnvs, height, width ){
	if( cnvs == undefined ){
	    return;
	}
	//var ctx = cnvs.getContext('2d');
	if( height == undefined){
		height = 24;
	}
	if( width == undefined ){
		width = 80;
	}
	cnvs.width = width;
	cnvs.height = height;

	var textBuff = [];
	textBuff.length = height;
	for( i = 0; i < height ; i++){
		textBuff[i] = [];
		textBuff[i].length = width;
	}
	//create terminal structure
	this.width = width;
	this.height = height;
	this.background = 'black';
	this.scrollRegion = {start: 0, end: height};
	this.csr = {'x' : 0, 'y': 0 };
	this.text =  {color : '#009900', font : '15px courier', width : 9, height : 15 };
	this.sel =  {'on' : false, 'sx' : 0, 'sy' : 0, 'ex':0, 'ey' : 0};
	this.textBuffer =  textBuff;
	this.cvs =  cnvs;
	this.ctx =  cnvs.getContext('2d');
    
	//member functions
	//color default changers
	this.getTextDefault = function(){
		if( this.__proto__ instanceof terminalGrid ){
			return this.__proto__.getTextDefault();
		}else{
			return this.text.color;
		}
	}
	this.setBackGround = function (bgcolor ){
		if( this.__proto__ instanceof terminalGrid ){
			this.__proto__.setBackGround(bgcolor);
		}else{
			this.background = bgcolor;
			this.cvs.style.background = bgcolor;
		}
	};
	this.setTextColor = function (textColor ){
		if( this.__proto__ instanceof terminalGrid ){
			this.__proto__.setTextColor(textColor);
		}else{
			this.text.color = textColor;
		}

	}
	//selection methods
	//translate canvas x y into grid coordinates
	this.getCoords = function( x_t, y_t){
	    if( this.__proto__ instanceof terminalGrid ){
		return this.__proto__.getCoords(x_t, y_t);
	    }else{
		return { x: Math.floor( (x_t - this.cvs.offsetLeft - 4 )/ this.text.width ),
			 y: Math.floor( (y_t - this.cvs.offsetTop  - 4) / this.text.height ) };
	    }
	};
	
	this.endSel = function( x, y ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.endSel(x, y);
	    }else{
		if( this.sel.ex != x || this.sel.ey != y ){
		    this.drawSel(true);
		    this.sel.ex = x;
		    this.sel.ey = y;
		    this.drawSel(false);
		}
	    }
	};
	this.beginSel = function( x, y ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.beginSel(x, y);
	    }else{
		if( this.sel.sx != this.sel.ex || this.sel.ey != this.sel.sy){
		    this.drawSel(true);
		}
		this.sel.sx = x;
		this.sel.sy = y;
		this.sel.ex = x;
		this.sel.ey = y;
	    }
	};
	this.drawSel = function(invert){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.drawSel(x, y);
	    }else{
		var curx, cury, stopx, stopy, tc, bc;
		if( this.sel.ey >= this.sel.sy){ 
		    cury = this.sel.sy; 
		    stopy = this.sel.ey;
		} else { 
		    cury = this.sel.ey;
		    stopy = this.sel.sy;
		}
		if( this.sel.ex >= this.sel.sx){
		    curx = this.sel.sx;
		    stopx = this.sel.ex;
		}else{
		    curx = this.sel.ey;
		    stopx = this.sel.sx;
		}
		if(invert){
		    tc = this.text.color;
		    bc = this.background;
		}else{
		    tc = this.background;
		    bc = this.text.color;
		}
		copyBuffer = '';
		//loop over selection and highlight
		while( curx != stopx || cury != stopy ){
		    this.drawRegion(curx, cury,1,1, bc);
		    this.writeChar(this.textBuffer[cury][curx], curx, cury, tc );
		    if( this.textBuffer[cury][curx] == undefined ){
			copyBuffer += ' ';
		    }else{
			copyBuffer += this.textBuffer[cury][curx];
		    }
		    curx++;
		    if( curx >= this.width ){
			copyBuffer += '\n';
			cury++;
			curx = 0;
		    }
		}
	    }
	    
	};
	//---------------------------------------------
	//resets stuff
	this.reset = function(){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.reset();
	    }else{
		this.clearRegion(0,0, this.width, this.height );
		this.csr.x = 0;
		this.csr.y = 0;
	    }
	};
    
	this.setScrollRegion =  function( start, end){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.setScrollRegion(start, end);
	    }else{
		if( start == undefined ){
		    start = 0;
		    end = this.height;
		}
		this.scrollRegion.start = start;
		this.scrollRegion.end = end;
	    }
	};
	//cursor Fuctions

	this.drawRegion = function (x, y, width, height, color ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.drawRegion(x, y, width, height, color);
	    }else{
		if( color == undefined ){
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
		this.ctx.fillRect( x* this.text.width, y * this.text.height, this.text.width * width, this.text.height * height );
		this.ctx.restore();

	    }
	    
	};

	this.clearRegion =  function(x,y, width, height){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.clearRegion(x, y, width, height);
	    }else{
		this.ctx.save();
		this.ctx.clearRect(x*this.text.width, y*this.text.height, this.text.width * width, this.text.height * height);
		for( var i = x; i < x+width; ++i){
		    for( var j = y; j < y+height; ++j){
			this.textBuffer[j][i] = undefined;
		    }
		}
		this.ctx.restore();
	    }
	};
	this.clearBlock =  function(x, y){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.clearBlock(x, y);
	    }else{
		//default to clearing the cursor position
		if(x == undefined ){
			x  = this.csr.x;
		}
		if( y == undefined){ 
			y  = this.csr.y;
		}
		//clear the rectangle
		this.clearRegion(x, y, 1, 1);
	    }
	};
	
	this.writeStr = function( str, x, y, color, bgcolor ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.writeStr( str, x,y, color, bgcolor );
	    }else{
		if(color == undefined ) {
		color = this.text.color;
		}
		if(x == undefined){
		     x = this.csr.x;
		}
		if(y == undefined){
		    y = this.csr.y;
		}
		if(bgcolor == undefined ){
		    bgcolor = this.background;
		}
		this.ctx.save();
		//set up context
		this.ctx.font = this.text.font;
		this.ctx.fillStyle = color;
		this.ctx.textBaseline = 'top';
		this.drawRegion(x, y, str.length, 1, bgcolor );
		//save stuff to text buffer
		for( var i = 0; i < str.length; ++i ){
		    this.textBuffer[y][x+i] = str.charAt(i);
		}
		//render text
		this.ctx.fillText( str, x*this.text.width, y*this.text.height );
		this.ctx.restore();

	    }
	}
	
	//character functions
	this.writeChar =  function( ch, x, y, color ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.writeChar( ch, x, y, color );
	    }else{
		if( ch == undefined ){
		    return;
		}
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
	    }
	};
	this.incCursor =  function () {
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.incCursor();
	    }else{
		this.csr.x++;
		if ( this.csr.x >= this.width ){
			this.csr.x = 0;
			this.csr.y++;
		}
		if(this.csr.y >= this.height){
		    this.csr.y--;
		    this.scrollUp();
		}
		document.getElementById('coords').innerHTML = "x: " + this.csr.x + " y: " + this.csr.y;
	    }
	};
	this.setCursor =  function (x,y ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.setCursor(x, y);
	    }else{
		if( x == undefined || y == undefined ){
			return;
		}else{
			this.csr.x = x;
			this.csr.y = y;
		}
	    }
	};
	this.resize =  function ( height, width ){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.resize(height, width);
	    }else{
		if( width == undefined || height == undefined){
			return;
		}
		this.cvs.width = width * this.text.width;
		this.cvs.height = height * this.text.height;
		this.width = width;
		this.height = height;
	    }
	};
	this.charAt =  function (x,y) {
		if( x == undefined || y == undefined){
			return undefined;
		}
		if( x < 0 || x > this.width || y < 0 || y > height ){
			return undefined;
		}
		return this.textBuffer[y][x];
	};
	this.scrollUp =  function (){
	    if( this.__proto__ instanceof terminalGrid ){
		this.__proto__.scrollUp();
	    }else{
		this.ctx.save();
		var i_data = this.ctx.getImageData(0,(this.scrollRegion.start +1) * this.text.height,this.cvs.width, (this.scrollRegion.end * this.text.height) - this.text.height);
		this.ctx.putImageData(i_data, 0, this.scrollRegion.start*this.text.height);
		this.ctx.clearRect(0, (this.scrollRegion.end-1)*this.text.height, this.cvs.width, this.text.height);
		var newline = [];
		newline.length = this.width;
		//splice out the line which has scrolled off the screen
		this.textBuffer.splice(this.scrollRegion.start,1);
		//splice in the new line buffer
		this.textBuffer.splice(this.scrollRegion.end-1,0, newline);
		this.ctx.restore();
	    }
	    
	};

	this.resize(height, width);
    return true;
}//end of create terminal

