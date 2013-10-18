// required modules
var express = require('express'),
    crypto = require('crypto'),
    querystring = require('querystring'),
    ecc = require('./lib/ECCVerify'),
    SQRLParser = require('./lib/SQRLParser'),
    io = require('socket.io').listen(9090);

var hostname = 'localhost';

// some salt for nonce
var counter = 0;

// nonce tracking for challenge verification
var urlNonce = {},
    eccverify = new ecc(),
    clients = {};

// init express app
var app = express();

// set development logging to console
app.use(express.logger('dev'));

// use body parser to get post data
app.use(express.bodyParser());

// set ejs as template engine and html as doctype
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// setup static directory
app.use(express.static(__dirname + '/static'));

// a get on our root will generate a qr code with
// our sqrl url + nonce
// create a new node hash object of type sha1
// update the hash object with the current time
// digest the hash as the nonce and append it to the sqrl url
// pass the string to our renderer
app.get('/', function (req, res) {
    var hash = crypto.createHash('md5');
    hash.update(new Date().getTime().toString() + counter, 'utf8');
    var nonce = hash.digest('hex');
    var string = 'sqrl://localhost:8080/sqrl?nut=' + nonce.toString();
    res.render('index', { url: string, nonce: nonce.toString() });
    counter += 1;
    urlNonce[nonce] = new Date().getTime();
    console.log('Generated nonce: ' + nonce +
        ' with timestamp: ' + urlNonce[nonce]);
});

// a post to our sqrl auth url
app.post('/sqrl', function (req, res) {
    var parser = new SQRLParser(req)
    console.log('Challenge for: ' + parser.nonce);

    if (urlNonce[parser.nonce]) {

        var result = eccverify.check(parser.domain, parser.sig, parser.key);
        if (result) {
            msg = "Authentication Successful!"
            io.sockets.socket(clients[parser.nonce]).emit('response', {response: parser.results(), result: msg, status: true});
        } else {
            msg = "Authentication Failed!"
            io.sockets.socket(clients[parser.nonce]).emit('response', {response: parser.results(), result: msg, status: false});
        }

        delete urlNonce[parser.nonce];
    } else {
        msg = "Authentication Failed!";
        res.send(400);
        results = parser.results()
        results[0]['result'] = ["This nut is no longer valid"]
        io.sockets.socket(clients[parser.nonce]).emit('response', {response: results, result: msg, status: false});
    }

    res.send(result);

});

io.sockets.on('connection', function (socket) {
  socket.on('register', function(nonce){
    clients[nonce['data']] = socket.id;
  });
});

// listen on port 8080
app.listen(8080);
