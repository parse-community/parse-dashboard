# React 19 + react-router 7 + GraphiQL 5 Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate parse-dashboard from React 16 → 19, react-router 6 → 7, and GraphiQL 2 → 5 on one branch as four ordered, independently-buildable commits, each green (build + lint + Jest + browser smoke) before the next.

**Architecture:** Four sequential checkpoints (Tasks 1–4), each a single commit, preceded by a one-time local verification stack (Task 0) and closed by a wrap-up + PR (Task 5). Because Jest `roots` is `['src/lib']` and the risky paths (entry points, drag/drop, draggables, GraphiQL/Monaco, splat routing) have **no** unit coverage, each task's real gate is: `npm run build` succeeds, `npm run lint` clean, `npm test` green (the 5 `react-test-renderer` tests), and a **browser smoke** of the specific behavior against the local Parse Server stack.

**Tech Stack:** React 19, react-dom/client `createRoot`, react-router 7, GraphiQL 5 (`@graphiql/react` + Monaco web workers via `graphiql/setup-workers/webpack`), `@graphiql/toolkit` `createGraphiQLFetcher`, react-dnd 16 hooks, webpack 5.106, Babel 7 (classic JSX runtime), Jest 30 + jsdom, Node ≥ 20.19.

## Global Constraints

Copy these exact values; every task's requirements implicitly include this section.

- **Version targets (exact):** `react`/`react-dom` `18.3.1` at Task 1 then `19.2.7` at Task 2; `react-test-renderer` matches (`18.3.1` → `19.2.7`); `react-router` `7.18.1` (and `react-router-dom` **removed**); `graphiql` `5.2.4`; `@graphiql/toolkit` `0.12.1`; `@microlink/react-json-view` `1.31.22` (and `react-json-view` **removed**); `react-dnd` `16.0.1` (`react-dnd-html5-backend` stays `16.0.1`); `react-resizable` `4.0.2`; `react-draggable` `4.7.0`; `react-rnd` `10.5.3` (unchanged); `graphql` `16.12.0` (unchanged).
- **`monaco-editor` must resolve TRANSITIVELY at `0.52.2`** (pinned by `@graphiql/react`; `monaco-graphql` peer caps `< 0.53`). **Never** add `monaco-editor` `0.55.1` (or any explicit monaco) as a direct dependency.
- **Never** add `monaco-editor-webpack-plugin` — GraphiQL 5 ships `graphiql/setup-workers/webpack`.
- **Do NOT** enable `@babel/preset-react` `runtime:'automatic'` — keep the classic runtime; `import React` stays required in JSX files.
- **Do NOT** wrap entries in `<StrictMode>` — it would surface ~63 legacy-lifecycle warnings.
- **`react-router` import specifier:** import all router APIs from `'react-router'` (not `'react-router-dom'`).
- Preserve exact GraphQL header injection: `X-Parse-Application-Id`, `X-Parse-Master-Key`, and (only when present) `X-Parse-Client-Key`.
- Branch: `chore/react19-router7-graphiql5` (already created; design doc already committed). One commit per task. Pause for review after each task.

---

## File Structure

**Created**
- `scratch/dev-parse-server.mjs` (LOCAL ONLY — parse-server + GraphQL bootstrap for verification; **not committed**).

**Modified — Task 1 (React 16 → 18)**
- `src/dashboard/index.js` — `createRoot`.
- `src/quickstart/index.js` — `createRoot`.
- `src/parse-interface-guide/index.js` — `createRoot`.
- `src/dashboard/Data/Playground/Playground.react.js:2` — json-view import swap.
- `src/components/DataBrowserHeader/DataBrowserHeader.react.js` — decorators → hooks.
- `src/components/ColumnsConfiguration/ColumnConfigurationItem.react.js` — react-dnd v10 → v16 hooks API.
- `babel.config.js` — drop legacy decorators plugin.
- `package.json` — dependency bumps.

