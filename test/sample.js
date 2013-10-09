// node sample d0ee296585582b7b77d3fdc3a1f12bec
var crypto = require('crypto'),
    request = require('request'),
    ecc = require('../node_modules/ed25519/native');

var nonce = 'd0ee296585582b7b77d3fdc3a1f12bec';
var msg = new Buffer(64);
msg.write('sqrl.blakearnold.me/sqrl?' + nonce);

var seed = '1234567890abcdefghij1234567890ab';

// create hash update with seed and digest returns buffer
var hash = crypto.createHash('sha256').update(seed).digest();

// 32byte keypair lengths
var keypair = ecc.MakeKeypair(hash);

// 64byte signature lengths
var signature = ecc.Sign(msg, keypair).toString();
var publicKey = keypair.publicKey.toString();
var postBody = 'sig=' + signature + '&key=' + publicKey;

var body = new Buffer(postBody);

var options = {
  url: 'http://localhost:8080/sqrl?' + nonce,
  method: 'post',
  body: postBody 
};
request(options, function (err, response, body) {
  if (err) throw err;
  console.log(response);
  console.log(body);
});
