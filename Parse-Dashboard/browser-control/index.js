/**
 * Browser Control for Parse Dashboard
 *
 * Real-time browser automation system for AI agents to verify features during development.
 * This is a development-time debugging tool, NOT a replacement for unit/E2E tests.
 *
 * Usage:
 *   npm run browser-control
 *
 * API:
 *   HTTP: http://localhost:4040/browser-control/
 *   WebSocket: ws://localhost:4040/browser-control/stream/:sessionId
 *
 * @module browser-control
 */

const BrowserSessionManager = require('./BrowserSessionManager');
const BrowserControlAPI = require('./BrowserControlAPI');
const BrowserEventStream = require('./BrowserEventStream');
const ServerOrchestrator = require('./ServerOrchestrator');

module.exports = {
  BrowserSessionManager,
  BrowserControlAPI,
  BrowserEventStream,
  ServerOrchestrator
};
