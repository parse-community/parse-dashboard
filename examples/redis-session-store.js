/**
 * Example: Using Parse Dashboard with Redis Session Store for Multi-Replica Deployments
 *
 * This example shows how to configure Parse Dashboard with a Redis session store
 * to support multiple dashboard replicas behind a load balancer without sticky sessions.
 *
 * Prerequisites:
 * 1. Install required dependencies:
 *    npm install parse-dashboard connect-redis redis
 *
 * 2. Have a Redis server running (e.g., redis://localhost:6379)
 */

const express = require('express');
const ParseDashboard = require('parse-dashboard');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PORT = process.env.PORT || 4040;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';

// Create Redis client
const redisClient = createClient({
  url: REDIS_URL,
  // Optional: Add reconnect strategy
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Too many Redis reconnection attempts, giving up');
        return new Error('Redis connection failed');
      }
      // Exponential backoff: 50ms, 100ms, 200ms, 400ms, etc.
      return Math.min(retries * 50, 3000);
    }
  }
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Create Redis store for sessions
const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'parse-dashboard:', // Prefix for all session keys in Redis
  ttl: 86400, // Session TTL in seconds (24 hours)
});

// Parse Dashboard configuration
const dashboardConfig = {
  apps: [
    {
      serverURL: process.env.PARSE_SERVER_URL || 'http://localhost:1337/parse',
      appId: process.env.PARSE_APP_ID || 'myAppId',
      masterKey: process.env.PARSE_MASTER_KEY || 'myMasterKey',
      appName: process.env.PARSE_APP_NAME || 'My Parse App',
      // Optional: GraphQL endpoint
      // graphQLServerURL: 'http://localhost:1337/graphql',
    },
    // Add more apps as needed
  ],
  users: [
    {
      user: process.env.DASHBOARD_USER || 'admin',
      pass: process.env.DASHBOARD_PASS || 'password',
      // Optional: Restrict access to specific apps
      // apps: [{ appId: 'myAppId' }]
    },
  ],
  // Optional: Use encrypted passwords (recommended for production)
  // useEncryptedPasswords: true,
};

// Dashboard options
const dashboardOptions = {
  allowInsecureHTTP: process.env.ALLOW_INSECURE_HTTP === 'true',
  cookieSessionSecret: SESSION_SECRET, // IMPORTANT: Must be the same across all replicas
  cookieSessionMaxAge: 86400000, // Session cookie max age in milliseconds (24 hours)
  sessionStore: sessionStore, // Use Redis session store
};

// Create Express app
const app = express();

// Trust proxy when running behind a load balancer
app.set('trust proxy', 1);

// Mount Parse Dashboard
app.use('/dashboard', ParseDashboard(dashboardConfig, dashboardOptions));

// Health check endpoint (useful for load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Parse Dashboard is now available at http://localhost:${PORT}/dashboard`);
  console.log('Dashboard is configured with Redis session store for multi-replica support');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    redisClient.quit().then(() => {
      console.log('Redis connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    redisClient.quit().then(() => {
      console.log('Redis connection closed');
      process.exit(0);
    });
  });
});
