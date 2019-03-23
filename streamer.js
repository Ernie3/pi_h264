const spawn = require('child_process').spawn;
const Split = require('stream-split');
const fs = require("fs");
const config = require('./config.json');
const NALseparator = Buffer.from([0,0,0,1]);//NAL break

function start(socket) {
	console.log("==> starting stream");
	console.log("CONFIGURATION =>", config);

	var proc = spawn("ffmpeg", [
		"-s",config.width+"x"+config.height,
		"-re",
		"-framerate",config.fps+"",
		"-i",fs.realpathSync(config.device),
		"-c:v","libx264",
		"-b:v",config.bitrate,
		"-an",
		"-profile:v","baseline",
		//"-vf","drawtext='fontfile=/home/pi/ffmpeg/freefont/FreeSans.ttf:text=%{localtime\}':fontsize=50:fontcolor=yellow@1:box=1:boxcolor=red@0.9:x=(w-tw)/2:y=10",
		"-loglevel","error",
		"-stats",
		"-tune","zerolatency",
		"-f","h264",
		"-pix_fmt","yuv420p",
		"-preset","ultrafast",
		"-y",
		"-"
	]);

	let rawstream = proc.stdout.pipe(new Split(NALseparator));

	rawstream.on("data", function(data){
		socket.emit("nal_packet", Buffer.concat([NALseparator, data]));
	});

	proc.stderr.on("data", function(data) {
		let d = data.toString();

		if(config.verbose) {
			console.log("==> stderr: " + d);
		}

		// Ouch
		if(d.includes("Device or resource busy")) {
			console.error("Device busy... exiting program.", d);
			process.exit(1);
		}
	});

	proc.on("close", function(code){
		console.warn("process exit with code: " + code);
	});

	return proc;
}

exports.start = start
