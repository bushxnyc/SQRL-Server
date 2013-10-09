// required modules
var express = require('express'),
    crypto = require('crypto'),
    ecc = require('ed25519'),
    fs = require('fs'),
    querystring = require('querystring');

// some salt for nonce
var counter = 0;

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
  var string = "https://sqrl.blakearnold.me/sqrl?" + nonce.toString();
  res.render('index', { url: string });
  counter += 1;
});

// a post to our sqrl auth url
app.post('/sqrl', function (req, res) {
  var challenge = new Buffer('sqrl.blakearnold.me' + req.url);
  var signature = new Buffer(req.body.sig);
  var key = new Buffer(req.body.key);

  console.log(req.body.sig); 

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
});

// listen on port 8080
app.listen(8080);
