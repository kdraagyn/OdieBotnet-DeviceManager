var express = require('express.io');
var app = express();
var expressWs = require('express-ws')(app)
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('config');

var routes = require('./routes/index');
var device = require('./routes/device');

const ENVIRONMENT = process.env.ODIE_ENVIRONMENT
const SERVER_PORT = config.get("config.rest.port");
const LOG_LEVEL = config.get("config.logLevel");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/device/', device);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

app.listen( SERVER_PORT, function() {
	console.log( "Listening Port: " + SERVER_PORT );
});

module.exports = app;
