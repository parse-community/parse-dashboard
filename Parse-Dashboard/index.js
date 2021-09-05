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
const jsonFile = require('json-file-plus');
const express = require('express');
const parseDashboard = require('./app');
const OTPAuth = require('otpauth');
const crypto = require('crypto');

const program = require('commander');
program.option('--appId [appId]', 'the app Id of the app you would like to manage.');
program.option('--masterKey [masterKey]', 'the master key of the app you would like to manage.');
program.option('--serverURL [serverURL]', 'the server url of the app you would like to manage.');
program.option('--graphQLServerURL [graphQLServerURL]', 'the GraphQL server url of the app you would like to manage.');
program.option('--dev', 'Enable development mode. This will disable authentication and allow non HTTPS connections. DO NOT ENABLE IN PRODUCTION SERVERS');
program.option('--appName [appName]', 'the name of the app you would like to manage. Optional.');
program.option('--config [config]', 'the path to the configuration file');
program.option('--host [host]', 'the host to run parse-dashboard');
program.option('--port [port]', 'the port to run parse-dashboard');
program.option('--mountPath [mountPath]', 'the mount path to run parse-dashboard');
program.option('--allowInsecureHTTP [allowInsecureHTTP]', 'set this flag when you are running the dashboard behind an HTTPS load balancer or proxy with early SSL termination.');
program.option('--sslKey [sslKey]', 'the path to the SSL private key.');
program.option('--sslCert [sslCert]', 'the path to the SSL certificate.');
program.option('--trustProxy [trustProxy]', 'set this flag when you are behind a front-facing proxy, such as when hosting on Heroku.  Uses X-Forwarded-* headers to determine the client\'s connection and IP address.');
program.option('--cookieSessionSecret [cookieSessionSecret]', 'set the cookie session secret, defaults to a random string. You should set that value if you want sessions to work across multiple server, or across restarts');
program.option('--createUser', 'helper tool to allow you to generate secure user passwords and secrets. Use this once on a trusted device only.');
program.option('--createMFA', 'helper tool to allow you to generate multi-factor authentication secrets.');

program.parse(process.argv);

const host = program.host || process.env.HOST || '0.0.0.0';
const port = program.port || process.env.PORT || 4040;
const mountPath = program.mountPath || process.env.MOUNT_PATH || '/';
const allowInsecureHTTP = program.allowInsecureHTTP || process.env.PARSE_DASHBOARD_ALLOW_INSECURE_HTTP;
const cookieSessionSecret = program.cookieSessionSecret || process.env.PARSE_DASHBOARD_COOKIE_SESSION_SECRET;
const trustProxy = program.trustProxy || process.env.PARSE_DASHBOARD_TRUST_PROXY;
const dev = program.dev;

if (trustProxy && allowInsecureHTTP) {
  console.log('Set only trustProxy *or* allowInsecureHTTP, not both.  Only one is needed to handle being behind a proxy.');
  process.exit(-1);
}

let explicitConfigFileProvided = !!program.config;
let configFile = null;
let configFromCLI = null;
let configServerURL = program.serverURL || process.env.PARSE_DASHBOARD_SERVER_URL;
let configGraphQLServerURL = program.graphQLServerURL || process.env.PARSE_DASHBOARD_GRAPHQL_SERVER_URL;
let configMasterKey = program.masterKey || process.env.PARSE_DASHBOARD_MASTER_KEY;
let configAppId = program.appId || process.env.PARSE_DASHBOARD_APP_ID;
let configAppName = program.appName || process.env.PARSE_DASHBOARD_APP_NAME;
let configUserId = program.userId || process.env.PARSE_DASHBOARD_USER_ID;
let configUserPassword = program.userPassword || process.env.PARSE_DASHBOARD_USER_PASSWORD;
let configSSLKey = program.sslKey || process.env.PARSE_DASHBOARD_SSL_KEY;
let configSSLCert = program.sslCert || process.env.PARSE_DASHBOARD_SSL_CERT;

