/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Command line tool for npm start
"use strict"
const packageJson = require('package-json');
const basicAuth = require('basic-auth');
const path = require('path');
const jsonFile = require('json-file-plus');
const express = require('express');

const program = require('commander');
program.option('--appId [appId]', 'the app Id of the app you would like to manage.');
program.option('--masterKey [masterKey]', 'the master key of the app you would like to manage.');
program.option('--serverURL [serverURL]', 'the server url of the app you would like to manage.');
program.option('--appName [appName]', 'the name of the app you would like to manage. Optional.');
program.option('--config [config]', 'the path to the configuration file');
program.option('--port [port]', 'the port to run parse-dashboard');
program.option('--allowInsecureHTTP [allowInsecureHTTP]', 'set this flag when you are running the dashboard behind an HTTPS load balancer or proxy with early SSL termination.');

program.parse(process.argv);

const currentVersionFeatures = require('../package.json').parseDashboardFeatures;

var newFeaturesInLatestVersion = [];
packageJson('parse-dashboard', 'latest').then(latestPackage => {
  if (latestPackage.parseDashboardFeatures instanceof Array) {
    newFeaturesInLatestVersion = latestPackage.parseDashboardFeatures.filter(feature => {
      return currentVersionFeatures.indexOf(feature) === -1;
    });
  }
});

const port = program.port || process.env.PORT || 4040;
const allowInsecureHTTP = program.allowInsecureHTTP || process.env.PARSE_DASHBOARD_ALLOW_INSECURE_HTTP;

let explicitConfigFileProvided = !!program.config;
let configFile = null;
let configFromCLI = null;
let configServerURL = program.serverURL || process.env.PARSE_DASHBOARD_SERVER_URL;
let configMasterKey = program.masterKey || process.env.PARSE_DASHBOARD_MASTER_KEY;
let configAppId = program.appId || process.env.PARSE_DASHBOARD_APP_ID;
let configAppName = program.appName || process.env.PARSE_DASHBOARD_APP_NAME;
let configUserId = program.userId || process.env.PARSE_DASHBOARD_USER_ID;
let configUserPassword = program.userPassword || process.env.PARSE_DASHBOARD_USER_PASSWORD;
if (!program.config && !process.env.PARSE_DASHBOARD_CONFIG) {
  if (configServerURL && configMasterKey && configAppId) {
    configFromCLI = {
      data: {
        apps: [
          {
            appId: configAppId,
            serverURL: configServerURL,
            masterKey: configMasterKey,
            appName: configAppName,
          },
        ]
      }
    };
    if (configUserId && configUserPassword) {
      configFromCLI.data.users = [
        {
          user: configUserId,
          pass: configUserPassword,
        }
      ];
    }
  } else if (!configServerURL && !configMasterKey && !configAppName) {
    configFile = path.join(__dirname, 'parse-dashboard-config.json');
  }
} else if (!program.config && process.env.PARSE_DASHBOARD_CONFIG) {
  configFromCLI = {
    data: JSON.parse(process.env.PARSE_DASHBOARD_CONFIG)
  };
} else {
  configFile = program.config;
  if (program.appId || program.serverURL || program.masterKey || program.appName) {
    console.log('You must provide either a config file or required CLI options (app ID, Master Key, and server URL); not both.');
    process.exit(3);
  }
}

let p = null;
if (configFile) {
  p = jsonFile(configFile);
} else if (configFromCLI) {
  p = Promise.resolve(configFromCLI);
} else {
  //Failed to load default config file.
  console.log('You must provide either a config file or an app ID, Master Key, and server URL. See parse-dashboard --help for details.');
  process.exit(4);
}
p.then(config => {
  config.data.apps.forEach(app => {
    if (!app.appName) {
      app.appName = app.appId;
    }
  });

  const app = express();

  // Serve public files.
  app.use(express.static(path.join(__dirname,'public')));

  // Serve the configuration.
  app.get('/parse-dashboard-config.json', function(req, res) {
    const response = {
      apps: config.data.apps,
      newFeaturesInLatestVersion: newFeaturesInLatestVersion,
    };
    const users = config.data.users;

    let auth = null;
    //If they provide auth when their config has no users, ignore the auth
    if (users) {
      auth = basicAuth(req);
    }

    //Based on advice from Doug Wilson here:
    //https://github.com/expressjs/express/issues/2518
    const requestIsLocal =
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

    const successfulAuth =
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
      return res.json(response);
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
  });

  // For every other request, go to index.html. Let client-side handle the rest.
  app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  // Start the server.
  app.listen(port);

  console.log(`The dashboard is now available at http://localhost:${port}/`);
}, error => {
  if (error instanceof SyntaxError) {
    console.log('Your config file contains invalid JSON. Exiting.');
    process.exit(1);
  } else if (error.code === 'ENOENT') {
    if (explicitConfigFileProvided) {
      console.log('Your config file is missing. Exiting.');
      process.exit(2);
    } else {
      console.log('You must provide either a config file or required CLI options (app ID, Master Key, and server URL); not both.');
      process.exit(3);
    }
  } else {
    console.log('There was a problem with your config. Exiting.');
    process.exit(-1);
  }
})
.catch(error => {
  console.log('There was a problem loading the dashboard. Exiting.');
  process.exit(-1);
});
