function executeQuery() {

	// console.log('blaexecute');

	var ajaxPostContext = 'sounds';
	var userContext = null;

	$.ajax({
		type : "POST",
		url : baseURL + "get_walks.php",
		data : {
			postContext : ajaxPostContext,
			userContext : userContext
		}
	}).done(function(data) {
		var parsedData = $.parseJSON(data);
		var diff = 0;

		$.each(_previousSounds, function(i, previousSound) { {
				$.each(parsedData.sounds, function(j, sound) { {
						if (sound.sound_id != previousSound.sound_id) {
							return 1;
						}

						if (sound.is_playing != previousSound.is_playing) {
							diff++;
							var timeoutDuration = sound.duration * 1000;
							setTimeout(function() {
								$.ajax({
									type : "POST",
									url : baseURL + "change_sound_playing_state.php",
									data : {
										sound_id : sound.sound_id,
										state : 0
									}
								}).done(function(data) {
								});
							}, timeoutDuration);
						}
					}
				});
			}
		});

		// console.log('bladiff: ', diff);

		if (diff > 0) {
			clearMarkersAndInfoWindows();
			createMarkersForSounds(parsedData.sounds, parsedData.sound_tags, ajaxPostContext);
			_previousSounds = parsedData.sounds;
		}

		setTimeout(executeQuery, 1000);
	});
}

function checkAuth(onSuccessCallback) {
	$.post(baseURL + 'auth.php', function ajaxPostCallback(data) {
		if (data == 'auth_failed') {
			$.mobile.changePage("#login");
		} else {
			onSuccessCallback();
		}
	});
}

function getSoundsAndCreateMarkers(userContext) {
	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('getSoundsAndCreateMarkers entered..');
	}

	var ajaxPostContext = 'sounds';
	if (_mapOverlayContext == 'user') {
		ajaxPostContext = 'sounds_user';
	}
	if (_mapOverlayContext == 'search') {
		ajaxPostContext = 'sounds_search';
	}

	$.ajax({
		type : "POST",
		url : baseURL + "get_walks.php",
		data : {
			postContext : ajaxPostContext,
			userContext : userContext
		}
	}).done(function(data) {
		var parsedData = $.parseJSON(data);
		_previousSounds = parsedData.sounds;
		createMarkersForSounds(parsedData.sounds, parsedData.sound_tags, ajaxPostContext);
	});
}

function getWalksAndCreateMarkers(userContext) {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('getWalksAndCreateMarkers entered..');
	}

	var ajaxPostContext = 'walks';
	if (_mapOverlayContext == 'user') {
		ajaxPostContext = 'walks_user';
	}
	if (_mapOverlayContext == 'search') {
		ajaxPostContext = 'walks_search';
	}

	// console.log(ajaxPostContext);

	$.ajax({
		type : "POST",
		url : baseURL + "get_walks.php",
		data : {
			postContext : ajaxPostContext,
			userContext : userContext
		}
	}).done(function(data) {
		var parsedData = $.parseJSON(data);
		// console.log(parsedData);
		createMarkersForWalks(parsedData.walks, parsedData.walk_tags, parsedData.starting_walk_sounds, parsedData.starting_sounds);
	});
}

function getSoundsForSelectedWalkAndCreateMarkers() {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('getSoundsForSelectedWalkAndCreateMarkers entered..');
	}

	var ajaxPostContext = 'walk_user';
	if (_mapOverlayContext == 'walk') {
		ajaxPostContext = 'walk';
	}

	// console.log(ajaxPostContext);

	$.ajax({
		type : "POST",
		url : baseURL + "get_walks.php",
		data : {
			postContext : ajaxPostContext,
			walk_id : _selectedWalkID
		}
	}).done(function(data) {
		var parsedData = $.parseJSON(data);
		createMarkersForSounds(parsedData.sounds, parsedData.sound_tags, 'sounds_in_walk');
		if (_mapOverlayContext == 'user' && parsedData.residual_sounds) {
			createMarkersForSounds(parsedData.residual_sounds, parsedData.sound_tags, 'residual_sounds');
		}
		createPathForSounds(parsedData.sounds, parsedData.walk_sounds);
	});
}

// function getSoundsAndCreateMarkers() {

//     if (CONSOLE_DEBUG_OUTPUT) {
//         console.log('getSoundsAndCreateMarkers entered..');
//     }

//     var ajaxPostContext = 'sounds';
//     if (_mapOverlayContext == 'user') {
//         ajaxPostContext = 'sounds_user';
//     }

//     $.ajax({
//         type : "POST",
//         url : baseURL + "get_walks.php",
//         data : {
//             context : ajaxPostContext,
//         }
//     }).done(function(data) {
//         var parsedData = $.parseJSON(data);
//         createMarkersForSounds(parsedData.sounds, parsedData.sound_tags, ajaxPostContext);
//     });
// }

