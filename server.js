var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var socketIo = require('socket.io');
var game = require('./controllers/game');

var app = express();
var server = http.Server(app);
var io = socketIo(server);

var router = require('./utils/router');

var port = process.env.PORT || 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router.initialize(express));

game.initialize(io);

server.listen(port);
console.log('Magic happens on ' + port + ' port!');