**Modified — Task 2 (React 18 → 19)**
- `package.json` — react/react-dom/react-test-renderer → 19.2.7; react-draggable/react-resizable bumps.
- `src/dashboard/Data/Browser/DataBrowser.react.js` — verify `ResizableBox` (react-resizable 4).
- `src/dashboard/Data/CustomDashboard/CanvasElement.react.js` — verify `Rnd` (react-rnd); patch fallback if `findDOMNode` throws.

**Modified — Task 3 (react-router 6 → 7)**
- `src/dashboard/Dashboard.js`, `src/parse-interface-guide/routes.js` — future flags then removal.
- 19 files importing `react-router-dom` (enumerated in Task 3) — specifier flip.
- `package.json` — remove react-router-dom, add react-router.

**Modified — Task 4 (GraphiQL 2 → 5)**
- `webpack/base.config.js` — `.ttf`/`.woff2?` asset rule; `publicPath` evaluation.
- `src/dashboard/index.js` — CSS path + worker setup import.
- `src/dashboard/Data/ApiConsole/GraphQLConsole.react.js` — v5 component + fetcher rewrite.
- `package.json` — graphiql 5 + toolkit; remove graphiql 2.

---

## Task 0: Local verification stack (one-time, not committed)

**Files:**
- Create (local only): `scratch/dev-parse-server.mjs`

**Interfaces:**
- Produces: a running Parse Server at `http://localhost:1337/parse` with GraphQL at `http://localhost:1337/graphql`, appId `hello`, masterKey `world` — matching the committed `Parse-Dashboard/parse-dashboard-config.json`. Consumed by every task's browser-smoke step.

- [ ] **Step 1: Confirm deps present**

Run: `npm ls parse-server mongodb-runner puppeteer 2>/dev/null | head`
Expected: `parse-server@9.9.0`, `mongodb-runner@6.7.3`, `puppeteer@24.37.2` listed.

- [ ] **Step 2: Start a local MongoDB**

Run: `npx mongodb-runner start --port 27017` (or use an already-running local mongod on 27017).
Expected: a MongoDB instance listening on 27017.

- [ ] **Step 3: Write the parse-server bootstrap (local scratch, not committed)**

Create `scratch/dev-parse-server.mjs`:

```js
import { ParseServer } from 'parse-server';
import express from 'express';

const app = express();
const server = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/parsedashtest',
  appId: 'hello',
  masterKey: 'world',
  serverURL: 'http://localhost:1337/parse',
  mountGraphQL: true,
  graphQLPath: '/graphql',
  mountPlayground: false,
});
await server.start();
app.use('/parse', server.app);
app.listen(1337, () => console.log('parse-server + /graphql on :1337'));
```

Run: `node scratch/dev-parse-server.mjs`
Expected: log line "parse-server + /graphql on :1337"; `curl -s -X POST http://localhost:1337/graphql -H 'X-Parse-Application-Id: hello' -H 'X-Parse-Master-Key: world' -H 'Content-Type: application/json' -d '{"query":"{ __typename }"}'` returns JSON containing `"__typename":"Query"`.

- [ ] **Step 4: Confirm the dashboard dev server points at it**

Run: `grep -n "graphQLServerURL\|serverURL\|appId" Parse-Dashboard/parse-dashboard-config.json`
Expected: `serverURL http://localhost:1337/parse`, `appId hello`. For GraphiQL, the dashboard is started with `PARSE_DASHBOARD_GRAPHQL_SERVER_URL=http://localhost:1337/graphql` (env var consumed by `Parse-Dashboard/server.js:34`). No committed config change needed.

- [ ] **Step 5: Verify current app boots (pre-migration baseline)**

Run: `npm run build 2>&1 | tail -5` then `npm test 2>&1 | tail -15`
Expected: build succeeds; Jest suite passes (baseline green before any change).

*No commit — Task 0 artifacts are local only.*

