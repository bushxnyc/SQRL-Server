// required modules
var express = require('express'),
    crypto = require('crypto'),
    querystring = require('querystring'),
    ecc = require('./lib/ECCVerify'),
    SQRLParser = require('./lib/SQRLParser');

var hostname = 'localhost';

// some salt for nonce
var counter = 0;

// nonce tracking for challenge verification
var urlNonce = {},
    eccverify = new ecc();

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
    res.render('index', { url: string });
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
        res.send(result);

<<<<<<< HEAD
        console.log("Key: " + url_parts.query['sqrlkey'] + " \nSignature: " + req.body['sqrlsig'] + " \nChallenge: " + challenge);

        try {
            if(ecc.Verify(challenge, signature, key)) {
                res.send(200);
            } else {
                res.send(400);
            }
        } catch (err) {
            fs.writeFile('ECCerror.error', err, function (err) {
                if (err) throw err;
                console.log('Caught Err');
            });
            res.send(500);
        }
        //delete urlNonce[nonce];
=======
        delete urlNonce[parser.nonce];
>>>>>>> 2c69685889a37e671fadbe7a653207f2164db947
    } else {
        res.send(400);
    }
});

// listen on port 8080
app.listen(8080);
