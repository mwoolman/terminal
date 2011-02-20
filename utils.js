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

	currEl  = document.createElement('td');
	currEl.innerHTML = "Bright Colors";
	currEl.className = "label";
	br.appendChild(currEl);
	//create color elements
    for( idx in colors.bright ){
		currEl  = document.createElement('td');
		currEl.style.background = colors.bright[idx];
		//save reference to the element for later use
		brightRow.push(currEl);
		br.appendChild(currEl);
    }

    br = br.nextElementSibling;
	currEl  = document.createElement('td');
	currEl.className = "spacer";
	br.appendChild(currEl);

    for( idx in colors.bright ){
		currEl  = document.createElement('td');
		var txt = document.createElement('input');
		txt.type = 'text';
		txt.value = colors.bright[idx];
		currEl.appendChild(txt);
		setBrightRow.push(txt);
		br.appendChild(currEl);
    }
    br = br.nextElementSibling;
    // dark colors
	currEl  = document.createElement('td');
	currEl.innerHTML = "Normal Colors";
	currEl.className = "label";
	br.appendChild(currEl);

    for( idx in colors.dark ){
		currEl  = document.createElement('td');
		currEl.style.background = colors.dark[idx];
		darkRow.push(currEl);
		br.appendChild(currEl);
    }
    br = br.nextElementSibling;
	currEl  = document.createElement('td');
	currEl.className = "spacer";
	br.appendChild(currEl);
    for( idx in colors.dark ){
		currEl  = document.createElement('td');
		var txt = document.createElement('input');
		txt.type = 'text';
		txt.value = colors.dark[idx];
		currEl.appendChild(txt);
		setDarkRow.push(txt);
		br.appendChild(currEl);
    }
	//background
	br = br.nextElementSibling;
	currEl  = document.createElement('td');
	currEl.innerHTML = "background";
	currEl.className = "label";
	br.appendChild(currEl);
	currEl = document.createElement('td');
	currEl.style.background = term.background;
	bgDefault.push(currEl);
	br.appendChild(currEl);
	//text color
	currEl  = document.createElement('td');
	currEl.innerHTML = "Text Color";
	currEl.className = "label";
	br.appendChild(currEl);
	currEl = document.createElement('td');
	currEl.style.background = term.getTextDefault();
	txtDefault.push(currEl);
	br.appendChild(currEl);
	//color selector
	br = br.nextElementSibling;
	currEl  = document.createElement('td');
	currEl.className = "spacer";
	br.appendChild(currEl);
	currEl = document.createElement('td');
	var txt = document.createElement('input');
	txt.type = 'text';
	txt.value = term.background;
	currEl.appendChild(txt);
	bgDefault.push(txt);
	br.appendChild(currEl);
	//text color selector
	currEl  = document.createElement('td');
	currEl.className = "spacer";
	br.appendChild(currEl);
	currEl = document.createElement('td');
	var txt = document.createElement('input');
	txt.type = 'text';
	txt.value = term.getTextDefault();
	currEl.appendChild(txt);
	txtDefault.push(txt);
	br.appendChild(currEl);
    
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
