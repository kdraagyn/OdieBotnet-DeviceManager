/**
 *	This module wraps a websocket connection in an observable when an event comes
 *		INTO the socket, an observable is sent to all observers to do what they will with 
 *		it.
 * 	The module also exposes the socket sending capabilities on the socket for quick message 
 *		transfer down the socket
 **/
var Rx = require('rx');

var observableSocket = (function( ws, onDeviceCloseFunc ) {
	
	var observable = Rx.Observable.create(function (obs) {
		// Handle messages  
		ws.onmessage = obs.onNext.bind(obs);
		ws.onerror = obs.onError.bind(obs);
		ws.onclose = onDeviceCloseFunc;

		// Return way to unsubscribe
		return ws.close.bind(ws);
	});

	return observable;
});

module.exports = observableSocket;
