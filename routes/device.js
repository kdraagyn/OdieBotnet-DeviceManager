var express = require('express');
var router = express.Router();
var config = require('config');
var dgram = require('dgram');

var deviceIdToIpConnection = {};

const WS_LISTENING_PORT = config.get('config.websocket.port');
const UDP_LISTENING_PORT = config.get('config.udp.port');

var udpServer = dgram.createSocket('udp4');

router.post('/:deviceId', function(req, res, next) {
	var deviceId = req.params.deviceId;
	var message = req.body;

	var response = {};
	response[ 'status' ] = 'FAILURE';
	response[ 'message' ] = 'Unknown error occured';

	if( deviceId in deviceIdToIpConnection ) {
		var request = {};
		request[ 'id' ] = deviceId;
		request[ 'payload' ] = message;

		var connection = deviceIdToIpConnection[ deviceId ];
		connection.send( JSON.stringify( request) );

		response[ 'status' ] = 'SUCCESS';
		response[ 'message' ] = "Sent message to device";
	} else {
		response[ 'message' ] = "Unknown device ID, failed to send message";
	}
		
	res.json( response );
});

// router.post('/:deviceId/toggle', function(req, res, next) {
	// var deviceId = req.params.deviceId;
	// var response = {};
	// response[ "status" ] = "FAILURE";

	// if( deviceId in deviceIdToIpConnection ) {
		// var request = {};
		// request[ "id" ] = deviceId;
		// request[ "cmd" ] = "TOGGLE";
		// request[ 'cmdMessage' ] = {};

		// var connection = deviceIdToIpConnection[ deviceId ];
		// connection.send( JSON.stringify( request ) );

		// response[ "status" ] = "SUCCESS";
	// }

	// res.json( response );
// });

router.post('/:deviceId/register', function(req, res, next) {
	var deviceId = req.params.deviceId;
	var port = req.body['port'];
	var deviceId = Math.floor( Math.random() * 65536 );
	var responseJson = {};

	responseJson[ "id" ] = deviceId;
	responseJson[ 'path' ] = '/device/ws';
	responseJson[ "port" ] = WS_LISTENING_PORT;

	var deviceMessage = JSON.stringify( responseJson );
	var udpClient = require('dgram').createSocket('udp4');
	udpClient.send( deviceMessage, 0, deviceMessage.length, port, "localhost", function(err, msg) {
		if( err ) throw err;
		udpClient.close();
		res.json({status:"SUCCESS"});
	});
});

router.get('/getDevices', function(req, res, next) {
	res.json(Object.keys( deviceIdToIpConnection ) );
});

router.ws('/ws/', function(ws, req) {
	ws.on('message', function(msg) {
		var requestJson = JSON.parse(msg);

		var deviceId = requestJson[ "id" ];
		var payload = requestJson['payload'];

		deviceIdToIpConnection[ deviceId ] = ws;
	});
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
	responseObject['id'] = Math.floor(Math.random() * 65536 );

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
