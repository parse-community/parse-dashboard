/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Command line tool for npm start

var DEFAULT_DASHBOARD_CONFIG = __dirname + '/parse-dashboard-config.json';

var program = require("commander");
program.option('--port [port]', "the port to run parse-dashboard");
program.option('--config [config]', "the path to the configuration file");
program.option('--allowInsecureHTTP [allowInsecureHTTP]', 'set that flag when parse server is behind an HTTPS load balancer/proxy');

program.parse(process.argv);

// collect the variables
var configFile = program.config || DEFAULT_DASHBOARD_CONFIG;
var port = program.port || process.env.PORT;
var allowInsecureHTTP = program.allowInsecureHTTP || process.env.PARSE_DASHBOARD_ALLOW_INSECURE_HTTP;

var packageJson = require('package-json');
var basicAuth = require('basic-auth');
var path = require('path');
var jsonFile = require('json-file-plus');
var express = require('express');
var app = express();
var currentVersionFeatures = require('../package.json').parseDashboardFeatures;

// Serve public files.
app.use(express.static(path.join(__dirname,'public')));

var newFeaturesInLatestVersion = []
packageJson('parse-dashboard').then(latestPackage => {
  if (latestPackage.parseDashboardFeatures instanceof Array) {
    newFeaturesInLatestVersion = parseDashboardFeatures.filter(feature => {
      return currentVersionFeatures.indexOf(feature) === -1;
    });
  }
});

app.get('/parse-dashboard-config.json', function(req, res) {
  jsonFile(configFile)
  .then(config => {
    config.data.apps.forEach((app) => {
      if (!app.appName) {
        return res.send({ success: false, error: 'An application is misconfigured, appName is required' });
      }
    });
    var response = {
      apps: config.data.apps,
      newFeaturesInLatestVersion: newFeaturesInLatestVersion,
    };
    var users = config.data.users;
    //If they provide auth when their config has no users, ignore the auth
    if (users) {
      var auth = basicAuth(req);
    }
    //Based on advice from Doug Wilson here:
    //https://github.com/expressjs/express/issues/2518
    var requestIsLocal =
      req.connection.remoteAddress === '127.0.0.1' ||
      req.connection.remoteAddress === '::ffff:127.0.0.1' ||
      req.connection.remoteAddress === '::1';
    if (!requestIsLocal && !req.secure && !allowInsecureHTTP) {
      //Disallow HTTP requests except on localhost, to prevent the master key from being transmitted in cleartext
      return res.send({ success: false, error: 'Parse Dashboard can only be remotely accessed via HTTPS' });
    }

    if (!requestIsLocal && !users) {
      //Accessing the dashboard over the internet can only be done with username and password
      return res.send({ success: false, error: 'Configure a user to access Parse Dashboard remotely' });
    }

    var successfulAuth =
      //they provided auth
      auth &&
      //there are configured users
      users &&
      //the provided auth matches one of the users
      users.find(user => {
        return user.user == auth.name &&
               user.pass == auth.pass
      });
    if (successfulAuth) {
      //They provided correct auth
      return res.send(response);
    }

    if (users || auth) {
      //They provided incorrect auth
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    //They didn't provide auth, and have configured the dashboard to not need auth
    //(ie. didn't supply usernames and passwords)
    if (requestIsLocal) {
      //Allow no-auth access on localhost only, if they have configured the dashboard to not need auth
      return res.json(response);
    }
    //We shouldn't get here. Fail closed.
    res.send({ success: false, error: 'Something went wrong.' });
  }, error => {
    if (error instanceof SyntaxError) {
      res.send({ success: false, error: 'Your parse-dashboard-config.json file contains invalid JSON.' });
    } else if (error.code === 'ENOENT') {
      res.send({ success: false, error: 'Your parse-dashboard-config.json file is missing.' });
    } else {
      res.send({ success: false, error: 'There was a problem with your parse-dashboard-config.json file.' });
    }
  })
  .catch(error => res.send({ success: false, error: 'There was a problem loading the dashboard.' }));
});

// For every other request, go to index.html. Let client-side handle the rest.
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Start the server, listening to port 4040.
app.listen(port || 4040);
