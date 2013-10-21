// required modules
var crypto = require('crypto'),
    express = require('express'),
    ecc = require('./lib/ECCVerify'),
    querystring = require('querystring'),
    SQRLParser = require('./lib/SQRLParser'),
    fs = require('fs'),
    https = require('https');

// Server name to host service from
var hostname = 'sqrl.vbssi.com';

// directory with ssl cert files
var keys_dir = './certs/';

// some salt for nonce
var counter = 0;

// nonce tracking for challenge verification
var urlNonce = {},
    eccverify = new ecc(),
    clients = {};

// init express app
var app = express()
    ,server = require('http').createServer(app).listen(3000)
    ,io = require('socket.io').listen(server);

server_options = {
  key  : fs.readFileSync(keys_dir + 'server.pem'),
  cert : fs.readFileSync(keys_dir + 'server.crt')
}

https.createServer(server_options,app).listen(443);

// set development logging to console
app.use(express.logger('dev'));

// use body parser to get post data
app.use(express.bodyParser());

// set ejs as template engine and html as doctype
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// setup static directory
app.use(express.static(__dirname + '/static'));

var getScheme = function(req) {
    if (typeof req.connection.encrypted == "object") {
        return "sqrl://"
    } else {
        return "qrl://"
    }
}


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
    var string = getScheme(req) + hostname + '/sqrl?nut=' + nonce.toString();
    res.render('index', { url: string, nonce: nonce.toString(), hostname: hostname });
    counter += 1;
    urlNonce[nonce] = new Date().getTime();
    console.log('Generated nonce: ' + nonce +
        ' with timestamp: ' + urlNonce[nonce]);
});

// a post to our sqrl auth url
app.post('*/sqrl', function (req, res) {
    var parser = new SQRLParser(req, hostname)
    console.log('Challenge for: ' + parser.nonce);

    if (urlNonce[parser.nonce]) {

        var result = eccverify.check(parser.domain, parser.sig, parser.key);
        if (result == 200) {
            msg = "Authentication Successful!"
            io.sockets.socket(clients[parser.nonce]).emit('response', {response: parser.results(), result: msg, status: true});
        } else {
            msg = "Authentication Failed! (Challenge Failed Verification)"
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
app.listen(80);
