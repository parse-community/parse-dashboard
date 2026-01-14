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

  const explicitConfigFileProvided = !!options.config;
  let configFile = null;
  let configFromCLI = null;
  const configServerURL = options.serverURL || process.env.PARSE_DASHBOARD_SERVER_URL;
  const configGraphQLServerURL = options.graphQLServerURL || process.env.PARSE_DASHBOARD_GRAPHQL_SERVER_URL;
  const configMasterKey = options.masterKey || process.env.PARSE_DASHBOARD_MASTER_KEY;
  const configAppId = options.appId || process.env.PARSE_DASHBOARD_APP_ID;
  const configAppName = options.appName || process.env.PARSE_DASHBOARD_APP_NAME;
  const configUserId = options.userId || process.env.PARSE_DASHBOARD_USER_ID;
  const configUserPassword = options.userPassword || process.env.PARSE_DASHBOARD_USER_PASSWORD;
  const configSSLKey = options.sslKey || process.env.PARSE_DASHBOARD_SSL_KEY;
  const configSSLCert = options.sslCert || process.env.PARSE_DASHBOARD_SSL_CERT;
  const configAgent = options.agent || process.env.PARSE_DASHBOARD_AGENT;

  function handleSIGs(server, parseServerProcess, mongoDBInstance) {
    const signals = {
      'SIGINT': 2,
      'SIGTERM': 15
    };
    function shutdown(signal, value) {
      // Stop Parse Server if it's running
      if (parseServerProcess) {
        console.log('Stopping Parse Server...');
        parseServerProcess.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (parseServerProcess && !parseServerProcess.killed) {
            parseServerProcess.kill('SIGKILL');
          }
        }, 5000);
      }

      // Stop MongoDB if it's running
      if (mongoDBInstance) {
        console.log('Stopping MongoDB...');
        const MongoRunner = require('mongo-runner');
        MongoRunner.stop(mongoDBInstance).catch(err => {
          console.warn('Error stopping MongoDB:', err.message);
        });
      }

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
      // Add agent configuration from environment variables
      if (configAgent) {
        // If it's already an object (from JS config), use it directly
        if (typeof configAgent === 'object') {
          configFromCLI.data.agent = configAgent;
        } else {
          // Otherwise, try to parse it as JSON
          try {
            configFromCLI.data.agent = JSON.parse(configAgent);
          } catch (error) {
            console.error('Failed to parse PARSE_DASHBOARD_AGENT:', error.message);
            process.exit(1);
          }
        }
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

  if (allowInsecureHTTP || trustProxy || dev) {app.enable('trust proxy');}

  config.data.trustProxy = trustProxy;
  const dashboardOptions = {
    allowInsecureHTTP,
    cookieSessionSecret,
    dev,
    cookieSessionMaxAge,
    cookieSessionStore: config.data.cookieSessionStore
  };
  app.use(mountPath, parseDashboard(config.data, dashboardOptions));

  // Browser Control API for AI agent verification (development only)
  const browserControlEnabled = dev || process.env.PARSE_DASHBOARD_BROWSER_CONTROL === 'true';
  let browserControlAPI, browserEventStream, parseServerProcess, mongoDBInstance;

  // Auto-start MongoDB and Parse Server when browser-control mode is enabled
  if (browserControlEnabled) {
    const { spawn } = require('child_process');
    const MongoRunner = require('mongo-runner');
    const parseServerPort = process.env.PARSE_SERVER_PORT || 1337;
    const parseServerAppId = process.env.PARSE_SERVER_APP_ID || 'testAppId';
    const parseServerMasterKey = process.env.PARSE_SERVER_MASTER_KEY || 'testMasterKey';
    const mongoPort = process.env.MONGO_PORT || 27017;
    const parseServerDB = process.env.PARSE_SERVER_DATABASE_URI || `mongodb://localhost:${mongoPort}/parse-dashboard-test`;
    const parseServerURL = `http://localhost:${parseServerPort}/parse`;

    // Start MongoDB first
    const startMongoDB = async () => {
      try {
        console.log('Starting MongoDB instance...');
        mongoDBInstance = await MongoRunner.run({
          port: mongoPort,
          quiet: true,
          // Use a temporary directory for data
          dbpath: path.join(require('os').tmpdir(), 'parse-dashboard-mongo'),
        });
        console.log(`MongoDB started on port ${mongoPort}`);
        return true;
      } catch (error) {
        console.warn('Failed to start MongoDB:', error.message);
        console.warn('Attempting to use existing MongoDB connection...');
        return false;
      }
    };

    // Start Parse Server after MongoDB is ready
    const startParseServer = () => {
      try {
        console.log('Starting Parse Server for browser control...');
        parseServerProcess = spawn('npx', [
          'parse-server',
          '--appId', parseServerAppId,
          '--masterKey', parseServerMasterKey,
          '--databaseURI', parseServerDB,
          '--port', parseServerPort.toString(),
          '--serverURL', parseServerURL,
          '--mountPath', '/parse'
        ], {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        // Listen for Parse Server output
        parseServerProcess.stdout.on('data', (data) => {
          const output = data.toString();
          if (output.includes('parse-server running') || output.includes('listening on port')) {
            console.log(`Parse Server started at ${parseServerURL}`);
          }
        });

        parseServerProcess.stderr.on('data', (data) => {
          const error = data.toString();
          // Only log actual errors, not warnings
          if (error.includes('error') || error.includes('Error')) {
            console.error('[Parse Server]:', error);
          }
        });

        parseServerProcess.on('exit', (code) => {
          if (code !== 0 && code !== null) {
            console.error(`Parse Server exited with code ${code}`);
          }
        });

        // Auto-configure dashboard with test app pointing to Parse Server
        if (!config.data.apps || config.data.apps.length === 0) {
          config.data.apps = [{
            serverURL: parseServerURL,
            appId: parseServerAppId,
            masterKey: parseServerMasterKey,
            appName: 'Browser Control Test App'
          }];
          console.log('Dashboard auto-configured with test app');
        }
      } catch (error) {
        console.warn('Failed to start Parse Server:', error.message);
        console.warn('Browser control will work but you need to configure apps manually');
      }
    };

    // Start MongoDB, then Parse Server
    startMongoDB().then(() => {
      // Wait a bit for MongoDB to be ready
      setTimeout(startParseServer, 1000);
    });

    // Load browser control API
    try {
      const createBrowserControlAPI = require('./browser-control/BrowserControlAPI');
      const BrowserEventStream = require('./browser-control/BrowserEventStream');

      browserControlAPI = createBrowserControlAPI();
      app.use('/browser-control', browserControlAPI);
      console.log('Browser Control API enabled at /browser-control');
    } catch (error) {
      console.warn('Failed to load Browser Control API:', error.message);
    }
  }

  let server;
  if(!configSSLKey || !configSSLCert){
    // Start the server.
    server = app.listen(port, host, function () {
      console.log(`The dashboard is now available at http://${server.address().address}:${server.address().port}${mountPath}`);

      // Initialize WebSocket event stream after server starts
      if (browserControlEnabled && browserControlAPI) {
        try {
          const BrowserEventStream = require('./browser-control/BrowserEventStream');
          browserEventStream = new BrowserEventStream(server, browserControlAPI.sessionManager);
        } catch (error) {
          console.warn('Failed to initialize Browser Event Stream:', error.message);
        }
      }
    });
  } else {
    // Start the server using SSL.
    const privateKey = fs.readFileSync(configSSLKey);
    const certificate = fs.readFileSync(configSSLCert);

    server = require('https').createServer({
      key: privateKey,
      cert: certificate
    }, app).listen(port, host, function () {
      console.log(`The dashboard is now available at https://${server.address().address}:${server.address().port}${mountPath}`);

      // Initialize WebSocket event stream after server starts
      if (browserControlEnabled && browserControlAPI) {
        try {
          const BrowserEventStream = require('./browser-control/BrowserEventStream');
          browserEventStream = new BrowserEventStream(server, browserControlAPI.sessionManager);
        } catch (error) {
          console.warn('Failed to initialize Browser Event Stream:', error.message);
        }
      }
    });
  }
  handleSIGs(server, parseServerProcess, mongoDBInstance);
};
