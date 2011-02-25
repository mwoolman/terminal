Terminal
========

a terminal emulator written in javascript rendering onto a canvas element.  Uses a node.js server and socket.io transport to communicate with a terminal process running on a server.

Installation
-------------

* checkout the project source
* install [Node.js] (http://github.com/ry/node/tree/master) if you haven't already 
* install the [socket.io library] (http://socket.io/)
* go to the terminal source directory and run: `node server.js`
* visit localhost:8081 in the browser of your choice -- works best in chrome 

Notes
-----

If you want window resizing to work then you will need to patch node.js 
enter the node src directory and fix line 298 by changing
    `NODE_SET_METHOD(target, "setWindowSize", GetWindowSize);`
  to
    `NODE_SET_METHOD(target, "setWindowSize", SetWindowSize);`
