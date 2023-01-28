/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Command line tool for npm start
'use strict'
const path = require('path');
const fs = require('fs');
const express = require('express');
const parseDashboard = require('./app');

module.exports = (options) => {
  const host = options.host || process.env.HOST || '0.0.0.0';
  const port = options.port || process.env.PORT || 4040;
  const mountPath = options.mountPath || process.env.MOUNT_PATH || '/';
  const allowInsecureHTTP = options.allowInsecureHTTP || process.env.PARSE_DASHBOARD_ALLOW_INSECURE_HTTP;
  const cookieSessionSecret = options.cookieSessionSecret || process.env.PARSE_DASHBOARD_COOKIE_SESSION_SECRET;
  const trustProxy = options.trustProxy || process.env.PARSE_DASHBOARD_TRUST_PROXY;
  const cookieSessionMaxAge = options.cookieSessionMaxAge || process.env.PARSE_DASHBOARD_COOKIE_SESSION_MAX_AGE;
  const dev = options.dev;

  if (trustProxy && allowInsecureHTTP) {
    console.log('Set only trustProxy *or* allowInsecureHTTP, not both.  Only one is needed to handle being behind a proxy.');
    process.exit(-1);
  }

  let explicitConfigFileProvided = !!options.config;
  let configFile = null;
  let configFromCLI = null;
  let configServerURL = options.serverURL || process.env.PARSE_DASHBOARD_SERVER_URL;
  let configGraphQLServerURL = options.graphQLServerURL || process.env.PARSE_DASHBOARD_GRAPHQL_SERVER_URL;
  let configMasterKey = options.masterKey || process.env.PARSE_DASHBOARD_MASTER_KEY;
  let configAppId = options.appId || process.env.PARSE_DASHBOARD_APP_ID;
  let configAppName = options.appName || process.env.PARSE_DASHBOARD_APP_NAME;
  let configUserId = options.userId || process.env.PARSE_DASHBOARD_USER_ID;
  let configUserPassword = options.userPassword || process.env.PARSE_DASHBOARD_USER_PASSWORD;
  let configSSLKey = options.sslKey || process.env.PARSE_DASHBOARD_SSL_KEY;
  let configSSLCert = options.sslCert || process.env.PARSE_DASHBOARD_SSL_CERT;

  function handleSIGs(server) {
    const signals = {
      'SIGINT': 2,
      'SIGTERM': 15
    };
    function shutdown(signal, value) {
      server.close(function () {
        console.log('server stopped by ' + signal);
        process.exit(128 + value);
      });
    }
    Object.keys(signals).forEach(function (signal) {
      process.on(signal, function () {
        shutdown(signal, signals[signal]);
      });
    });
  }

  if (!options.config && !process.env.PARSE_DASHBOARD_CONFIG) {
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
      if (configGraphQLServerURL) {
        configFromCLI.data.apps[0].graphQLServerURL = configGraphQLServerURL;
      }
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
  } else if (!options.config && process.env.PARSE_DASHBOARD_CONFIG) {
    configFromCLI = {
      data: JSON.parse(process.env.PARSE_DASHBOARD_CONFIG)
    };
  } else {
    configFile = options.config;
    if (options.appId || options.serverURL || options.masterKey || options.appName || options.graphQLServerURL) {
      console.log('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
      process.exit(3);
    }
  }

  let config = null;
  let configFilePath = null;
  if (configFile) {
    try {
      config = {
        data: JSON.parse(fs.readFileSync(configFile, 'utf8'))
      };
      configFilePath = path.dirname(configFile);
    } catch (error) {
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
    }
  } else if (configFromCLI) {
    config = configFromCLI;
  } else {
    //Failed to load default config file.
    console.log('You must provide either a config file or an app ID, Master Key, and server URL. See parse-dashboard --help for details.');
    process.exit(4);
  }

  config.data.apps.forEach(app => {
    if (!app.appName) {
      app.appName = app.appId;
    }
  });

  if (config.data.iconsFolder && configFilePath) {
    config.data.iconsFolder = path.join(configFilePath, config.data.iconsFolder);
  }

  const app = express();

  if (allowInsecureHTTP || trustProxy || dev) app.enable('trust proxy');

  config.data.trustProxy = trustProxy;
  let dashboardOptions = { allowInsecureHTTP, cookieSessionSecret, dev, cookieSessionMaxAge };
  app.use(mountPath, parseDashboard(config.data, dashboardOptions));
  let server;
  if(!configSSLKey || !configSSLCert){
    // Start the server.
    server = app.listen(port, host, function () {
      console.log(`The dashboard is now available at http://${server.address().address}:${server.address().port}${mountPath}`);
    });
  } else {
    // Start the server using SSL.
    var privateKey = fs.readFileSync(configSSLKey);
    var certificate = fs.readFileSync(configSSLCert);

    server = require('https').createServer({
      key: privateKey,
      cert: certificate
    }, app).listen(port, host, function () {
      console.log(`The dashboard is now available at https://${server.address().address}:${server.address().port}${mountPath}`);
    });
  }
  handleSIGs(server);
};
