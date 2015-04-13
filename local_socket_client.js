/*
*	this nodejs app is both a socket client as well as an osc client
*	it listens to the interaction on the global socket server in the MyCity, MySounds project
*	when a sound file is played it forwards the message as osc in the local area network
*/

/*
*	get addresses and ports from config file
*/

var config = require('./public_html/config.json');

/*
*	connect to eastn bridge as client
*/

var eastnBridgeServerIO = require('socket.io-client');
var eastnBridgeServerSocket = eastnBridgeServerIO.connect(config.addressOfGlobalSocketServer + ':' + config.portOfGlobalSocketServer);

/*
*	create osc client
*/

var osc = require('node-osc');
var oscClient = new osc.Client(config.ipAddressOfOSCServer, config.portOfOSCServer); 

/*
*	eastnBridgeServer Socket handler
*/

eastnBridgeServerSocket.on('connect', function() {

	console.log('connected');

	eastnBridgeServerSocket.on('message', function(msg) {

		console.log(msg);

		if (msg.length > 1 && msg[0] == '/playSoundWithID') {

			/*
			*	send osc message
			*/

			oscClient.send("/msmk_play", msg[3], msg[4]);
		}
	}); 
})