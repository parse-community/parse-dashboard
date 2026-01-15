/**
 * Browser Control Setup - Development Mode Only
 *
 * This module handles initialization of the browser-control feature for AI agents.
 * It is designed to be completely isolated from production code.
 *
 * SECURITY: This module will NOT load in production environments (NODE_ENV=production)
 */

const { spawn, execSync } = require('child_process');
const net = require('net');

/**
 * Check if a port is in use by attempting to connect to it
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is in use, false otherwise
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, '127.0.0.1');
  });
}

/**
 * Get process info using the port (for error messages)
 * @param {number} port - Port number
 * @returns {string|null} - Process info or null if not found
 */
function getProcessOnPort(port) {
  try {
    const result = execSync(`lsof -i :${port} -t 2>/dev/null || true`, { encoding: 'utf8' }).trim();
    if (result) {
      const pid = result.split('\n')[0];
      const processInfo = execSync(`ps -p ${pid} -o comm= 2>/dev/null || true`, { encoding: 'utf8' }).trim();
      return processInfo ? `${processInfo} (PID: ${pid})` : `PID: ${pid}`;
    }
  } catch {
    // Silently fail - process info is optional
  }
  return null;
}

/**
 * Initialize browser control for the dashboard
 * @param {Express.Application} app - Express app instance
 * @param {Object} config - Dashboard configuration
 * @returns {Object|null} - Setup result with initialization hook, or null if disabled
 */
