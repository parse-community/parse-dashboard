/**
 * Example: Using Parse Dashboard with MongoDB Session Store for Multi-Replica Deployments
 *
 * This example shows how to configure Parse Dashboard with a MongoDB session store
 * to support multiple dashboard replicas behind a load balancer without sticky sessions.
 *
 * Prerequisites:
 * 1. Install required dependencies:
 *    npm install parse-dashboard connect-mongo
 *
 * 2. Have a MongoDB server running (e.g., mongodb://localhost:27017)
 */

const express = require('express');
const ParseDashboard = require('parse-dashboard');
const MongoStore = require('connect-mongo');

// Configuration
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/parse-dashboard-sessions';
const PORT = process.env.PORT || 4040;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';

// Create MongoDB session store
const sessionStore = MongoStore.create({
  mongoUrl: MONGODB_URL,
  collectionName: 'sessions', // Collection name for storing sessions
  ttl: 86400, // Session TTL in seconds (24 hours)
  autoRemove: 'native', // Let MongoDB's TTL index handle session cleanup
  touchAfter: 3600, // Update session only once per hour (unless session data changes)
  // Optional: Add connection options
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
});

// Handle store connection events
sessionStore.on('error', (err) => {
  console.error('MongoDB Session Store Error:', err);
});

sessionStore.on('connected', () => {
  console.log('Connected to MongoDB for session storage');
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
  sessionStore: sessionStore, // Use MongoDB session store
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
  console.log('Dashboard is configured with MongoDB session store for multi-replica support');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    sessionStore.close().then(() => {
      console.log('MongoDB session store connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    sessionStore.close().then(() => {
      console.log('MongoDB session store connection closed');
      process.exit(0);
    });
  });
});
