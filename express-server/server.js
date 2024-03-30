const express = require('express')
const app = express()
const fs = require('fs'),
    http = require('http'),
    https = require('https');

const port = 443;

const options = {
  key: fs.readFileSync('./cert/private.pem'),
  cert: fs.readFileSync('./cert/public.pem'),
};

app.use('/', express.static('../out'));

https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});