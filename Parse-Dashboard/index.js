/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
"use strict";
const packageJson = require('package-json');
const basicAuth = require('basic-auth');
const path = require('path');
const jsonFile = require('json-file-plus');
const express = require('express');

class ParseDashboard {

  constructor(dashboardConfig) {
    if(typeof dashboardConfig === 'undefined')
    {
      dashboardConfig = {};
    }
    if(!dashboardConfig.apps)
    {
      dashboardConfig.apps = [];
    }
    this.config = { 
      apps : dashboardConfig.apps,
      users: dashboardConfig.users,
    };
  }


  //Server the provided config retrieved from request to the provided response object
  static serveConfig(config,req,res){
    var currentVersionFeatures = require('../package.json').parseDashboardFeatures;
    var newFeaturesInLatestVersion = [];
    packageJson('parse-dashboard', 'latest').then(latestPackage => {
      if (latestPackage.parseDashboardFeatures instanceof Array) {
        newFeaturesInLatestVersion = latestPackage.parseDashboardFeatures.filter(feature => {
          return currentVersionFeatures.indexOf(feature) === -1;
        });
      }
    });
    const response = {
      apps: config.apps,
      newFeaturesInLatestVersion: newFeaturesInLatestVersion,
    };
    const users = config.users;

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
  }

  serveConfigWrapper(req,res)
  {
      ParseDashboard.serveConfig(this.config,req,res);
  }
  
  app() {
    var api = express();
    // Serve public files.
    api.use("/",express.static(path.join(__dirname,'public')));

    // Serve the configuration.
    api.get('/parse-dashboard-config.json',this.serveConfigWrapper.bind(this));

    // For every other request, go to index.html. Let client-side handle the rest.
    api.get('/*', function(req, res) {
      res.sendFile(__dirname + '/index.html');
    });
    return api;
  }
  
  static runServer(config)
  {
      var api = express();

      // Serve public files.
      api.use("/",express.static(path.join(__dirname,'public')));

      // Serve the configuration.
      api.get('/parse-dashboard-config.json',function(req,res)
      {
        ParseDashboard.serveConfig(config,req,res);
      });

      // For every other request, go to index.html. Let client-side handle the rest.
      api.get('/*', function(req, res) {
        res.sendFile(__dirname + '/index.html');
      });

      // Start the server.
      api.listen(config.port);
      
      
      console.log('The dashboard is now available at http://localhost:'+config.port);
  }
}

module.exports = ParseDashboard;