---

## Task 1: Checkpoint 1 — React 16 → 18 (createRoot + third-party unblock)

**Files:**
- Modify: `src/dashboard/index.js`, `src/quickstart/index.js`, `src/parse-interface-guide/index.js`
- Modify: `src/dashboard/Data/Playground/Playground.react.js:2`
- Modify: `src/components/DataBrowserHeader/DataBrowserHeader.react.js`
- Modify: `src/components/ColumnsConfiguration/ColumnConfigurationItem.react.js`
- Modify: `babel.config.js`, `package.json`

**Interfaces:**
- Produces: app running on React 18 with `createRoot`; `@microlink/react-json-view` default export `ReactJson` (same API as before); `DataBrowserHeader` as a function component consuming props `{ name, type, targetClass, order, index, moveDataBrowserHeader, style? }`; `ColumnConfigurationItem` using react-dnd 16 hooks.

- [ ] **Step 1: Bump React + third-party deps in package.json**

In `package.json` `dependencies`: `"react": "18.3.1"`, `"react-dom": "18.3.1"`, `"react-dnd": "16.0.1"`; remove `"react-json-view": "1.21.3"`, add `"@microlink/react-json-view": "1.31.22"`. In `devDependencies`: `"react-test-renderer": "18.3.1"`; remove `"@babel/plugin-proposal-decorators": "7.29.0"`.

Run: `npm install`
Expected: installs without `ERESOLVE` peer errors (the react-json-view React-17 cap is gone).

- [ ] **Step 2: Convert `src/dashboard/index.js` to createRoot**

Replace `import ReactDOM from 'react-dom';` with `import { createRoot } from 'react-dom/client';` and replace the render line:

```js
const path = window.PARSE_DASHBOARD_PATH || '/';
const root = createRoot(document.getElementById('browser_mount'));
root.render(<Dashboard path={path} />);
registerServiceWorker();
```

Leave `require('graphiql/graphiql.min.css')` unchanged (still GraphiQL 2 until Task 4).

- [ ] **Step 3: Convert `src/quickstart/index.js` to createRoot**

Replace `import ReactDOM from 'react-dom';` with `import { createRoot } from 'react-dom/client';` and replace the render:

```js
const root = createRoot(document.getElementById('quickstart_mount'));
root.render(<Quickstart />);
```

- [ ] **Step 4: Convert `src/parse-interface-guide/index.js` to createRoot**

`Routes` is a JSX element, pass it directly:

```js
import { createRoot } from 'react-dom/client';
import Routes from './routes';

const root = createRoot(document.getElementById('browser_mount'));
root.render(Routes);
```

- [ ] **Step 5: Swap the JSON viewer in Playground**

In `src/dashboard/Data/Playground/Playground.react.js` change line 2 only:

```js
import ReactJson from '@microlink/react-json-view';
```

The `<ReactJson .../>` usage (~line 1178) and the `'react-json-view error'` console guards (~lines 897/908/919) stay as-is (the fork emits the same error prefix). Note to verify the guard at browser-smoke.

- [ ] **Step 6: Rewrite `DataBrowserHeader.react.js` decorators → react-dnd 16 hooks**

Replace the whole file body (keep the license header and propTypes block):

