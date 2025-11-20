# Parse Dashboard Examples

This directory contains example configurations for Parse Dashboard in various deployment scenarios.

## Multi-Replica Deployments

When running Parse Dashboard with multiple replicas behind a load balancer, you need to use a shared session store to ensure CSRF tokens and user sessions work correctly across all replicas.

### Available Examples

1. **[redis-session-store.js](./redis-session-store.js)** - Using Redis as the session store
   - Fast, in-memory session storage
   - Recommended for high-traffic deployments
   - Requires: `connect-redis`, `redis`

2. **[mongodb-session-store.js](./mongodb-session-store.js)** - Using MongoDB as the session store
   - Persistent session storage
   - Good if you already have MongoDB infrastructure
   - Requires: `connect-mongo`

### Quick Start

1. Choose an example based on your infrastructure
2. Install the required dependencies:
   ```bash
   # For Redis
   npm install parse-dashboard connect-redis redis

   # For MongoDB
   npm install parse-dashboard connect-mongo
   ```
3. Configure environment variables:
   ```bash
   # For Redis
   export REDIS_URL="redis://localhost:6379"
   export SESSION_SECRET="your-secret-key-change-this"
   export PARSE_SERVER_URL="http://localhost:1337/parse"
   export PARSE_APP_ID="myAppId"
   export PARSE_MASTER_KEY="myMasterKey"

   # For MongoDB
   export MONGODB_URL="mongodb://localhost:27017/parse-dashboard-sessions"
   export SESSION_SECRET="your-secret-key-change-this"
   export PARSE_SERVER_URL="http://localhost:1337/parse"
   export PARSE_APP_ID="myAppId"
   export PARSE_MASTER_KEY="myMasterKey"
   ```
4. Run the example:
   ```bash
   node examples/redis-session-store.js
   # or
   node examples/mongodb-session-store.js
   ```

### Important Notes

- **`SESSION_SECRET` must be the same across all replicas** - This ensures session cookies work correctly
- **Configure your load balancer properly** - Set `trustProxy: true` when behind a reverse proxy
- **Health check endpoint** - All examples include a `/health` endpoint for load balancer health checks
- **Graceful shutdown** - Examples include proper cleanup handlers for SIGTERM and SIGINT signals

### Kubernetes Deployment

For Kubernetes deployments, you can use ConfigMaps and Secrets to configure your dashboard:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: parse-dashboard-config
data:
  REDIS_URL: "redis://redis-service:6379"
  PARSE_SERVER_URL: "http://parse-server-service:1337/parse"
  PARSE_APP_ID: "myAppId"
---
apiVersion: v1
kind: Secret
metadata:
  name: parse-dashboard-secrets
type: Opaque
data:
  SESSION_SECRET: <base64-encoded-secret>
  PARSE_MASTER_KEY: <base64-encoded-master-key>
  DASHBOARD_PASS: <base64-encoded-password>
```

### Docker Compose

For Docker Compose deployments, you can use environment files:

```yaml
version: '3.8'
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  parse-dashboard:
    build: .
    environment:
      - REDIS_URL=redis://redis:6379
      - SESSION_SECRET=${SESSION_SECRET}
      - PARSE_SERVER_URL=${PARSE_SERVER_URL}
      - PARSE_APP_ID=${PARSE_APP_ID}
      - PARSE_MASTER_KEY=${PARSE_MASTER_KEY}
    ports:
      - "4040:4040"
    depends_on:
      - redis
    deploy:
      replicas: 3
```

### Troubleshooting

**Issue: "CSRF token validation failed" errors**
- Ensure `SESSION_SECRET` is the same across all replicas
- Verify the session store is accessible from all replicas
- Check that `trustProxy` is enabled when behind a load balancer

**Issue: Sessions not persisting**
- Verify the session store connection is working
- Check session TTL configuration
- Ensure the session store has enough memory/storage

**Issue: High memory usage**
- Adjust session TTL to clean up expired sessions
- Use `touchAfter` option (MongoDB) to reduce update frequency
- Monitor session store metrics

For more information, see the [main README](../README.md#running-multiple-dashboard-replicas).
