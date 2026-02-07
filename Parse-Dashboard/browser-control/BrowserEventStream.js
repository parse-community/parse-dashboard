const WebSocket = require('ws');

/**
 * BrowserEventStream
 *
 * WebSocket server for streaming real-time browser events to AI agents.
 * Broadcasts console logs, network activity, navigation events, and errors.
 *
 * Features:
 * - Real-time event streaming via WebSocket
 * - Per-session event filtering
 * - Automatic cleanup on disconnect
 * - Support for multiple clients per session
 */
class BrowserEventStream {
  /**
   * @param {http.Server} httpServer - HTTP server to attach WebSocket to
   * @param {BrowserSessionManager} sessionManager - Session manager instance
   */
  constructor(httpServer, sessionManager) {
    this.sessionManager = sessionManager;
    this.clients = new Map(); // sessionId -> Set of WebSocket clients

    // Create WebSocket server without path (we'll handle routing manually)
    this.wss = new WebSocket.Server({
      noServer: true,
      clientTracking: true
    });

    // Handle WebSocket upgrade requests manually to support dynamic paths
    // Path pattern: /browser-control/stream/:sessionId
    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url, 'http://localhost').pathname;

      // Check if this is a browser-control stream request
      if (pathname.startsWith('/browser-control/stream/')) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      }
      // Let other upgrade requests pass through (don't destroy socket)
    });

    // Handle new WebSocket connections
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Listen to session manager events
    this.attachSessionListeners();

    console.log('Browser Event Stream WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   * @private
   */
  handleConnection(ws, req) {
    // Extract session ID from URL path
    // Expected format: /browser-control/stream/sess_abc123
    const sessionId = this.extractSessionId(req.url);

    if (!sessionId) {
      ws.close(1008, 'Session ID required in URL path: /browser-control/stream/:sessionId');
      return;
    }

    // Validate session exists
    if (!this.sessionManager.hasSession(sessionId)) {
      ws.close(1008, `Invalid session ID: ${sessionId}`);
      return;
    }

    // Track client for this session
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId).add(ws);

    console.log(`Client connected to session ${sessionId} stream`);

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connected',
      sessionId,
      timestamp: Date.now(),
      message: 'Connected to browser event stream'
    });

    // Handle client messages (optional commands)
    ws.on('message', (data) => {
      this.handleClientMessage(ws, sessionId, data);
    });

    // Handle disconnect
    ws.on('close', () => {
      const clients = this.clients.get(sessionId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          this.clients.delete(sessionId);
        }
      }
      console.log(`Client disconnected from session ${sessionId} stream`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error.message);
    });
  }

  /**
   * Extract session ID from WebSocket URL
   * @private
   */
  extractSessionId(url) {
    // URL format: /browser-control/stream/sess_abc123?query=params
    const match = url.match(/\/browser-control\/stream\/([^?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Handle messages from clients
   * @private
   */
  handleClientMessage(ws, sessionId, data) {
    try {
      const message = JSON.parse(data.toString());

      // Optional: Support simple commands via WebSocket
      if (message.action === 'ping') {
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to parse client message:', error.message);
    }
  }

  /**
   * Attach listeners to session manager events
   * @private
   */
  attachSessionListeners() {
    // Console messages
    this.sessionManager.on('console', (sessionId, data) => {
      this.broadcast(sessionId, {
        type: 'console',
        level: data.level,
        text: data.text,
        timestamp: data.timestamp
      });
    });

    // Page errors
    this.sessionManager.on('error', (sessionId, data) => {
      this.broadcast(sessionId, {
        type: 'error',
        message: data.message,
        stack: data.stack,
        timestamp: data.timestamp
      });
    });

    // Network requests
    this.sessionManager.on('network', (sessionId, data) => {
      this.broadcast(sessionId, {
        type: 'network',
        method: data.method,
        url: data.url,
        status: data.status,
        timestamp: data.timestamp
      });
    });

    // Page navigation
    this.sessionManager.on('navigation', (sessionId, data) => {
      this.broadcast(sessionId, {
        type: 'navigation',
        url: data.url,
        timestamp: data.timestamp
      });
    });

    // Session events
    this.sessionManager.on('session-created', ({ sessionId }) => {
      this.broadcast(sessionId, {
        type: 'session-event',
        event: 'created',
        sessionId,
        timestamp: Date.now()
      });
    });

    this.sessionManager.on('session-cleaned', ({ sessionId }) => {
      this.broadcast(sessionId, {
        type: 'session-event',
        event: 'cleaned',
        sessionId,
        timestamp: Date.now()
      });

      // Close all client connections for this session
      const clients = this.clients.get(sessionId);
      if (clients) {
        clients.forEach(ws => {
          ws.close(1000, 'Session closed');
        });
        this.clients.delete(sessionId);
      }
    });

    this.sessionManager.on('session-crashed', ({ sessionId }) => {
      this.broadcast(sessionId, {
        type: 'session-event',
        event: 'crashed',
        sessionId,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Broadcast a message to all clients watching a session
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message to broadcast
   */
  broadcast(sessionId, message) {
    const clients = this.clients.get(sessionId);
    if (!clients || clients.size === 0) {
      return;
    }

    const payload = JSON.stringify(message);

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  /**
   * Send a message to a specific client
   * @private
   */
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Get count of active connections per session
   * @returns {Map} - sessionId -> client count
   */
  getConnectionCounts() {
    const counts = new Map();
    for (const [sessionId, clients] of this.clients.entries()) {
      counts.set(sessionId, clients.size);
    }
    return counts;
  }

  /**
   * Close all WebSocket connections
   */
  closeAll() {
    this.wss.clients.forEach(client => {
      client.close(1000, 'Server shutting down');
    });
    this.clients.clear();
  }

  /**
   * Shutdown the WebSocket server
   * @returns {Promise<void>}
   */
  async shutdown() {
    return new Promise((resolve) => {
      this.closeAll();
      this.wss.close(() => {
        console.log('Browser Event Stream shut down');
        resolve();
      });
    });
  }
}

module.exports = BrowserEventStream;