```js
import PropTypes from 'lib/PropTypes';
import React, { useRef } from 'react';
import styles from 'components/DataBrowserHeader/DataBrowserHeader.scss';
import baseStyles from 'stylesheets/base.scss';
import { useDrag, useDrop } from 'react-dnd';

const Types = {
  DATA_BROWSER_HEADER: 'dataBrowserHeader',
};

function DataBrowserHeader({ name, type, targetClass, order, style, index, moveDataBrowserHeader }) {
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: Types.DATA_BROWSER_HEADER,
      collect: monitor => ({ isOver: monitor.isOver() }),
      drop: item => {
        if (!item || item.index === index) {
          return;
        }
        moveDataBrowserHeader(item.index, index);
      },
    }),
    [index, moveDataBrowserHeader]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: Types.DATA_BROWSER_HEADER,
      item: { name, index },
      collect: monitor => ({ isDragging: monitor.isDragging() }),
    }),
    [name, index]
  );

  drag(drop(ref));

  const classes = [styles.header, baseStyles.unselectable];
  if (order) {
    classes.push(styles[order]);
  }
  if (isOver && !isDragging) {
    classes.push(styles.over);
  }
  if (isDragging) {
    classes.push(styles.dragging);
  }

  return (
    <div ref={ref} className={classes.join(' ')} style={style}>
      <div className={styles.name}>{name}</div>
      <div className={styles.type}>{targetClass ? `${type} <${targetClass}>` : type}</div>
    </div>
  );
}

export default DataBrowserHeader;

DataBrowserHeader.propTypes = {
  name: PropTypes.string.isRequired.describe('The name of the column.'),
  type: PropTypes.string.describe('The type of the column.'),
  targetClass: PropTypes.string.describe('The target class for a Pointer or Relation.'),
  order: PropTypes.oneOf(['ascending', 'descending']).describe(
    'A sort ordering that displays as an arrow in the header.'
  ),
};
```

- [ ] **Step 7: Update `ColumnConfigurationItem.react.js` to the react-dnd 16 hooks API**

react-dnd 16 moves `type` out of `item` to the top level and prefers a ref connector. Replace the file body:

```js
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import Icon from 'components/Icon/Icon.react';
import styles from 'components/ColumnsConfiguration/ColumnConfigurationItem.scss';

const DND_TYPE = 'ColumnConfigurationItem';

export default ({ name, handleColumnDragDrop, index, onChangeVisible, visible }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { index },
      collect: monitor => ({ isDragging: !!monitor.isDragging() }),
    }),
    [index]
  );

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: DND_TYPE,
      drop: item => handleColumnDragDrop(item.index, index),
      canDrop: item => item.index !== index,
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [index, handleColumnDragDrop]
  );

  drag(drop(ref));

  return (
    <section
      ref={ref}
      className={styles.columnConfigItem}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : null,
        backgroundColor: isOver && canDrop ? '#208aec' : null,
      }}
      onClick={() => onChangeVisible(!visible)}
    >
      <div className={[styles.icon, styles.visibilityIcon].join(' ')}>
        <Icon
          name={visible ? 'visibility' : 'visibility_off'}
          width={18}
          height={18}
          fill={visible ? 'white' : 'rgba(0,0,0,0.4)'}
        />
      </div>
      <div className={styles.columnConfigItemName} title={name}>
        {name}
      </div>
      <div className={[styles.icon, styles.columnIcon].join(' ')}>
        <Icon name="drag-indicator" width={14} height={14} fill="white" />
      </div>
    </section>
  );
};
```

- [ ] **Step 8: Drop the legacy decorators Babel plugin**

In `babel.config.js` remove the line `['@babel/plugin-proposal-decorators', { legacy: true }],` so `plugins` is:

```js
plugins: [['@babel/transform-runtime', { corejs: 3 }]],
```

(DataBrowserHeader was the only `@decorator` user — confirmed by grep.)

- [ ] **Step 9: Lint + build**

Run: `npm run lint 2>&1 | tail -5` then `npm run build 2>&1 | tail -5`
Expected: lint clean; build succeeds (no decorator-syntax error, no react-dnd type errors, no missing react-json-view).

- [ ] **Step 10: Jest**

Run: `npm test 2>&1 | tail -15`
Expected: all suites pass (react-test-renderer 18 renders the 5 components without error).

- [ ] **Step 11: Browser smoke (against Task 0 stack)**

