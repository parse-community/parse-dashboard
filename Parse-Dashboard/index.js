/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Command line tool for npm start
'use strict'
const CLIHelper = require('./CLIHelper.js');
const startServer = require('./server');

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
program.option('--createUser', 'helper tool to allow you to generate secure user passwords and secrets. Use this on trusted devices only.');
program.option('--createMFA', 'helper tool to allow you to generate multi-factor authentication secrets.');
program.option('--cookieSessionMaxAge [cookieSessionMaxAge]', '(Optional) Sets the time in seconds for when the session cookie will be deleted and the dashboard user has to re-login; if no value is set then the cookie will be deleted when the browser session ends.');

program.action(async (options) => {
  for (const key in options) {
    const func = CLIHelper[key];
    if (func && typeof func === 'function') {
      await func();
      process.exit(0);
    }
  }
});

async function run() {
  await program.parseAsync(process.argv);
  const options = program.opts();

  startServer(options);
}

run();
