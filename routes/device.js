var express = require('express');
var router = express.Router();
var config = require('config');
var dgram = require('dgram');
var observableSocket = require('observable-socket');
var Rx = require('rx');

const WS_LISTENING_PORT = config.get('config.websocket.port');
const UDP_LISTENING_PORT = config.get('config.udp.port');

var udpServer = dgram.createSocket('udp4');
var webSocketObservable = Rx.Observable.create( function( observer ) {});

// route all observables equally on a subject
var webSocketSubject = new Rx.Subject();

var deviceIdToSocket = {};

router.post('/:deviceId', function(req, res, next) {
	var deviceId = req.params.deviceId;
	var message = req.body;

	var response = {};
	response[ 'status' ] = 'fail';
	response[ 'message' ] = 'Unknown error occured';

	if( deviceId in deviceIdToSocket ) {
		var request = {};
		request[ 'id' ] = deviceId;
		request[ 'payload' ] = message;

		var connection = deviceIdToSocket[ deviceId ];

		// send payload to device
		connection.send( JSON.stringify( request) );

		// react to message coming back from device
		var restSubject = webSocketSubject.subscribe( function(e) {
			response[ 'status' ] = 'success';
			response[ 'message' ] = "Sent message to device";
			response[ 'payload' ] = e.data;
			restSubject.dispose();
			res.json( response );	
		}); 
	} else {
		response[ 'message' ] = "Unknown device ID, failed to send message";
		res.json( response );
	}
});

router.get('/getDevices', function(req, res, next) {
	res.json(Object.keys( deviceIdToSocket ) );
});

router.ws('/ws/', function(ws, req) {

	ws.on('message', function(msg) {
		var requestJson = JSON.parse(msg);

		var deviceId = requestJson[ "id" ];
		var payload = requestJson['payload'];

		if( !(deviceId in deviceIdToSocket ) ) {
			var obsSock = observableSocket( ws );
			deviceIdToSocket[ deviceId ] = ws;
			obsSock.subscribe( webSocketSubject );
		}
	});
});

// listen to webSocket events
webSocketSubject.subscribe( function( e ) {
	console.log( "inside constantly subject" );
	console.log( e.data );
}, function (error) {
	console.log('ERROR!');
	console.log(error)
});

udpServer.on('error', function(error) {
	console.log('Udp server error.');
	udpServer.close();
});

udpServer.on('message', function(message, rinfo) {
	console.log('Broadcast message: ' + rinfo.address + ':' + rinfo.port + ')');
	
	var responseObject = {};
	responseObject['port'] = WS_LISTENING_PORT;
	responseObject['path'] = 'device/ws';
	responseObject['id'] = Object.keys(deviceIdToSocket).length + 1;

	responseMessage = JSON.stringify(responseObject);

	setTimeout( function() {
		udpServer.send( responseMessage, 0, responseMessage.length, rinfo.port, rinfo.address, function( err, bytes ) {
			if( err ) {
				throw err;
			}
		});
	}, 200);
});
udpServer.on('listening', function() {
	var address = udpServer.address();
	udpServer.setBroadcast( true );
	console.log( 'UDP server listening on: ' + address.address + ":" + address.port );
});
udpServer.bind(UDP_LISTENING_PORT);

module.exports = router;
