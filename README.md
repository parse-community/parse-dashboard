![parse-repository-header-dashboard](https://user-images.githubusercontent.com/5673677/138276825-9b430df8-b1f6-41d7-af32-4852a8fbc143.png)

---

[![Build Status](https://github.com/parse-community/parse-dashboard/workflows/ci/badge.svg?branch=alpha)](https://github.com/parse-community/parse-dashboard/actions?query=workflow%3Aci+branch%3Aalpha)
[![Build Status](https://github.com/parse-community/parse-dashboard/workflows/ci/badge.svg?branch=release)](https://github.com/parse-community/parse-dashboard/actions?query=workflow%3Aci+branch%3Arelease)
[![Snyk Badge](https://snyk.io/test/github/parse-community/parse-dashboard/badge.svg)](https://snyk.io/test/github/parse-community/parse-dashboard)

[![Node Version](https://img.shields.io/badge/nodejs-18,_20,_22-green.svg?logo=node.js&style=flat)](https://nodejs.org/)
[![auto-release](https://img.shields.io/badge/%F0%9F%9A%80-auto--release-9e34eb.svg)](https://github.com/parse-community/parse-dashboard/releases)

[![npm latest version](https://img.shields.io/npm/v/parse-dashboard/latest.svg)](https://www.npmjs.com/package/parse-dashboard)
[![npm alpha version](https://img.shields.io/npm/v/parse-dashboard/alpha.svg)](https://www.npmjs.com/package/parse-dashboard)

[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)][open-collective-link]
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)][open-collective-link]
[![License][license-svg]][license-link]
[![Forum](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/parse-server)
[![Twitter](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)

---

Parse Dashboard is a standalone dashboard for managing your [Parse Server](https://github.com/ParsePlatform/parse-server) apps.

---

- [Getting Started](#getting-started)
  - [Compatibility](#compatibility)
    - [Parse Server](#parse-server)
    - [Node.js](#nodejs)
  - [Configuring Parse Dashboard](#configuring-parse-dashboard)
    - [Options](#options)
    - [File](#file)
    - [Environment variables](#environment-variables)
      - [Multiple apps](#multiple-apps)
      - [Single app](#single-app)
  - [Managing Multiple Apps](#managing-multiple-apps)
  - [GraphQL Playground](#graphql-playground)
  - [App Icon Configuration](#app-icon-configuration)
  - [App Background Color Configuration](#app-background-color-configuration)
  - [Other Configuration Options](#other-configuration-options)
    - [Prevent columns sorting](#prevent-columns-sorting)
    - [Custom order in the filter popup](#custom-order-in-the-filter-popup)
    - [Persistent Filters](#persistent-filters)
    - [Scripts](#scripts)
    - [Resource Cache](#resource-cache)
- [Running as Express Middleware](#running-as-express-middleware)
- [Deploying Parse Dashboard](#deploying-parse-dashboard)
  - [Preparing for Deployment](#preparing-for-deployment)
  - [Security Considerations](#security-considerations)
    - [Security Checks](#security-checks)
    - [Configuring Basic Authentication](#configuring-basic-authentication)
    - [Multi-Factor Authentication (One-Time Password)](#multi-factor-authentication-one-time-password)
    - [Separating App Access Based on User Identity](#separating-app-access-based-on-user-identity)
  - [Use Read-Only masterKey](#use-read-only-masterkey)
    - [Making an app read-only for all users](#making-an-app-read-only-for-all-users)
    - [Makings users read-only](#makings-users-read-only)
    - [Making user's apps readOnly](#making-users-apps-readonly)
  - [Configuring Localized Push Notifications](#configuring-localized-push-notifications)
  - [Run with Docker](#run-with-docker)
- [Features](#features)
  - [Data Browser](#data-browser)
    - [Filters](#filters)
    - [Info Panel](#info-panel)
      - [Response](#response)
        - [Segments](#segments)
        - [Text Item](#text-item)
        - [Key-Value Item](#key-value-item)
        - [Table Item](#table-item)
        - [Image Item](#image-item)
        - [Video Item](#video-item)
        - [Audio Item](#audio-item)
        - [Button Item](#button-item)
        - [Panel Item](#panel-item)
      - [Prefetching](#prefetching)
    - [Freeze Columns](#freeze-columns)
    - [Browse as User](#browse-as-user)
    - [Change Pointer Key](#change-pointer-key)
      - [Limitations](#limitations)
    - [CSV Export](#csv-export)
  - [AI Agent](#ai-agent)
    - [Configuration](#configuration)
    - [Providers](#providers)
      - [OpenAI](#openai)
  - [Views](#views)
    - [Data Sources](#data-sources)
      - [Aggregation Pipeline](#aggregation-pipeline)
      - [Cloud Function](#cloud-function)
    - [View Table](#view-table)
      - [Pointer](#pointer)
      - [Link](#link)
      - [Image](#image)
- [Contributing](#contributing)

# Getting Started

Install the dashboard from `npm`.

```
npm install -g parse-dashboard
```

You can launch the dashboard for an app with a single command by supplying an app ID, master key, URL, and name like this:

```
parse-dashboard --dev --appId yourAppId --masterKey yourMasterKey --serverURL "https://example.com/parse" --appName optionalName
```

You may set the host, port and mount path by supplying the `--host`, `--port` and `--mountPath` options to parse-dashboard. You can use anything you want as the app name, or leave it out in which case the app ID will be used.

The `--dev` parameter disables production-ready security features. This parameter is useful when running Parse Dashboard on Docker. Using this parameter will:

- allow insecure http connections from anywhere, bypassing the option `allowInsecureHTTP`
- allow the Parse Server `masterKey` to be transmitted in cleartext without encryption
- allow dashboard access without user authentication

> ⚠️ Do not use this parameter when deploying Parse Dashboard in a production environment.

After starting the dashboard, you can visit http://localhost:4040 in your browser:

![Parse Dashboard](.github/dash-shot.png)

## Compatibility

### Parse Server
Parse Dashboard is compatible with the following versions of Parse Server.

| Parse Dashboard | Parse Server     |
|-----------------|------------------|
| >= 1.0.0        | >= 2.1.4 < 7.0.0 |
| >= 8.0.0        | >= 7.0.0         |

Parse Dashboard automatically checks the Parse Server version when connecting and displays a warning if the server version does not meet the minimum required version. The required Parse Server version is defined in the `supportedParseServerVersion` field in `package.json`.

### Node.js
Parse Dashboard is continuously tested with the most recent releases of Node.js to ensure compatibility. We follow the [Node.js Long Term Support plan](https://github.com/nodejs/Release) and only test against versions that are officially supported and have not reached their end-of-life date.

| Version    | Latest Version | End-of-Life | Compatible |
|------------|----------------|-------------|------------|
| Node.js 18 | 18.20.4        | May 2025    | ✅ Yes      |
| Node.js 20 | 20.18.0        | April 2026  | ✅ Yes      |
| Node.js 22 | 22.9.0         | April 2027  | ✅ Yes      |

## Configuring Parse Dashboard

### Options

This section provides a comprehensive reference for all Parse Dashboard configuration options that can be used in the configuration file, via CLI arguments, or as environment variables.

#### Root Configuration Keys

| Key | Type | Required | Default | CLI | Env Variable | Example | Description | Links to Details |
|-----|------|----------|---------|-----|--------------|---------|-------------|------------------|
| `apps` | Array&lt;Object&gt; | Yes | - | - | `PARSE_DASHBOARD_CONFIG` | `[{...}]` | Array of Parse Server apps to manage | [App Configuration](#app-configuration-apps-array) |
| `users` | Array&lt;Object&gt; | No | - | - | - | `[{...}]` | User accounts for dashboard authentication | [User Configuration](#user-configuration-users) |
| `useEncryptedPasswords` | Boolean | No | `false` | - | - | `true` | Use bcrypt hashes instead of plain text passwords | - |
| `trustProxy` | Boolean \| Number | No | `false` | `--trustProxy` | `PARSE_DASHBOARD_TRUST_PROXY` | `1` | Trust X-Forwarded-* headers when behind proxy | - |
| `iconsFolder` | String | No | - | - | - | `"icons"` | Folder for app icons (relative or absolute path) | - |
| `agent` | Object | No | - | - | `PARSE_DASHBOARD_AGENT` (JSON) | `{...}` | AI agent configuration | [AI Agent Configuration](#ai-agent) |
| `enableResourceCache` | Boolean | No | `false` | - | - | `true` | Enable browser caching of dashboard resources | - |


##### App Configuration (`apps` array)

| Parameter                  | Type                | Optional | Default   | CLI                  | Env Variable                         | Example                           | Description                                                                                                  |
| -------------------------- | ------------------- | -------- | --------- | -------------------- | ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `appId`                    | String              | no       | -         | `--appId`            | `PARSE_DASHBOARD_APP_ID`             | `"myAppId"`                       | The Application ID for your Parse Server instance.                                                           |
| `masterKey`                | String \| Function  | no       | -         | `--masterKey`        | `PARSE_DASHBOARD_MASTER_KEY`         | `"key"` or `() => "key"`          | Master key for full access. Can be a String or Function returning a String.                                  |
| `serverURL`                | String              | no       | -         | `--serverURL`        | `PARSE_DASHBOARD_SERVER_URL`         | `"http://localhost:1337/parse"`   | The URL where your Parse Server is running.                                                                  |
| `appName`                  | String              | yes      | `appId`   | `--appName`          | `PARSE_DASHBOARD_APP_NAME`           | `"MyApp"`                         | Display name of the app.                                                                                     |
| `masterKeyTtl`             | Number              | yes      | -         | `--masterKeyTtl`     | -                                    | `3600`                            | TTL for master key cache in seconds (only when masterKey is a function).                                        |
| `readOnlyMasterKey`        | String              | yes      | -         | -                    | -                                    | `"myReadOnlyKey"`                 | Read-only master key that prevents mutations.                                                                |
| `clientKey`                | String              | yes      | -         | -                    | -                                    | `"myClientKey"`                   | Client key for Parse SDK (legacy, mostly unused).                                                            |
| `javascriptKey`            | String              | yes      | -         | -                    | -                                    | `"myJsKey"`                       | JavaScript key for Parse SDK (legacy, mostly unused).                                                        |
| `restKey`                  | String              | yes      | -         | -                    | -                                    | `"myRestKey"`                     | REST API key for server-side REST applications.                                                              |
| `windowsKey`               | String              | yes      | -         | -                    | -                                    | `"myWindowsKey"`                  | Windows SDK key (legacy, mostly unused).                                                                     |
| `webhookKey`               | String              | yes      | -         | -                    | -                                    | `"myWebhookKey"`                  | Webhook key for Cloud Code Webhooks.                                                                         |
| `fileKey`                  | String              | yes      | -         | -                    | -                                    | `"myFileKey"`                     | File key used for file migrations.                                                           |
| `graphQLServerURL`         | String              | yes      | -         | `--graphQLServerURL` | `PARSE_DASHBOARD_GRAPHQL_SERVER_URL` | `"http://localhost:1337/graphql"` | The URL where your Parse GraphQL Server is running.                                                          |
| `appNameForURL`            | String              | yes      | `appName` | -                    | -                                    | `"my-app"`                        | URL-friendly name used in dashboard URLs.                                                                    |
| `production`               | Boolean             | yes      | `false`   | -                    | -                                    | `true`                            | Mark as production environment.                                                                              |
| `iconName`                 | String              | yes      | -         | -                    | -                                    | `"icon.png"`                      | Filename of app icon (requires global `iconsFolder`).                                                        |
| `primaryBackgroundColor`   | String              | yes      | -         | -                    | -                                    | `"#FFA500"`                       | Primary background color (CSS value).                                                                        |
| `secondaryBackgroundColor` | String              | yes      | -         | -                    | -                                    | `"#FF4500"`                       | Secondary background color (CSS value).                                                                      |
| `supportedPushLocales`     | Array&lt;String&gt; | yes      | -         | -                    | -                                    | `["en","fr"]`                     | Supported locales for push notifications.                                                                    |
| `preventSchemaEdits`       | Boolean             | yes      | `false`   | -                    | -                                    | `true`                            | Prevent schema modifications through the dashboard.                                                          |
| `columnPreference`         | Object              | yes      | -         | -                    | -                                    | `{"_User":[...]}`                 | Column visibility/sorting/filtering preferences. See [column preferences details](#prevent-columns-sorting). |
| `classPreference`          | Object              | yes      | -         | -                    | -                                    | `{"_Role":{...}}`                 | Persistent filters for all users. See [persistent filters details](#persistent-filters).                     |
| `enableSecurityChecks`     | Boolean             | yes      | `false`   | -                    | -                                    | `true`                            | Enable security checks under App Settings > Security.                                                        |
| `cloudConfigHistoryLimit`  | Integer             | yes      | `100`     | -                    | -                                    | `200`                             | Number of historic Cloud Config values (0 to Number.MAX_SAFE_INTEGER).                                       |
| `config`                   | Object              | yes      | -         | -                    | -                                    | `{...}`                           | Settings for storing dashboard config on server.                                                             |
| `config.className`         | String              | yes      | -         | -                    | -                                    | `"DashboardConfig"`               | Table name for dashboard configuration.                                                                      |
| `scripts`                  | Array&lt;Object&gt; | yes      | `[]`      | -                    | -                                    | `[{...}]`                         | Scripts for this app. See [scripts table below](#scripts).                                                   |
| `infoPanel`                | Array&lt;Object&gt; | yes      | -         | -                    | -                                    | `[{...}]`                         | Info panel config. See [info panel table below](#info-panel).                                                |

##### Column Preference Configuration (`apps[].columnPreference.<className>[]`)

Each class in `columnPreference` can have an array of column configurations:

| Parameter         | Type    | Optional | Default | Example       | Description                                        |
| ------------------|---------|----------|---------|---------------|----------------------------------------------------|
| `name`            | String  | no       | -       | `"createdAt"` | Column/field name.                                 |
| `visible`         | Boolean | yes      | `true`  | `false`       | Whether the column is visible in the data browser. |
| `preventSort`     | Boolean | yes      | `false` | `true`        | Prevent this column from being sortable.           |
| `filterSortToTop` | Boolean | yes      | `false` | `true`        | Sort this column to the top in filter popup.       |

##### Scripts Configuration (`apps[].scripts[]`)

| Parameter                 | Type                                       | Optional | Default | Example         | Description                                       |
| --------------------------|--------------------------------------------|----------|---------|-----------------|---------------------------------------------------|
| `title`                   | String                                     | no       | -       | `"Delete User"` | Title in context menu and confirmation dialog.    |
| `classes`                 | Array&lt;String&gt; \| Array&lt;Object&gt; | no       | -       | `["_User"]`     | Classes for which script can run.                 |
| `cloudCodeFunction`       | String                                     | no       | -       | `"deleteUser"`  | Parse Cloud Function name to execute.             |
| `executionBatchSize`      | Integer                                    | yes      | `1`     | `10`            | Batch size for multiple objects (runs in serial). |
| `showConfirmationDialog`  | Boolean                                    | yes      | `false` | `true`          | Show confirmation dialog before execution.        |
| `confirmationDialogStyle` | String                                     | yes      | `info`  | `critical`      | Dialog style: `info` (blue) or `critical` (red).  |

##### Info Panel Configuration (`apps[].infoPanel[]`)

| Parameter           | Type                | Optional | Default | Example            | Description                                   |
| --------------------|---------------------|----------|---------|--------------------|-----------------------------------------------|
| `title`             | String              | no       | -       | `"User Details"`   | Panel title.                                  |
| `classes`           | Array&lt;String&gt; | no       | -       | `["_User"]`        | Classes for which panel is displayed.         |
| `cloudCodeFunction` | String              | no       | -       | `"getUserDetails"` | Cloud Function receiving selected object.     |
| `prefetchObjects`   | Number              | yes      | `0`     | `2`                | Number of next rows to prefetch.              |
| `prefetchStale`     | Number              | yes      | `0`     | `10`               | Seconds after which prefetched data is stale. |
| `prefetchImage`     | Boolean             | yes      | `true`  | `false`            | Whether to prefetch image content.            |
| `prefetchVideo`     | Boolean             | yes      | `true`  | `false`            | Whether to prefetch video content.            |
| `prefetchAudio`     | Boolean             | yes      | `true`  | `false`            | Whether to prefetch audio content.            |


##### User Configuration (`users[]`)

| Parameter         | Type                | Optional | Default  | CLI              | Env Variable                    | Example              | Description                            |
| ------------------|---------------------|----------|----------|------------------|---------------------------------|----------------------|----------------------------------------|
| `user`            | String              | no       | -        | `--userId`       | `PARSE_DASHBOARD_USER_ID`       | `"admin"`            | Username for authentication.           |
| `pass`            | String              | no       | -        | `--userPassword` | `PARSE_DASHBOARD_USER_PASSWORD` | `"pass"`             | Password (plain or bcrypt hash).       |
| `mfa`             | String              | yes      | -        | -                | -                               | `"JBSWY3DPEHPK3PXP"` | MFA secret for TOTP.                   |
| `mfaAlgorithm`    | String              | yes      | `"SHA1"` | -                | -                               | `"SHA256"`           | TOTP algorithm for MFA.                |
| `mfaDigits`       | Number              | yes      | `6`      | -                | -                               | `8`                  | Number of digits in MFA code.          |
| `mfaPeriod`       | Number              | yes      | `30`     | -                | -                               | `60`                 | MFA code validity period in seconds.   |
| `readOnly`        | Boolean             | yes      | `false`  | -                | -                               | `true`               | Read-only access to all their apps.    |
| `apps`            | Array&lt;Object&gt; | yes      | -        | -                | -                               | `[{...}]`            | Apps user can access (all if omitted). |
| `apps[].appId`    | String              | no       | -        | -                | -                               | `"myAppId"`          | App ID user can access.                |
| `apps[].readOnly` | Boolean             | yes      | `false`  | -                | -                               | `true`               | Read-only access to this specific app. |

#### CLI & Server Options

| Parameter             | Type    | Optional | Default      | CLI                     | Env Variable                             | Example         | Description                                      |
| ----------------------|---------|----------|--------------|-------------------------|------------------------------------------|-----------------| -------------------------------------------------|
| `host`                | String  | yes      | `"0.0.0.0"`  | `--host`                | `HOST`                                   | `"127.0.0.1"`   | Host address to bind server.                     |
| `port`                | Number  | yes      | `4040`       | `--port`                | `PORT`                                   | `8080`          | Port for dashboard server.                       |
| `mountPath`           | String  | yes      | `"/"`        | `--mountPath`           | `MOUNT_PATH`                             | `"/dashboard"`  | Mount path for application.                      |
| `allowInsecureHTTP`   | Boolean | yes      | `false`      | `--allowInsecureHTTP`   | `PARSE_DASHBOARD_ALLOW_INSECURE_HTTP`    | `true`          | Allow HTTP (use behind HTTPS proxy).             |
| `sslKey`              | String  | yes      | -            | `--sslKey`              | `PARSE_DASHBOARD_SSL_KEY`                | `"/path/key"`   | Path to SSL private key for HTTPS.               |
| `sslCert`             | String  | yes      | -            | `--sslCert`             | `PARSE_DASHBOARD_SSL_CERT`               | `"/path/cert"`  | Path to SSL certificate for HTTPS.               |
| `cookieSessionSecret` | String  | yes      | Random       | `--cookieSessionSecret` | `PARSE_DASHBOARD_COOKIE_SESSION_SECRET`  | `"secret"`      | Secret for session cookies (for multi-server).   |
| `cookieSessionMaxAge` | Number  | yes      | Session-only | `--cookieSessionMaxAge` | `PARSE_DASHBOARD_COOKIE_SESSION_MAX_AGE` | `3600`          | Session cookie expiration (seconds).             |
| `dev`                 | Boolean | yes      | `false`      | `--dev`                 | -                                        | -               | Development mode (**DO NOT use in production**). |
| `config`              | String  | yes      | -            | `--config`              | -                                        | `"config.json"` | Path to JSON configuration file.                 |

#### Helper CLI Commands

| Command        | Description                                                         |
| ---------------|---------------------------------------------------------------------|
| `--createUser` | Interactive tool to generate secure user passwords and MFA secrets. |
| `--createMFA`  | Interactive tool to generate MFA secrets for existing users.        |

### File

You can also start the dashboard from the command line with a config file. To do this, create a new file called `parse-dashboard-config.json` inside your local Parse Dashboard directory hierarchy. The file should match the following format:

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
    }
  ]
}
```

You can then start the dashboard using `parse-dashboard --config parse-dashboard-config.json`.

### Environment variables

> This only works when starting the app using the `parse-dashboard` command

There are also two methods you can use to configure the dashboard using environment variables.

#### Multiple apps

Provide the entire JSON configuration in `PARSE_DASHBOARD_CONFIG` and it will be parsed just like the config file.

#### Single app

You can also define each configuration option individually.

```
HOST: "0.0.0.0"
PORT: "4040"
MOUNT_PATH: "/"
PARSE_DASHBOARD_TRUST_PROXY: undefined // Or "1" to trust connection info from a proxy's X-Forwarded-* headers
PARSE_DASHBOARD_SERVER_URL: "http://localhost:1337/parse"
PARSE_DASHBOARD_MASTER_KEY: "myMasterKey"
PARSE_DASHBOARD_APP_ID: "myAppId"
PARSE_DASHBOARD_APP_NAME: "MyApp"
PARSE_DASHBOARD_USER_ID: "user1"
PARSE_DASHBOARD_USER_PASSWORD: "pass"
PARSE_DASHBOARD_SSL_KEY: "sslKey"
PARSE_DASHBOARD_SSL_CERT: "sslCert"
PARSE_DASHBOARD_CONFIG: undefined // Only for reference, it must not exist
PARSE_DASHBOARD_COOKIE_SESSION_SECRET: undefined // set the cookie session secret, defaults to a random string. Use this option if you want sessions to work across multiple servers, or across restarts
PARSE_DASHBOARD_AGENT: undefined // JSON string containing the full agent configuration with models array

```

## Managing Multiple Apps

Managing multiple apps from the same dashboard is also possible. Simply add additional entries into the `parse-dashboard-config.json` file's `"apps"` array:

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse", // Self-hosted Parse Server
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App"
    },
    {
      "serverURL": "http://localhost:1337/parse2", // Self-hosted Parse Server
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App 2"
    }
  ]
}
```

## GraphQL Playground

Parse Dashboard has a built-in GraphQL Playground to play with the auto-generated [Parse GraphQL API](https://github.com/parse-community/parse-server#graphql).

You can setup the GraphQL Playground by passing the `--graphQLServerURL` option to the `parse-dashboard` CLI:

```
parse-dashboard --dev --appId yourAppId --masterKey yourMasterKey --serverURL "https://example.com/parse" --graphQLServerURL "https://example.com/graphql" --appName optionalName
```

The `graphQLServerURL` option is also available through an environment variable called `PARSE_DASHBOARD_GRAPHQL_SERVER_URL`:

```
HOST: "0.0.0.0"
PORT: "4040"
MOUNT_PATH: "/"
PARSE_DASHBOARD_SERVER_URL: "http://localhost:1337/parse"
PARSE_DASHBOARD_GRAPHQL_SERVER_URL: "http://localhost:1337/graphql"
PARSE_DASHBOARD_MASTER_KEY: "myMasterKey"
PARSE_DASHBOARD_APP_ID: "myAppId"
PARSE_DASHBOARD_APP_NAME: "MyApp"
```

You can also setup the GraphQL Playground in your `parse-dashboard-config.json` file:

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "graphQLServerURL": "http://localhost:1337/graphql",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App"
    },
    {
      "serverURL": "http://localhost:1337/parse2",
      "graphQLServerURL": "http://localhost:1337/graphql2",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App 2"
    }
  ]
}
```

After starting the dashboard, you can visit http://0.0.0.0:4040/apps/MyTestApp/api_console/graphql in your browser:

![Parse Dashboard GraphQL Playground](.github/graphql-playground.png)

## App Icon Configuration

Parse Dashboard supports adding an optional icon for each app, so you can identify them easier in the list. To do so, you *must* use the configuration file, define an `iconsFolder` in it, and define the `iconName` parameter for each app (including the extension). The path of the `iconsFolder` is relative to the configuration file. If you have installed ParseDashboard globally you need to use the full path as value for the `iconsFolder`. To visualize what it means, in the following example `icons` is a directory located under the same directory as the configuration file:

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App",
      "iconName": "MyAppIcon.png",
    }
  ],
  "iconsFolder": "icons"
}
```

## App Background Color Configuration

Parse Dashboard supports adding an optional background color for each app, so you can identify them easier in the list. To do so, you *must* use the configuration file, define an `primaryBackgroundColor` and `secondaryBackgroundColor` in it, parameter for each app. It is `CSS style`. To visualize what it means, in the following example `backgroundColor` is a configuration file:

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App",
      "primaryBackgroundColor": "#FFA500", // Orange
      "secondaryBackgroundColor": "#FF4500" // OrangeRed
    },
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App [2]",
      "primaryBackgroundColor": "rgb(255, 0, 0)", // Red
      "secondaryBackgroundColor": "rgb(204, 0, 0)" // DarkRed
    }
  ]
}
```

## Other Configuration Options

You can set `appNameForURL` in the config file for each app to control the url of your app within the dashboard. This can make it easier to use bookmarks or share links on your dashboard.

To change the app to production, simply set `production` to `true` in your config file. The default value is false if not specified.

 ### Prevent columns sorting

You can prevent some columns to be sortable by adding `preventSort` to columnPreference options in each app configuration

```json

"apps": [
  {
    "appId": "local_app_id",
    "columnPreference": {
        "_User": [
          {
            "name": "createdAt",
            "visible": true,
            "preventSort": true
          },
          {
            "name": "updatedAt",
            "visible": true,
            "preventSort": false
          },
        ]
      }
    }
]
```

### Custom order in the filter popup

If you have classes with a lot of columns and you filter them often with the same columns you can sort those to the top by extending the `columnPreference` setting with the `filterSortToTop` option:

```json
"apps": [
  {
    "columnPreference": {
        "_User": [
          {
            "name": "objectId",
            "filterSortToTop": true
          },
          {
            "name": "email",
            "filterSortToTop": true
          }
        ]
      }
    }
]
```

### Persistent Filters

The filters you save in the data browser of Parse Dashboard are only available for the current dashboard user in the current browser session. To make filters permanently available for all dashboard users of an app, you can define filters in the `classPreference` setting.

For example:

```json
"apps": [{
  "classPreference": {
    "_Role": {
      "filters": [{
        "name": "Filter Name",
        "filter": [
          {
            "field": "objectId",
            "constraint": "exists"
          }
        ]
      }]
    }
  }
}]
```

You can conveniently create a filter definition without having to write it by hand by first saving a filter in the data browser, then exporting the filter definition under *App Settings > Export Class Preferences*.

### Scripts

You can specify scripts to execute Cloud Functions with the `scripts` option:

```json
"apps": [
  {
    "scripts": [
      {
        "title": "Delete Account",
        "classes": ["_User"],
        "cloudCodeFunction": "deleteAccount",
        "showConfirmationDialog": true,
        "confirmationDialogStyle": "critical"
      }
    ]
  }
]
```

You can also specify custom fields with the `scrips` option:

```json
"apps": [
  {
    "scripts": [
      {
        "title": "Delete account",
        "classes": [
          {
            "name": "_User",
            "fields": [
              { "name": "createdAt", "validator": "value => value > new Date(\"2025\")" }
            ]
          }
        ],
        "cloudCodeFunction": "deleteAccount"
      }
    ]
  }
]

```

Next, define the Cloud Function in Parse Server that will be called. The object that has been selected in the data browser will be made available as a request parameter:

```js
Parse.Cloud.define('deleteAccount', async (req) => {
  req.params.object.set('deleted', true);
  await req.params.object.save(null, {useMasterKey: true});
}, {
  requireMaster: true
});
```

The field which the script was invoked on can be accessed by `selectedField`:

```js
Parse.Cloud.define('deleteAccount', async (req) => {
  if (req.params.selectedField !== 'objectId') {
    throw new Parse.Error(Parse.Error.SCRIPT_FAILED, 'Deleting accounts is only available on the objectId field.');
  }
  req.params.object.set('deleted', true);
  await req.params.object.save(null, {useMasterKey: true});
}, {
  requireMaster: true
});
```

⚠️ Depending on your Parse Server version you may need to set the Parse Server option `encodeParseObjectInCloudFunction` to `true` so that the selected object in the data browser is made available in the Cloud Function as an instance of `Parse.Object`. If the option is not set, is set to `false`, or you are using an older version of Parse Server, the object is made available as a plain JavaScript object and needs to be converted from a JSON object to a `Parse.Object` instance with `req.params.object = Parse.Object.fromJSON(req.params.object);`, before you can call any `Parse.Object` properties and methods on it.

For older versions of Parse Server:

<details>
<summary>Parse Server &gt;=4.4.0 &lt;6.2.0</summary>

```js
Parse.Cloud.define('deleteAccount', async (req) => {
  req.params.object = Parse.Object.fromJSON(req.params.object);
  req.params.object.set('deleted', true);
  await req.params.object.save(null, {useMasterKey: true});
}, {
  requireMaster: true
});
```

</details>

<details>
<summary>Parse Server &gt;=2.1.4 &lt;4.4.0</summary>

```js
Parse.Cloud.define('deleteAccount', async (req) => {
  if (!req.master || !req.params.object) {
    throw 'Unauthorized';
  }
  req.params.object = Parse.Object.fromJSON(req.params.object);
  req.params.object.set('deleted', true);
  await req.params.object.save(null, {useMasterKey: true});
});
```

</details>

### Resource Cache

Parse Dashboard can cache its resources such as bundles in the browser, so that opening the dashboard in another tab does not reload the dashboard resources from the server but from the local browser cache. Caching only starts after login in the dashboard.

| Parameter             | Type    | Optional | Default | Example | Description                                                                                                    |
|-----------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------|
| `enableResourceCache` | Boolean | yes      | `false` | `true`  | Enables caching of dashboard resources in the browser for faster dashboard loading in additional browser tabs. |


Example configuration:

```javascript
const dashboard = new ParseDashboard({
  enableResourceCache: true,
  apps: [
    {
      serverURL: 'http://localhost:1337/parse',
      appId: 'myAppId',
      masterKey: 'myMasterKey',
      appName: 'MyApp'
    }
  ]
});
```

> [!Warning]
> This feature can make it more difficult to push dashboard updates to users. Enabling the resource cache will start a browser service worker that caches dashboard resources locally only once. As long as the service worker is running, it will prevent loading any dashboard updates from the server, even if the user reloads the browser tab. The service worker is automatically stopped, once the last dashboard browser tab is closed. On the opening of the first dashboard browser tab, a new service worker is started and the dashboard resources are loaded from the server.

> [!Note]
> For developers: during dashboard development, the resource cache should be disabled to ensure reloading the dashboard tab in the browser loads the new dashboard bundle with any changes you made in the source code. You can inspect the service worker in the developer tools of most browsers. For example in Google Chrome, go to *Developer Tools > Application tab > Service workers* to see whether the dashboard service worker is currently running and to debug it.

# Running as Express Middleware

Instead of starting Parse Dashboard with the CLI, you can also run it as an [express](https://github.com/expressjs/express) middleware.

```javascript
var express = require('express');
var ParseDashboard = require('parse-dashboard');

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
    }
  ]
});

var app = express();

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

var httpServer = require('http').createServer(app);
httpServer.listen(4040);
```

If you want to run both [Parse Server](https://github.com/ParsePlatform/parse-server) and Parse Dashboard on the same server/port, you can run them both as express middleware:

```javascript
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

var api = new ParseServer({
	// Parse Server settings
});

var options = { allowInsecureHTTP: false };

var dashboard = new ParseDashboard({
	// Parse Dashboard settings
}, options);

var app = express();

// make the Parse Server available at /parse
app.use('/parse', api);

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

var httpServer = require('http').createServer(app);
httpServer.listen(4040);
```

# Deploying Parse Dashboard

## Preparing for Deployment

Make sure the server URLs for your apps can be accessed by your browser. If you are deploying the dashboard, then `localhost` urls will not work.

## Security Considerations
In order to securely deploy the dashboard without leaking your apps master key, you will need to use HTTPS and Basic Authentication.

The deployed dashboard detects if you are using a secure connection. If you are deploying the dashboard behind a load balancer or front-facing proxy, then the app won't be able to detect that the connection is secure. In this case, you can start the dashboard with the `--trustProxy=1` option (or set the PARSE_DASHBOARD_TRUST_PROXY config var to 1) to rely on the X-Forwarded-* headers for the client's connection security.  This is useful for hosting on services like Heroku, where you can trust the provided proxy headers to correctly determine whether you're using HTTP or HTTPS.  You can also turn on this setting when using the dashboard as [express](https://github.com/expressjs/express) middleware:

```javascript
var trustProxy = true;
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
    }
  ],
  "trustProxy": 1
});
```

### Security Checks

You can view the security status of your Parse Server by enabling the dashboard option `enableSecurityChecks`, and visiting App Settings > Security.

```javascript
const dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
      "enableSecurityChecks": true
    }
  ],
});
```

### Configuring Basic Authentication
You can configure your dashboard for Basic Authentication by adding usernames and passwords your `parse-dashboard-config.json` configuration file:

```json
{
  "apps": [{"...": "..."}],
  "users": [
    {
      "user":"user1",
      "pass":"pass"
    },
    {
      "user":"user2",
      "pass":"pass"
    }
  ],
  "useEncryptedPasswords": true | false
}
```

You can store the password in either `plain text` or `bcrypt` formats. To use the `bcrypt` format, you must set the config `useEncryptedPasswords` parameter to `true`.
You can generate encrypted passwords by using `parse-dashboard --createUser`, and pasting the result in your users config.

### Multi-Factor Authentication (One-Time Password)

You can add an additional layer of security for a user account by requiring multi-factor authentication (MFA) for the user to login.

With MFA enabled, a user must provide a one-time password that is typically bound to a physical device, in addition to their login password. This means in addition to knowing the login password, the user needs to have physical access to a device to generate the one-time password. This one-time password is time-based (TOTP) and only valid for a short amount of time, typically 30 seconds, until it expires.

The user requires an authenticator app to generate the one-time password. These apps are provided by many 3rd parties and mostly for free.

If you create a new user by running `parse-dashboard --createUser`, you will be  asked whether you want to enable MFA for the new user. To enable MFA for an existing user, run `parse-dashboard --createMFA` to generate a `mfa` secret that you then add to the existing user configuration, for example:

```json
{
  "apps": [{"...": "..."}],
  "users": [
    {
      "user":"user1",
      "pass":"pass",
      "mfa": "lmvmOIZGMTQklhOIhveqkumss"
    }
  ]
}
```

 Parse Dashboard follows the industry standard and supports the common OTP algorithm `SHA-1` by default, to be compatible with most authenticator apps. If you have specific security requirements regarding TOTP characteristics (algorithm, digit length, time period) you can customize them by using the guided configuration mentioned above.

### Running Multiple Dashboard Replicas

When deploying Parse Dashboard with multiple replicas behind a load balancer, you need to use a shared session store to ensure that CSRF tokens and user sessions work correctly across all replicas. Without a shared session store, login attempts may fail with "CSRF token validation failed" errors when requests are distributed across different replicas.

#### Using a Custom Session Store

Parse Dashboard supports using any session store compatible with [express-session](https://github.com/expressjs/session). The `sessionStore` option must be configured programmatically when initializing the dashboard.

**Suggested Session Stores:**

- [connect-redis](https://www.npmjs.com/package/connect-redis) - Redis session store
- [connect-mongo](https://www.npmjs.com/package/connect-mongo) - MongoDB session store
- [connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple) - PostgreSQL session store
- [memorystore](https://www.npmjs.com/package/memorystore) - Memory session store with TTL support

**Example using connect-redis:**

```js
const express = require('express');
const ParseDashboard = require('parse-dashboard');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;

// Instantiate Redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect();

// Instantiate Redis session store
const cookieSessionStore = new RedisStore({ client: redisClient });

// Configure dashboard with session store
const dashboard = new ParseDashboard({
  apps: [...],
  users: [...],
}, {
  cookieSessionStore,
  cookieSessionSecret: 'your-secret-key',
});

**Important Notes:**

- The `cookieSessionSecret` option must be set to the same value across all replicas to ensure session cookies work correctly.
- If `cookieSessionStore` is not provided, Parse Dashboard will use the default in-memory session store, which only works for single-instance deployments.
- For production deployments with multiple replicas, always configure a shared session store.

#### Alternative: Using Sticky Sessions

If you cannot use a shared session store, you can configure your load balancer to use sticky sessions (session affinity), which ensures that requests from the same user are always routed to the same replica. However, using a shared session store is the recommended approach as it provides better reliability and scalability.

### Separating App Access Based on User Identity
If you have configured your dashboard to manage multiple applications, you can restrict the management of apps based on user identity.

To do so, update your `parse-dashboard-config.json` configuration file to match the following format:

```json
{
  "apps": [{"...": "..."}],
  "users": [
     {
       "user":"user1",
       "pass":"pass1",
       "apps": [{"appId": "myAppId1"}, {"appId": "myAppId2"}]
     },
     {
       "user":"user2",
       "pass":"pass2",
       "apps": [{"appId": "myAppId1"}]
     }  ]
}
```
The effect of such a configuration is as follows:

When `user1` logs in, he/she will be able to manage `myAppId1` and `myAppId2` from the dashboard.

When *`user2`*  logs in, he/she will only be able to manage *`myAppId1`* from the dashboard.

## Use Read-Only masterKey

Starting parse-server 2.6.5, it is possible to provide a `readOnlyMasterKey` to parse-server to prevent mutations on objects from a client.
If you want to protect your dashboard with this feature, just use the `readOnlyMasterKey` instead of the `masterKey`. All write calls will fail.

### Making an app read-only for all users

Start your `parse-server` with

```json
{
"masterKey": "YOUR_MASTER_KEY_HERE",
"readOnlyMasterKey": "YOUR_READ_ONLY_MASTER_KEY",
}
```

Then in your dashboard configuration:

```javascript
var trustProxy = true;
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "YOUR_READ_ONLY_MASTER_KEY",
      "appName": "MyApp"
    }
  ],
  "trustProxy": 1
});
```

### Makings users read-only

Make sure you specify the `readOnlyMasterKey` for the apps that you want to use read-only feature in "apps" configuration.
You can mark a user as a read-only user:

```json
{
  "apps": [
    {
      "appId": "myAppId1",
      "masterKey": "myMasterKey1",
      "readOnlyMasterKey": "myReadOnlyMasterKey1",
      "serverURL": "myURL1",
      "port": 4040,
      "production": true
    },
    {
      "appId": "myAppId2",
      "masterKey": "myMasterKey2",
      "readOnlyMasterKey": "myReadOnlyMasterKey2",
      "serverURL": "myURL2",
      "port": 4041,
      "production": true
    }
  ],
  "users": [
    {
      "user":"user1",
      "pass":"pass1",
      "readOnly": true,
      "apps": [{"appId": "myAppId1"}, {"appId": "myAppId2"}]
    },
    {
      "user":"user2",
      "pass":"pass2",
      "apps": [{"appId": "myAppId1"}]
    }
  ]
}
```

This way `user1` will have a readOnly access to `myAppId1` and `myAppId2`

### Making user's apps readOnly

Make sure you specify the `readOnlyMasterKey` for the apps that you want to use read-only feature in "apps" configuration.
You can give read only access to a user on a per-app basis:

```json
{
  "apps": [
    {
      "appId": "myAppId1",
      "masterKey": "myMasterKey1",
      "readOnlyMasterKey": "myReadOnlyMasterKey1",
      "serverURL": "myURL",
      "port": 4040,
      "production": true
    },
    {"...": "..."}
  ],
  "users": [
    {
      "user":"user",
      "pass":"pass",
      "apps": [{"appId": "myAppId", "readOnly": true}, {"appId": "myAppId2"}]
    }
  ]
}
```

With this configuration, user1 will have read only access to `myAppId1` and read/write access to `myAppId2`.

## Configuring Localized Push Notifications

With the latest version of the [dashboard](https://www.npmjs.com/package/parse-dashboard), it is possible to send localized messages for push notifications.
You can provide a list of locales or languages you want to support for your dashboard users.

```json
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App",
      "iconName": "MyAppIcon.png",
      "supportedPushLocales": ["en", "ru", "fr"]
    }
  ],
  "iconsFolder": "icons"
}
```

## Run with Docker

The official docker image is published on [docker hub](https://hub.docker.com/r/parseplatform/parse-dashboard)

Run the image with your ``config.json`` mounted as a volume

```
docker run -d -p 8080:4040 -v host/path/to/config.json:/src/Parse-Dashboard/parse-dashboard-config.json parseplatform/parse-dashboard --dev
```

You can also pass the appId, masterKey and serverURL as arguments:

```
docker run -d -p 4040:4040 parseplatform/parse-dashboard --dev --appId $APP_ID --masterKey $MASTER_KEY --serverURL $SERVER_URL
```

By default, the container will start the app at port 4040 inside the container. However, you can run custom command as well (see ``Deploying in production`` for custom setup).

In this example, we want to run the application in production mode at port 80 of the host machine.

```
docker run -d -p 80:8080 -v host/path/to/config.json:/src/Parse-Dashboard/parse-dashboard-config.json parse-dashboard --port 8080 --dev
```

If you are not familiar with Docker, ``--port 8080`` will be passed in as argument to the entrypoint to form the full command ``npm start -- --port 8080``. The application will start at port 8080 inside the container and port ``8080`` will be mounted to port ``80`` on your host machine.

# Features
*(The following is not a complete list of features but a work in progress to build a comprehensive feature list.)*

## Data Browser

### Filters

▶️ *Core > Browser > Filter*

The filter dialog allows to add relational filter conditions based on other classes that have a pointer to the current class.

For example, users in the `_User` class may have:

- purchases in a `Purchase` class with a `_User` pointer field
- transactions in a `Payment` class with a `_User` pointer field

A relational filter allows you filter all users who:

- purchased a specific item (in `Purchase` class)
- payed with a specific payment method (in `Payment` class)

To apply such a filter, simply go to the `_User` class and add the two required filter conditions with the `Purchase` and `Payment` classes.

### Info Panel

▶️ *Core > Browser > Show Panel / Hide Panel*

The data browser offers an info panel that can display information related to the currently selected object in the data browser table. The info panel is made visible by clicking on the menu button *Show Panel* in the top right corner when browsing a class for which the info panel is configured in the dashboard options.

The following example dashboard configuration shows an info panel for the `_User` class with the title `User Details`, by calling the Cloud Code Function `getUserDetails` and displaying the returned response.

```json
"apps": [
  {
    "infoPanel": [
      {
        "title": "User Details",
        "classes": ["_User"],
        "cloudCodeFunction": "getUserDetails",
        "prefetchObjects": 2,
        "prefetchStale": 10,
        "prefetchImage": true,
        "prefetchVideo": true,
        "prefetchAudio": true
      }
    ]
  }
]
```

The Cloud Code Function receives the selected object in the payload and returns a response that can include various items.

#### Response

##### Segments

The info panel can contain multiple segments to display different groups of information.

| Parameter                | Value  | Optional | Description                                                                                                                            |
|--------------------------|--------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| `segments`               | Array  | No       | An ordered array of segments, where each segment represents a distinct group of items to display.                                      |
| `segments[i].title`      | String | No       | The title of the segment that will be displayed.                                                                                       |
| `segments[i].items`      | Array  | No       | An ordered array of items within the segment. Each item can be of different types, such as text, key-value pairs, tables, images, etc. |
| `segments[i].style`      | Object | Yes      | The CSS style definition for the segment.                                                                                              |
| `segments[i].titleStyle` | Object | Yes      | The CSS style definition for the segment title.                                                                                        |

Example:

```json
{
  "panel": {
    "segments": [
      {
        "title": "Purchases",
        "style": { "backgroundColor": "lightgray", "font-size": "10px" },
        "titleStyle": { "backgroundColor": "orange", "color": "white" },
        "items": [
          {
            "type": "text",
            "text": "This user has a high churn risk!"
          }
        ]
      }
    ]
  }
}
```

The items array can include various types of content such as text, key-value pairs, tables, images, videos, audios, and buttons. Each type offers a different way to display information within the info panel, allowing for a customizable and rich user experience. Below is a detailed explanation of each type.

##### Text Item

A simple text field.

| Parameter | Value  | Optional | Description               |
|-----------|--------|----------|---------------------------|
| `type`    | String | No       | Must be `"text"`.         |
| `text`    | String | No       | The text to display.      |
| `style`   | Object | Yes      | The CSS style definition. |

Example:

```json
{
  "type": "text",
  "text": "This user has a high churn risk!",
  "style": { "backgroundColor": "red" },
}
```

##### Key-Value Item

A text item that consists of a key and a value. The value can optionally be linked to a URL.

| Parameter       | Value   | Default     | Optional | Description                                                                                                                                                                                             |
|-----------------|---------|-------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`          | String  | -           | No       | Must be `"keyValue"`.                                                                                                                                                                                   |
| `key`           | String  | -           | No       | The key text to display.                                                                                                                                                                                |
| `value`         | String  | -           | No       | The value text to display.                                                                                                                                                                              |
| `url`           | String  | `undefined` | Yes      | The URL that will be opened in a new browser tab when clicking on the value text. It can be set to an absolute URL or a relative URL in which case the base URL is `<PROTOCOL>://<HOST>/<MOUNT_PATH>/`. |
| `isRelativeUrl` | Boolean | `false`     | Yes      | Set this to `true` when linking to another dashboard page, in which case the base URL for the relative URL will be `<PROTOCOL>://<HOST>/<MOUNT_PATH>/apps/<APP_NAME>/`.                                 |
| `values`        | Array   | -           | Yes      | Additional values to display after `value`. Each item is an object with `value`, optional `url` and `isRelativeUrl`.                                                                                    |
| `style`         | Object  | -           | Yes      | The CSS style definition.                                                                                                                                                                               |

Examples:

```json
{
  "type": "keyValue",
  "key": "Lifetime purchase value",
  "value": "$10k",
  "style": { "backgroundColor": "green" },
}
```

```json
{
  "type": "keyValue",
  "key": "Last purchase ID",
  "value": "123",
  "url": "https://example.com/purchaseDetails?purchaseId=123"
}
```

```json
{
  "type": "keyValue",
  "key": "Purchase",
  "value": "123",
  "url": "browser/Purchase",
  "isRelativeUrl": true
}
```

```json
{
  "type": "keyValue",
  "key": "Purchase Value",
  "value": "123",
  "url": "browser/Purchase",
  "isRelativeUrl": true,
  "values": [{ "value": "456" }]
}
```

To navigate to a specific object using a relative URL, the query parameters must be URL encoded:

```js
const objectId = 'abc123';
const className = 'Purchase';
const query = [{ field: 'objectId', constraint: 'eq', compareTo: objectId }];
const url = `browser/Purchase?filters=${JSON.stringify(query)}`;
const item = {
  type: 'keyValue',
  key: 'Purchase',
  value: objectId,
  url,
  isRelativeUrl: true
}
```

##### Table Item

A table with columns and rows to display data in a structured format.

| Parameter         | Value  | Optional | Description                                                                      |
|-------------------|--------|----------|----------------------------------------------------------------------------------|
| `type`            | String | No       | Must be `"table"`.                                                               |
| `columns`         | Array  | No       | The column definitions, including names and types.                               |
| `columns[*].name` | String | No       | The name of the column to display.                                               |
| `columns[*].type` | String | No       | The type of the column value (e.g., `"string"`, `"number"`).                     |
| `rows`            | Array  | No       | The rows of data, where each row is an object containing values for each column. |
| `style`           | Object | Yes      | The CSS style definition.                                                        |

Example:

```json
{
  "type": "table",
  "columns": [
    {
      "name": "Name",
      "type": "string"
    },
    {
      "name": "Age",
      "type": "number"
    }
  ],
  "rows": [
    {
      "Name": "Alice",
      "Age": 30
    },
    {
      "Name": "Bob",
      "Age": 40
    }
  ],
  "style": { "backgroundColor": "lightGray" }
}
```

##### Image Item

An image to be displayed in the panel.

| Parameter | Value  | Optional | Description                      |
|-----------|--------|----------|----------------------------------|
| `type`    | String | No       | Must be `"image"`.               |
| `url`     | String | No       | The URL of the image to display. |
| `style`   | Object | Yes      | The CSS style definition.        |

Example:

```json
{
  "type": "image",
  "url": "https://example.com/images?purchaseId=012345",
  "style": { "backgroundColor": "white" }
}
```

##### Video Item

A video to be displayed in the panel.

| Parameter | Value  | Optional | Description                      |
|-----------|--------|----------|----------------------------------|
| `type`    | String | No       | Must be `"video"`.               |
| `url`     | String | No       | The URL of the video to display. |
| `style`   | Object | Yes      | The CSS style definition.        |

Example:

```json
{
  "type": "video",
  "url": "https://example.com/video.mp4",
  "style": { "backgroundColor": "white" }
}
```

##### Audio Item

An audio file to be played in the panel.

| Parameter | Value  | Optional | Description                   |
|-----------|--------|----------|-------------------------------|
| `type`    | String | No       | Must be `"audio"`.            |
| `url`     | String | No       | The URL of the audio to play. |
| `style`   | Object | Yes      | The CSS style definition.     |

Example:

```json
{
  "type": "audio",
  "url": "https://example.com/audio.mp3",
  "style": { "backgroundColor": "white" }
}
```

##### Button Item

A button that triggers an action when clicked.

| Parameter        | Value  | Optional | Description                                             |
|------------------|--------|----------|---------------------------------------------------------|
| `type`           | String | No       | Must be `"button"`.                                     |
| `text`           | String | No       | The text to display on the button.                      |
| `action`         | Object | No       | The action to be performed when the button is clicked.  |
| `action.url`     | String | No       | The URL to which the request should be sent.            |
| `action.method`  | String | No       | The HTTP method to use for the action (e.g., `"POST"`). |
| `action.headers` | Object | Yes      | Optional headers to include in the request.             |
| `action.body`    | Object | Yes      | The body of the request in JSON format.                 |
| `style`          | Object | Yes      | The CSS style definition.                               |

Example:

```json
{
  "type": "button",
  "text": "Click me!",
  "action": {
    "url": "https://api.example.com/click",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "key": "value"
    }
  },
  "style": { "backgroundColor": "pink", "color": "white" }
}
```

##### Panel Item

A sub-panel whose data is loaded on-demand by expanding the item.

| Parameter           | Value  | Optional | Description                                                                                                                                       |
|---------------------|--------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`              | String | No       | Must be `"infoPanel"`.                                                                                                                            |
| `title`             | String | No       | The title to display in the expandable headline.                                                                                                  |
| `cloudCodeFunction` | String | No       | The Cloud Code Function to call which receives the selected object in the data browser and returns the response to be displayed in the sub-panel. |
| `style`             | Object | Yes      | The CSS style definition.                                                                                                                         |

Example:

```json
{
  "type": "panel",
  "title": "Purchase History",
  "cloudCodeFunction": "getUserPurchaseHistory",
  "style": { "backgroundColor": "lightGray" },
}
```

#### Prefetching

To reduce the time for info panel data to appear, data can be prefetched.

| Parameter                      | Type    | Optional | Default | Example | Description                                                                                                                       |
|--------------------------------|---------|----------|---------|---------|-----------------------------------------------------------------------------------------------------------------------------------|
| `infoPanel[*].prefetchObjects` | Number  | yes      | `0`     | `2`     | Number of next rows to prefetch when browsing sequential rows. For example, `2` means the next 2 rows will be fetched in advance. |
| `infoPanel[*].prefetchStale`   | Number  | yes      | `0`     | `10`    | Duration in seconds after which prefetched data is discarded as stale.                                                            |
| `infoPanel[*].prefetchImage`   | Boolean | yes      | `true`  | `false` | Whether to prefetch image content when prefetching objects. Only applies when `prefetchObjects` is enabled.                       |
| `infoPanel[*].prefetchVideo`   | Boolean | yes      | `true`  | `false` | Whether to prefetch video content when prefetching objects. Only applies when `prefetchObjects` is enabled.                       |
| `infoPanel[*].prefetchAudio`   | Boolean | yes      | `true`  | `false` | Whether to prefetch audio content when prefetching objects. Only applies when `prefetchObjects` is enabled.                       |

Prefetching is particularly useful when navigating through lists of objects. To optimize performance and avoid unnecessary data loading, prefetching is triggered only after the user has moved through 3 consecutive rows using the keyboard down-arrow key or by mouse click.

When `prefetchObjects` is enabled, media content (images, videos, and audio) in the info panel can also be prefetched to improve loading performance. By default, all media types are prefetched, but you can selectively disable prefetching for specific media types using the `prefetchImage`, `prefetchVideo`, and `prefetchAudio` options.

### Freeze Columns

▶️ *Core > Browser > Freeze column*

Right-click on a table column header to freeze columns from the left up to the clicked column in the data browser. When scrolling horizontally, the frozen columns remain visible while the other columns scroll underneath.

### Browse as User

▶️ *Core > Browser > Browse*

This feature allows you to use the data browser as another user, respecting that user's data permissions. For example, you will only see records and fields the user has permission to see.

> ⚠️ Logging in as another user will trigger the same Cloud Triggers as if the user logged in themselves using any other login method. Logging in as another user requires to enter that user's password.

### Change Pointer Key

▶️ *Core > Browser > Edit > Change pointer key*

This feature allows you to change how a pointer is represented in the browser. By default, a pointer is represented by the `objectId` of the linked object. You can change this to any other column of the object class. For example, if class `Installation` has a field that contains a pointer to class `User`, the pointer will show the `objectId` of the user by default. You can change this to display the field `email` of the user, so that a pointer displays the user's email address instead.

#### Limitations

- This does not work for an array of pointers; the pointer will always display the `objectId`.
- System columns like `createdAt`, `updatedAt`, `ACL` cannot be set as pointer key.
- This feature uses browser storage; switching to a different browser resets the pointer key to `objectId`.

> ⚠️ For each custom pointer key in each row, a server request is triggered to resolve the custom pointer key. For example, if the browser shows a class with 50 rows and each row contains 3 custom pointer keys, a total of 150 separate server requests are triggered.

### CSV Export

▶️ *Core > Browser > Export*

This feature will take either selected rows or all rows of an individual class and saves them to a CSV file, which is then downloaded. CSV headers are added to the top of the file matching the column names.

> ⚠️ There is currently a 10,000 row limit when exporting all data. If more than 10,000 rows are present in the class, the CSV file will only contain 10,000 rows.

## AI Agent

The Parse Dashboard includes an AI agent that can help manage your Parse Server data through natural language commands. The agent can perform operations like creating classes, adding data, querying records, and more.

> [!Caution]
> The AI agent has full access to your database using the master key. It can read, modify, and delete any data. This feature is highly recommended for development environments only. Always back up important data before using the AI agent.

### Configuration

To configure the AI agent for your dashboard, you need to add the `agent` configuration to your Parse Dashboard config:

```json
{
  "apps": [
    // ...
  ],
  "agent": {
    "models": [
      {
        "name": "ChatGPT 4.1",
        "provider": "openai",
        "model": "gpt-4.1",
        "apiKey": "YOUR_OPENAI_API_KEY"
      },
    ]
  }
}
```

| Parameter                  | Type   | Required | Description                                                                                                                         |
|----------------------------|--------|----------|-------------------------------------------------------------------------------------------------------------------------------------|
| `agent`                    | Object | Yes      | The AI agent configuration object.  When using the environment variable, provide the complete agent configuration as a JSON string. |
| `agent.models`             | Array  | Yes      | Array of AI model configurations available to the agent.                                                                            |
| `agent.models[*].name`     | String | Yes      | The display name for the model (e.g., `ChatGPT 4.1`).                                                                               |
| `agent.models[*].provider` | String | Yes      | The AI provider identifier (e.g., "openai").                                                                                        |
| `agent.models[*].model`    | String | Yes      | The specific model name from the provider (e.g., `gpt-4.1`).                                                                        |
| `agent.models[*].apiKey`   | String | Yes      | The API key for authenticating with the AI provider.                                                                                |

The agent will use the configured models to process natural language commands and perform database operations using the master key from your app configuration.

### Providers

> [!Note]
> Currently, only OpenAI models are supported. Support for additional providers may be added in future releases.

#### OpenAI

To get an OpenAI API key for use with the AI agent:

1. **Create an OpenAI account**: Visit [platform.openai.com](https://platform.openai.com) and sign up for an account if you don't already have one.

2. **Access the API section**: Once logged in, navigate to the API section of your OpenAI dashboard.

3. **Create a new project**: 
   - Go to the "Projects" section
   - Click "Create project"
   - Name your project "Parse-Dashboard" (or any descriptive name)
   - Complete the project setup

4. **Configure model access**:
   - In your project, navigate to "Limits > Model Usage"
   - Select the AI models you want to use (e.g., `gpt-4`, `gpt-3.5-turbo`)
   - These model names will be used as the `agent.models[*].model` parameter in your dashboard configuration

5. **Generate an API key**: 
   - Go to the "API Keys" page in your project settings
   - Click "Create new secret key"
   - Give your key a descriptive name (e.g., "Parse Dashboard Agent")
   - Copy the generated API key immediately (you won't be able to see it again)

6. **Set up billing**: Make sure you have a valid payment method added to your OpenAI account, as API usage incurs charges.

7. **Configure the dashboard**: Add the API key to your Parse Dashboard configuration as shown in the example above.

> [!Important]
> Keep your API key secure and never commit it to version control. Consider using environment variables or secure configuration management for production deployments.

## Views

▶️ *Core > Views*

Views are saved queries that display data in a table format. Saved views appear in the sidebar, where you can select, edit, or delete them. Optionally you can enable the object counter to show in the sidebar how many items match the view.

> [!Caution]
> Values are generally rendered without sanitization in the resulting data table. If rendered values come from user input or untrusted data, make sure to remove potentially dangerous HTML or JavaScript, to prevent an attacker from injecting malicious code, to exploit vulnerabilities like Cross-Site Scripting (XSS).

### Data Sources

Views can pull their data from the following data sources.

#### Aggregation Pipeline
  
Display aggregated data from your classes using a MongoDB aggregation pipeline. Create a view by selecting a class and defining an aggregation pipeline.

#### Cloud Function
  
Display data returned by a Parse Cloud Function. Create a view specifying a Cloud Function that returns an array of objects. Cloud Functions enable custom business logic, computed fields, and complex data transformations.

Cloud Function views can prompt users for text input and/or file upload when opened. Enable "Require text input" or "Require file upload" checkboxes when creating the view. The user provided data will then be available in the Cloud Function as parameters.

Cloud Function example:

```js
Parse.Cloud.define("myViewFunction", request => {
  const text = request.params.text;
  const fileData = request.params.fileData;
  return processDataWithTextAndFile(text, fileData);
});
```

> [!Note]
> Text and file data are ephemeral and only available to the Cloud Function during that request. Files are base64 encoded, increasing the data during transfer by ~33%.

### View Table

When designing the aggregation pipeline, consider that some values are rendered specially in the output table.

#### Pointer

Parse Object pointers are automatically displayed as links to the target object.

Example:

```json
{ "__type": "Pointer", "className": "_User", "objectId": "xWMyZ4YEGZ" }
```

#### Link

Links are rendered as hyperlinks that open in a new browser tab.

Example:

```json
{
  "__type": "Link",
  "url": "https://example.com",
  "text": "Link"
}
```

Set `isRelativeUrl: true` when linking to another dashboard page, in which case the base URL for the relative URL will be `<PROTOCOL>://<HOST>/<MOUNT_PATH>/apps/<APP_NAME>/`. The key `isRelativeUrl` is optional and `false` by default.

Example:

```json
{
  "__type": "Link",
  "url": "browser/_Installation",
  "isRelativeUrl": true,
  "text": "Link"
}
```

A query part of the URL can be easily added using the `urlQuery` key which will automatically escape the query string.

Example:

```json
{
  "__type": "Link",
  "url": "browser/_Installation",
  "urlQuery": "filters=[{\"field\":\"objectId\",\"constraint\":\"eq\",\"compareTo\":\"xWMyZ4YEGZ\",\"class\":\"_Installation\"}]",
  "isRelativeUrl": true,
  "text": "Link"
}
```

In the example above, the query string will be escaped and added to the url, resulting in the complete URL:

```js
"browser/_Installation?filters=%5B%7B%22field%22%3A%22objectId%22%2C%22constraint%22%3A%22eq%22%2C%22compareTo%22%3A%22xWMyZ4YEGZ%22%2C%22class%22%3A%22_Installation%22%7D%5D"
```

> [!Tip]
> For guidance on how to create the URL query for a dashboard data browser filter, open the data browser and set the filter. Then copy the browser URL and unescape it. The query constraints in `?filters=[...]` will give you an idea of the constraint syntax.

> [!Note]
> For security reasons, the link `<a>` tag contains the `rel="noreferrer"` attribute, which prevents the target website to know the referring website which in this case is the Parse Dashboard URL. That attribute is widely supported across modern browsers, but if in doubt check your browser's compatibility.

#### Image

Images are rendered directly in the output table with an `<img>` tag. The content mode is always "scale to fit", meaning that if the image file is 100x50px and the specified dimensions are 50x50px, it would display as 50x25px, since it's scaled maintaining aspect ratio.

Example:

```json
{
  "__type": "Image",
  "url": "https://example.com/image.png",
  "width": "50",
  "height": "50",
  "alt": "Image"
}
```

> [!Warning]
> The URL will be directly invoked by the browser when trying to display the image. For security reasons, make sure you either control the full URL, including the image file name, or sanitize the URL before returning it to the dashboard. URLs containing `javascript:` or `<script` will be blocked automatically and replaced with a placeholder.

# Contributing

We really want Parse to be yours, to see it grow and thrive in the open source community. Please see the [Contributing to Parse Dashboard guide](CONTRIBUTING.md).

-----

As of April 5, 2017, Parse, LLC has transferred this code to the parse-community organization, and will no longer be contributing to or distributing this code.

[license-svg]: https://img.shields.io/badge/license-BSD-lightgrey.svg
[license-link]: LICENSE
[open-collective-link]: https://opencollective.com/parse-server
