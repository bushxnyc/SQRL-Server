var url = require('url');


var SQRLParser = function(req) {

    var url_parts = url.parse(req.url, true);

    this.nonce = url_parts.query['nut'];
    this.sig = req.body['sqrlsig'] + "="
    this.key = url_parts.query['sqrlkey'] + "==";
    this.domain = 'localhost:8080' + req.url;
}

module.exports = SQRLParser;
