var ecc = require('ed25519'),
    base64url = require('base64url'),
    fs  = require('fs');


var ECCVerify = function() {


    this.check = function(cha, sig, key) {

        console.log("Key: " + key + " \nSig: " + sig + " \nChallenge: " + cha);
        var challenge = new Buffer(cha),
            signature = new Buffer(base64url.toBuffer(sig)),
            key = new Buffer(base64url.toBuffer(key));


        try {
            if(ecc.Verify(challenge, signature, key)) {
                return 200;
            } else {
                return 400;
            }
        } catch (err) {
            fs.writeFile('ECCerror.error', err, function (err) {
                if (err) throw err;
                console.log('Caught Err');
            });
            return 500;
        }
    }
}


module.exports = ECCVerify;
