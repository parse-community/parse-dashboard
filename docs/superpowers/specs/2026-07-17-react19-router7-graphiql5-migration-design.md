# Coordinated upgrade: React 19 + react-router 7 + GraphiQL 5 — Design

- **Issue:** [parse-community/parse-dashboard#3408](https://github.com/parse-community/parse-dashboard/issues/3408)
- **Date:** 2026-07-17
- **Branch:** `chore/react19-router7-graphiql5`
- **Supersedes Dependabot PRs:** #3336, #3341, #3369, #3372, #3377

## 1. Goal

Land a single coordinated migration that moves the dashboard from React 16 → 19,
react-router 6 → 7, and GraphiQL 2 → 5. These bumps are coupled through peer
dependencies (GraphiQL 5 requires React 18/19; React 19 forces the `findDOMNode`
and `ReactDOM.render` removals) and cannot be merged independently. The work lands
on one branch as four ordered, independently-buildable commits, with a review
checkpoint after each.

## 2. Current state (verified against the repo on `alpha`)

| Package | Current | Target |
| --- | --- | --- |
| `react` / `react-dom` | 16.14.0 | 19.2.7 (via 18.3.x stepping stone) |
| `react-test-renderer` (dev) | 16.13.1 | 19.2.7 |
| `react-router-dom` | 6.30.3 | **removed** |
| `react-router` | — | **7.18.1** (new dependency) |
| `react-json-view` | 1.21.3 | **removed** |
| `@microlink/react-json-view` | — | **1.31.22** (new dependency) |
| `react-dnd` | 10.0.2 | 16.0.1 |
| `react-dnd-html5-backend` | 16.0.1 | 16.0.1 (unchanged; fixes pre-existing mismatch) |
| `graphiql` | 2.0.8 | **5.2.4** |
| `@graphiql/toolkit` | — | **0.12.1** (new dependency) |
| `graphql` | 16.12.0 | 16.12.0 (unchanged; satisfies GraphiQL 5 peer) |
| `graphql-ws` | — | **6.1.0** (new; `@graphiql/toolkit` peer imported by `createGraphiQLFetcher`) |
| `monaco-editor` | — | 0.52.2 (**transitive only** — do NOT add 0.55.1) |
| `@babel/plugin-proposal-decorators` (dev) | 7.29.0 | 7.29.0 (**kept** — see Implementation notes) |

Toolchain (webpack 5.106, Babel 7, Jest 30 + jsdom, Node `>=20.19`) does not block the work.

## 3. Key findings that revise the issue

The issue's audit is accurate for *application* source but understated three
**third-party** React-19 blockers (its "legacy patterns: clean" audit only checked
app code, not dependency internals). All three are confirmed in-repo:

1. **`react-json-view@1.21.3`** — peer `^15||^16||^17` is a hard `npm install` block
   against React 18/19. Used in [`Playground.react.js`](../../../src/dashboard/Data/Playground/Playground.react.js).
   → replace with `@microlink/react-json-view` (drop-in fork, same `<ReactJson>` API).
2. **`react-dnd@10` decorators** — `@DragSource`/`@DropTarget` in
   [`DataBrowserHeader.react.js`](../../../src/components/DataBrowserHeader/DataBrowserHeader.react.js)
   (the only file using the `react-dnd` **class-decorator** API). Predates React
   18/19 and cannot be version-bumped without a hooks rewrite. → rewrite
   `DataBrowserHeader` to `useDrag`/`useDrop`, update `ColumnConfigurationItem` to
   the v16 hooks API, and bump `react-dnd` 10→16 (matching the already-installed
   html5-backend@16). **The Babel decorators plugin is kept** — `@withRouter` /
   `@subscribeTo` are used as class decorators across ~25 files (see Implementation
   notes).
3. **`react-rnd` / `react-resizable`** — call the **removed** `findDOMNode` and will
   **throw** (not warn) under React 19 unless a `nodeRef` is threaded.
   [`CanvasElement.react.js`](../../../src/dashboard/Data/CustomDashboard/CanvasElement.react.js)
   uses `<Rnd>`; [`DataBrowser.react.js`](../../../src/dashboard/Data/Browser/DataBrowser.react.js)
   uses `<ResizableBox>`. Neither passes `nodeRef` today.

### Resolved technical decisions

- **Router target = `react-router@7.18.1`** (main package). `react-router-dom` is a
  dead-ended compat shim (frozen at 7.18.1, no v8); every API in use
  (`BrowserRouter`, `Routes`, `Route`, `Outlet`, `Link`, `NavLink`, `Navigate`,
  `useNavigate`, `useParams`, `useLocation`, `useOutletContext`, `useBeforeUnload`,
  `useNavigationType`, `NavigationType`) still exports from `react-router`. Only the
  import specifier changes. v7 is dual CJS/ESM (Jest-safe) and keeps Node `>=20`;
  v8 was rejected because it forces `engines.node >= 22.22.0` (a ranged-expression +
  CI-matrix rewrite) and pure-ESM Jest work. v8 is a trivial later bump.
- **GraphiQL 5 integration** (verified against v5 CHANGELOG + published dist):
  - `import { GraphiQL } from 'graphiql'` (no default export).
  - `import { createGraphiQLFetcher } from '@graphiql/toolkit'`; fetcher =
    `createGraphiQLFetcher({ url: graphQLServerURL, headers: parseHeaders })`
    (auto-sets Accept + Content-Type JSON; merges editor headers).
  - Props: `headers` → `initialHeaders`; `headerEditorEnabled` → drop (default true).
  - CSS: `graphiql/graphiql.min.css` → `graphiql/style.css`.
  - Monaco workers: one side-effect import `import 'graphiql/setup-workers/webpack'`
    (uses webpack-5-native `new Worker(new URL(...))`). **No** `monaco-editor-webpack-plugin`.
  - **Mandatory webpack change:** add a `.ttf` asset rule (Monaco codicon font) or
    the build fails.
  - `monaco-editor` must resolve **transitively at 0.52.2** (pinned by `@graphiql/react`;
    `monaco-graphql` peer caps `< 0.53`). Do **not** install 0.55.1.

### Out of scope (deliberately, to keep diffs focused)

All optional / non-blocking under React 19:
- `@babel/preset-react` `runtime:'automatic'` — classic runtime still works in React 19.
- `react-helmet` → `react-helmet-async` (warn-only `componentWillMount`).
- Adding `<StrictMode>` — would surface ~63 legacy-lifecycle warnings.
- Migrating the 5 `react-test-renderer` tests to `@testing-library/react` — bump the
  renderer to 19 now; migrate later.
- Legacy lifecycle cleanup (`componentWillMount` ×30, `componentWillReceiveProps` ×33)
  — warn-only, not removed.

## 4. Execution — four ordered checkpoints

One branch, one commit per checkpoint, each independently buildable and green
(build + `npm test` + `npm run lint` + browser smoke). **Pause for review after each.**

### Checkpoint 1 — React 16 → 18 (createRoot + third-party unblock)

- `src/dashboard/index.js`, `src/quickstart/index.js`, `src/parse-interface-guide/index.js`:
  `import ReactDOM from 'react-dom'` → `import { createRoot } from 'react-dom/client'`;
  `ReactDOM.render(X, el)` → `createRoot(el).render(X)`. (PIG renders the `Routes` JSX
  element directly.)
- `src/dashboard/Data/Playground/Playground.react.js`: `import ReactJson from 'react-json-view'`
  → `from '@microlink/react-json-view'`. Re-check the `'react-json-view error'` string
  guard at ~line 897.
- `src/components/DataBrowserHeader/DataBrowserHeader.react.js`: rewrite `@DropTarget`/
  `@DragSource` decorators → `useDrag`/`useDrop` hooks, preserving column drag-reorder
  behavior. It already renders inside a `DndProvider` (in `DataBrowserHeaderBar`).
- `package.json`: `react`/`react-dom` → `18.3.1` (latest 18.x); `react-test-renderer` →
  `18.3.1`; remove `react-json-view`, add `@microlink/react-json-view@1.31.22`;
  `react-dnd` 10.0.2 → 16.0.1.
- `babel.config.js` + `package.json`: drop `@babel/plugin-proposal-decorators` (only
  DataBrowserHeader used it) and verify the build still passes.
- **Verify:** app boots (`/`, quickstart, PIG); drag a Data Browser column header
  (react-dnd); open the Playground JS console (json viewer). `findDOMNode` still exists
  in React 18, so drag/resize libs are fine here.

### Checkpoint 2 — React 18 → 19

- `package.json`: `react`/`react-dom` → `19.2.7`; `react-test-renderer` → `19.2.7`.
- `src/dashboard/Data/CustomDashboard/CanvasElement.react.js`: thread a `nodeRef` into
  `<Rnd>` so react-rnd/react-draggable stop calling `findDOMNode`.
- `src/dashboard/Data/Browser/DataBrowser.react.js`: thread a `nodeRef` into
  `<ResizableBox>` (react-resizable).
- React 19 removals sweep: confirm no `ReactDOM.render`/string refs/legacy Context/
  `react-dom/test-utils` remain (app source already clean).
- **Verify:** drag/resize CustomDashboard canvas elements and resize a Data Browser
  column (the two `findDOMNode` paths); the 5 `react-test-renderer` tests still pass
  (deprecation warning is acceptable). **Runtime risk:** if `<Rnd>`/`<ResizableBox>`
  still throw `findDOMNode`, the pinned react-rnd@10.5.3 / react-resizable@3.1.3 may
  not expose `nodeRef` — bump the specific library to a `nodeRef`-supporting version.

### Checkpoint 3 — react-router 6 → 7

- **Sub-step A (de-risk on v6):** add future flags to both `<BrowserRouter>`
  ([`Dashboard.js:338`](../../../src/dashboard/Dashboard.js#L338),
  [`parse-interface-guide/routes.js`](../../../src/parse-interface-guide/routes.js)):
  `future={{ v7_relativeSplatPath:true, v7_startTransition:true, v7_fetcherPersist:true,
  v7_normalizeFormMethod:true, v7_partialHydration:true, v7_skipActionErrorRevalidation:true }}`.
  First grep-confirm no component-scope `React.lazy` (required before `v7_startTransition`).
  Verify routing under flags: deep links, back/forward, `cloud_code/*` splat, `path="*"` 404.
- **Sub-step B (consolidate):** flip `from 'react-router-dom'` → `from 'react-router'` in
  all 19 source files incl. `src/lib/withRouter.js`; remove `react-router-dom` from
  `package.json`, add `react-router@7.18.1`; **remove** the `future` props (they are v7
  defaults and can warn as unknown).
- **Verify:** full routing regression (app selector, sidebar, deep links, splat, 404).
- **Note:** `CloudCode` reads the splat via `useParams().splat` and navigates with
  absolute `generatePath(...)`, so `v7_relativeSplatPath` needs no code change.

### Checkpoint 4 — GraphiQL 2 → 5

- `package.json`: remove `graphiql@2.0.8`; add `graphiql@5.2.4` + `@graphiql/toolkit@0.12.1`.
  Keep `graphql@16.12.0`. Do **not** add `monaco-editor` (transitive 0.52.2).
- `webpack/base.config.js`: add `{ test: /\.ttf$/, type: 'asset/resource' }` (and
  `/\.woff2?$/` for safety). Evaluate `output.publicPath: 'auto'` for Monaco worker
  chunk resolution (verify in browser; revert if it breaks other asset paths).
- `src/dashboard/index.js`: `require('graphiql/graphiql.min.css')` →
  `import 'graphiql/style.css';` + add `import 'graphiql/setup-workers/webpack';`
  (before the app renders).
- `src/dashboard/Data/ApiConsole/GraphQLConsole.react.js`: named `GraphiQL` import +
  `createGraphiQLFetcher`; build `const fetcher = createGraphiQLFetcher({ url:
  graphQLServerURL, headers: parseHeaders })` and render `<GraphiQL fetcher={fetcher}
  initialHeaders={JSON.stringify(parseHeaders, null, 2)} />`. Preserve X-Parse-App-Id /
  Master-Key / optional Client-Key injection exactly.
- **Verify (against the local stack):** GraphQL console mounts a **Monaco** editor
  (no blank editor / no worker 404), schema loads, a query runs against the local Parse
  GraphQL endpoint, and X-Parse headers are sent (network/server logs). If the Parse
  server rejects the multi-value `Accept`, pass `enableIncrementalDelivery:false`.

### Wrap-up
Full `npm test` + `npm run lint` + production `npm run build` (dashboard **and** PIG
configs). Open one PR on `chore/react19-router7-graphiql5` that closes/supersedes the
five Dependabot PRs.

## 5. Verification harness (per "stand up local stack")

- **MongoDB** via `mongodb-runner` (devDep).
- **Parse Server** via `parse-server@9.9.0` (devDep) with `mountGraphQL: true` and a
  `graphQLServerURL`, so the GraphQL console has a live schema/endpoint.
- **Dashboard** config pointing at that app with `graphQLServerURL` set.
- **Browser QA** via the existing `puppeteer@24.37` + `browser-control` npm scripts
  (headless), plus manual smoke for the GraphQL console.
- **Regression matrix** = the issue's Manual QA checklist.
- **Coverage gap (accepted):** Jest `roots` is `['src/lib']` and the 5 tests only touch
  presentational components — Monaco/GraphiQL, drag/drop, `findDOMNode` draggables,
  `createRoot` entries, and splat routing have **no** unit-test net. Verification for
  those leans entirely on the browser harness above.

## 6. Top risks & mitigations

| # | Risk | Mitigation |
| --- | --- | --- |
| 1 | Monaco worker 404 / blank editor under `publicPath: 'bundles/'` | Verify in browser at CP4; switch `output.publicPath` to `'auto'` if workers 404. |
| 2 | `react-rnd`/`react-resizable` still call `findDOMNode` at pinned versions | Thread `nodeRef` at CP2; if it throws, bump the specific lib to a `nodeRef`-supporting release. |
| 3 | `DataBrowserHeader` hooks rewrite changes column-reorder behavior | Drag-test at CP1 against current behavior. |
| 4 | Parse GraphQL server rejects `createGraphiQLFetcher`'s multi-value `Accept` | `enableIncrementalDelivery:false`. |
| 5 | `@microlink/react-json-view` visual/behavioral drift in Playground | Smoke the JS console output rendering at CP1. |

## 7. Deliverable

Single branch `chore/react19-router7-graphiql5`; five commits (four checkpoints,
react-router split into a flags commit + a consolidation commit); one PR that
supersedes/closes #3336, #3341, #3369, #3372, #3377. Review checkpoint after each
before proceeding.

## 8. Implementation notes (what actually shipped vs. this plan)

Discoveries during execution, all surfaced by the live-stack browser QA (none were
caught by build or unit tests):

- **The Babel decorators plugin was NOT dropped.** The pre-implementation audit's
  "only `DataBrowserHeader` uses decorators" was wrong: `@withRouter` and
  `@subscribeTo(...)` are used as **class decorators** across ~25 files. Lint caught
  it; `@babel/plugin-proposal-decorators` is kept. (react-dnd's `@DragSource`/
  `@DropTarget` are a separate, unrelated use that the rewrite removed.)
- **Two React 18 automatic-batching regressions** in the Data Browser (CP1): `setState`
  is no longer synchronous inside promises, so `Browser.react.js` read stale state
  right after `setState`. Fixed by using the fetched value directly and by making
  `StoreManager.dispatch` resolve with the new state.
- **`findDOMNode` needed no manual `nodeRef` edits** (CP2): bumping `react-draggable`
  4.5→4.7 and `react-resizable` 3.1.3→4.0.2 is sufficient — those versions thread a
  `nodeRef` internally and `react-draggable@4.7` guards the removed API. `CanvasElement`
  / `DataBrowser` were not modified (better than Risk #2 anticipated).
- **graphiql@2 crashed the whole app on boot under React 19** (CP2) by reading the
  removed `ReactCurrentOwner` internal at module load. Fixed by lazy-loading
  `GraphQLConsole` (`React.lazy` + `Suspense`), which also permanently code-splits the
  Monaco/GraphiQL chunk. Consequence: the GraphQL console is intentionally broken
  between CP2 and CP4, isolated behind the lazy boundary.
- **webpack `resolve.modules`** needed a relative `'node_modules'` walk-up entry (CP2):
  React 19 peer conflicts make npm nest some deps (`@graphiql/react`, `react-side-effect`)
  that the absolute-only module paths couldn't resolve.
- **The 5 `react-test-renderer` tests needed `act()` wrapping** (CP2): React 19 renders
  concurrently, so `create()` must run inside `act()` for `toJSON()`/`getInstance()`.
- **react-router install needed `--legacy-peer-deps` at CP3** (graphiql@2 blocks React 19
  peers); normalized to a plain lockfile once graphiql 5 landed at CP4.
- **`graphql-ws@6.1.0` added at CP4** — a `@graphiql/toolkit` peer that
  `createGraphiQLFetcher` statically imports.
- **`output.publicPath: 'auto'` (CP4)** — Risk #1 materialized: Monaco workers 404'd on a
  doubled relative `bundles/bundles/…` path; `'auto'` fixed it and is app-wide safe.
- **`enableIncrementalDelivery:false` was NOT needed** (Risk #4): parse-server accepted
  the fetcher's multi-value `Accept`; introspection returns 200 with data.
