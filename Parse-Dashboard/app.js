'use strict';
const express = require('express');
const basicAuth = require('basic-auth');
const path = require('path');
const packageJson = require('package-json');
var fs = require('fs');

const currentVersionFeatures = require('../package.json').parseDashboardFeatures;

var newFeaturesInLatestVersion = [];
packageJson('parse-dashboard', 'latest').then(latestPackage => {
  if (latestPackage.parseDashboardFeatures instanceof Array) {
    newFeaturesInLatestVersion = latestPackage.parseDashboardFeatures.filter(feature => {
      return currentVersionFeatures.indexOf(feature) === -1;
    });
  }
});

function getMount(req) {
  let url = req.url;
  let originalUrl = req.originalUrl;
  var mountPathLength = req.originalUrl.length - req.url.length;
  var mountPath = req.originalUrl.slice(0, mountPathLength);
  if (!mountPath.endsWith('/')) {
    mountPath += '/';
  }
  return mountPath;
}

function checkIfIconsExistForApps(apps, iconsFolder) {
  for (var i in apps) {
    var currentApp = apps[i];
    var iconName = currentApp.iconName;
    var path = iconsFolder + "/" + iconName;

    fs.stat(path, function(err, stat) {
      if (err) {
          if ('ENOENT' == err.code) {// file does not exist
              console.warn("Icon with file name: " + iconName +" couldn't be found in icons folder!");
          } else {
            console.log(
              'An error occurd while checking for icons, please check permission!');
          }
      } else {
          //every thing was ok so for example you can read it and send it to client
      }
  } );
  }
}

module.exports = function(config, allowInsecureHTTP) {
  var app = express();
  // Serve public files.
  app.use(express.static(path.join(__dirname,'public')));

  // Serve the configuration.
  app.get('/parse-dashboard-config.json', function(req, res) {
    let response = {
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

    let appsUserHasAccess = null;
    let bcrypt = require('bcryptjs');

    const successfulAuth =
      //they provided auth
      auth &&
      //there are configured users
      users &&
      //the provided auth matches one of the users
      users.find(user => {
        let isAuthorized = user.user == auth.name &&
                          (user.pass == auth.pass ||
                           bcrypt.compareSync(auth.pass, user.pass));
        if (isAuthorized) {
          // User restricted apps
          appsUserHasAccess = user.apps
        }

        return isAuthorized
      });

    if (successfulAuth) {
      if(appsUserHasAccess) {
        // Restric access to apps defined in user dictionary
        // If they didn't supply any app id, user will access all apps
        response.apps = response.apps.filter(function (app) {
          return appsUserHasAccess.find(appUserHasAccess => {
            return app.appId == appUserHasAccess.appId
          })
        });
      }
      // They provided correct auth
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

  // Serve the app icons. Uses the optional `iconsFolder` parameter as
  // directory name, that was setup in the config file.
  // We are explicitly not using `__dirpath` here because one may be
  // running parse-dashboard from globally installed npm.
  if (config.iconsFolder) {
    try {
      var stat = fs.statSync(config.iconsFolder);
      if (stat.isDirectory()) {
        app.use('/appicons', express.static(config.iconsFolder));
        //Check also if the icons really exist
        checkIfIconsExistForApps(config.apps, config.iconsFolder);
      }
    } catch (e) {
      // Directory doesn't exist or something.
      console.warn("Iconsfolder at path: " + config.iconsFolder +
        " not found!");
    }
  }

  // For every other request, go to index.html. Let client-side handle the rest.
  app.get('/*', function(req, res) {
    let mountPath = getMount(req);
    res.send(`<!DOCTYPE html>
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="${mountPath}favicon.ico" />
        <base href="${mountPath}"/>
        <script>
          PARSE_DASHBOARD_PATH = "${mountPath}";
        </script>
      </head>
      <html>
        <title>Parse Dashboard</title>
        <body>
          <div id="browser_mount"></div>
          <script src="${mountPath}bundles/dashboard.bundle.js"></script>
        </body>
      </html>
    `);
  });

  return app;
}
