var config = null;
var CONSOLE_DEBUG_OUTPUT = true;
var _hasOpenInfoWindow = false;
var _sounds = null;
var _soundTags = null;
var socket = null;
var _username = null;
var _runtimeContext = 'Browser';
var _soundFileFromBrowser = null;
var _imageFileFromBrowser = null;
var _walkImageFileFromBrowser = null;
var _currentPositionMarker;
var _currentPositionAccuracyCircle;
var watchID = null;
var ENABLE_GEOLOCATION_TRACKING = 1;
var PREPARE_SOUND_METADATA = 1;
var PREPARE_WALK_METADATA = 1;
var _mapOverlayContext = 'walk';
var soundIDForWalkCreation = -1;
var _selectedWalkID = -1;
var _startingSoundIDOfSelectedWalk;
var map;
var infoWindows = [];
var markers = [];
var markerCluster = null;
var _infoWindowMaxWidth = 200;
var _infoWindowMaxHeight = 600;
var _walkPolyLine = null;
var localSoundImageURI = null;
var localWalkImageURI = null;
var destinationType;
var photoContext = null;
var myFileSystem = null;
var progressCircleBarSize = 0;
var sonicEmotionZonesForKarlsruhe = [];
var cityZones = null;
var baseURL = 'http://msmk.zkm.de/';

var isMobile = {
	Android : function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry : function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS : function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera : function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows : function() {
		return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	},
	any : function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

$(document).on("pageinit", "#home", function() {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('home pageinit');
	}

	$.mobile.changePage("#concertStartScreen");
});

function gotFS(fileSystem) {
	myFileSystem = fileSystem;
}

function switchMapOverlayContext(context) {
	_mapOverlayContext = context;
	_selectedWalkID = -1;
	_startingSoundIDOfSelectedWalk = -1;
}


$(document).on("pageshow", "#login", function() {
	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('login pageShow');
	}
});

$(document).on("pageshow", "#createSoundPageMobile", function() {

	checkAuth(function() {

	});
});

$(document).on("pageshow", "#create_sound", function() {

	checkAuth(function() {

	});
});

$(document).on("pageinit", "#myWalksListPage", function() {
	getMyWalksList();
});

$(document).on("pageshow", "#map", function() {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('map pageshow');
	}

	google.maps.event.trigger(map, 'resize');
	google.maps.event.addListenerOnce(map, "idle", function() {
		google.maps.event.trigger(map, 'resize');
	});
});

$(document).on("pageinit", "#map", function() {
	if (_username == null) {
		$.mobile.changePage("#concertStartScreen");
	}
});

