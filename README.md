# Parse Dashboard

An open source dashboard for managing your Parse apps.

To run it:

```
git clone git@github.com:ParsePlatform/parse-dashboard.git
cd parse-dashboard
npm install
npm run-script dashboard
```

 Next add your app into parse-dashboard/Parse-Dashboard/parse-dashboard-config.json. Drew can help you make this easier, or if you want to do it yourself, the format is this:

 ```
 {
   "apps": [
     {
       "api_key": "from https://dashboard.parse.com/apps/_/settings/keys under File key",
       "created_at": "2016-02-01T19:50:55Z",
       "javascript_key": "from https://dashboard.parse.com/apps/_/settings/keys under JavaScript key",
       "name": "LocalManage",
       "push_key": "from https://dashboard.parse.com/apps/_/settings/keys under Master key",
       "rest_api_key": "from https://dashboard.parse.com/apps/_/settings/keys under REST API key",
       "send_email_address": "no-reply@parseapps.com",
       "verify_emails": false,
       "webhook_key": "from https://dashboard.parse.com/apps/_/settings/keys under Webhook key",
       "windows_key": "from https://dashboard.parse.com/apps/_/settings/keys under .NET key",
       "key": "from https://dashboard.parse.com/apps/_/settings/keys under Application ID",
       "secret": "from https://dashboard.parse.com/apps/_/settings/keys under Client key",
       "friendly_id": "the name of your app that shows up in the URL",
       "is_production?": false,
       "server_url": "http://parse.local:3000/1 (for localhost development within hungry), https://api.parse.com/1 (the default, for your parse hosted apps), or the URL you run your parse-server on."
     }
   ]
 }
```

 Then visit http://localhost:4040 and you will be able to manage your parse apps.
