var url = require('url');


var SQRLParser = function(req) {

    var url_parts = url.parse(req.url, true);

    this.nonce = url_parts.query['nut'];
    this.sig = req.body['sqrlsig'] + "="
    this.key = url_parts.query['sqrlkey'] + "==";
    this.domain = 'localhost:8080' + req.url;

console.log(url_parts)
    this.results = function(){
        val = [];
        val.push(this.getNonce(this.nonce));
        val.push(this.getChal(this.domain));
        val.push(this.getKey(url_parts.query['sqrlkey']));
        val.push(this.getSig(req.body['sqrlsig']));
        val.push(this.getVer(url_parts.query['sqrlver']));
        return val;
    }

    this.getVer = function(version) {
        var errors = [];
        return {name: "Version", value: version, result: errors}
    }

    this.getChal = function(domain) {
        var errors = [];
        return {name: "Challenge", value: domain, result: errors}
    }

    this.getKey = function(key) {
        var errors = [];
        if (key.slice(-1) == "="){
            errors.push("All \"=\" signs should be removed from the end of this string");
        }
        if (key.length != 43 ){
            errors.push("The Key length should be exactly 43 characters");
        }
        return {name: "PublicKey", value: key, result: errors}
    }

    this.getSig = function(sig) {
        var errors = [];
        if (sig.slice(-1) == "="){
            errors.push("All \"=\" signs should be removed from the end of this string");
        }
        if (sig.length != 86 ){
            errors.push("The Signature length should be exactly 86 characters");
        }
        return {name: "Signature", value: sig, result: errors}
    }

    this.getNonce = function(nonce) {
        var errors = [];
        return {name: "Nut", value: nonce, result: errors}
    }
}

module.exports = SQRLParser;
