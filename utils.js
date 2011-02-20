var brightRow =  [];
var setBrightRow = [];
var darkRow = [];
var setDarkRow = [];
var bgDefault = [];
var txtDefault = [];

//color
var DefaultNormalColors = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#C0C0C0'];
var DefaultBrightColors = ['#808080', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF' ];

function createColorWidget(){
    var br = document.getElementById('bright');

    var currEl;
    var colors = term.getColors();
	//label the bright colors cell
	br.appendChild(createCell("Bright Colors", undefined, "label"));
	//create color elements
    for( idx in colors.bright ){
		currEl  = createCell( undefined, colors.bright[idx]);
		//save reference to the element for later use
		brightRow.push(currEl);
		br.appendChild(currEl);
    }

    br = br.nextElementSibling;
	//add spacer
	br.appendChild(createCell( undefined, undefined, "spacer"));

    for( idx in colors.bright ){
		currEl  = createCell();
		var txt = createInputField(colors.bright[idx]);
		currEl.appendChild(txt);
		setBrightRow.push(txt);
		br.appendChild(currEl);
    }

    br = br.nextElementSibling;
    // dark colors
	br.appendChild(createCell("Normal Colors", undefined, "label"));

    for( idx in colors.dark ){
		currEl  = createCell( undefined, colors.dark[idx]);
		darkRow.push(currEl);
		br.appendChild(currEl);
    }

    br = br.nextElementSibling;
	br.appendChild(createCell(undefined, undefined, "spacer"));

    for( idx in colors.dark ){
		currEl  = createCell();
		var txt = createInputField(colors.bright[idx]);

		currEl.appendChild(txt);
		setDarkRow.push(txt);
		br.appendChild(currEl);
    }
	//background
	br = br.nextElementSibling;
	br.appendChild(createCell("background", undefined, 'label'));
	//create the color cell
	currEl = createCell(undefined, term.background, undefined);
	bgDefault.push(currEl);
	br.appendChild(currEl);
	//text color
	br.appendChild(createCell('Text Color', undefined, 'label'));
	currEl = createCell(undefined, term.getTextDefault(), undefined); 
	txtDefault.push(currEl);
	br.appendChild(currEl);
	//color selector
	br = br.nextElementSibling;
	br.appendChild(createCell(undefined, undefined, 'spacer'));
	currEl = createCell();
	var txt = createInputField(term.background);
	currEl.appendChild(txt);
	bgDefault.push(txt);
	br.appendChild(currEl);
	//text color selector
	br.appendChild(createCell(undefined, undefined, 'spacer'));
	currEl = createCell();
	var txt = createInputField(term.getTextDefault());
	currEl.appendChild(txt);
	txtDefault.push(txt);
	br.appendChild(currEl);
    
}


function createCell( text, bg, className ){
	var el = document.createElement('td');
	if( text == undefined ){
		text = "";
	}
	el.innerHTML = text;
	el.style.background = bg;
	el.className = className;
	return el;
}

function createInputField(text ){
	var el = document.createElement('input');
	el.type = 'text';
	el.value = text;
	return el;
}

function showColorSelector(){
    document.getElementById('colors').style.display = 'block';
    
}

function hideColorSelector(){
    document.getElementById('colors').style.display = 'none';
    
}

function setColors(){
	var bColors = [];
	var dColors = [];
	for( idx in setBrightRow ){
		bColors.push(setBrightRow[idx].value);
		dColors.push(setDarkRow[idx].value);
	}
	term.setColors(bColors, dColors);
	var txtDef = txtDefault[1].value;
	var bgDef = bgDefault[1].value;
	term.setTerminalDefaults(bgDef, txtDef);
}

function getKeyboard(){
	document.getElementById('copybuff').focus();
}