Run: `npm run dashboard` (Parse-Dashboard server + webpack watch), open `http://localhost:4040`.
Verify: (a) app boots at `/` with no console errors; (b) Data Browser loads a class and **drag-reordering a column header** works (react-dnd 16 hooks); (c) the columns-configuration list drag-reorders (ColumnConfigurationItem); (d) Playground JS console renders object output via `@microlink/react-json-view`. Also load quickstart and PIG bundles without console errors.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json babel.config.js src/dashboard/index.js src/quickstart/index.js src/parse-interface-guide/index.js src/dashboard/Data/Playground/Playground.react.js src/components/DataBrowserHeader/DataBrowserHeader.react.js src/components/ColumnsConfiguration/ColumnConfigurationItem.react.js
git commit -m "feat: React 16→18 (createRoot) + unblock react-json-view/react-dnd (#3408)"
```

**PAUSE for review.**

---

## Task 2: Checkpoint 2 — React 18 → 19

**Files:**
- Modify: `package.json`
- Modify: `src/dashboard/Data/Browser/DataBrowser.react.js` (ResizableBox — verify under react-resizable 4)
- Modify: `src/dashboard/Data/CustomDashboard/CanvasElement.react.js` (Rnd — verify; patch fallback)

**Interfaces:**
- Consumes: Task 1's React 18 app.
- Produces: app running on React 19.2.7 with drag/resize (`react-rnd`, `react-resizable`) working (no `findDOMNode` throw).

- [ ] **Step 1: Bump to React 19 + draggable libs**

In `package.json` `dependencies`: `"react": "19.2.7"`, `"react-dom": "19.2.7"`, `"react-resizable": "4.0.2"`, `"react-draggable": "4.7.0"` (add `react-draggable` explicitly to force ≥4.7.0 for react-rnd/react-resizable's internal use). In `devDependencies`: `"react-test-renderer": "19.2.7"`.

Run: `npm install` then `npm run build 2>&1 | tail -5`
Expected: installs and builds.

- [ ] **Step 2: Jest under React 19**

Run: `npm test 2>&1 | tail -20`
Expected: 5 react-test-renderer tests pass (a deprecation warning per `create()` is acceptable). If any test fails on concurrent-render `act()` warnings, wrap the specific `renderer.create(...)` in `act(() => {...})` imported from `react` (not `react-dom/test-utils`) — apply only to the failing test.

- [ ] **Step 3: Browser smoke — the two findDOMNode paths**

Run: `npm run dashboard`, open `http://localhost:4040`.
Verify in the browser console for `findDOMNode` errors while exercising: (a) **Data Browser column resize** (drag a `DragHandle`/`ResizableBox` edge in `DataBrowser.react.js`); (b) **Custom Dashboard** — create/select a canvas element and **drag + resize** it (`Rnd` in `CanvasElement.react.js`).

- [ ] **Step 4: Resolve any findDOMNode throw**

Expected primary outcome: react-resizable 4.0.2 handles its node internally → `ResizableBox` needs no code change. If `<Rnd>` throws `findDOMNode is not a function`:
  - First try: confirm `react-draggable@4.7.0` is deduped under `react-rnd` (`npm ls react-draggable`).
  - If it still throws (react-rnd 10.5.3 does not thread `nodeRef` to its internal `<Draggable>`), apply `patch-package`: add `patch-package` devDep, patch `node_modules/react-rnd/lib/index.js` to pass a `nodeRef` to its `<Draggable>`, add `"postinstall": "patch-package"` to scripts, and commit the generated `patches/react-rnd+10.5.3.patch`. Re-verify drag/resize.

(If a patch is needed, note it in the commit body; it is a known react-rnd-under-React-19 limitation.)

- [ ] **Step 5: Lint + full build**

