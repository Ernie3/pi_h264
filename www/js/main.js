var socket;
var player;
var fps_display;

var frame_list = [];
var frame_num = 0; //fps counter
var nal_packet_num = 0;
var first_picure = false;

console.log("Host:", document.location.host);

function initPage() {
	console.log("==> initPage")
	fps_display = document.getElementById("fps_id")

	socket = io("http://" + document.location.host);
	
	socket.on("data",function(data){
		console.log("message: " + JSON.stringify(data));
	});

	socket.emit("data", { data:"Hi from client!" });

	socket.on("nal_packet",function(data){
		nal_packet_num++;

		player.decode(new Uint8Array(data), { 
			frame: frame_num++ 
		});
	});

	player = new Player({
		useWorker: true,
		workerFile: "broadway/Decoder.js",
		webgl: true,
	  	size: { 
			width: 360, 
			height: 240
		}
	});

	var container = document.getElementById("canvas_container_id");
 	container.appendChild(player.canvas);

	// Count FPS
	setInterval(function() {
		fps_display.innerHTML=frame_num + " fps";
		frame_num = 0;
	}, 1000);
}

function startVideo(){
	console.log("==> startVideo");
	socket.emit("start_stream", { action: "start_stream" });
}

function stopVideo(){
	console.log("==> stopVideo");
	socket.emit("stop_stream", { action: "stop_stream" });
}
