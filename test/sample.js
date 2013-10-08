// node sample d0ee296585582b7b77d3fdc3a1f12bec
var crypto = require('crypto'),
    ecc = require('../node_modules/ed25519/native');

var nonce = process.argv[2] | 'd0ee296585582b7b77d3fdc3a1f12bec';
var msg = new Buffer(64);
msg.write('https://sqrl.blakearnold.me/sqrl?' + nonce);

var seed = process.argv[3] | '1234567890abcdefghij1234567890ab';

// create hash update with seed and digest returns buffer
var hash = crypto.createHash('sha256').update(seed).digest();

var keypair = ecc.MakeKeypair(hash);

var signature = ecc.Sign(msg, keypair);

console.log(signature);

