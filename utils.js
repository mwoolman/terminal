var brightRow =  [];
var setBrightRow = [];
var darkRow = [];
var setDarkRow = [];


//color
var DefaultNormalColors = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#C0C0C0'];
var DefaultBrightColors = ['#808080', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF' ];

function createColorWidget(){
    var br = document.getElementById('bright');

    var currEl;
    var colors = term.getColors();
    for( idx in colors.bright ){
	currEl  = document.createElement('td');
	currEl.style.background = colors.bright[idx];
	br.appendChild(currEl);
    }
    br = br.nextElementSibling;
    for( idx in colors.bright ){
	currEl  = document.createElement('td');
	var txt = document.createElement('input');
	txt.type = 'text';
	txt.value = colors.bright[idx];
	currEl.appendChild(txt);
	br.appendChild(currEl);
    }
    br = br.nextElementSibling;
    // dark colors
    for( idx in colors.dark ){
	currEl  = document.createElement('td');
	currEl.style.background = colors.dark[idx];
	br.appendChild(currEl);
    }
    br = br.nextElementSibling;
    for( idx in colors.dark ){
	currEl  = document.createElement('td');
	var txt = document.createElement('input');
	txt.type = 'text';
	txt.value = colors.dark[idx];
	currEl.appendChild(txt);
	br.appendChild(currEl);
    }
    
    
}

function showColorSelector(){
    document.getElementById('colors').style.display = 'block';
    
}

function hideColorSelector(){
    document.getElementById('colors').style.display = 'none';
    
}

