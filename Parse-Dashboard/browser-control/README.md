# Browser Control API for Parse Dashboard

## Overview

The Browser Control API is a development-time tool that allows AI agents to interact with Parse Dashboard through an automated browser during feature implementation and debugging. This enables real-time verification without writing test files.

**This is NOT a replacement for unit tests or E2E tests** - it's specifically designed for AI agents to validate implementations while actively developing features.

## Quick Start

### Prerequisites

**Requirements:**
- Node.js 20.19.0 or higher

**Note:** MongoDB is automatically started when you run `npm run browser-control` - no manual setup needed!

### 1. Start Dashboard with Browser Control

When you run the browser-control command, **MongoDB and Parse Server automatically start** alongside the dashboard - zero setup required!

```bash
npm run browser-control
```

This will:
1. Download and start MongoDB 8.0.4 (if not already downloaded)
2. Start Parse Server on port 1337 (connects to the auto-started MongoDB)
3. Start Dashboard on port 4040
4. Auto-configure dashboard with a test app pointing to Parse Server
5. Enable Browser Control API at `/browser-control`

Or for visible browser (helpful for debugging):

```bash
npm run browser-control:visible
```

**What happens automatically:**
- MongoDB 8.0.4 is downloaded (on first run) and started automatically
- Parse Server spawns and connects to the MongoDB instance
- Dashboard creates a test app called "Browser Control Test App"
- You can immediately start creating browser sessions and testing
- Everything stops cleanly when you exit (Ctrl+C)

### 2. Create a Browser Session

```bash
curl -X POST http://localhost:4040/browser-control/session/start \
  -H "Content-Type: application/json" \
  -d '{"headless": true, "startServers": false}'
```

Response:
```json
{
  "sessionId": "sess_1234567890_abc123",
  "dashboardUrl": null,
  "parseServerUrl": null
}
```

### 3. Navigate to Dashboard

```bash
curl -X POST http://localhost:4040/browser-control/session/sess_1234567890_abc123/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:4040/"}'
```

### 4. Take Screenshot

```bash
curl http://localhost:4040/browser-control/session/sess_1234567890_abc123/screenshot
```

### 5. Cleanup

```bash
curl -X DELETE http://localhost:4040/browser-control/session/sess_1234567890_abc123
```

## API Reference

### Session Management

#### Create Session
**POST** `/browser-control/session/start`

Create a new browser session, optionally starting Parse Server and Dashboard.

**Request Body:**
```json
{
  "headless": true,              // Optional: Run headless (default: true)
  "width": 1280,                 // Optional: Browser width (default: 1280)
  "height": 720,                 // Optional: Browser height (default: 720)
  "slowMo": 0,                   // Optional: Slow down by N ms (default: 0)
  "startServers": false,         // Optional: Start Parse Server + Dashboard (default: false)
  "parseServerOptions": {        // Optional: Parse Server config
    "port": 1337,
    "appId": "testAppId",
    "masterKey": "testMasterKey",
    "databaseURI": "mongodb://localhost:27017/test"
  },
  "dashboardOptions": {          // Optional: Dashboard config
    "port": 4040,
    "appName": "TestApp"
  }
}
```

**Response:**
```json
{
  "sessionId": "sess_1234567890_abc123",
  "dashboardUrl": "http://localhost:4040",
  "parseServerUrl": "http://localhost:1337/parse",
  "servers": {
    "parseServer": { "port": 1337, "appId": "testAppId" },
    "dashboard": { "port": 4040 }
  }
}
```

#### Get Session Status
**GET** `/browser-control/session/:sessionId/status`

**Response:**
```json
{
  "sessionId": "sess_1234567890_abc123",
  "active": true,
  "pageUrl": "http://localhost:4040/apps",
  "createdAt": 1234567890000,
  "lastActivity": 1234567895000,
  "uptime": 5000
}
```

#### Delete Session
**DELETE** `/browser-control/session/:sessionId`

Cleanup and destroy browser session.

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_1234567890_abc123"
}
```

#### List All Sessions
**GET** `/browser-control/sessions`

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "sess_1234567890_abc123",
      "createdAt": 1234567890000,
      "lastActivity": 1234567895000,
      "uptime": 5000,
      "crashed": false,
      "pageUrl": "http://localhost:4040/apps"
    }
  ],
  "count": 1
}
```

