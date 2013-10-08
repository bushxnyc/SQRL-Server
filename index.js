// required modules
var express = require('express'),
    crypto = require('crypto'),
    ed25519 = require('./node_modules/ed25519/native');
    
var counter = 0;

// init express app    
var app = express();

// set ejs as template engine and html as doctype
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// set development logging to console
app.use(express.logger('dev'));

// setup static directory
app.use(express.static(__dirname + '/static'));

// a get on our root will generate a qr code with
// our sqrl url + nonce
app.get('/', function (req, res) {

  // create a new node hash object of type sha1
  // update the hash object with the current time
  // digest the hash as the nonce and append it to the sqrl url
  // pass the string to our renderer
  var hash = crypto.createHash('sha1');
  hash.update(new Date().getTime().toString() + counter, 'utf8');
  var nonce = hash.digest('hex');  
  var string = "https://sqrl.blakearnold.me/sqrl?" + nonce.toString();  
  res.render('index', { url: string });
  counter += 1;
});

// a post to our sqrl auth url
app.post('/sqrl', function (req, res) {
  // var public key
  // var signature
  // use public key to decrypt signature
  // check if post query string matches supplied query string
  // return 200 OK if they do else fail if not
});

// listen on port 8080
app.listen(8080);
