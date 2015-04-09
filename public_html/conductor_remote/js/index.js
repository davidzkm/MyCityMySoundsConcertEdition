var baseURL = 'http://msmk.zkm.de/'
var socket = null;

$(document).ready(function() {

	$.getJSON('../config.json', null, function(data) {
		config = data;

		socket = io('http://' + config.ipAddressOfNodeJSSocketServer + ':' + config.portOfNodeJSSocketServer + '/');
		socket.on('connect', function () {

		});

		$(".hsptContextButton").click(function(e) {
			var tag = $(this).text();

			tag = tag.replace('#', '');
			tag = tag.trim();

			var displayString = tag;

			var markerColor = 'white';
			var colorString = '#FFFFFF';

			if (tag == 'stimme') {
				markerColor = 'cyan';
				colorString = '#00FFFF';
				displayString = 'voice (stimme)';
			}

			if (tag == 'industrie') {
				markerColor = 'orange';
				colorString = '#FFAA00';

				displayString = 'industry (industrie)';
			}

			if (tag == 'maschine') {
				markerColor = 'orange';
				colorString = '#FFAA00';

				displayString = 'machine (maschine)';
			}

			if (tag == 'fauna') {
				markerColor = 'green';
				colorString = '#00FF00';

				displayString = 'fauna (fauna)';
			}

			if (tag == 'signal') {
				markerColor = 'red';
				colorString = '#FF0000';

				displayString = 'signal (signal)';
			}

			if (tag == 'elektrizitaet') {
				markerColor = 'yellow_green';
				colorString = '#FFFF00';

				displayString = 'electricity (elektrizitaet)';
			}

			if (tag == 'surren') {
				markerColor = 'yellow_green';
				colorString = '#FFFF00';

				displayString = 'buzzing (surren)';
			}

			if (tag == 'drone') {
				markerColor = 'blue';
				colorString = '#0000FF';

				displayString = 'drone (droehnen)';
			}

			if (tag == 'verkehr') {
				markerColor = 'yellow';
				colorString = '#FFCC00';

				displayString = 'traffic (verkehr)';
			}

			if (tag == 'rauschen') {
				markerColor = 'yellow';
				colorString = '#FFCC00';

				displayString = 'noise (rauschen)';
			}

			if (tag == 'perkussion') {
				markerColor = 'pink';
				colorString = '#FF00AA';

				displayString = 'percussion (perkussion)';
			}

			if (tag == 'alle') {
				markerColor = 'white';
				colorString = '#FFFFFF';

				displayString = 'every (alle)';
			}

			var args = [];
			args.push('/updateMarkerColorForSoundsWithTag');
			args.push(markerColor);
			args.push(tag);
			socket.emit('message', args);

			args = [];
			args.push('/displayCategoryStringInColor');
			args.push(displayString);
			args.push(colorString);
			socket.emit('message', args);

			// $.ajax({
			// 	type : "POST",
			// 	url : baseURL + "change_sound_marker_color.php",
			// 	data : {
			// 		marker_color : markerColor,
			// 		tag : tag
			// 	}
			// }).done(function(data) {
			// });
		});
	});
});