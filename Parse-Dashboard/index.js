/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var jsonFile = require('json-file-plus');
var express = require('express');
var app = express();

// Serve public files.
app.use(express.static('Parse-Dashboard/public'));

app.get('/parse-dashboard-config.json', function(req, res) {
  jsonFile(__dirname + '/parse-dashboard-config.json')
  .then(config => res.json(config.data))
  .catch(error => {
    if (error instanceof SyntaxError) {
      res.send({ success: false, error: 'Your parse-dashboard-config.json file contains invalid JSON.' });
    } else if (error.code === 'ENOENT') {
      res.send({ success: false, error: 'Your parse-dashboard-config.json file is missing.' });
    } else {
      res.send({ success: false, error: 'There was a problem with your parse-dashboard-config.json file.' });
    }
  });
});

// For every other request, go to index.html. Let client-side handle the rest.
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Start the server, listening to port 4040.
app.listen(process.env.PORT || 4040);
