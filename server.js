/**
* read from a file and send through the connection
*/

var http = require('http'),
    url = require('url'),
    fs = require ('fs'),
    sys = require('sys'),
    io = require ('socket.io'),
    tty = require('tty'),
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
    var terminal = tty.open('/bin/bash', ['-ic', 'irssi']);
    var fd = terminal[0];
    var proc = terminal[1];
    console.log(tty.setWindowSize(proc.fds[0], 24, 80));
    //proc.stdout.setEncoding('utf8');
    //proc.stderr.setEncoding('utf8');
    fd.on('data', function(data){
	//console.log('stdout: ' + data);
        client.send(data.toString('utf8'));
    });

    proc.on('exit', function(code){
        console.log('process exited with code ' + code);
    });

    client.on('message', function(message){
        //console.log('got message ' + message );
        //pass the data through to the process
        if( message.substr(0,4) == "[8;"){
            var args = message.split(';');
            var height = parseInt(args[1]);
            var width = parseInt(args[2].substr(0, args[2].length -2));
            console.log("setting window to height: " + height + " width: " + width);
            tty.setWindowSize(proc.fds[0], height, width);
            var res = proc.kill('SIGWINCH');
        }else if( fd.writable ){
            var result = fd.write(message);
        }
    });

    client.on('disconnect', function(){
     proc.kill('SIGKILL');
    });
});