function createMarkersForSounds(sounds, sound_tags, context) {

	if (CONSOLE_DEBUG_OUTPUT) {
		console.log('createMarkersForSounds entered..');
	}

	// console.log(context);

	$.each(sounds, function(i, sound) {

		/*
		 * compose content string for info window
		 */

		var contentString = '<div style="width: 200px"><img src="' + sound.thumbnail_url + '" /></div>' + '<h3>' + sound.sound_title;

		// if (_mapOverlayContext != 'user') {
		// 	contentString += '<a id="soundUserButton' + parseInt(i) + '">' + ' (' + sound.username + ')' + '</a>';
		// }

		contentString += ' (' + sound.duration + ' Sekunden)';

		contentString += '</h3>';

		contentString += 'Tags: ';

		$.each(sound_tags, function(j, sound_tag) {
			if (sound_tag.sound_id != sound.sound_id)
				return true;

			contentString += '#' + sound_tag.tag + ' ';
		});

		contentString += '<br /><br />';

		contentString += sound.sound_description;

		if (_mapOverlayContext == 'user') {
			contentString += '<br /><br />';

			if (context == 'sounds_in_walk' && sound.sound_id != _startingSoundIDOfSelectedWalk) {
				contentString += '<a style="float: left" id="removeFromWalkButton' + parseInt(i) + '">Remove from Walk</a>';
			}

			if (context == 'residual_sounds') {
				contentString += '<a style="float: left" id="addToWalkButton' + parseInt(i) + '">Add to Walk</a>';
			}

			if (sound.sound_id != _startingSoundIDOfSelectedWalk && context != 'sounds_in_walk' && context != 'residual_sounds') {
				contentString += '<a style="float: right" id="deleteSoundButton' + parseInt(i) + '">Delete</a>';
			}

			if (context != 'sounds_user' && context != 'sounds_in_walk' && context != 'residual_sounds') {
				contentString += '<br /><br />';
			}

			if (context == 'sounds_in_walk') {
			}

			if (context == 'sounds_user') {
				contentString += '<a style="float: left" id="createNewWalkFromHereButton' + parseInt(i) + '">+ Create Walk</a>';
			}
		}

		// contentString += '<div style="margin-top: 40px; height: 50px"><audio controls>' + '<source src="' + sound.soundfile_url + '"></audio></div>';
		contentString += '<div align="center"><a class="ui-btn hsptPlayButton" id="hsptPlayButton' + parseInt(i) + '"><i class="fa fa-play-circle fa-2x"></i></a></div>';

		// if (sound.is_playing == 1) return 1;

		if (sound.is_playing == 0) 
		{
			var infoWindow = new google.maps.InfoWindow({
				content : contentString,
				maxWidth : _infoWindowMaxWidth,
				maxHeight : _infoWindowMaxHeight
			});
			infoWindow.sound = sound;
			infoWindow.deleteSoundButtonPressed = 0;
			infoWindow.playButtonPressed = false;
			infoWindows.push(infoWindow);

			google.maps.event.addListener(infoWindow, 'domready', function(e) {
				if (_mapOverlayContext == 'user') {
					$('#deleteSoundButton' + parseInt(i)).click(function(e) {
						if (infoWindow.deleteSoundButtonPressed) {
							return;
						}
						infoWindow.deleteSoundButtonPressed++;

						if (_runtimeContext == 'Browser') {
							var confirmReturnValue = confirm('This will delete all the Sound information including the Image and Sound File. Continue?');
							if (confirmReturnValue) {
								$.ajax({
									type : "POST",
									url : baseURL + "delete_sound.php",
									data : {
										sound_id : infoWindow.sound.sound_id,
										soundfile_url : infoWindow.sound.soundfile_url,
										thumbnail_url : infoWindow.sound.thumbnail_url
									}
								}).done(function(data) {
									$('#mapOverlayUserButton').click();
								});
							}
						} else {
							navigator.notification.confirm('This will delete all the Sound information including the Image and Sound File. Continue?', function(index) {
								if (index == 1) {
									$.ajax({
										type : "POST",
										url : baseURL + "delete_sound.php",
										data : {
											sound_id : infoWindow.sound.sound_id,
											soundfile_url : infoWindow.sound.soundfile_url,
											thumbnail_url : infoWindow.sound.thumbnail_url
										}
									}).done(function(data) {
										$('#mapOverlayUserButton').click();
									});
								}
							}, 'Delete Sound', ['OK', 'Cancel']);
						}
					});

					$('#removeFromWalkButton' + parseInt(i)).click(function(e) {
						removeSoundFromSelectedWalk(infoWindow.sound.sound_id);
					});

					$('#addToWalkButton' + parseInt(i)).click(function(e) {
						addSoundToSelectedWalk(infoWindow.sound.sound_id);
					});

					$('#createNewWalkFromHereButton' + parseInt(i)).click(function(e) {
						soundIDForWalkCreation = infoWindow.sound.sound_id;
						if (soundIDForWalkCreation >= 0) {
							photoContext = 'walk';

							if (_runtimeContext == 'Browser') {
								$.mobile.changePage('#create_walk');
							} else {
								$.mobile.changePage('#createWalkPageMobile');
							}
						}
					});
				}

				$('#soundUserButton' + parseInt(i)).click(function(e) {
					_mapOverlayContext = 'sound';
					clearMarkersAndInfoWindows();
					getSoundsAndCreateMarkers(sound.username);
				});

				$('#hsptPlayButton' + parseInt(i)).click(function(e) {

					$.ajax({
						type : "POST",
						url : baseURL + "change_sound_playing_state.php",
						data : {
							sound_id : infoWindow.sound.sound_id,
							state : 1
						}
					}).done(function(data) {
						infoWindow.close();
					});

				});
			});

		}
		
		/*
		 * create new marker
		 */

		var marker_icon = 'img/sound_marker_magenta.png';
		if (sound.is_playing == 1) {
			marker_icon = 'img/sound_marker_tuerkis.png';
		}

		var marker = new google.maps.Marker({
			position : new google.maps.LatLng(sound.latitude, sound.longitude),
			map : map,
			title : sound.sound_title,
			icon : marker_icon,
		});
		markers.push(marker);

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
	});

	if (markerCluster && USE_MARKER_CLUSTERS) {
		markerCluster.clearMarkers();
	}

	// console.log(_mapOverlayContext);
	// 	if (context != 'sounds_in_walk' &&
	// 		context != 'residual_sounds' &&
	// 		_mapOverlayContext != 'search' &&
	// 		_mapOverlayContext != 'user') {
	// 	markerCluster = new MarkerClusterer(map, markers);
	// }
}