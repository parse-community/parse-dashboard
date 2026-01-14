const { spawn } = require('child_process');
const express = require('express');

// ESM-only modules - use .default for CommonJS compatibility
const getPortModule = require('get-port');
const getPort = getPortModule.default || getPortModule;
const fetchModule = require('node-fetch');
const fetch = fetchModule.default || fetchModule;

/**
 * ServerOrchestrator
 *
 * Manages Parse Server and Parse Dashboard instances for browser testing.
 * Handles starting servers on dynamic ports, health checks, and cleanup.
 *
 * Features:
 * - Programmatically start Parse Server via child process
 * - Start Parse Dashboard on available port
 * - Health check utilities to wait for server readiness
 * - Clean shutdown and resource cleanup
 */
class ServerOrchestrator {
  constructor() {
    this.parseServerProcess = null;
    this.dashboardServer = null;
    this.parseServerConfig = null;
    this.dashboardConfig = null;
  }

  /**
   * Start Parse Server programmatically
   * @param {Object} options - Configuration options
   * @param {number} options.port - Port for Parse Server (default: find available)
   * @param {string} options.appId - Application ID (default: 'testAppId')
   * @param {string} options.masterKey - Master key (default: 'testMasterKey')
   * @param {string} options.databaseURI - Database URI (default: 'mongodb://localhost:27017/test')
   * @param {string} options.mountPath - Mount path (default: '/parse')
   * @returns {Promise<Object>} - { process, port, serverURL, appId, masterKey }
   */
  async startParseServer(options = {}) {
    // Find available port
    const port = options.port || await getPort({ port: 1337 });
    const appId = options.appId || 'testAppId';
    const masterKey = options.masterKey || 'testMasterKey';
    const databaseURI = options.databaseURI || 'mongodb://localhost:27017/test';
    const mountPath = options.mountPath || '/parse';
    const serverURL = `http://localhost:${port}${mountPath}`;

    // Check if parse-server is available
    try {
      require.resolve('parse-server');
    } catch {
      throw new Error(
        'parse-server is not installed. Please install it with: npm install parse-server --save-dev'
      );
    }

    return new Promise((resolve, reject) => {
      // Spawn parse-server process
      const parseServer = spawn('npx', [
        'parse-server',
        '--appId', appId,
        '--masterKey', masterKey,
        '--databaseURI', databaseURI,
        '--port', port.toString(),
        '--mountPath', mountPath,
        '--serverURL', serverURL
      ], {
        stdio: 'pipe',
        env: { ...process.env }
      });

      let serverStarted = false;
      let startupOutput = '';

      // Collect stdout for diagnostics (but don't use for startup detection)
      parseServer.stdout.on('data', (data) => {
        startupOutput += data.toString();
      });

      parseServer.stderr.on('data', (data) => {
        console.error('[Parse Server Error]:', data.toString());
      });

      parseServer.on('error', (error) => {
        if (!serverStarted) {
          reject(new Error(`Failed to start Parse Server: ${error.message}`));
        }
      });

      parseServer.on('exit', (code) => {
        if (!serverStarted && code !== 0) {
          reject(new Error(`Parse Server exited with code ${code}. Output: ${startupOutput}`));
        }
      });

      // Build health check URL from configured mount path
      // Normalize mount path: ensure single leading slash, no trailing slash
      const normalizedMountPath = mountPath.startsWith('/') ? mountPath : `/${mountPath}`;
      const healthPath = normalizedMountPath.endsWith('/')
        ? `${normalizedMountPath}health`
        : `${normalizedMountPath}/health`;
      const healthUrl = `http://localhost:${port}${healthPath}`;

      // Poll health endpoint to detect when server is ready (more reliable than string matching)
      this.waitForServer(healthUrl, 20000)
        .then(() => {
          serverStarted = true;
          this.parseServerProcess = parseServer;
          this.parseServerConfig = {
            process: parseServer,
            port,
            serverURL,
            appId,
            masterKey,
            databaseURI,
            mountPath
          };
          resolve(this.parseServerConfig);
        })
        .catch(err => {
          if (!serverStarted) {
            parseServer.kill();
            reject(new Error(`Parse Server health check failed: ${err.message}. Output: ${startupOutput}`));
          }
        });
    });
  }