Run: `npm run lint 2>&1 | tail -5` && `npm run build 2>&1 | tail -5`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
# include patches/ and any modified src files only if Step 4 required them
git commit -m "feat: React 18→19 + findDOMNode-safe draggables (#3408)"
```

**PAUSE for review.**

---

## Task 3: Checkpoint 3 — react-router 6 → 7

**Files:**
- Modify: `src/dashboard/Dashboard.js:338`, `src/parse-interface-guide/routes.js` (future flags, then removal)
- Modify (specifier flip `'react-router-dom'` → `'react-router'`): `src/lib/withRouter.js`, `src/dashboard/Dashboard.js`, `src/dashboard/AppData.react.js`, `src/dashboard/Settings/GeneralSettings.react.js`, `src/dashboard/Push/PushDetails.react.js`, `src/dashboard/Data/Playground/Playground.react.js`, `src/dashboard/Data/Browser/Browser.react.js`, `src/dashboard/Data/Jobs/JobsData.react.js`, `src/dashboard/Apps/AppsIndex.react.js`, `src/dashboard/Data/ApiConsole/ApiConsole.react.js`, `src/components/Sidebar/SidebarSubItem.react.js`, `src/components/Sidebar/AppsMenu.react.js`, `src/components/Sidebar/SidebarHeader.react.js`, `src/components/Sidebar/SidebarSection.react.js`, `src/components/FileTree/FileTree.react.js`, `src/components/Toolbar/Toolbar.react.js`, `src/components/CategoryList/CategoryList.react.js`, `src/parse-interface-guide/PIG.react.js`, `src/parse-interface-guide/routes.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 2's React 19 app.
- Produces: app on `react-router@7.18.1`, `react-router-dom` removed, all router APIs imported from `'react-router'`.

- [ ] **Step 1 (sub-step A — de-risk on v6): add future flags to both routers**

In `src/dashboard/Dashboard.js` line ~338 change `<BrowserRouter basename={...}>` to include:

```jsx
<BrowserRouter
  basename={window.PARSE_DASHBOARD_PATH || '/'}
  future={{
    v7_relativeSplatPath: true,
    v7_startTransition: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }}
>
```

In `src/parse-interface-guide/routes.js` add the same `future={{...}}` prop to its `<BrowserRouter>`.

(Pre-checked: no component-scope `React.lazy`, so `v7_startTransition` is safe.)

- [ ] **Step 2: Build + routing smoke under flags**

Run: `npm run build 2>&1 | tail -5`, then `npm run dashboard` and verify: app-selector → app, sidebar nav, deep links + browser back/forward, the `cloud_code/*` splat (Cloud Code sub-navigation), and a `path="*"` 404 route all behave. No new console warnings about splat/relative paths.

- [ ] **Step 3: Commit the flag adoption (bisectable v6 checkpoint)**

```bash
git add src/dashboard/Dashboard.js src/parse-interface-guide/routes.js
git commit -m "chore: adopt react-router v7 future flags on v6 (#3408)"
```

- [ ] **Step 4 (sub-step B — consolidate): flip imports and swap the package**

Flip the specifier in all 19 files listed above:

Run: `grep -rl "from 'react-router-dom'" src/ | xargs sed -i '' "s/from 'react-router-dom'/from 'react-router'/g"`
Then verify none remain: `grep -rn "react-router-dom" src/` → expected: no matches.

In `package.json` remove `"react-router-dom": "6.30.3"` and add `"react-router": "7.18.1"`.

Run: `npm install`
Expected: `react-router@7.18.1` installed; `react-router-dom` gone.

- [ ] **Step 5: Remove the now-default future flags**

In `src/dashboard/Dashboard.js` and `src/parse-interface-guide/routes.js`, delete the `future={{...}}` props added in Step 1 (they are v7 defaults and can log "unknown future flag" warnings on v7).

- [ ] **Step 6: Build + Jest + routing smoke on v7**

