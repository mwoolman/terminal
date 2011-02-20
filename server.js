/**
* read from a file and send through the connection
*/

var http = require('http'),
    url = require('url'),
    fs = require ('fs'),
    sys = require('sys'),
    io = require ('socket.io'),
    spawn = require('child_process').spawn,
    server;
var pth;
server = http.createServer( function (req, res){
    //send a 404 message, shouldn't be asking for stuff from the server
	var path = url.parse(req.url).pathname;
	pth = path;
	console.log('requested: ' + path);
switch (path){
    case '/':
	path = '/terminal.html';
    case '/data.js':
    case '/terminal.html':
    case '/grid.js':
    case '/vt100.js':
    case '/utils.js':
      fs.readFile(__dirname +'/'+ path, function(err, data){
	console.log(__dirname +'/'+ path);
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path.substr(path.length-3) == '.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
	console.log(path);
      break;
      
    default: send404(res);
  }

    
}),

send404 = function(res){
    res.writeHead(404);
    res.write("couldn't find page");
    res.write("url "  + pth);
    res.end();
};


server.listen(8081);
//register clients session with the client object

var io = io.listen(server);

io.on('connection', function(client){
    var proc = spawn("/usr/bin/irssi", ['2>&1']);
    //var proc = spawn('/bin/bash', ['-i']);
    //proc.stdout.setEncoding('utf8');
    //proc.stderr.setEncoding('utf8');
    proc.stdout.on('data', function(data){
	//console.log('stdout: ' + data);
	client.send(data.toString('utf8'));
    });
    proc.stderr.on('data', function(data){
	//console.log('stderr: ')
	//console.log( data);
	client.send(data.toSting('utf8'));

    });
    proc.on('exit', function(code){
	console.log('process exited with code ' + code);
    });
    client.on('message', function(message){
	//console.log('got message ' + message );
	//pass the data through to the process
	if( proc.stdin.writable ){
	    var result = proc.stdin.write(message);
	}
    });
    client.on('disconnect', function(){
	 proc.stdin.end()//end the process
    });
});