$(document).ready(function() {

	$.getJSON('../config.json', null, function(data) {
		config = data;

		initSonicEmotionZonesForKarlsruhe();

		/*
		*	define city zones as circles with a center and radius
		*/

		cityZones = [];

		/*
		*	Karlsruhe
		*/

		var zone1 = {
			minLat : 48.985174,
			maxLat : 49.027176000000004,
			minLong : 8.372612,
			maxLong : 8.4299469
		};
		cityZones.push(zone1);

		socket = io('http://' + config.ipAddressOfNodeJSSocketServer + ':' + config.portOfNodeJSSocketServer + '/');
		socket.on('connect', function() {
			socket.emit('requestMSMKDBDataFromNodeServer');
		});

		socket.on('fetchMSMKDBDataForNodeServer', function(data) {
			$.ajax({
				type : "POST",
				url : baseURL + "get_walks_symposium.php",
				data : {
					postContext : 'sounds',
					userContext : null
				}
			}).done(function(data) {
				var parsedData = $.parseJSON(data);
				socket.emit('MSMKDBDataToNodeServer', parsedData);
			});
		});

		socket.on('MSMKDBDataToClients', function(data) {

			if (CONSOLE_DEBUG_OUTPUT) {
				console.log('MSMKDBDataToClients received: ', data);
			}

			_sounds = data.sounds;
			_soundTags = data.sound_tags;
			clearMarkersAndInfoWindows();
			createMarkersForSounds(_sounds, _soundTags, null);
		});

		socket.on('soundsToClients', function(sounds) {

			if (CONSOLE_DEBUG_OUTPUT) {
				console.log('soundsToClients received: ', sounds);
			}

			_sounds = sounds;
			clearMarkersAndInfoWindows();
			createMarkersForSounds(_sounds, _soundTags, null);
		});

		socket.on('message', function(msg) {

			if (CONSOLE_DEBUG_OUTPUT) {
				console.log('message received: ', msg);
			}

			if (msg[0] == '/updateMarkerColorForSoundsWithTag') {

				var markerColor = msg[1];
				var tag = msg[2];

				for (var i = 0; i < _sounds.length; i++) {
					if (tag.trim() == 'alle')
						_sounds[i].marker_color = 'white';
					else
						_sounds[i].marker_color = 'none';
				}

				for (var i = 0; i < _soundTags.length; i++) {

					for (var j = 0; j < _sounds.length; j++) {
						if (_sounds[j].sound_id == _soundTags[i].sound_id && _soundTags[i].tag.trim() == tag.trim()) {
							_sounds[j].marker_color = markerColor;
						}
					}
				}

				clearMarkersAndInfoWindows();
				createMarkersForSounds(_sounds, _soundTags, null);
				// io.sockets.emit('soundsToClients', sounds);
			}

			if (msg[0] == '/displayCategoryStringInColor') {

				if (msg[1] == 'schluss') {
					$('#concertCategoryOverlayBox').html('');
					return;
				}

				var categoryString = '#' + msg[1];
				var color = msg[2];
				$('#concertCategoryOverlayBox').html(categoryString);
				$('#concertCategoryOverlayBox').css('color', color);
			}

			if (msg[0] == '/updatePlayingStateForID') {
				$.each(_sounds, function(i, sound) {
					if (sound.sound_id == msg[1]) {
						sound.infoWindowOpenCounter = 0;
						sound.is_playing = msg[2];
						sound.username = msg[3];
						sound.marker.setMap(null);
						createMarkerForSound(sound, null);
						return 0;
					}
				});

				// clearMarkersAndInfoWindows();
				// createMarkersForSounds(_sounds, _soundTags, null);
			}
		});

		/*
		 * init + resize map stuff
		 */

		{
			if (CONSOLE_DEBUG_OUTPUT) {
				console.log('map pageinit');
			}

			var zoomControlFlag = false;
			if (_runtimeContext == 'Browser' && !isMobile.any()) {
				zoomControlFlag = true;
			}
			var mapOptions = {
				disableDefaultUI : true,
				zoomControl : zoomControlFlag,
				scaleControl : true,
				zoomControlOptions : {
					// style : google.maps.ZoomControlStyle.SMALL,
					position : google.maps.ControlPosition.BOTTOM_RIGHT
				},
				zoom : 13,
				center : new google.maps.LatLng(49.015887, 8.402307),
				mapTypeControl : true,
				mapTypeId : google.maps.MapTypeId.HYBRID
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
			map.setCenter(new google.maps.LatLng(49.015887, 8.402307));
		}

		$('#concertUserNameConfirmationButton').click(function(e) {
			var username = ($('#usernameInputField')).val();
			if (username.length < 2) {
				alert('Bitte mindestens 2 Zeichen angeben...');
				return;
			}
			_username = username.trim();

			if (_username != 'ima_beamer') {
				$('#concertCategoryOverlayBox').hide();
			}

			$.mobile.changePage("#map");

			clearMarkersAndInfoWindows();
			createMarkersForSounds(_sounds, _soundTags, null);
		});
	})
});

function clearMarkersAndInfoWindows() {

	$.each(markers, function(i, obj) {
		obj.setMap(null);
	});
	markers = [];
	if (markerCluster) {
		markerCluster.clearMarkers();
	}

	if (_walkPolyLine) {
		_walkPolyLine.setMap(null);
		_walkPolyLine = null;
	}

	_hasOpenInfoWindow = false;
}

function createMarkerForSound(sound, context) {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('createMarkerForSound entered..');
	}

	if (sound.marker_color == 'none' && sound.is_playing == 0)
		return 1;
	if (sound.marker_color == 'gray' && sound.is_playing == 0)
		return 1;

	/*
	 * compose content string for info window
	 */

	var contentString = '<div style="overflow:hidden!important">';
	if (sound.thumbnail_url != 'none') {
		contentString += '<div style="width: 200px" align="center"><img src="' + sound.thumbnail_url + '" /></div>';
	}

	if (_username != 'ima_beamer') {
		contentString += '<h3>' + sound.sound_title;

		contentString += ' (' + sound.duration + ' Sekunden)';

		contentString += '</h3>';

		contentString += '<div style="float: right; margin-left: 10px" align="center"><a class="ui-btn hsptPlayButton" id="hsptPlayButton' + '"><i class="fa fa-play-circle fa-3x"></i></a></div>';

		contentString += '<div>' + sound.sound_description + '</div>';
		contentString += '<br /><br />';
	}

	var infoWindow = new google.maps.InfoWindow({
		content : contentString,
		maxWidth : _infoWindowMaxWidth,
		maxHeight : _infoWindowMaxHeight
	});
	infoWindow.sound = sound;
	infoWindow.deleteSoundButtonPressed = 0;
	infoWindow.hsptPlaybackButtonPressed = 0;
	infoWindow.playButtonPressed = false;
	infoWindows.push(infoWindow);

	google.maps.event.addListener(infoWindow, 'closeclick', function() {
		_hasOpenInfoWindow = false;
	});

	google.maps.event.addListener(infoWindow, 'domready', function(e) {

		_hasOpenInfoWindow = true;

		$('#hsptPlayButton').click(function(e) {

			if (infoWindow.hsptPlaybackButtonPressed++)
				return;

			/*
			*	get nearest city zone first
			*/

			var distance = 0.0;
			var minDistance = 0.0;
			var minDistanceIndex = 0;
			$.each(cityZones, function(j, zone) {
				distance = (sound.latitude - zone.minLat) * (sound.latitude - zone.minLat) + (sound.longitude - zone.minLong) * (sound.longitude - zone.minLong);
				if (distance != 0.0) {
					distance = Math.sqrt(distance);
				}

				if (j==0) {
					minDistance = distance;
				}
				else if (distance < minDistance) {
					minDistance = distance;
					minDistanceIndex = j;
				}
			});
			var cityZone = cityZones[minDistanceIndex];

			/*
			*	create relative x coordinates for sound according to city zone
			*/

			if (sound.longitude <= cityZone.minLong) 
				sound.x = 0.0;

			if (sound.longitude >= cityZone.maxLong)
				sound.x = 1.0;

			if (sound.longitude > cityZone.minLong && sound.longitude < cityZone.maxLong) {
				var reciprocalLongitudeRange = cityZone.maxLong - cityZone.minLong;
				if (reciprocalLongitudeRange != 0.0) reciprocalLongitudeRange = 1.0 / reciprocalLongitudeRange;
				sound.x = (sound.longitude - cityZone.minLong) * reciprocalLongitudeRange;
			}

			/*
			*	create relative y coordinates for sound according to city zone
			*/

			if (sound.latitude <= cityZone.minLat) 
				sound.y = 0.0;

			if (sound.latitude >= cityZone.maxLat)
				sound.y = 1.0;

			if (sound.latitude > cityZone.minLat && sound.latitude < cityZone.maxLat) {
				var reciprocalLatitudeRange = cityZone.maxLat - cityZone.minLat;
				if (reciprocalLatitudeRange != 0.0) reciprocalLatitudeRange = 1.0 / reciprocalLatitudeRange;
				sound.y = (sound.latitude - cityZone.minLat) * reciprocalLatitudeRange;
			}

			/*
			 *	iterate through the hsptZones and choose the nearest one for the output
			 */

			distance = 0.0;
			minDistance = 0.0;
			minDistanceIndex = 0;
			$.each(sonicEmotionZonesForKarlsruhe, function(j, zone) {
				distance = (sound.x - zone.x) * (sound.x - zone.x) + (sound.y - zone.y) * (sound.y - zone.y);
				if (distance != 0.0) {
					distance = Math.sqrt(distance);
				}
				zone.distance = distance;

				if (j == 0) {
					minDistance = distance;
				} else if (distance < minDistance) {
					minDistance = distance;
					minDistanceIndex = j;
				}
			});

			/*
			 * get nearest zone id according to the minDistanceIndex
			 */

			var nearestZoneID = sonicEmotionZonesForKarlsruhe[minDistanceIndex].zoneID;

			/*
			 * replace mp3 extension with wav extension for max msp playback
			 */

			var soundFileName = sound.soundfile_url;
			soundFileName = soundFileName.substring(soundFileName.lastIndexOf('/') + 1);
			soundFileName = soundFileName.replace('.mp3', '.wav');
			// console.log(soundFileName);

			nearestZoneID += 64;

			// $.ajax({
			// 	type : "POST",
			// 	url : baseURL + "send_osc.php",
			// 	data : {
			// 		soundfile_name : soundFileName,
			// 		hspt_zone : nearestZoneID
			// 	}
			// }).done(function(data) {
			// 	// console.log(data);
			// });

			infoWindow.close();
			_hasOpenInfoWindow = false;

			var args = [];
			args.push('/playSoundWithID');
			args.push(sound.sound_id);
			args.push(_username);
			args.push(soundFileName);
			args.push(nearestZoneID);
			socket.emit('message', args);

		});
	});

	/*
	 * create new marker
	 */

	var marker_icon = 'img/sound_marker_';
	if (sound.marker_color != 'none') {
		marker_icon += sound.marker_color;
		marker_icon += '.png';
	} else {
		marker_icon += 'gray.png';
	}

	// var pictureLabel = document.createElement("img");
	// pictureLabel.src = sound.thumbnail_url;
	// if (sound.username == '') {
	// 	pictureLabel = '';
	// }

	var marker = new MarkerWithLabel({
		position : new google.maps.LatLng(sound.latitude, sound.longitude),
		map : map,
		title : sound.sound_title,
		icon : marker_icon,
		labelAnchor : new google.maps.Point(22, 0),
		labelContent : sound.username,
		labelClass : 'labels'
	});
	markers.push(marker);

	sound.marker = marker;

	if (_username == 'ima_beamer' && sound.is_playing == 1 && sound.infoWindowOpenCounter++ == 0) {
		map.setCenter(marker.getPosition());

		if (sound.thumbnail_url != 'none') {
			infoWindow.open(map, marker);
		}

		map.panBy(0, -100);
		setTimeout(function() {
			infoWindow.close();
		}, 3000);
	}

	// infoWindow.open(map, marker);

	if (sound.is_playing == 1) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}

	google.maps.event.addListener(marker, 'click', function(e) {
		$.each(infoWindows, function(j, obj) {
			obj.close();
		});

		if (sound.is_playing == 0) {
			map.setCenter(marker.getPosition());
			infoWindow.open(map, marker);
			map.panBy(0, -300);
		}
	});

	if (markerCluster && USE_MARKER_CLUSTERS) {
		markerCluster.clearMarkers();
	}
}