### Navigation & Interaction

#### Navigate
**POST** `/browser-control/session/:sessionId/navigate`

Navigate to a URL.

**Request Body:**
```json
{
  "url": "http://localhost:4040/apps",
  "waitUntil": "networkidle2",    // Optional: load, domcontentloaded, networkidle0, networkidle2
  "timeout": 30000                 // Optional: timeout in ms (default: 30000)
}
```

**Response:**
```json
{
  "success": true,
  "currentUrl": "http://localhost:4040/apps"
}
```

#### Click Element
**POST** `/browser-control/session/:sessionId/click`

Click an element by CSS selector.

**Request Body:**
```json
{
  "selector": "#login-button",
  "timeout": 5000                  // Optional: timeout in ms (default: 5000)
}
```

**Response:**
```json
{
  "success": true,
  "selector": "#login-button"
}
```

#### Type Text
**POST** `/browser-control/session/:sessionId/type`

Type text into an input field.

**Request Body:**
```json
{
  "selector": "input[name='username']",
  "text": "admin",
  "timeout": 5000,                 // Optional: timeout in ms (default: 5000)
  "delay": 0                       // Optional: delay between keystrokes in ms (default: 0)
}
```

**Response:**
```json
{
  "success": true,
  "selector": "input[name='username']",
  "text": "admin"
}
```

#### Wait for Element
**POST** `/browser-control/session/:sessionId/wait`

Wait for an element to appear.

**Request Body:**
```json
{
  "selector": ".data-browser",
  "timeout": 10000,                // Optional: timeout in ms (default: 10000)
  "visible": true                  // Optional: wait for visibility (default: true)
}
```

**Response:**
```json
{
  "success": true,
  "selector": ".data-browser",
  "found": true,
  "duration": 342
}
```

#### Reload Page
**POST** `/browser-control/session/:sessionId/reload`

Reload the current page.

**Request Body:**
```json
{
  "waitUntil": "networkidle2"     // Optional: wait condition
}
```

**Response:**
```json
{
  "success": true,
  "currentUrl": "http://localhost:4040/apps"
}
```

### Inspection & Debugging

#### Take Screenshot
**GET** `/browser-control/session/:sessionId/screenshot?fullPage=true&encoding=base64`

Capture a screenshot of the current page.

**Query Parameters:**
- `fullPage`: Capture full scrollable page (default: `true`)
- `encoding`: `base64` or `binary` (default: `base64`)

**Response:**
```json
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Execute JavaScript
**POST** `/browser-control/session/:sessionId/evaluate`

Execute JavaScript in the page context.

**Request Body:**
```json
{
  "script": "document.querySelector('.graph-panel-header')?.offsetHeight"
}
```

**Response:**
```json
{
  "result": 50
}
```

#### Query Elements
**POST** `/browser-control/session/:sessionId/query`

Query elements on the page.

**Request Body:**
```json
{
  "selector": ".data-row",
  "multiple": true                 // Optional: query multiple elements (default: false)
}
```

**Response (single):**
```json
{
  "element": {
    "text": "Test Object",
    "visible": true,
    "tagName": "DIV",
    "className": "data-row"
  }
}
```

**Response (multiple):**
```json
{
  "elements": [
    {
      "text": "Object 1",
      "visible": true,
      "tagName": "DIV",
      "className": "data-row"
    },
    {
      "text": "Object 2",
      "visible": true,
      "tagName": "DIV",
      "className": "data-row"
    }
  ],
  "count": 2
}
```

### Server Management

#### Get Server Status
**GET** `/browser-control/servers/status`

**Response:**
```json
{
  "parseServer": {
    "running": true,
    "port": 1337,
    "serverURL": "http://localhost:1337/parse",
    "appId": "testAppId"
  },
  "dashboard": {
    "running": true,
    "port": 4040,
    "url": "http://localhost:4040"
  }
}
```

#### Stop Servers
**POST** `/browser-control/servers/stop`

Stop Parse Server and Dashboard instances.

**Response:**
```json
{
  "success": true
}
```

### Cleanup

#### Cleanup All
**POST** `/browser-control/cleanup`

Cleanup all sessions and stop all servers.

**Response:**
```json
{
  "success": true
}
```

## WebSocket Event Stream

Connect to the WebSocket stream to receive real-time events from the browser.

### Connection

```
ws://localhost:4040/browser-control/stream/:sessionId
```

### Event Types

#### Console Messages
```json
{
  "type": "console",
  "level": "log",
  "text": "Application loaded",
  "timestamp": 1234567890000
}
```

#### Errors
```json
{
  "type": "error",
  "message": "Uncaught TypeError: Cannot read property 'x' of undefined",
  "stack": "TypeError: Cannot read property 'x' of undefined\n    at...",
  "timestamp": 1234567890000
}
```

#### Network Requests
```json
{
  "type": "network",
  "method": "POST",
  "url": "http://localhost:1337/parse/classes/TestClass",
  "status": 200,
  "timestamp": 1234567890000
}
```

#### Navigation
```json
{
  "type": "navigation",
  "url": "http://localhost:4040/apps/testApp/browser",
  "timestamp": 1234567890000
}
```

#### Session Events
```json
{
  "type": "session-event",
  "event": "created",
  "sessionId": "sess_1234567890_abc123",
  "timestamp": 1234567890000
}
```

## AI Agent Workflow Examples

### Example 1: Verify Feature Implementation

```javascript
// AI agent just implemented a delete button feature

