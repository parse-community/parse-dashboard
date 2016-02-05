var express = require('express');
var app = express();

// Serve public files.
app.use(express.static('Parse-Dashboard/public'));

app.get('/parse-dashboard-config.json', function(req, res) {
  res.sendFile(__dirname + '/parse-dashboard-config.json');
});

// For every other request, go to index.html. Let client-side handle the rest.
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Start the server, listening to port 4040.
app.listen(4040);