Run: `npm run lint 2>&1 | tail -5` && `npm run build 2>&1 | tail -5` && `npm test 2>&1 | tail -15`
Expected: all clean/green.
Then `npm run dashboard`: repeat the Step 2 routing checks on v7 (app selector, sidebar, deep links, back/forward, `cloud_code/*` splat, 404). Confirm `withRouter`-wrapped class components (e.g. Browser, Toolbar navigation) still receive `params`/`navigate`/`location`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/
git commit -m "feat: react-router 6→7, consolidate onto react-router package (#3408)"
```

**PAUSE for review.**

---

## Task 4: Checkpoint 4 — GraphiQL 2 → 5

**Files:**
- Modify: `webpack/base.config.js`
- Modify: `src/dashboard/index.js`
- Modify: `src/dashboard/Data/ApiConsole/GraphQLConsole.react.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 2's React 19 (GraphiQL 5 peer).
- Produces: GraphQL console rendering a Monaco editor with a working `createGraphiQLFetcher` against `graphQLServerURL`, X-Parse headers preserved.

- [ ] **Step 1: Swap GraphiQL deps**

In `package.json` `dependencies`: remove `"graphiql": "2.0.8"`; add `"graphiql": "5.2.4"` and `"@graphiql/toolkit": "0.12.1"`. Keep `"graphql": "16.12.0"`. Do **not** add `monaco-editor`.

Run: `npm install` then `npm ls monaco-editor`
Expected: `monaco-editor@0.52.2` resolved transitively (via `@graphiql/react`); **not** 0.55.1.

- [ ] **Step 2: Add the Monaco font asset rule to webpack**

In `webpack/base.config.js` `module.rules`, add (near the png/jpg rules):

```js
{
  test: /\.ttf$/,
  type: 'asset/resource',
},
{
  test: /\.woff2?$/,
  type: 'asset/resource',
},
```

- [ ] **Step 3: Update entry CSS + register Monaco workers**

In `src/dashboard/index.js` replace `require('graphiql/graphiql.min.css');` with:

```js
import 'graphiql/setup-workers/webpack';
import 'graphiql/style.css';
```

(Place these with the other top-of-file imports/`require`s, before the app renders. `setup-workers/webpack` sets `MonacoEnvironment.getWorker` once.)

- [ ] **Step 4: Rewrite `GraphQLConsole.react.js` for v5**

Replace the imports and the `content = ( <GraphiQL ... /> )` block:

```js
import React, { Component } from 'react';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from 'dashboard/Data/ApiConsole/ApiConsole.scss';
import { CurrentApp } from 'context/currentApp';
```

Replace the `else { ... }` branch body that builds `content` with:

```js
      const parseHeaders = {
        'X-Parse-Application-Id': applicationId,
        'X-Parse-Master-Key': masterKey,
      };
      if (clientKey) {
        parseHeaders['X-Parse-Client-Key'] = clientKey;
      }
      const fetcher = createGraphiQLFetcher({
        url: graphQLServerURL,
        headers: parseHeaders,
      });
      content = (
        <GraphiQL
          fetcher={fetcher}
          initialHeaders={JSON.stringify(parseHeaders, null, 2)}
        />
      );
```

Keep the `!graphQLServerURL` EmptyState branch and the `<Toolbar/>` wrapper unchanged.

- [ ] **Step 5: Build**

Run: `npm run build 2>&1 | tail -8`
Expected: build succeeds; no "Module parse failed" for `codicon.ttf`; Monaco `*.worker.js` chunks emitted.

- [ ] **Step 6: Browser smoke — the GraphQL console (against Task 0 stack)**

Run: `PARSE_DASHBOARD_GRAPHQL_SERVER_URL=http://localhost:1337/graphql npm run dashboard`, open `http://localhost:4040`, navigate **API Console → GraphQL**.
Verify: (a) the **Monaco** editor mounts (no blank editor; no `*.worker.js` 404 in the Network tab; no "define MonacoEnvironment" console error); (b) the schema/docs load; (c) run `{ __typename }` — it returns; (d) confirm request carries `X-Parse-Application-Id`/`X-Parse-Master-Key` (Network tab or parse-server log).

