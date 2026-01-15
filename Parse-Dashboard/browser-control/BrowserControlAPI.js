const express = require('express');
const BrowserSessionManager = require('./BrowserSessionManager');
const ServerOrchestrator = require('./ServerOrchestrator');

/**
 * Create Browser Control API
 *
 * Provides HTTP endpoints for AI agents to control browser sessions.
 * Exposes session management, navigation, interaction, and debugging capabilities.
 *
 * @param {Function} getWebpackState - Function to get current webpack compilation state
 * @returns {express.Router} Express router with browser control endpoints
 */
function createBrowserControlAPI(getWebpackState) {
  const router = express.Router();
  const sessionManager = new BrowserSessionManager();
  const orchestrator = new ServerOrchestrator();

  // Parse JSON bodies
  router.use(express.json());

  // Expose sessionManager for BrowserEventStream to access
  router.sessionManager = sessionManager;
  router.orchestrator = orchestrator;

  /**
   * POST /session/start
   * Create a new browser session, optionally starting Parse Server and Dashboard
   */
  router.post('/session/start', async (req, res) => {
    try {
      const {
        headless = true,
        width = 1280,
        height = 720,
        slowMo = 0,
        startServers = false,
        parseServerOptions = {},
        dashboardOptions = {}
      } = req.body;

      let parseServerInfo, dashboardInfo;

      // Start servers if requested
      if (startServers) {
        try {
          parseServerInfo = await orchestrator.startParseServer(parseServerOptions);
          dashboardInfo = await orchestrator.startDashboard(parseServerInfo, dashboardOptions);
        } catch (error) {
          return res.status(500).json({
            error: `Failed to start servers: ${error.message}`
          });
        }
      }

      // Create browser session
      const { sessionId } = await sessionManager.createSession({
        headless,
        width,
        height,
        slowMo
      });

      res.json({
        sessionId,
        dashboardUrl: dashboardInfo?.url,
        parseServerUrl: parseServerInfo?.serverURL,
        servers: startServers ? {
          parseServer: {
            port: parseServerInfo.port,
            appId: parseServerInfo.appId
          },
          dashboard: {
            port: dashboardInfo.port
          }
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /session/:sessionId
   * Clean up and destroy a browser session
   */
  router.delete('/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cleaned = await sessionManager.cleanup(sessionId);

      if (!cleaned) {
        return res.status(404).json({ error: `Session ${sessionId} not found` });
      }

      res.json({ success: true, sessionId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /session/:sessionId/status
   * Get session status and metadata
   */
  router.get('/session/:sessionId/status', (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = sessionManager.getSession(sessionId);

      res.json({
        sessionId,
        active: true,
        pageUrl: session.page.url(),
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        uptime: Date.now() - session.createdAt
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  /**
   * GET /sessions
   * Get all active sessions
   */
  router.get('/sessions', (req, res) => {
    const sessions = sessionManager.getAllSessions();
    res.json({ sessions, count: sessions.length });
  });

  /**
   * POST /session/:sessionId/navigate
   * Navigate to a URL
   */
  router.post('/session/:sessionId/navigate', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { url, waitUntil = 'networkidle2', timeout = 30000 } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'url is required' });
      }

      const { page } = sessionManager.getSession(sessionId);
      await page.goto(url, { waitUntil, timeout });

      res.json({
        success: true,
        currentUrl: page.url()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/click
   * Click an element
   */
  router.post('/session/:sessionId/click', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { selector, timeout = 5000 } = req.body;

      if (!selector) {
        return res.status(400).json({ error: 'selector is required' });
      }

      const { page } = sessionManager.getSession(sessionId);
      await page.waitForSelector(selector, { timeout });
      await page.click(selector);

      res.json({ success: true, selector });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/type
   * Type text into an input
   */
  router.post('/session/:sessionId/type', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { selector, text, timeout = 5000, delay = 0 } = req.body;

      if (!selector || text === undefined) {
        return res.status(400).json({ error: 'selector and text are required' });
      }

      const { page } = sessionManager.getSession(sessionId);
      await page.waitForSelector(selector, { timeout });

      // Clear existing text first
      await page.click(selector, { clickCount: 3 });
      await page.keyboard.press('Backspace');

      // Type new text
      await page.type(selector, text, { delay });

      res.json({ success: true, selector, text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/wait
   * Wait for a selector to appear
   */
  router.post('/session/:sessionId/wait', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { selector, timeout = 10000, visible = true } = req.body;

      if (!selector) {
        return res.status(400).json({ error: 'selector is required' });
      }

      const { page } = sessionManager.getSession(sessionId);
      const startTime = Date.now();

      await page.waitForSelector(selector, { timeout, visible });
      const duration = Date.now() - startTime;

      res.json({ success: true, selector, found: true, duration });
    } catch (error) {
      res.status(500).json({ error: error.message, found: false });
    }
  });

  /**
   * GET /session/:sessionId/screenshot
   * Take a screenshot
   */
  router.get('/session/:sessionId/screenshot', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { fullPage = 'true', encoding = 'base64' } = req.query;

      const { page } = sessionManager.getSession(sessionId);

      const screenshot = await page.screenshot({
        fullPage: fullPage === 'true',
        encoding
      });

      if (encoding === 'base64') {
        res.json({ base64: `data:image/png;base64,${screenshot}` });
      } else {
        res.type('image/png').send(screenshot);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/evaluate
   * Execute JavaScript in the page context
   */
  router.post('/session/:sessionId/evaluate', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { script } = req.body;

      if (!script) {
        return res.status(400).json({ error: 'script is required' });
      }

      const { page } = sessionManager.getSession(sessionId);

      // Wrap script in function if it's not already
      const scriptToEval = script.startsWith('function') || script.includes('=>')
        ? `(${script})()`
        : script;

      const result = await page.evaluate(scriptToEval);

      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/query
   * Query elements on the page
   */
  router.post('/session/:sessionId/query', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { selector, multiple = false } = req.body;

      if (!selector) {
        return res.status(400).json({ error: 'selector is required' });
      }

      const { page } = sessionManager.getSession(sessionId);

      if (multiple) {
        // Query multiple elements
        const elements = await page.$$eval(selector, els =>
          els.map(el => ({
            text: el.textContent?.trim(),
            visible: el.offsetParent !== null,
            tagName: el.tagName,
            className: el.className
          }))
        );
        res.json({ elements, count: elements.length });
      } else {
        // Query single element
        const element = await page.$eval(selector, el => ({
          text: el.textContent?.trim(),
          visible: el.offsetParent !== null,
          tagName: el.tagName,
          className: el.className
        })).catch(() => null);

        if (!element) {
          return res.status(404).json({ error: `Element not found: ${selector}` });
        }

        res.json({ element });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /session/:sessionId/reload
   * Reload the current page
   */
  router.post('/session/:sessionId/reload', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { waitUntil = 'networkidle2' } = req.body;

      const { page } = sessionManager.getSession(sessionId);
      await page.reload({ waitUntil });

      res.json({ success: true, currentUrl: page.url() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /servers/status
   * Get status of Parse Server and Dashboard
   */
  router.get('/servers/status', (req, res) => {
    const status = orchestrator.getStatus();
    res.json(status);
  });

  /**
   * GET /ready
   * Check if the dashboard is ready (webpack compiled, assets available)
   * Returns ready: true when webpack is not compiling, false otherwise
   */
  router.get('/ready', (req, res) => {
    const webpackState = getWebpackState ? getWebpackState() : { isCompiling: false };
    const ready = !webpackState.isCompiling;

    res.json({
      ready,
      webpack: {
        compiling: webpackState.isCompiling,
        lastCompilationTime: webpackState.lastCompilationTime,
        lastCompilationDuration: webpackState.lastCompilationDuration,
        compileCount: webpackState.compileCount,
        hasErrors: webpackState.errors && webpackState.errors.length > 0,
      }
    });
  });

  /**
   * GET /ready/wait
   * Wait for the dashboard to be ready (webpack compiled)
   * Polls until webpack is done compiling or timeout is reached
   */
  router.get('/ready/wait', async (req, res) => {
    const timeout = parseInt(req.query.timeout, 10) || 30000;
    const pollInterval = 100;
    const startTime = Date.now();

    const checkReady = () => {
      const webpackState = getWebpackState ? getWebpackState() : { isCompiling: false };
      return !webpackState.isCompiling;
    };

    // Poll until ready or timeout
    while (!checkReady()) {
      if (Date.now() - startTime > timeout) {
        const webpackState = getWebpackState ? getWebpackState() : {};
        return res.status(408).json({
          ready: false,
          error: 'Timeout waiting for webpack to finish compiling',
          waited: Date.now() - startTime,
          webpack: {
            compiling: webpackState.isCompiling,
            compileCount: webpackState.compileCount,
          }
        });
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    const webpackState = getWebpackState ? getWebpackState() : {};
    res.json({
      ready: true,
      waited: Date.now() - startTime,
      webpack: {
        compiling: false,
        lastCompilationTime: webpackState.lastCompilationTime,
        lastCompilationDuration: webpackState.lastCompilationDuration,
        compileCount: webpackState.compileCount,
      }
    });
  });

  /**
   * POST /servers/stop
   * Stop Parse Server and Dashboard
   */
  router.post('/servers/stop', async (req, res) => {
    try {
      await orchestrator.stopAll();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /cleanup
   * Clean up all sessions and servers
   */
  router.post('/cleanup', async (req, res) => {
    try {
      await sessionManager.cleanupAll();
      await orchestrator.stopAll();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cleanup on process exit
  const cleanup = async () => {
    console.log('Browser Control API shutting down...');
    await sessionManager.shutdown();
    await orchestrator.stopAll();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  return router;
}

module.exports = createBrowserControlAPI;
