'use strict';

const express = require('express');
const path = require('path');
const csrf = require('csurf');
const Authentication = require('./Authentication.js');
const fs = require('fs');
const ConfigKeyCache = require('./configKeyCache.js');
const currentVersionFeatures = require('../package.json').parseDashboardFeatures;

let newFeaturesInLatestVersion = [];

/**
 * Gets the new features in the latest version of Parse Dashboard.
 */
async function getNewFeaturesInLatestVersion() {
  try {
    // Get latest version
    const packageJson = (await import('package-json')).default;
    const latestPackage = await packageJson('parse-dashboard', { version: 'latest', fullMetadata: true });

    if (latestPackage.parseDashboardFeatures instanceof Array) {
      newFeaturesInLatestVersion = latestPackage.parseDashboardFeatures.filter(feature => {
        return currentVersionFeatures.indexOf(feature) === -1;
      });
    }
  } catch {
    // Fail silently if fetching the latest package information fails
    newFeaturesInLatestVersion = [];
  }
}
getNewFeaturesInLatestVersion().catch(() => {})

function getMount(mountPath) {
  mountPath = mountPath || '';
  if (!mountPath.endsWith('/')) {
    mountPath += '/';
  }
  return mountPath;
}

function checkIfIconsExistForApps(apps, iconsFolder) {
  for (const i in apps) {
    const currentApp = apps[i];
    const iconName = currentApp.iconName;
    const path = iconsFolder + '/' + iconName;

    fs.stat(path, function(err) {
      if (err) {
        if ('ENOENT' == err.code) {// file does not exist
          console.warn('Icon with file name: ' + iconName + ' couldn\'t be found in icons folder!');
        } else {
          console.log(
            'An error occurd while checking for icons, please check permission!');
        }
      } else {
        //every thing was ok so for example you can read it and send it to client
      }
    });
  }
}

