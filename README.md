# Overview

NodeJS SQRL Server Implmentation for testing clients. It established an socket.io link with the browser attempting to login and send the authentication response there. As well as display the components of the ed25519 crypto challenge

REQUIREMENTS
------------

express, socket.io, base64url, ejs, native module: https://github.com/dazoe/ed25519, and request for test scripts.

INSTALL
-------

    git clone http://github.com/bushxnyc/SQRL-Server.git
    cd SQRL-Server
    npm install
    node index.js
  
TODO
----

- [x] Add verification of generated nonce vs received challenge url.
- [x] Update test script to use supplied nonce from GET on url.
- [x] Created frontend feedback on auth success and failure
