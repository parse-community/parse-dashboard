# Parse Dashboard

Parse Dashboard is standalone dashboard for managing your Parse apps. You can use it to manage your [Parse Server](https://github.com/ParsePlatform/parse-server) apps and your apps that are running on [Parse.com](https://Parse.com).

## Getting Started

[Node.js](https://nodejs.org) is required to run the dashboard. Once you have Node you can install the dashboard by cloning this repo and running `npm install`.

```
git clone git@github.com:ParsePlatform/parse-dashboard.git
cd parse-dashboard
npm install
```

Next add your app info into `parse-dashboard/Parse-Dashboard/parse-dashboard-config.json`. The file should match the following format, using the server URL, App ID, and Master Key from your Parse Server. The App Name can be anything you want, and is used to reference your app in the dashboard.

```
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

Ensure your Parse Server version is `>= 2.1.4`. The dashboard will not work with Parse Server instances with lower versions.

You can also manage your apps that are hosted on Parse.com from the same dashboard. For these apps, you must specify your rest key and javascript key, and set your server url to https://api.parse.com/1.

```
{
  "apps": [
    {
      "serverURL": "https://api.parse.com/1",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "javascriptKey": "myJavascriptKey",
      "restKey": "myRestKey",
      "appName": "My Parse.Com App"
    },
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse Server App"
    }
  ]
}
```

Then execute `npm run dashboard` and visit http://localhost:4040 and you will be able to manage your parse apps.

## Other options

You can set `appNameForURL` for each app to control the url of your app within the dashboard.

If you want to require a username and password to access the dashboard, you can do so by adding usernames and passwords for HTTP Basic Auth to your configuration file:

```
{
  "apps": [...],
  "users": [
    {
      "user":"user1",
      "pass":"pass"
    },
    {
      "user":"user2",
      "pass":"pass"
    }
  ]
}
```

HTTPS and Basic Auth are mandatory if you are accessing the dashboard remotely instead of accessing it from `localhost`.