  /**
   * Start Parse Dashboard
   * @param {Object} parseServerConfig - Parse Server configuration from startParseServer()
   * @param {Object} options - Dashboard options
   * @param {number} options.port - Port for Dashboard (default: find available)
   * @param {string} options.appName - App name (default: 'TestApp')
   * @param {string} options.mount - Mount path (default: '/')
   * @returns {Promise<Object>} - { server, port, url }
   */
  async startDashboard(parseServerConfig, options = {}) {
    if (!parseServerConfig) {
      throw new Error('parseServerConfig is required');
    }

    // Find available port
    const port = options.port || await getPort({ port: 4040 });
    const appName = options.appName || 'TestApp';
    const mount = options.mount || '/';

    try {
      // Import Parse Dashboard app
      const ParseDashboard = require('../app');

      // Dashboard settings
      const dashboardSettings = {
        apps: [{
          serverURL: parseServerConfig.serverURL,
          appId: parseServerConfig.appId,
          masterKey: parseServerConfig.masterKey,
          appName: appName
        }],
        trustProxy: 1
      };

      // Create Express app
      const app = express();

      // Mount Parse Dashboard
      app.use(mount, ParseDashboard(dashboardSettings, { allowInsecureHTTP: true }));

      // Start server
      return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          const url = `http://localhost:${port}${mount}`;
          this.dashboardServer = server;
          this.dashboardConfig = {
            server,
            port,
            url,
            mount,
            appName,
            settings: dashboardSettings
          };

          console.log(`Parse Dashboard started at ${url}`);
          resolve(this.dashboardConfig);
        });

        // Handle errors via server's 'error' event (correct approach)
        server.on('error', (err) => {
          reject(new Error(`Failed to start Dashboard: ${err.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Failed to start Dashboard: ${error.message}`);
    }
  }

  /**
   * Wait for a server to respond to health check
   * @param {string} healthUrl - Health check URL
   * @param {number} timeout - Timeout in milliseconds (default: 10000)
   * @returns {Promise<void>}
   * @private
   */
  async waitForServer(healthUrl, timeout = 10000) {
    const startTime = Date.now();
    const interval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(healthUrl);
        if (response.ok || response.status === 200 || response.status === 404) {
          return; // Server is responding
        }
      } catch {
        // Server not ready yet, continue waiting
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Server health check timeout after ${timeout}ms`);
  }

  /**
   * Stop Parse Server
   * @returns {Promise<void>}
   */
  async stopParseServer() {
    if (!this.parseServerProcess) {
      return;
    }

    // Capture reference to avoid race conditions
    const proc = this.parseServerProcess;

    // Check if process already exited
    if (proc.exitCode !== null || proc.killed) {
      this.parseServerProcess = null;
      this.parseServerConfig = null;
      console.log('Parse Server already stopped');
      return;
    }

    return new Promise((resolve) => {
      let forceKillTimeout = null;

      // Attach exit handler BEFORE sending signals
      proc.once('exit', () => {
        // Clear the force kill timeout
        if (forceKillTimeout) {
          clearTimeout(forceKillTimeout);
        }

        // Null references exactly once
        this.parseServerProcess = null;
        this.parseServerConfig = null;
        console.log('Parse Server stopped');
        resolve();
      });

      // Try graceful shutdown first
      proc.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      forceKillTimeout = setTimeout(() => {
        // Use captured reference, not this.parseServerProcess
        if (!proc.killed && proc.exitCode === null) {
          proc.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  /**
   * Stop Parse Dashboard
   * @returns {Promise<void>}
   */
  async stopDashboard() {
    if (!this.dashboardServer) {
      return;
    }

    // Capture reference to avoid race conditions
    const server = this.dashboardServer;

    return new Promise((resolve) => {
      server.close(() => {
        this.dashboardServer = null;
        this.dashboardConfig = null;
        console.log('Parse Dashboard stopped');
        resolve();
      });
    });
  }

  /**
   * Stop all servers
   * @returns {Promise<void>}
   */
  async stopAll() {
    await Promise.all([
      this.stopDashboard(),
      this.stopParseServer()
    ]);
  }

  /**
   * Get current server status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      parseServer: this.parseServerConfig ? {
        running: true,
        port: this.parseServerConfig.port,
        serverURL: this.parseServerConfig.serverURL,
        appId: this.parseServerConfig.appId
      } : {
        running: false
      },
      dashboard: this.dashboardConfig ? {
        running: true,
        port: this.dashboardConfig.port,
        url: this.dashboardConfig.url
      } : {
        running: false
      }
    };
  }
}

module.exports = ServerOrchestrator;
