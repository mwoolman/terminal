
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
	'scrollRegion': {start: 0, end: height},
	'csr' : {'x' : 0, 'y': 0 },
	'text' : {'color' : '#009900', 'font' : '15px courier', 'width' : 9, 'height' : 15 },
	'sel' : {'on' : false, 'sx' : 0, 'sy' : 0, 'ex':0, 'ey' : 0},
	'textBuffer' : textBuff,
	'cvs' : cnvs,
	'ctx' : ctx,
	//member functions
	'setScrollRegion' : function( start, end){
	    if( start == undefined ){
		start = 0;
		end = this.height;
	    }
	    this.scrollRegion.start = start;
	    this.scrollRegion.end = end;
	},
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
		if( color == 'blue' ){
		}
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x*this.text.width, y * this.text.height, this.text.width, this.text.height);
		this.ctx.restore();
	},
	'clearRegion': function(x,y, width, height){
	    this.ctx.save();
	    this.ctx.clearRect(x*this.text.width, y*this.text.height, this.text.width * width, this.text.height * height);
	    for( var i = x; i < x+width; ++i){
		for( var j = y; j < y+height; ++j){
		    this.textBuffer[j][i] = undefined;
		}
	    }
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
	    this.clearRegion(x, y, 1, 1);
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
			if(this.csr.y >= this.height){
			    this.csr.y--;
			    this.scrollUp();
			}
			document.getElementById('coords').innerHTML = "x: " + this.csr.x + " y: " + this.csr.y;
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
		},
		'scrollUp' : function (){
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
	t.resize(height, width);
	return t;
}//end of create terminal