// 1. Create session
const createRes = await fetch('http://localhost:4040/browser-control/session/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ headless: false, startServers: false })
});
const { sessionId } = await createRes.json();

// 2. Navigate to class browser
await fetch(`http://localhost:4040/browser-control/session/${sessionId}/navigate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'http://localhost:4040/apps/testApp/browser/TestClass' })
});

// 3. Check if delete button exists
const queryRes = await fetch(`http://localhost:4040/browser-control/session/${sessionId}/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ selector: '.delete-button' })
});
const { element } = await queryRes.json();

if (element) {
  console.log('✓ Delete button found!');

  // 4. Take screenshot for verification
  const screenshotRes = await fetch(
    `http://localhost:4040/browser-control/session/${sessionId}/screenshot`
  );
  const { base64 } = await screenshotRes.json();
  // AI can analyze screenshot
} else {
  console.log('❌ Delete button not found - need to fix');
}

// 5. Cleanup
await fetch(`http://localhost:4040/browser-control/session/${sessionId}`, {
  method: 'DELETE'
});
```

### Example 2: Debug UI Issue

```javascript
// AI agent is debugging layout alignment

const { sessionId } = await createSession();
await navigate(sessionId, 'http://localhost:4040/apps/testApp/browser');

// Check actual heights
const heightsRes = await fetch(
  `http://localhost:4040/browser-control/session/${sessionId}/evaluate`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      script: `({
        graphPanelHeader: document.querySelector('.graph-panel-header')?.offsetHeight,
        infoPanelHeader: document.querySelector('.info-panel-header')?.offsetHeight
      })`
    })
  }
);
const { result } = await heightsRes.json();

console.log('Header heights:', result);
// { graphPanelHeader: 45, infoPanelHeader: 50 }

if (result.graphPanelHeader !== result.infoPanelHeader) {
  console.log('❌ Heights misaligned - adjusting CSS...');
  // AI makes CSS changes and checks again
}
```

### Example 3: Monitor Console Errors

```javascript
// Connect WebSocket to monitor real-time console logs
const ws = new WebSocket(`ws://localhost:4040/browser-control/stream/${sessionId}`);

const errors = [];
ws.on('message', (data) => {
  const event = JSON.parse(data);
  if (event.type === 'console' && event.level === 'error') {
    errors.push(event.text);
    console.log('⚠️ Console error:', event.text);
  }
});

// Navigate and check for errors
await navigate(sessionId, 'http://localhost:4040/apps');

// Wait for page to load
await new Promise(resolve => setTimeout(resolve, 2000));