function setupBrowserControl(app, config) {
  const isProduction = process.env.NODE_ENV === 'production';
  const configAllowsBrowserControl = config.data.browserControl === true;
  const envAllowsBrowserControl = process.env.PARSE_DASHBOARD_BROWSER_CONTROL === 'true';
  const explicitlyEnabled = configAllowsBrowserControl || envAllowsBrowserControl;

  const shouldEnable = explicitlyEnabled && !isProduction;

  if (explicitlyEnabled && isProduction) {
    console.error('⚠️  SECURITY WARNING: Browser Control API cannot be enabled in production (NODE_ENV=production)');
    console.error('⚠️  This is a development-only feature.');
    return null;
  }

  if (!shouldEnable) {
    return null;
  }

  let parseServerProcess = null;
  let mongoDBInstance = null;
  let browserControlAPI = null;
  let browserEventStream = null;

  // Auto-start MongoDB and Parse Server
  const { MongoCluster } = require('mongodb-runner');
  const mongoPort = parseInt(process.env.MONGO_PORT, 10) || 27017;
  const parseServerPort = parseInt(process.env.PARSE_SERVER_PORT, 10) || 1337;
  const parseServerURL = `http://localhost:${parseServerPort}/parse`;

  // Use credentials from config file if available, otherwise fall back to env vars or defaults
  const firstApp = config.data.apps && config.data.apps.length > 0 ? config.data.apps[0] : null;
  const parseServerAppId = process.env.PARSE_SERVER_APP_ID || (firstApp ? firstApp.appId : 'testAppId');
  const parseServerMasterKey = process.env.PARSE_SERVER_MASTER_KEY || (firstApp ? firstApp.masterKey : 'testMasterKey');
  const mongoVersion = process.env.MONGO_VERSION || '8.0.4';

  // Configure dashboard synchronously before parseDashboard middleware is mounted
  // to ensure the dashboard knows about the auto-started Parse Server
  if (!config.data.apps || config.data.apps.length === 0) {
    config.data.apps = [{
      serverURL: parseServerURL,
      appId: parseServerAppId,
      masterKey: parseServerMasterKey,
      appName: 'Browser Control Test App'
    }];
    console.log('Dashboard auto-configured with test app');
  } else {
    // Update existing first app's serverURL to point to the auto-started Parse Server
    config.data.apps[0].serverURL = parseServerURL;
    console.log(`Dashboard configured to use Parse Server at ${parseServerURL}`);
  }

  // Wait for MongoDB to be ready by polling for successful connections
  const waitForMongo = async (mongoUri, maxRetries = 20, delayMs = 500) => {
    const { MongoClient } = require('mongodb');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = new MongoClient(mongoUri, {
          serverSelectionTimeoutMS: 1000,
          connectTimeoutMS: 1000
        });

        await client.connect();
        await client.close();

        console.log(`MongoDB ready after ${attempt} attempt(s)`);
        return true;
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(
            `MongoDB not ready after ${maxRetries} attempts (${maxRetries * delayMs}ms): ${error.message}`
          );
        }
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  };

  // Start MongoDB first
  const startMongoDB = async () => {
    // Security check: Abort if MongoDB port is already in use
    if (await isPortInUse(mongoPort)) {
      const processInfo = getProcessOnPort(mongoPort);
      console.error(`\n⛔ SECURITY: MongoDB port ${mongoPort} is already in use${processInfo ? ` by ${processInfo}` : ''}`);
      console.error('⛔ Browser Control will not start to prevent potential conflicts or security issues.');
      console.error('⛔ Please stop the existing process or use a different port via MONGO_PORT environment variable.\n');
      return null;
    }

    try {
      console.log(`Starting MongoDB ${mongoVersion} instance on port ${mongoPort}...`);
      const os = require('os');
      mongoDBInstance = await MongoCluster.start({
        topology: 'standalone',
        version: mongoVersion,
        tmpDir: os.tmpdir(),
        args: ['--port', mongoPort.toString()],
      });
      const mongoUri = mongoDBInstance.connectionString;
      console.log(`MongoDB ${mongoVersion} started at ${mongoUri}`);
      return mongoUri;
    } catch (error) {
      console.warn('Failed to start MongoDB:', error.message);
      console.warn('Attempting to use existing MongoDB connection...');
      return null;
    }
  };

  // Start Parse Server after MongoDB is ready
  const startParseServer = async (mongoUri) => {
    // Security check: Abort if Parse Server port is already in use
    if (await isPortInUse(parseServerPort)) {
      const processInfo = getProcessOnPort(parseServerPort);
      console.error(`\n⛔ SECURITY: Parse Server port ${parseServerPort} is already in use${processInfo ? ` by ${processInfo}` : ''}`);
      console.error('⛔ Browser Control will not start Parse Server to prevent potential conflicts or security issues.');
      console.error('⛔ Please stop the existing process or use a different port via PARSE_SERVER_PORT environment variable.\n');
      return;
    }

    try {
      console.log(`Starting Parse Server for browser control on port ${parseServerPort}...`);
      parseServerProcess = spawn('npx', [
        'parse-server',
        '--appId', parseServerAppId,
        '--masterKey', parseServerMasterKey,
        '--databaseURI', mongoUri,
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
    } catch (error) {
      console.warn('Failed to start Parse Server:', error.message);
      console.warn('Browser control will work but you need to configure apps manually');
    }
  };

  // Start MongoDB, wait for it to be ready, then start Parse Server
  startMongoDB()
    .then(async (mongoUri) => {
      if (!mongoUri) {
        return;
      }

      try {
        // Wait for MongoDB to accept connections before starting Parse Server
        await waitForMongo(mongoUri);
        await startParseServer(mongoUri);
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        console.error('Parse Server will not be started');
      }
    })
    .catch(error => {
      console.error('Error in MongoDB startup sequence:', error.message);
    });

  // Load browser control API BEFORE parseDashboard middleware to bypass authentication
  try {
    const createBrowserControlAPI = require('./BrowserControlAPI');
    browserControlAPI = createBrowserControlAPI();
    app.use('/browser-control', browserControlAPI);
    console.log('Browser Control API enabled at /browser-control');
  } catch (error) {
    console.warn('Failed to load Browser Control API:', error.message);
  }

  // Cleanup function for servers
  const cleanup = () => {
    // Shutdown WebSocket server
    if (browserEventStream) {
      browserEventStream.shutdown().catch(err => {
        console.warn('Error shutting down Browser Event Stream:', err.message);
      });
    }

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
    if (mongoDBInstance) {
      console.log('Stopping MongoDB...');
      mongoDBInstance.close().catch(err => {
        console.warn('Error stopping MongoDB:', err.message);
      });
    }
  };

  // Hook to initialize WebSocket when HTTP server is ready
  const initializeWebSocket = (server) => {
    if (!browserControlAPI) {
      return;
    }

    try {
      const BrowserEventStream = require('./BrowserEventStream');
      browserEventStream = new BrowserEventStream(server, browserControlAPI.sessionManager);
    } catch (error) {
      console.warn('Failed to initialize Browser Event Stream:', error.message);
    }
  };

  // Return setup result with hooks
  return {
    cleanup,
    initializeWebSocket
  };
}

module.exports = setupBrowserControl;
