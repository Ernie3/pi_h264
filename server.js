const http = require("http")
const os = require("os")
const netInt = os.networkInterfaces()
const fs = require("fs")
const streamer = require("./streamer.js")
const config = require('./config.json');

let port = config.port;
console.log("Starting server on +:" + port);

let server = http.createServer(function(req,res) {
	console.log("==> new connection: " + req.connection.remoteAddress + ", url: " + req.url);
	
	let filename = req.url == "/" ? "/index.html" : req.url;
	let method = req.method.toLowerCase();

	if(method === "get") {
		let file = fs.createReadStream("www" + filename);
		file.on("error", function(err){
			console.log("Can't open file, err: "+err)
		});
		file.pipe(res);
	}

}).listen(port);

let stream;

// socket.io
let io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.emit('data', { data: 'Hi from server' });

  socket.on('data', function (data) {
    console.log(data);
  });

  socket.on("start_stream", function(data) {
  	console.log("==> start_stream");
  	startStream(socket);
  });

  socket.on("stop_stream", function(data) {
  	console.log("==> stop_stream");
  	stopStream();
  });
});

let currentlyStreaming = false;

function startStream(socket) {
	// if stream is already running
	// stop that one for new one
	if(currentlyStreaming) {
		stopStream(socket);
	}
	currentlyStreaming = true;

	stream = new streamer.start(socket);
}

function stopStream(socket) {
	console.log("==> stoping stream");

	try {
		stream.kill();
	} catch(err) {
		console.error(err);
	}
}

console.log("Server started from smb!");
console.log(netInt);
