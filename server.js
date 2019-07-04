const express = require('express');
const { ParseServer } = require('parse-server');

const api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dashboard',
  appId: 'hello',
  masterKey: 'world',
  serverURL: 'http://localhost:1338/parse',
});

const app = express();
app.use('/parse', api);

const port = 1338;
const httpServer = require('http').createServer(app);

httpServer.listen(port, () => {
  console.log(`parse-server running on port: ${port}`);
});
