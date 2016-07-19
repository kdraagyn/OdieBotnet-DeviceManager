var express = require('express');
var dgram = require('dgram');
var router = express.Router();

router.get('/', function(req, res, next) {
	var client = dgram.createSocket('udp4');

	var response = {};
	response['status'] = 'UP';

	message = "hello world"

	client.send(message, 0, message.length, 9090, 'localhost', (err) => {
		client.close();
		res.json(response);
	});

	res.json(response);
});

module.exports = router;
