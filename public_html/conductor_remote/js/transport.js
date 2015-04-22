var transportContext = "stop";
var progress = 0.0;
var interval = 30.0;
var seconds = 0.0;
var minutes = 0.0;
var ms = 0.0;
var updateProgressReturn = null;
var mediaPlayTimerReturn = null;

var mediaRec = null;

function transportHandler(buttonIndex) {
	switch (buttonIndex) {
		case 0:
			$("#recordIcon").css({
				"color" : "black",
				"opacity" : "1"
			});
			$("#playIcon").css({
				"color" : "black",
				"opacity" : "1"
			});
			$("#recordIcon").stop();
			$("#playIcon").stop();

			transportContext = "stop";
			clearInterval(updateProgressReturn);
			clearInterval(mediaPlayTimerReturn);
			progress = 0.0;
			displayTransportDigits();
			updateProgressReturn = null;

			/*
			 * stop recording or playback
			 */

			mediaRec.stopRecord();
			mediaRec.stop();

			break;

		case 1:
			if (transportContext == "stop" && playAudio()) {
				$("#playIcon").css({
					"color" : "green"
				});
				playButtonBlink();
				transportContext = "play";
				updateProgressReturn = setInterval(updateProgress, interval);
			}
			break;

		case 2:
			if (transportContext == "stop") {
				$("#recordIcon").css({
					"color" : "red"
				});
				recordButtonBlink();
				transportContext = "record";
				updateProgressReturn = setInterval(updateProgress, interval);

				/*
				 * start recording
				 */

				recordAudio();
			}
			break;

		default:
			break;
	}
}

var playButtonBlink = function() {
	$('#playIcon').animate({
		opacity : '0'
	}, function() {
		$(this).animate({
			opacity : '1'
		}, playButtonBlink);
	});
};

var recordButtonBlink = function() {
	$('#recordIcon').animate({
		opacity : '0'
	}, function() {
		$(this).animate({
			opacity : '1'
		}, recordButtonBlink);
	});
};

function displayTransportDigits() {
	seconds = Math.floor(progress * 0.001) % 60;
	ms = progress % 1000;
	ms *= 0.1;
	minutes = Math.floor(progress * 0.001 * 0.01666667);

	$('#soundProgressDigits').html(prependZero(minutes) + ':' + prependZero(seconds) + ':' + prependZero(ms));
}

function updateProgress() {
	progress += interval;
	displayTransportDigits();
}

function playAudio() {
	if (!mediaRec) {
		return 0;
	}

	mediaRec.play();

	mediaPlayTimerReturn = setInterval(function() {
		mediaRec.getCurrentPosition(function(position) {
			if (position <= -1 && transportContext != "stop") {
				transportHandler(0);
			}
		});
	});

	return 1;
}

function recordAudio() {
	
	mediaRec = new Media("recording.wav", mediaRecordSuccessfulCallback, mediaRecordErrorCallback);

	// Record audio
	mediaRec.startRecord();
}

var mediaRecordSuccessfulCallback = function() {

};
var mediaRecordErrorCallback = function(err) {

};