module.exports = function(config, options) {
  options = options || {};
  const app = express();
  // Serve public files.
  app.use(express.static(path.join(__dirname,'public')));

  // Allow setting via middleware
  if (config.trustProxy && app.disabled('trust proxy')) {
    app.enable('trust proxy');
  }

  // wait for app to mount in order to get mountpath
  app.on('mount', function() {
    const mountPath = getMount(app.mountpath);
    const users = config.users;
    const useEncryptedPasswords = config.useEncryptedPasswords ? true : false;
    const authInstance = new Authentication(users, useEncryptedPasswords, mountPath);
    authInstance.initialize(app, { cookieSessionSecret: options.cookieSessionSecret, cookieSessionMaxAge: options.cookieSessionMaxAge });

    // CSRF error handler
    app.use(function (err, req, res, next) {
      if (err.code !== 'EBADCSRFTOKEN') {return next(err)}

      // handle CSRF token errors here
      res.status(403)
      res.send('form tampered with')
    });

    // Serve the configuration.
    app.get('/parse-dashboard-config.json', async (req, res) => {
      const apps = config.apps.map((app) => Object.assign({}, app)); // make a copy
      const response = {
        apps,
        newFeaturesInLatestVersion,
        agent: config.agent,
      };

      //Based on advice from Doug Wilson here:
      //https://github.com/expressjs/express/issues/2518
      const requestIsLocal =
        req.connection.remoteAddress === '127.0.0.1' ||
        req.connection.remoteAddress === '::ffff:127.0.0.1' ||
        req.connection.remoteAddress === '::1';
      if (!options.dev && !requestIsLocal) {
        if (!req.secure && !options.allowInsecureHTTP) {
          //Disallow HTTP requests except on localhost, to prevent the master key from being transmitted in cleartext
          return res.send({ success: false, error: 'Parse Dashboard can only be remotely accessed via HTTPS' });
        }

        if (!users) {
          //Accessing the dashboard over the internet can only be done with username and password
          return res.send({ success: false, error: 'Configure a user to access Parse Dashboard remotely' });
        }
      }
      const authentication = req.user;

      const successfulAuth = authentication && authentication.isAuthenticated;
      const appsUserHasAccess = authentication && authentication.appsUserHasAccessTo;
      const isReadOnly = authentication && authentication.isReadOnly;
      // User is full read-only, replace the masterKey by the read-only one
      if (isReadOnly) {
        response.apps = response.apps.map((app) => {
          app.masterKey = app.readOnlyMasterKey;
          if (!app.masterKey) {
            throw new Error('You need to provide a readOnlyMasterKey to use read-only features.');
          }
          return app;
        });
      }
      if (successfulAuth) {
        if (appsUserHasAccess) {
          const processedApps = await Promise.all(
            response.apps.map(async (app) => {
              const matchingAccess = appsUserHasAccess.find(
                (access) => access.appId === app.appId
              );

              if (!matchingAccess) {
                return null;
              }

              if (matchingAccess.readOnly) {
                app.masterKey = app.readOnlyMasterKey;
              }

              if (typeof app.masterKey === 'function') {
                app.masterKey = await ConfigKeyCache.get(app.appId, 'masterKey', app.masterKeyTtl, app.masterKey);
              }

              return app;
            })
          );

          response.apps = processedApps.filter((app) => app !== null);
        }
        // They provided correct auth
        return res.json(response);
      }

      if (users) {
        //They provided incorrect auth
        return res.sendStatus(401);
      }

      //They didn't provide auth, and have configured the dashboard to not need auth
      //(ie. didn't supply usernames and passwords)
      if (requestIsLocal || options.dev) {
        //Allow no-auth access on localhost only, if they have configured the dashboard to not need auth
        await Promise.all(
          response.apps.map(async (app) => {
            if (typeof app.masterKey === 'function') {
              app.masterKey = await ConfigKeyCache.get(app.appId, 'masterKey', app.masterKeyTtl, app.masterKey);
            }
          })
        );

        return res.json(response);
      }
      //We shouldn't get here. Fail closed.
      res.send({ success: false, error: 'Something went wrong.' });
    });

    // Agent API endpoint for handling AI requests
    app.post('/agent', csrf(), async (req, res) => {
      try {
        const { message, modelName } = req.body;
        
        if (!message || typeof message !== 'string' || message.trim() === '') {
          return res.status(400).json({ error: 'Message is required' });
        }

        if (!modelName || typeof modelName !== 'string') {
          return res.status(400).json({ error: 'Model name is required' });
        }

        // Check if agent configuration exists
        if (!config.agent || !config.agent.models || !Array.isArray(config.agent.models)) {
          return res.status(400).json({ error: 'No agent configuration found' });
        }

        // Find the requested model
        const modelConfig = config.agent.models.find(model => model.name === modelName);
        if (!modelConfig) {
          return res.status(400).json({ error: `Model "${modelName}" not found in configuration` });
        }

        // Validate model configuration
        const { provider, model, apiKey } = modelConfig;
        if (!provider || !model || !apiKey) {
          return res.status(400).json({ error: 'Model configuration is incomplete' });
        }

        if (apiKey === 'xxxxx' || apiKey.includes('xxx')) {
          return res.status(400).json({ error: 'Please replace the placeholder API key with your actual API key' });
        }

        // Only support OpenAI for now
        if (provider.toLowerCase() !== 'openai') {
          return res.status(400).json({ error: `Provider "${provider}" is not supported yet` });
        }

        // Make request to OpenAI API
        const response = await makeOpenAIRequest(message, model, apiKey);
        res.json({ response });

      } catch (error) {
        console.error('Agent API error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    });

    /**
     * Make a request to OpenAI API
     */
    async function makeOpenAIRequest(message, model, apiKey) {
      const fetch = (await import('node-fetch')).default;
      
      const url = 'https://api.openai.com/v1/chat/completions';
      
      const messages = [
        {
          role: 'system',
          content: `You are an AI assistant integrated into Parse Dashboard, a data management interface for Parse Server applications.

Your role is to help users with:
- Database queries and data operations
- Understanding Parse Server concepts
- Troubleshooting common issues
- Best practices for data modeling
- Cloud Code and server configuration

When responding:
- Be concise and helpful
- Provide practical examples when relevant
- Ask clarifying questions if the user's request is unclear
- Focus on Parse-specific solutions and recommendations

You have access to the user's Parse Dashboard interface, so you can reference their database schema, classes, and data when appropriate.`
        },
        {
          role: 'user',
          content: message
        }
      ];

      const requestBody = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your API key permissions.');
        } else if (response.status >= 500) {
          throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response received from OpenAI API');
      }

      return data.choices[0].message.content;
    }

    // Serve the app icons. Uses the optional `iconsFolder` parameter as
    // directory name, that was setup in the config file.
    // We are explicitly not using `__dirpath` here because one may be
    // running parse-dashboard from globally installed npm.
    if (config.iconsFolder) {
      try {
        const stat = fs.statSync(config.iconsFolder);
        if (stat.isDirectory()) {
          app.use('/appicons', express.static(config.iconsFolder));
          //Check also if the icons really exist
          checkIfIconsExistForApps(config.apps, config.iconsFolder);
        }
      } catch {
        // Directory doesn't exist or something.
        console.warn('Iconsfolder at path: ' + config.iconsFolder +
          ' not found!');
      }
    }

    app.get('/login', csrf(), function(req, res) {
      const redirectURL = req.url.includes('?redirect=') && req.url.split('?redirect=')[1].length > 1 && req.url.split('?redirect=')[1];
      if (!users || (req.user && req.user.isAuthenticated)) {
        return res.redirect(`${mountPath}${redirectURL || 'apps'}`);
      }

      let errors = req.flash('error');
      if (errors && errors.length) {
        errors = `<div id="login_errors" style="display: none;">
          ${errors.join(' ')}
        </div>`
      }
      res.send(`<!DOCTYPE html>
      <html>
        <head>
          <link rel="shortcut icon" type="image/x-icon" href="${mountPath}favicon.ico" />
          <base href="${mountPath}"/>
          <script>
            PARSE_DASHBOARD_PATH = "${mountPath}";
          </script>
          <title>Parse Dashboard</title>
        </head>
        <body>
          <div id="login_mount"></div>
          ${errors}
          <script id="csrf" type="application/json">"${req.csrfToken()}"</script>
          <script src="${mountPath}bundles/login.bundle.js"></script>
        </body>
      </html>
      `);
    });

    // For every other request, go to index.html. Let client-side handle the rest.
    app.get('/*', function(req, res) {
      if (users && (!req.user || !req.user.isAuthenticated)) {
        const redirect = req.url.replace('/login', '');
        if (redirect.length > 1) {
          return res.redirect(`${mountPath}login?redirect=${redirect}`);
        }
        return res.redirect(`${mountPath}login`);
      }
      if (users && req.user && req.user.matchingUsername) {
        res.append('username', req.user.matchingUsername);
      }
      res.send(`<!DOCTYPE html>
      <html>
        <head>
          <link rel="shortcut icon" type="image/x-icon" href="${mountPath}favicon.ico" />
          <base href="${mountPath}"/>
          <script>
            PARSE_DASHBOARD_PATH = "${mountPath}";
            PARSE_DASHBOARD_ENABLE_RESOURCE_CACHE = ${config.enableResourceCache ? 'true' : 'false'};
          </script>
          <title>Parse Dashboard</title>
        </head>
        <body>
          <div id="browser_mount"></div>
          <script src="${mountPath}bundles/dashboard.bundle.js"></script>
        </body>
      </html>
      `);
    });
  });

  return app;
}
