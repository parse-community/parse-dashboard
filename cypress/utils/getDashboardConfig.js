export function getDashboardConfig(apps) {
    return {
      newFeaturesInLatestVersion: [],
      apps: apps.map(app => ({
        serverURL: app.serverURL || "http://localhost:1337/parse",
        appId: app.appId || "hello",
        masterKey: app.masterKey || "world",
        appName: app.appName,
        iconName: app.iconName || "",
        primaryBackgroundColor: app.primaryBackgroundColor || "",
        secondaryBackgroundColor: app.secondaryBackgroundColor || "",
      })),
    };
  }