if (errors.length > 0) {
  console.log(`❌ Found ${errors.length} console errors:`, errors);
} else {
  console.log('✓ No console errors detected');
}
```

## Troubleshooting

### Browser doesn't start

**Error:** `Failed to launch browser`

**Solution:** Make sure Puppeteer is installed:
```bash
npm install
```

### MongoDB or Parse Server won't start

**Error:** `Failed to start MongoDB` or `Failed to start Parse Server`

**Solution:** Make sure all dependencies are installed:
```bash
npm install
```

If MongoDB port is already in use, you can change it:
```bash
MONGO_PORT=27018 npm run browser-control
```

### Session timeout

**Error:** `Session sess_xxx not found or expired`

**Solution:** Sessions expire after 30 minutes of inactivity. Create a new session.

### WebSocket connection refused

**Error:** `WebSocket connection failed`

**Solution:** Make sure you're connecting to the WebSocket path with a valid session ID:
```
ws://localhost:4040/browser-control/stream/:sessionId
```

### Port already in use

**Error:** `EADDRINUSE: address already in use`

**Solution:** Stop any running Dashboard instances or change the port:
```bash
PORT=4041 npm run browser-control
```

## Security

The Browser Control API uses a **two-layer security model** to prevent accidental or unauthorized enablement. Browser Control requires **both** of the following conditions to be met:

1. **Explicit opt-in**
   - Set `"browserControl": true` in `parse-dashboard-config.json`, or
   - Set `PARSE_DASHBOARD_BROWSER_CONTROL=true` environment variable

2. **Not in production environment**
   - Feature is automatically blocked when `NODE_ENV=production`

> [!NOTE]
> The feature enables only when you have opted in (via config or environment variable) AND you're not in production. The production block cannot be bypassed under any circumstances.

### Additional Protections

- Maximum 5 concurrent sessions to prevent resource exhaustion
- Sessions auto-expire after 30 minutes of inactivity
- API bypasses authentication (development-only feature)

### Example Configuration

```json
{
  "browserControl": true,
  "apps": [...],
  "users": [...]
}
```

**⚠️ CRITICAL**: Never deploy with `browserControl: true` in production. Remove this field or set to `false` before deploying.

## Environment Variables

### Browser Control
- `PARSE_DASHBOARD_BROWSER_CONTROL=true` - Enable browser control API
- `BROWSER_HEADLESS=false` - Run browser in visible mode
- `BROWSER_SLOW_MO=100` - Slow down browser operations by N milliseconds

### MongoDB Auto-Start (when browser-control is enabled)
MongoDB is automatically started when browser-control mode is enabled using `mongodb-runner`.

- `MONGO_PORT=27017` - MongoDB port (default: 27017)
- `MONGO_VERSION=8.0.4` - MongoDB version (default: 8.0.4)

**Note**: MongoDB 8.0.4 is downloaded and started automatically. Data is stored in a temporary directory and cleaned up on exit.

### Parse Server Auto-Start (when browser-control is enabled)
Parse Server 9.1.1 is automatically started when browser-control mode is enabled.

- `PARSE_SERVER_PORT=1337` - Parse Server port (default: 1337)
- `PARSE_SERVER_APP_ID=testAppId` - Application ID (default: testAppId)
- `PARSE_SERVER_MASTER_KEY=testMasterKey` - Master key (default: testMasterKey)
- `PARSE_SERVER_DATABASE_URI` - MongoDB connection string (default: auto-generated based on MONGO_PORT)

**Note**: Parse Server 9 requires MongoDB 5.0+

**Example with custom configuration:**
```bash
PARSE_SERVER_PORT=1338 \
PARSE_SERVER_APP_ID=myTestApp \
PARSE_SERVER_MASTER_KEY=mySecretKey \
npm run browser-control
```

## Limitations

- Maximum 5 concurrent browser sessions
- 30-minute session timeout
- Sessions are not persisted across Dashboard restarts
- Screenshots limited to page size (configurable viewport)
- JavaScript evaluation has security restrictions (page context only)

## Best Practices for AI Agents

1. **Always cleanup sessions** when done to free resources
2. **Use headless mode** for faster execution (unless debugging visually)
3. **Monitor WebSocket events** to catch console errors early
4. **Take screenshots** before and after UI changes for comparison
5. **Use evaluate** to inspect computed styles and DOM properties
6. **Wait for elements** before interacting to avoid race conditions
7. **Set appropriate timeouts** based on network conditions

## Contributing

This is a development tool specifically designed for AI agent workflows. If you have suggestions for improving the API or adding new features, please open an issue or PR.
