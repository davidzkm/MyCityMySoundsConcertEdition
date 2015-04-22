var config = require('./public_html/config.json');
var args = [];
var _dbData = null;
var baseURL = 'http://msmk.zkm.de/';
var activeCategory = 'alle';
var activeColor = '#FFFFFF';

var io = require('socket.io').listen(3333);

var osc = require('node-osc');
var oscClient = new osc.Client(config.ipAddressOfOSCServer, config.portOfOSCServer); 

io.sockets.on('connection', function (socket) {

	socket.on('MSMKDBDataToNodeServer', function (data) {
		console.log(data);
		_dbData = data;
		var sounds = _dbData.sounds;
		for (var i=0; i< sounds.length; i++) {
			sounds[i].is_playing = false;
			sounds[i].username = '';
			sounds[i].marker_color = 'none';
		}

		socket.emit('MSMKDBDataToClients', _dbData);
	});

	socket.on('requestMSMKDBDataFromNodeServer', function (data) {
		if (!_dbData) {
			socket.emit('fetchMSMKDBDataForNodeServer');

			return;
		}
		socket.emit('MSMKDBDataToClients', _dbData);

		var args = [];
		args.push('/displayCategoryStringInColor');
		args.push(activeCategory);
		args.push(activeColor);
		socket.emit('message', args);
	});

	socket.on('message', function (msg) {

		console.log(msg);

		if (msg[0] == '/updateMarkerColorForSoundsWithTag') {

			io.sockets.emit('message', msg);
			
			var markerColor = msg[1];
			var tag = msg[2];

			var sounds = _dbData.sounds;
			var soundTags = _dbData.sound_tags;

			for (var i=0; i< sounds.length; i++)
			{
				if (tag.trim() == 'alle') sounds[i].marker_color = 'white';
				else sounds[i].marker_color = 'none';
			}

			for (var i=0; i<soundTags.length; i++) {

				for (var j=0; j<sounds.length; j++) {
					if (sounds[j].sound_id == soundTags[i].sound_id &&
						soundTags[i].tag.trim() == tag.trim()) {
						sounds[j].marker_color = markerColor;
					}
				}
			}

			// io.sockets.emit('soundsToClients', sounds);
		}

		if (msg[0] == '/playSoundWithID') {
			var soundID = msg[1];

			var sounds = _dbData.sounds;
			var soundTags = _dbData.sound_tags;

			var username = msg[2];

			for (var i=0; i<sounds.length; i++)
			{
				if (sounds[i].sound_id != soundID) continue;

				sounds[i].is_playing = true;
				sounds[i].username = username;

				args = [];
				args.push('/updatePlayingStateForID');
				args.push(sounds[i].sound_id);
				args.push(sounds[i].is_playing);
				args.push(sounds[i].username);
				io.sockets.emit('message', args);

				setTimeout(function timeoutCallback() {
					sounds[i].is_playing = false;
					sounds[i].username = '';
					args = [];
					args.push('/updatePlayingStateForID');
					args.push(sounds[i].sound_id);
					args.push(sounds[i].is_playing);
					args.push(sounds[i].username);
					io.sockets.emit('message', args);
				}
				, sounds[i].duration * 1000);

				break;
			}

			/*
			*	send osc message
			*/

			oscClient.send("/msmk_play", msg[3], msg[4]);
		}

		if (msg[0] == '/displayCategoryStringInColor') {
			activeCategory = msg[1];
			activeColor = msg[2];
			io.sockets.emit('message', msg);
		}
	});

	socket.on('disconnect', function () { 
	});

});