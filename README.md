# Parse Dashboard

A dashboard for managing your Parse apps.

## Getting Started

[Node.js](nodejs.org) is required to run the dashboard. Once you have Node you can install the dashboard by cloning this repo and running `npm install`.

```
git clone git@github.com:ParsePlatform/parse-dashboard.git
cd parse-dashboard
npm install
```

Next add your app info into parse-dashboard/Parse-Dashboard/parse-dashboard-config.json. The file should match the following format:

```
{
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
    },
  ]
}
```

You can also manage your apps that are hosted on Parse.com from the same dashboard. For these apps, you must specify your javascript key and set your server url to https://api.parse.com/1.

```
{
  "apps": [
    {
      "serverURL": "https://api.parse.com/1",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "javascriptKey": "myJavascriptKey",
      "appName": "My App"
    },
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "My Parse.Com App"
    }
  ]
}
```

Then execute `npm run dashboard` and visit http://localhost:4040 and you will be able to manage your parse apps.

## Other options

You can also set `appNameForURL` for each app to control the url of your app within the dashboard.