function createMarkersForSounds(sounds, sound_tags, context) {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('createMarkersForSounds entered..');
	}

	$.each(sounds, function(i, sound) {
		createMarkerForSound(sound, context);
	});

	if (markerCluster && USE_MARKER_CLUSTERS) {
		markerCluster.clearMarkers();
	}
}

function initSonicEmotionZonesForKarlsruhe() {
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.027176000000004,
		longitude : 8.404026,
		distance : 0.0,
		zoneID : 4
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 48.985174,
		longitude : 8.4036827,
		distance : 0.0,
		zoneID : 8
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0073618,
		longitude : 8.372612,
		distance : 0.0,
		zoneID : 2
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.007587,
		longitude : 8.4299469,
		distance : 0.0,
		zoneID : 6
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 48.993397,
		longitude : 8.3770752,
		distance : 0.0,
		zoneID : 1
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 48.9931717,
		longitude : 8.4251404,
		distance : 0.0,
		zoneID : 7
	});
	// sonicEmotionZonesForKarlsruhe.push({ latitude: 49.016932100000005, longitude: 8.4272003, distance: 0.0, zoneID: 23} );
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0221106,
		longitude : 8.4218789,
		distance : 0.0,
		zoneID : 5
	});
	// sonicEmotionZonesForKarlsruhe.push({ latitude: 49.0252625, longitude: 8.415184, distance: 0.0, zoneID: 24} );
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.025487600000005,
		longitude : 8.3906364,
		distance : 0.0,
		zoneID : 22
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.022786,
		longitude : 8.3829117,
		distance : 0.0,
		zoneID : 3
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.01738240000001,
		longitude : 8.3775902,
		distance : 0.0,
		zoneID : 21
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0210975,
		longitude : 8.3932114,
		distance : 0.0,
		zoneID : 12
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0206472,
		longitude : 8.4117507,
		distance : 0.0,
		zoneID : 13
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0137798,
		longitude : 8.4198189,
		distance : 0.0,
		zoneID : 14
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0145679,
		longitude : 8.3860016,
		distance : 0.0,
		zoneID : 11
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0019565,
		longitude : 8.3851433,
		distance : 0.0,
		zoneID : 10
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 48.995874900000004,
		longitude : 8.394928,
		distance : 0.0,
		zoneID : 9
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 48.9954245,
		longitude : 8.4119224,
		distance : 0.0,
		zoneID : 16
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0025197,
		longitude : 8.4184456,
		distance : 0.0,
		zoneID : 15
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0042088,
		longitude : 8.3947563,
		distance : 0.0,
		zoneID : 17
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0036457,
		longitude : 8.4093475,
		distance : 0.0,
		zoneID : 18
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0135546,
		longitude : 8.3963013,
		distance : 0.0,
		zoneID : 20
	});
	sonicEmotionZonesForKarlsruhe.push({
		latitude : 49.0136672,
		longitude : 8.4083176,
		distance : 0.0,
		zoneID : 19
	});

	/*
	*	for each zone compute relative x-y coordinates
	*/

	var maxLat = 0.;
	var maxLong = 0.;
	var minLat = sonicEmotionZonesForKarlsruhe[0].latitude;
	var minLong = sonicEmotionZonesForKarlsruhe[0].longitude;

	$.each(sonicEmotionZonesForKarlsruhe, function(i, zone) {
		if (zone.latitude > maxLat) {
			maxLat = zone.latitude;
		}

		if (zone.longitude > maxLong) {
			maxLong = zone.longitude;
		}

		if (zone.latitude < minLat) {
			minLat = zone.latitude;
		}

		if (zone.longitude < minLong) {
			minLong = zone.longitude;
		}
	});

	var reciprocalLatitudeRange = maxLat - minLat;
	if (reciprocalLatitudeRange != 0.0) reciprocalLatitudeRange = 1.0 / reciprocalLatitudeRange;

	var reciprocalLongitudeRange = maxLong - minLong;
	if (reciprocalLongitudeRange != 0.0) reciprocalLongitudeRange = 1.0 / reciprocalLongitudeRange;

	$.each(sonicEmotionZonesForKarlsruhe, function(i, zone) {
		zone.x = (zone.longitude - minLong) * reciprocalLongitudeRange;
		zone.y = (zone.latitude - minLat) * reciprocalLatitudeRange;
	});
}