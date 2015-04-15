/*
*	this nodejs app is both a socket client as well as an osc client
*	it listens to the interaction on the global socket server in the MyCity, MySounds project
*	when a sound file is played it forwards the message as osc in the local area network
*/


//	get addresses and ports from config file

var config = require('./config.json');

//	connect to eastn bridge as client

var socketClientIO = require('socket.io-client');
var socket = socketClientIO.connect(config.addressOfGlobalSocketServer + ':' + config.portOfGlobalSocketServer);

//	create osc client

var osc = require('node-osc');
var oscClient = new osc.Client(config.ipAddressOfOSCServer, config.portOfOSCServer); 

//	eastnBridgeServer Socket handler

socket.on('connect', function() {

	console.log('connected');

	socket.on('message', function(msg) {

		console.log(msg);

		if (msg.length > 1 && msg[0] == '/playSoundWithID') {

			
			//	send osc message
			
			oscClient.send("/msmk_play", msg[3], msg[4]);
		}
	}); 
})