const EventEmitter = require('events');
const puppeteer = require('puppeteer');

/**
 * BrowserSessionManager
 *
 * Manages persistent Puppeteer browser instances for AI agent verification.
 * Each session represents an isolated browser with its own page and event listeners.
 *
 * Features:
 * - Create/manage multiple browser sessions
 * - Track session activity with automatic timeout
 * - Capture console logs, errors, and network events
 * - Handle browser crashes with recovery logic
 */
class BrowserSessionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.sessions = new Map(); // sessionId -> { browser, page, metadata }
    this.sessionTimeout = options.sessionTimeout || 30 * 60 * 1000; // 30 minutes default
    this.maxSessions = options.maxSessions || 5;

    // Start cleanup interval to remove inactive sessions
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Check every minute
  }

  /**
   * Create a new browser session
   * @param {Object} options - Configuration options
   * @param {boolean} options.headless - Run in headless mode (default: true)
   * @param {number} options.width - Browser width (default: 1280)
   * @param {number} options.height - Browser height (default: 720)
   * @param {number} options.slowMo - Slow down operations by N milliseconds
   * @returns {Promise<Object>} - { sessionId, page, browser }
   */
  async createSession(options = {}) {
    // Check session limit
    if (this.sessions.size >= this.maxSessions) {
      throw new Error(`Maximum number of sessions (${this.maxSessions}) reached`);
    }

    const headless = options.headless ?? (process.env.BROWSER_HEADLESS !== 'false');
    const slowMo = options.slowMo || parseInt(process.env.BROWSER_SLOW_MO) || 0;

    try {
      // Launch Puppeteer browser
      const browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        defaultViewport: {
          width: options.width || 1280,
          height: options.height || 720
        },
        slowMo
      });

      // Create new page
      const page = await browser.newPage();

      // Generate unique session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Set up event listeners
      this.attachPageListeners(sessionId, page);

      // Handle browser disconnect/crash
      browser.on('disconnected', () => {
        this.handleBrowserCrash(sessionId);
      });

      // Store session
      const sessionData = {
        browser,
        page,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        options,
        crashed: false
      };
      this.sessions.set(sessionId, sessionData);

      this.emit('session-created', { sessionId, options });

      return { sessionId, page, browser };
    } catch (error) {
      throw new Error(`Failed to create browser session: ${error.message}`);
    }
  }

  /**
   * Attach event listeners to page for logging and debugging
   * @private
   */
  attachPageListeners(sessionId, page) {
    // Console messages
    page.on('console', msg => {
      const data = {
        level: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      };
      this.emit('console', sessionId, data);
    });

    // Page errors
    page.on('pageerror', error => {
      const data = {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      };
      this.emit('error', sessionId, data);
    });

    // Network requests
    page.on('requestfinished', request => {
      const response = request.response();
      if (response) {
        const data = {
          method: request.method(),
          url: request.url(),
          status: response.status(),
          timestamp: Date.now()
        };
        this.emit('network', sessionId, data);
      }
    });

    // Page navigation
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const data = {
          url: frame.url(),
          timestamp: Date.now()
        };
        this.emit('navigation', sessionId, data);
      }
    });
  }

  /**
   * Get an existing session and update its last activity time
   * @param {string} sessionId - The session ID
   * @returns {Object} - Session data
   * @throws {Error} - If session not found
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found or expired`);
    }
    if (session.crashed) {
      throw new Error(`Session ${sessionId} has crashed`);
    }

    // Update last activity
    session.lastActivity = Date.now();
    return session;
  }

  /**
   * Get all active sessions
   * @returns {Array} - Array of session info objects
   */
  getAllSessions() {
    const sessions = [];
    for (const [sessionId, data] of this.sessions.entries()) {
      sessions.push({
        sessionId,
        createdAt: data.createdAt,
        lastActivity: data.lastActivity,
        uptime: Date.now() - data.createdAt,
        crashed: data.crashed,
        pageUrl: data.page?.url?.() || 'unknown'
      });
    }
    return sessions;
  }

  /**
   * Check if a session exists
   * @param {string} sessionId - The session ID
   * @returns {boolean}
   */
  hasSession(sessionId) {
    return this.sessions.has(sessionId);
  }

  /**
   * Clean up a specific session
   * @param {string} sessionId - The session ID
   * @returns {Promise<boolean>} - True if session was cleaned up
   */
  async cleanup(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      // Close page first
      if (session.page && !session.page.isClosed()) {
        await session.page.close();
      }

      // Close browser
      if (session.browser && session.browser.isConnected()) {
        await session.browser.close();
      }
    } catch (error) {
      console.error(`Error cleaning up session ${sessionId}:`, error.message);
    } finally {
      // Remove from sessions map
      this.sessions.delete(sessionId);
      this.emit('session-cleaned', { sessionId });
    }

    return true;
  }

  /**
   * Clean up all sessions
   * @returns {Promise<void>}
   */
  async cleanupAll() {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.cleanup(id)));
  }

  /**
   * Clean up inactive sessions based on timeout
   * @private
   */
  cleanupInactiveSessions() {
    const now = Date.now();

    // Collect inactive session IDs first to avoid mutating this.sessions during iteration
    const inactiveSessionIds = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        inactiveSessionIds.push(sessionId);
      }
    }

    // Clean up collected sessions outside the iteration
    if (inactiveSessionIds.length > 0) {
      console.log(`Cleaning up ${inactiveSessionIds.length} inactive session(s)`);

      Promise.allSettled(
        inactiveSessionIds.map(sessionId => this.cleanup(sessionId))
      ).then(results => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to cleanup session ${inactiveSessionIds[index]}:`, result.reason);
          }
        });
      });
    }
  }

  /**
   * Handle browser crash
   * @private
   */
  handleBrowserCrash(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.crashed = true;
      this.emit('session-crashed', { sessionId });
      console.error(`Browser session ${sessionId} crashed`);

      // Clean up after a short delay
      setTimeout(() => {
        this.cleanup(sessionId).catch(err => {
          console.error(`Failed to cleanup crashed session ${sessionId}:`, err);
        });
      }, 5000);
    }
  }

  /**
   * Shutdown the session manager and clean up all sessions
   * @returns {Promise<void>}
   */
  async shutdown() {
    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up all sessions
    await this.cleanupAll();

    this.emit('shutdown');
  }
}

module.exports = BrowserSessionManager;
