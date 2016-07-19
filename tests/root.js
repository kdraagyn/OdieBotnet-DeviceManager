var request = require('supertest');

describe("loading express", function() {
	var server;

	beforeEach(function() {
		server = require('../app');
	});

	it('should respond /', function(done) {
		request(server)
			.get('/')
			.expect(200, done);
	});
});
