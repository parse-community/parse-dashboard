/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp           from 'lib/ParseApp';
import { post, del } from 'lib/AJAX';

let appsStore = [];

const AppsManager = {
  addApp(raw) {
    appsStore.push(new ParseApp(raw));
  },

  apps() {
    appsStore.sort(function(app1, app2) {
      return app1.name.localeCompare(app2.name);
    });
    return appsStore;
  },

  findAppBySlugOrName(slugOrName) {
    let apps = this.apps();
    for (let i = apps.length; i--;) {
      if (apps[i].slug === slugOrName || apps[i].name === slugOrName) {
        return apps[i];
      }
    }
    return null;
  },

  create(name, connectionURL) {
    let payload = {
      parse_app: { name }
    };
    if (connectionURL) {
      payload.parse_app.connectionString = connectionURL;
    }
    return post('/apps', payload).then((response) => {
      let newApp = new ParseApp(response.app);
      appsStore.push(newApp);
      return newApp;
    });
  },

  deleteApp(slug, password) {
    return del('/apps/' + slug + '?password_confirm_delete=' + password).then(() => {
      for (let i = 0; i < appsStore.length; i++) {
        if (appsStore[i].slug == slug) {
          appsStore.splice(i, 1);
          return;
        }
      }
    });
  },

  // Fetch the latest usage and request info for the apps index
  getAllAppsIndexStats() {
    return Promise.all(this.apps().map(app => {
      if (app.serverInfo.error) {
        return;
      }
      return Promise.all(
        [
          app.getClassCount('_Installation').then(count => app.installations = count),
          app.getClassCount('_User').then(count => app.users = count)
        ]
      );
    }));
  },

  // Options should be a list containing a subset of
  // ["schema", "app_settings", "config", "cloud_code", "background_jobs"]
  // indicating which parts of the app to clone.
  cloneApp(slug, name, options) {
    //Clone nothing by default
    let optionsForRuby = {
      cloud_code: false,
      background_jobs: false,
      config: false,
      schema: false,
      app_settings: false,
      data: false,
    };
    options.forEach((option) => {
      if (option !== 'data') { //Data cloning not supported yet, but api_server still requires the key to be present
        optionsForRuby[option] = true;
      }
    });
    let path = '/apps/' + slug + '/clone_app';
    let request = post(path, {
      app_name: name,
      options: optionsForRuby,
    });
    request.then(({ app }) => {
      if (!appsStore) {
        AppsManager.seed();
      }
      appsStore.push(new ParseApp(app));
    });
    return request;
  },

  transferApp(slug, newOwner, password) {
    let payload = {
      new_owner_email: newOwner,
    }
    if (password) {
      // Users who log in with oauth don't have a password,
      // and don't require one to transfer their app.
      payload.password_confirm_transfer = password;
    }

    let promise = post('/apps/' + slug + '/transfer', payload);
    promise.then(() => {
      //TODO modify appsStore to reflect transfer
    });
    return promise;
  }
}

export default AppsManager;