- [ ] **Step 7: Resolve worker-loading / Accept issues if any**

- If workers 404: set `output.publicPath: 'auto'` in `webpack/base.config.js`, rebuild, re-verify (revert if it breaks other asset URLs).
- If the query fails on the `Accept` header: change the fetcher to `createGraphiQLFetcher({ url: graphQLServerURL, headers: parseHeaders, enableIncrementalDelivery: false })` and re-verify.

- [ ] **Step 8: Lint + Jest**

Run: `npm run lint 2>&1 | tail -5` && `npm test 2>&1 | tail -15`
Expected: clean/green (no test imports graphiql, so ESM is not loaded by Jest).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json webpack/base.config.js src/dashboard/index.js src/dashboard/Data/ApiConsole/GraphQLConsole.react.js
git commit -m "feat: GraphiQL 2→5 (Monaco workers, createGraphiQLFetcher) (#3408)"
```

**PAUSE for review.**

---

## Task 5: Wrap-up + PR

**Interfaces:**
- Consumes: Tasks 1–4 commits on `chore/react19-router7-graphiql5`.

- [ ] **Step 1: Full production build (dashboard + PIG)**

Run: `npm run build 2>&1 | tail -10`
Expected: both `webpack --config webpack/production.config.js` and `webpack --config webpack/PIG.config.js` succeed.

- [ ] **Step 2: Full test + lint**

Run: `npm test 2>&1 | tail -20` && `npm run lint 2>&1 | tail -5`
Expected: green.

- [ ] **Step 3: Regression pass against the issue's Manual QA checklist**

Drive the local stack through the issue #3408 "Manual QA checklist" (Data Browser CRUD/relations/export, Cloud Code/Jobs/Logs/Config/Webhooks/Views, Push, Analytics, REST + GraphQL consoles, `useBeforeUnload` prompts, modals/popovers). Record any regressions.

- [ ] **Step 4: Push + open the PR**

```bash
git push -u origin chore/react19-router7-graphiql5
gh pr create --repo parse-community/parse-dashboard --base alpha \
  --title "feat: React 19 + react-router 7 + GraphiQL 5 coordinated upgrade" \
  --body "Closes #3408. Supersedes #3336, #3341, #3369, #3372, #3377.

<four-commit summary + QA results + any react-rnd patch note>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 5: Reference the superseded Dependabot PRs**

Comment on #3336, #3341, #3369, #3372, #3377 that they are superseded by this PR (do **not** auto-close — leave that to the maintainer/merge). *(Outward-facing GitHub writes — confirm with the user before posting.)*

---

## Self-Review (against the spec)

- **Spec coverage:** createRoot ×3 (T1 s2–4) ✔; react-json-view replace (T1 s5) ✔; react-dnd decorators→hooks + v16 API (T1 s6–8) ✔; React 19 bump + findDOMNode/nodeRef (T2) ✔; react-router 6→7 flags + consolidation (T3) ✔; GraphiQL 5 + Monaco workers + fetcher + CSS + `.ttf` rule (T4) ✔; monaco 0.52.2-transitive constraint (T4 s1) ✔; local stack + browser QA (T0, per-task smokes, T5) ✔; single PR superseding 5 PRs (T5) ✔.
- **Out-of-scope items** (automatic runtime, StrictMode, helmet-async, RTL migration) correctly excluded.
- **Type/name consistency:** `moveDataBrowserHeader(item.index, index)` matches the parent prop `moveDataBrowserHeader={this.props.handleDragDrop}` and the original `props.moveDataBrowserHeader`; `handleColumnDragDrop(item.index, index)` unchanged; `createGraphiQLFetcher({url, headers})` + `initialHeaders` match the design.
- **Known runtime unknowns** carry explicit fallbacks in-task (react-rnd patch, `publicPath: 'auto'`, `enableIncrementalDelivery:false`).
