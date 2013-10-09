// node sample d0ee296585582b7b77d3fdc3a1f12bec

var crypto = require('crypto'),
    querystring = require('querystring'),
    request = require('request'),
    ecc = require('ed25519');

var nonce = 'd0ee296585582b7b77d3fdc3a1f12bec',
    msg = new Buffer('sqrl.blakearnold.me/sqrl?' + nonce);

// create hash update with seed and digest returns buffer
var seed = '1234567890abcdefghij1234567890ab',
    hash = crypto.createHash('sha256').update(seed).digest();

// 32byte keypair lengths
var keypair = ecc.MakeKeypair(hash);

// 64byte signature lengths
var signature = ecc.Sign(msg, keypair);

var post_data = {
  sig: signature.toJSON(),
  key: keypair.publicKey.toJSON()
};

var options = {
  url: 'http://localhost:8080/sqrl?' + nonce,
  method: 'post',
  form: post_data,
};
request(options, function (err, response, body) {
  if (err) throw err;
  console.log(body);
});
