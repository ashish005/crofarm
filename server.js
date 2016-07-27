var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    http = require('http');

var  server = express(); // Set up an express server (but not starting it yet)
// configure app to use bodyParser()
// this will let us get the data from a POST
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(cors());

var port = process.env.PORT || 3011;        // set our port
server.set('port', port);
var base = '/client';

server.use('/', express.static(__dirname + base));
server.use('/data', express.static(__dirname + "/data"));

server.get('/', function (req, res) {
    res.sendFile('index.html', { root : __dirname});
});

server.listen(server.get('port'), function () {
    console.log('INFO: server is running on port ' + server.get('port'));
});