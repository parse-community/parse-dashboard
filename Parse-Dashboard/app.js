'use strict';

const express = require('express');
const path = require('path');
const csrf = require('csurf');
const Authentication = require('./Authentication.js');
const fs = require('fs');
const ConfigKeyCache = require('./configKeyCache.js');
const currentVersionFeatures = require('../package.json').parseDashboardFeatures;
const Parse = require('parse/node');

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
          console.warn('An error occurred while checking for icons, please check permission!');
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

  // Parse JSON and URL-encoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
    authInstance.initialize(app, {
      cookieSessionSecret: options.cookieSessionSecret,
      cookieSessionMaxAge: options.cookieSessionMaxAge,
      cookieSessionStore: options.cookieSessionStore
    });

    // CSRF error handler
    app.use(function (err, req, res, next) {
      if (err.code !== 'EBADCSRFTOKEN') {return next(err)}

      // handle CSRF token errors here
      res.status(403);
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        res.json({ error: 'CSRF token validation failed. Please refresh the page and try again.' });
      } else {
        res.send('CSRF token validation failed. Please refresh the page and try again.');
      }
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

    // In-memory conversation storage (consider using Redis in future)
    const conversations = new Map();

    // Agent API endpoint for handling AI requests - scoped to specific app
    app.post('/apps/:appId/agent', async (req, res) => {
      try {
        const { message, modelName, conversationId, permissions } = req.body;
        const { appId } = req.params;

        if (!message || typeof message !== 'string' || message.trim() === '') {
          return res.status(400).json({ error: 'Message is required' });
        }

        if (!modelName || typeof modelName !== 'string') {
          return res.status(400).json({ error: 'Model name is required' });
        }

        if (!appId || typeof appId !== 'string') {
          return res.status(400).json({ error: 'App ID is required' });
        }

        // Check if agent configuration exists
        if (!config.agent || !config.agent.models || !Array.isArray(config.agent.models)) {
          return res.status(400).json({ error: 'No agent configuration found' });
        }

        // Find the app in the configuration
        const app = config.apps.find(app => (app.appNameForURL || app.appName) === appId);
        if (!app) {
          return res.status(404).json({ error: `App "${appId}" not found` });
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

        // Get or create conversation history
        const conversationKey = `${appId}_${conversationId || 'default'}`;
        if (!conversations.has(conversationKey)) {
          conversations.set(conversationKey, []);
        }

        const conversationHistory = conversations.get(conversationKey);

        // Array to track database operations for this request
        const operationLog = [];

        // Make request to OpenAI API with app context and conversation history
        const response = await makeOpenAIRequest(message, model, apiKey, app, conversationHistory, operationLog, permissions);

        // Update conversation history with user message and AI response
        conversationHistory.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response || 'Operation completed successfully.' }
        );

        // Keep conversation history to a reasonable size (last 20 messages)
        if (conversationHistory.length > 20) {
          conversationHistory.splice(0, conversationHistory.length - 20);
        }

        // Generate or use provided conversation ID
        const finalConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.json({
          response,
          conversationId: finalConversationId,
          debug: {
            timestamp: new Date().toISOString(),
            appId: app.appId,
            modelUsed: model,
            operations: operationLog
          }
        });

      } catch (error) {
        // Return the full error message to help with debugging
        const errorMessage = error.message || 'Provider error';
        res.status(500).json({ error: `Error: ${errorMessage}` });
      }
    });

    /**
     * Database function tools for the AI agent
     */
    const databaseTools = [
      {
        type: 'function',
        function: {
          name: 'queryClass',
          description: 'Query a Parse class/table to retrieve objects. Use this to fetch data from the database.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class to query'
              },
              where: {
                type: 'object',
                description: 'Query constraints as a JSON object (e.g., {"name": "John", "age": {"$gte": 18}})'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default 100, max 1000)'
              },
              skip: {
                type: 'number',
                description: 'Number of results to skip for pagination'
              },
              order: {
                type: 'string',
                description: 'Field to order by (prefix with \'-\' for descending, e.g., \'-createdAt\')'
              },
              include: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of pointer fields to include/populate'
              },
              select: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of fields to select (if not provided, all fields are returned)'
              }
            },
            required: ['className']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'createObject',
          description: 'Create a new object in a Parse class/table. IMPORTANT: This is a write operation that requires explicit user confirmation before execution. You must ask the user to confirm before calling this function. You MUST provide the objectData parameter with the actual field values to be saved in the object.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class to create an object in'
              },
              objectData: {
                type: 'object',
                description: 'REQUIRED: The object fields and values for the new object as a JSON object. Example: {\'model\': \'Honda Civic\', \'year\': 2023, \'brand\': \'Honda\'}. This parameter is mandatory and cannot be empty.',
                additionalProperties: true
              },
              confirmed: {
                type: 'boolean',
                description: 'Must be true to indicate user has explicitly confirmed this write operation',
                default: false
              }
            },
            required: ['className', 'objectData', 'confirmed']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'updateObject',
          description: 'Update an existing object in a Parse class/table. IMPORTANT: This is a write operation that requires explicit user confirmation before execution. You must ask the user to confirm before calling this function.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class containing the object'
              },
              objectId: {
                type: 'string',
                description: 'The objectId of the object to update'
              },
              objectData: {
                type: 'object',
                description: 'The fields to update as a JSON object'
              },
              confirmed: {
                type: 'boolean',
                description: 'Must be true to indicate user has explicitly confirmed this write operation',
                default: false
              }
            },
            required: ['className', 'objectId', 'objectData', 'confirmed']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'deleteObject',
          description: 'Delete a SINGLE OBJECT/ROW from a Parse class/table using its objectId. Use this when you want to delete one specific record/object, not the entire class. IMPORTANT: This is a destructive write operation that requires explicit user confirmation before execution. You must ask the user to confirm before calling this function.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class containing the object'
              },
              objectId: {
                type: 'string',
                description: 'The objectId of the specific object/record to delete'
              },
              confirmed: {
                type: 'boolean',
                description: 'Must be true to indicate user has explicitly confirmed this destructive operation',
                default: false
              }
            },
            required: ['className', 'objectId', 'confirmed']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getSchema',
          description: 'Get the schema information for Parse classes. Use this to understand the structure of classes/tables.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class to get schema for (optional - if not provided, returns all schemas)'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'countObjects',
          description: 'Count objects in a Parse class/table that match given constraints.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class to count objects in'
              },
              where: {
                type: 'object',
                description: 'Query constraints as a JSON object (optional)'
              }
            },
            required: ['className']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'createClass',
          description: 'Create a new Parse class/table with specified fields. This creates the class structure without any objects.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class to create'
              },
              fields: {
                type: 'object',
                description: 'Fields to define for the class as a JSON object where keys are field names and values are field types (e.g., {"name": "String", "age": "Number", "email": "String"})'
              },
              confirmed: {
                type: 'boolean',
                description: 'Must be true to indicate user has explicitly confirmed this operation',
                default: false
              }
            },
            required: ['className', 'confirmed']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'deleteClass',
          description: 'Delete an ENTIRE Parse class/table (the class itself) and ALL its data. Use this when the user wants to delete/remove the entire class/table, not individual objects. This completely removes the class schema and all objects within it. IMPORTANT: This is a highly destructive operation that permanently removes the entire class structure and all objects within it. Requires explicit user confirmation before execution.',
          parameters: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: 'The name of the Parse class/table to completely delete/remove'
              },
              confirmed: {
                type: 'boolean',
                description: 'Must be true to indicate user has explicitly confirmed this highly destructive operation',
                default: false
              }
            },
            required: ['className', 'confirmed']
          }
        }
      }
    ];

    /**
     * Execute database function calls
     */
    async function executeDatabaseFunction(functionName, args, appContext, operationLog = [], permissions = {}) {
      // Check permissions before executing write operations
      const writeOperations = ['deleteObject', 'deleteClass', 'updateObject', 'createObject', 'createClass'];

      if (writeOperations.includes(functionName)) {
        // Handle both boolean and string values for permissions
        const permissionValue = permissions && permissions[functionName];
        const hasPermission = permissionValue === true || permissionValue === 'true';

        if (!hasPermission) {
          throw new Error(`Permission denied: The "${functionName}" operation is currently disabled in the permissions settings. Please enable this permission in the Parse Dashboard Permissions menu if you want to allow this operation.`);
        }
      }

      // Configure Parse for this app context
      Parse.initialize(appContext.appId, undefined, appContext.masterKey);
      Parse.serverURL = appContext.serverURL;
      Parse.masterKey = appContext.masterKey;

      try {
        switch (functionName) {
          case 'queryClass': {
            const { className, where = {}, limit = 100, skip = 0, order, include = [], select = [] } = args;
            const query = new Parse.Query(className);

            // Apply constraints
            Object.keys(where).forEach(key => {
              const value = where[key];
              if (typeof value === 'object' && value !== null) {
                // Handle complex queries like {$gte: 18}
                Object.keys(value).forEach(op => {
                  switch (op) {
                    case '$gt': query.greaterThan(key, value[op]); break;
                    case '$gte': query.greaterThanOrEqualTo(key, value[op]); break;
                    case '$lt': query.lessThan(key, value[op]); break;
                    case '$lte': query.lessThanOrEqualTo(key, value[op]); break;
                    case '$ne': query.notEqualTo(key, value[op]); break;
                    case '$in': query.containedIn(key, value[op]); break;
                    case '$nin': query.notContainedIn(key, value[op]); break;
                    case '$exists':
                      if (value[op]) {query.exists(key);}
                      else {query.doesNotExist(key);}
                      break;
                    case '$regex': query.matches(key, new RegExp(value[op], value.$options || '')); break;
                  }
                });
              } else {
                query.equalTo(key, value);
              }
            });

            if (limit) {query.limit(Math.min(limit, 1000));}
            if (skip) {query.skip(skip);}
            if (order) {
              if (order.startsWith('-')) {
                query.descending(order.substring(1));
              } else {
                query.ascending(order);
              }
            }
            if (include.length > 0) {query.include(include);}
            if (select.length > 0) {query.select(select);}

            const results = await query.find({ useMasterKey: true });
            const resultData = results.map(obj => obj.toJSON());
            const operationSummary = {
              operation: 'queryClass',
              className,
              resultCount: results.length,
              timestamp: new Date().toISOString()
            };

            operationLog.push(operationSummary);
            return resultData;
          }

          case 'createObject': {
            const { className, objectData, confirmed } = args;

            // Validate required parameters
            if (!objectData || typeof objectData !== 'object' || Object.keys(objectData).length === 0) {
              throw new Error('Missing or empty \'objectData\' parameter. To create an object, you must provide the objectData fields and values as a JSON object. For example: {\'model\': \'Honda Civic\', \'year\': 2023, \'brand\': \'Honda\'}');
            }

            // Require explicit confirmation for write operations
            if (!confirmed) {
              throw new Error(`Creating objects requires user confirmation. The AI should ask for permission before creating objects in the ${className} class.`);
            }

            const ParseObject = Parse.Object.extend(className);
            const object = new ParseObject();

            Object.keys(objectData).forEach(key => {
              object.set(key, objectData[key]);
            });

            const result = await object.save(null, { useMasterKey: true });
            const resultData = result.toJSON();

            return resultData;
          }

          case 'updateObject': {
            const { className, objectId, objectData, confirmed } = args;

            // Require explicit confirmation for write operations
            if (!confirmed) {
              throw new Error(`Updating objects requires user confirmation. The AI should ask for permission before updating object ${objectId} in the ${className} class.`);
            }

            const query = new Parse.Query(className);
            const object = await query.get(objectId, { useMasterKey: true });

            Object.keys(objectData).forEach(key => {
              object.set(key, objectData[key]);
            });

            const result = await object.save(null, { useMasterKey: true });
            const resultData = result.toJSON();

            return resultData;
          }

          case 'deleteObject': {
            const { className, objectId, confirmed } = args;

            // Require explicit confirmation for destructive operations
            if (!confirmed) {
              throw new Error(`Deleting objects requires user confirmation. The AI should ask for permission before permanently deleting object ${objectId} from the ${className} class.`);
            }

            const query = new Parse.Query(className);
            const object = await query.get(objectId, { useMasterKey: true });

            await object.destroy({ useMasterKey: true });

            const result = { success: true, objectId };
            return result;
          }

          case 'getSchema': {
            const { className } = args;
            let result;
            if (className) {
              result = await new Parse.Schema(className).get({ useMasterKey: true });
            } else {
              result = await Parse.Schema.all({ useMasterKey: true });
            }
            return result;
          }

          case 'countObjects': {
            const { className, where = {} } = args;
            const query = new Parse.Query(className);

            Object.keys(where).forEach(key => {
              const value = where[key];
              if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(op => {
                  switch (op) {
                    case '$gt': query.greaterThan(key, value[op]); break;
                    case '$gte': query.greaterThanOrEqualTo(key, value[op]); break;
                    case '$lt': query.lessThan(key, value[op]); break;
                    case '$lte': query.lessThanOrEqualTo(key, value[op]); break;
                    case '$ne': query.notEqualTo(key, value[op]); break;
                    case '$in': query.containedIn(key, value[op]); break;
                    case '$nin': query.notContainedIn(key, value[op]); break;
                    case '$exists':
                      if (value[op]) {query.exists(key);}
                      else {query.doesNotExist(key);}
                      break;
                  }
                });
              } else {
                query.equalTo(key, value);
              }
            });

            const count = await query.count({ useMasterKey: true });

            const result = { count };
            return result;
          }

          case 'createClass': {
            const { className, fields = {}, confirmed } = args;

            // Require explicit confirmation for class creation
            if (!confirmed) {
              throw new Error(`Creating classes requires user confirmation. The AI should ask for permission before creating the ${className} class.`);
            }

            const schema = new Parse.Schema(className);

            // Add fields to the schema
            Object.keys(fields).forEach(fieldName => {
              const fieldType = fields[fieldName];
              switch (fieldType.toLowerCase()) {
                case 'string':
                  schema.addString(fieldName);
                  break;
                case 'number':
                  schema.addNumber(fieldName);
                  break;
                case 'boolean':
                  schema.addBoolean(fieldName);
                  break;
                case 'date':
                  schema.addDate(fieldName);
                  break;
                case 'array':
                  schema.addArray(fieldName);
                  break;
                case 'object':
                  schema.addObject(fieldName);
                  break;
                case 'geopoint':
                  schema.addGeoPoint(fieldName);
                  break;
                case 'file':
                  schema.addFile(fieldName);
                  break;
                default:
                  // For pointer fields or unknown types, try to add as string
                  schema.addString(fieldName);
                  break;
              }
            });

            const result = await schema.save({ useMasterKey: true });

            const resultData = { success: true, className, schema: result };
            return resultData;
          }

          case 'deleteClass': {
            const { className, confirmed } = args;

            // Require explicit confirmation for class deletion - this is highly destructive
            if (!confirmed) {
              throw new Error(`Deleting classes requires user confirmation. The AI should ask for permission before permanently deleting the ${className} class and ALL its data.`);
            }

            // Check if the class exists first
            try {
              await new Parse.Schema(className).get({ useMasterKey: true });
            } catch (error) {
              if (error.code === 103) {
                throw new Error(`Class "${className}" does not exist.`);
              }
              throw error;
            }

            // Delete the class and all its data
            const schema = new Parse.Schema(className);

            try {
              // First purge all objects from the class
              await schema.purge({ useMasterKey: true });

              // Then delete the class schema itself
              await schema.delete({ useMasterKey: true });

              const resultData = { success: true, className, message: `Class "${className}" and all its data have been permanently deleted.` };
              return resultData;
            } catch (deleteError) {
              throw new Error(`Failed to delete class "${className}": ${deleteError.message}`);
            }
          }

          default:
            throw new Error(`Unknown function: ${functionName}`);
        }
      } catch (error) {
        console.error('Database operation error:', {
          functionName,
          args,
          appId: appContext.appId,
          serverURL: appContext.serverURL,
          error: error.message,
          stack: error.stack
        });
        throw new Error(`Database operation failed: ${error.message}`);
      }
    }

    /**
     * Make a request to OpenAI API
     */
    async function makeOpenAIRequest(userMessage, model, apiKey, appContext = null, conversationHistory = [], operationLog = [], permissions = {}) {
      const fetch = (await import('node-fetch')).default;

      const url = 'https://api.openai.com/v1/chat/completions';

      const appInfo = appContext ?
        `\n\nContext: You are currently helping with the Parse Server app "${appContext.appName}" (ID: ${appContext.appId}) at ${appContext.serverURL}.` :
        '';

      // Build messages array starting with system message
      const messages = [
        {
          role: 'system',
          content: `You are an AI assistant integrated into Parse Dashboard, a data management interface for Parse Server applications.

Your role is to help users with:
- Database queries and data operations using the Parse JS SDK
- Understanding Parse Server concepts and best practices
- Troubleshooting common issues
- Best practices for data modeling
- Cloud Code and server configuration guidance

You have access to database function tools that allow you to:
- Query classes/tables to retrieve objects (read-only, no confirmation needed)
- Create new objects in classes (REQUIRES USER CONFIRMATION)
- Update existing objects (REQUIRES USER CONFIRMATION)
- Delete INDIVIDUAL objects by objectId (REQUIRES USER CONFIRMATION)
- Delete ENTIRE classes/tables and all their data (REQUIRES USER CONFIRMATION)
- Get schema information for classes (read-only, no confirmation needed)
- Count objects that match certain criteria (read-only, no confirmation needed)
- Create new empty classes/tables (REQUIRES USER CONFIRMATION)

IMPORTANT: Choose the correct function based on what the user wants to delete:
- Use 'deleteObject' when deleting a specific object/record by its objectId
- Use 'deleteClass' when deleting an entire class/table (the class itself and all its data)

CRITICAL SECURITY RULE FOR WRITE OPERATIONS:
- ANY write operation (create, update, delete) MUST have explicit user confirmation through conversation
- When a user requests a write operation, explain what you will do and ask for confirmation 
- Only call the write operation functions with confirmed=true after the user has explicitly agreed
- If a user says "Create a new class", treat this as confirmation to create objects in that class
- You CANNOT perform write operations without the user's knowledge and consent
- Read operations (query, schema, count) can be performed immediately without confirmation

Confirmation Pattern:
1. User requests operation (e.g., "Create a new class called Products")
2. You ask: "I'll create a new object in the Products class. Should I proceed?"
3. User confirms: "Yes" / "Go ahead" / "Do it"
4. You call the function with confirmed=true

When working with the database:
- Read operations (query, getSchema, count) can be performed immediately
- Write operations require the pattern: 1) Explain what you'll do, 2) Ask for confirmation, 3) Only then execute if confirmed
- Always use the provided database functions instead of writing code
- Class names are case-sensitive 
- Use proper Parse query syntax for complex queries
- Handle objectId fields correctly
- Be mindful of data types (Date, Pointer, etc.)
- Always consider security and use appropriate query constraints
- Provide clear explanations of what database operations you're performing
- If any database function returns an error, you MUST include the full error message in your response to the user. Never hide error details or give vague responses like "there was an issue" - always show the specific error message.
- IMPORTANT: When creating objects, you MUST provide the 'objectData' parameter with actual field values. Never call createObject with only className and confirmed - always include the objectData object with the fields and values to be saved.
- IMPORTANT: When updating objects, you MUST provide the 'objectData' parameter with the fields you want to update. Include the objectData object with field names and new values.

CRITICAL RULE FOR createObject FUNCTION:
- The createObject function REQUIRES THREE parameters: className, objectData, and confirmed
- The 'objectData' parameter MUST contain the actual field values as a JSON object
- NEVER call createObject with only className and confirmed - this will fail
- Example: createObject({className: 'TestCars', objectData: {model: 'Honda Civic', year: 2023, brand: 'Honda'}, confirmed: true})
- The objectData object should contain all the fields and their values that you want to save

When responding:
- Be concise and helpful
- Provide practical examples when relevant
- Ask clarifying questions if the user's request is unclear
- Focus on Parse-specific solutions and recommendations
- If you perform database operations, explain what you did and show the results
- For write operations, always explain the impact and ask for explicit confirmation
- Format your responses using Markdown for better readability:
  * Use **bold** for important information
  * Use *italic* for emphasis
  * Use \`code\` for field names, class names, and values
  * Use numbered lists for step-by-step instructions
  * Use bullet points for listing items
  * Use tables when showing structured data
  * Use code blocks with language specification for code examples
  * Use headers (##, ###) to organize longer responses
  * When listing database classes, format as a numbered list with descriptions
  * Use tables for structured data comparison

You have direct access to the Parse database through function calls, so you can query actual data and provide real-time information.${appInfo}`
        }
      ];

      // Add conversation history if it exists
      if (conversationHistory && conversationHistory.length > 0) {
        // Filter out any messages with null or undefined content to prevent API errors
        const validHistory = conversationHistory.filter(msg =>
          msg && typeof msg === 'object' && msg.role &&
          (msg.content !== null && msg.content !== undefined && msg.content !== '')
        );
        messages.push(...validHistory);
      }

      // Add the current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const requestBody = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        tools: databaseTools,
        tool_choice: 'auto',
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
        const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error)
          ? errorData.error.message
          : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data || typeof data !== 'object' || !('choices' in data) || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('No response received from OpenAI API');
      }

      const choice = data.choices[0];
      const responseMessage = choice.message;

      // Handle function calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCalls = responseMessage.tool_calls;
        const toolResponses = [];

        for (const toolCall of toolCalls) {
          if (toolCall.type === 'function') {
            try {
              const functionName = toolCall.function.name;
              const functionArgs = JSON.parse(toolCall.function.arguments);

              console.log('Executing database function:', {
                functionName,
                args: functionArgs,
                appId: appContext.appId,
                serverURL: appContext.serverURL,
                timestamp: new Date().toISOString()
              });

              // Execute the database function
              const result = await executeDatabaseFunction(functionName, functionArgs, appContext, operationLog, permissions);

              toolResponses.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                content: result ? JSON.stringify(result) : JSON.stringify({ success: true })
              });
            } catch (error) {
              toolResponses.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                content: JSON.stringify({ error: error.message || 'Unknown error occurred' })
              });
            }
          }
        }

        // Make a second request with the tool responses
        const followUpMessages = [
          ...messages,
          responseMessage,
          ...toolResponses
        ];

        const followUpRequestBody = {
          model: model,
          messages: followUpMessages,
          temperature: 0.7,
          max_tokens: 2000,
          tools: databaseTools,
          tool_choice: 'auto',
          stream: false
        };

        const followUpResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(followUpRequestBody)
        });

        if (!followUpResponse.ok) {
          throw new Error(`Follow-up request failed: ${followUpResponse.statusText}`);
        }

        const followUpData = await followUpResponse.json();

        if (!followUpData || typeof followUpData !== 'object' || !('choices' in followUpData) || !Array.isArray(followUpData.choices) || followUpData.choices.length === 0) {
          throw new Error('No follow-up response received from OpenAI API');
        }

        const followUpContent = followUpData.choices[0].message.content;
        if (!followUpContent) {
          console.warn('OpenAI returned null content in follow-up response, using fallback message');
        }
        return followUpContent || 'Done.';
      }

      const content = responseMessage.content;
      if (!content) {
        console.warn('OpenAI returned null content in initial response, using fallback message');
      }
      return content || 'Done.';
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
      let redirectURL = null;
      try {
        const url = new URL(req.url, 'http://localhost');
        redirectURL = url.searchParams.get('redirect');
      } catch (error) {
        console.warn('Invalid URL in login redirect:', error.message);
      }
      if (!users || (req.user && req.user.isAuthenticated)) {
        // Validate and sanitize redirect URL to prevent open redirect vulnerability
        if (redirectURL) {
          // Reject absolute URLs and protocol-relative URLs
          if (redirectURL.includes('://') || redirectURL.startsWith('//')) {
            redirectURL = null;
          } else {
            // Strip leading slash to prevent double slashes
            if (redirectURL.charAt(0) === '/') {
              redirectURL = redirectURL.substring(1);
            }
          }
        }
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