if (program.createUser) {
  (async () => {
    const inquirer = require('inquirer');
    const result = {}
    const displayResult = {};
    const { username, password } = await inquirer.prompt([{
      type: 'input',
      name: 'username',
      message: 'Please enter the username:',
    }, {
      type: 'confirm',
      name: 'password',
      message: 'Would you like to generate a secure password?',
    }]);
    displayResult.username = username;
    result.user = username;
    if (!password) {
      const { password } = await inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: `Please enter the password for ${username}:`,
      }]);
      displayResult.password = password;
      result.pass = password
    } else {
      const password = crypto.randomBytes(20).toString('base64');
      result.pass = password;
      displayResult.password = password;
    }
    const { mfa, encrypt } = await inquirer.prompt([{
      type: 'confirm',
      name: 'encrypt',
      message: `Would you like to use encrypted passwords?`,
    }, {
      type: 'confirm',
      name: 'mfa',
      message: `Would you like to enforce multi-factor authentication for ${username}?`,
    }]);
    if (encrypt) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      result.pass = bcrypt.hashSync(result.pass, salt);
    }
    if (mfa) {
      const { app } = await inquirer.prompt([{
          type: 'input',
          name: 'app',
          message: "What is your app's name?",
      }])
      const {secret, url} = generateSecret({app, username});
      result.mfa = secret;
      displayResult.mfa = url
      showQR(displayResult.mfa)
      console.log(`Ask ${username} to install an Authenticator app and scan this QR code on their device, or open this URL:

${url}

After you've shared the QR code ${username}, it is recommended to delete any photos or records of it.`)
    }
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(JSON.stringify(displayResult));
    proc.stdin.end();
    console.log(`
Your new user details' raw credentials have been copied to your clipboard. Add the following to your Parse Dashboard config:

${JSON.stringify(result)}

`);
  if (encrypt) {
    console.log(`Be sure to set "useEncryptedPasswords": true in your config\n\n`);
  }
  })();
  return;
}
if (program.createMFA) {
  (async () => {
    const inquirer = require('inquirer');
    const { username, app } = await inquirer.prompt([{
      type: 'input',
      name: 'username',
      message: 'Please enter the name of the user you would like to create a multi-factor authentication secret for:',
    }, {
      type: 'input',
      name: 'app',
      message: "What is your app's name?",
    }]);
    const { url, secret } = generateSecret({app, username})
    showQR(url);
    console.log(`Ask ${username} to install an Authenticator app and scan this QR code on their device, or open this URL:

${url}

After you've shared the QR code ${username}, it is recommended to delete any photos or records of it.

Please add this to your dashboard config for ${username}.

"mfa":"${secret}"

`)
  })();
  return;
}

function generateSecret({app, username}) {
  const secret = new OTPAuth.Secret().base32;
  const totp = new OTPAuth.TOTP({
    issuer: app,
    label: username,
    algorithm: 'SHA256',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret)
  });
  const url = totp.toString();
  return { secret, url }
}

function showQR(text) {
  const QRCode = require('qrcode')
  QRCode.toString(text, {type:'terminal'}, (err, url) => {
    console.log(url)
  })
}

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
} else if (!program.config && process.env.PARSE_DASHBOARD_CONFIG) {
  configFromCLI = {
    data: JSON.parse(process.env.PARSE_DASHBOARD_CONFIG)
  };
} else {
  configFile = program.config;
  if (program.appId || program.serverURL || program.masterKey || program.appName || program.graphQLServerURL) {
    console.log('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
    process.exit(3);
  }
}

let p = null;
let configFilePath = null;
if (configFile) {
  p = jsonFile(configFile);
  configFilePath = path.dirname(configFile);
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

  if (config.data.iconsFolder && configFilePath) {
    config.data.iconsFolder = path.join(configFilePath, config.data.iconsFolder);
  }

  const app = express();

  if (allowInsecureHTTP || trustProxy || dev) app.enable('trust proxy');

  config.data.trustProxy = trustProxy;
  let dashboardOptions = { allowInsecureHTTP, cookieSessionSecret, dev };
  app.use(mountPath, parseDashboard(config.data, dashboardOptions));
  let server;
  if(!configSSLKey || !configSSLCert){
    // Start the server.
    server = app.listen(port, host, function () {
      console.log(`The dashboard is now available at http://${server.address().address}:${server.address().port}${mountPath}`);
    });
  } else {
    // Start the server using SSL.
    var fs = require('fs');
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
  console.log('There was a problem loading the dashboard. Exiting.', error);
  process.exit(-1);
});
