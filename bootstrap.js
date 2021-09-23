#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Color constants
const GREEN='\x1b[0;32m'
const RESET='\x1b[0m'
const BOLD='\x1b[1m'
const CHECK=`${GREEN}✓${RESET}`

console.log('\
\n\
             `.-://////:-..`            \n\
         `:/oooooooooooooooo+:.`        \n\
      `:+oooooooooooooooooooooo+/`      \n\
     :+ooooooooooooooooooooooooooo/.    \n\
   .+oooooooooooooo/:.....-:+ooooooo-   \n\
  .+ooooooooooooo/` .:///:-` -+oooooo:  \n\
 `+ooooooooooooo: `/ooooooo+- `ooooooo- \n\
 :oooooooooooooo  :ooooooooo+` /oooooo+ \n\
 +ooooooooooooo/  +ooooooooo+  /ooooooo.\n\
 oooooooooooooo+  ooooooooo`  .oooooooo.\n\
 +ooooooooooo+/: `ooooooo`  .:ooooooooo.\n\
 :ooooooo+.`````````````  /+oooooooooo+ \n\
 `+oooooo- `ooo+ /oooooooooooooooooooo- \n\
  .+ooooo/  :/:` -ooooooooooooooooooo:  \n\
   .+ooooo+:-..-/ooooooooooooooooooo-   \n\
     :+ooooooooooooooooooooooooooo/.    \n\
      `:+oooooooooooooooooooooo+/`      \n\
         `:/oooooooooooooooo+:.`        \n\
             `.-://////:-..`            \n\
\n\
            parse-dashboard\
\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
rl.pause();

const waitForLine = function() {
  rl.resume();
  return new Promise((resolve) => {
    rl.on('line', function (cmd) {
      rl.pause();
      rl.removeAllListeners();
      resolve(cmd);
    });
  });
}

const optionsFromArgs = function() {
  let args = process.argv.slice(2, process.argv.length);
  const validOptions = ['appName', 'appId', 'masterKey', 'serverURL', 'config'];
  const options = {};
  while(args.length) {
    let val = args.shift();
    if (val.indexOf('--') == 0) {
      let key = val.slice(2, val.length);
      if (validOptions.indexOf(key) < 0) {
        return Promise.reject('Unknown option: '+key);
      }
      let value = args.shift();
      options[key] = value;
    }
  }
  return Promise.resolve(options);
}

const getInstallationDirectory = function() {
  console.log('Enter an installation directory');
  process.stdout.write(`(${process.cwd()}) : `);
  return waitForLine().then((res) => {
    if (!res) {
      return process.cwd();
    }
    return res;
  });
}

const getKey = function(keyName, result) {
  process.stdout.write(keyName + ': ');
  return waitForLine().then((res) => {
    result[keyName] = res;
    return result;
  });
}

const getManualConfiguration = function(config = {}) {
  let promise = Promise.resolve();
  ['appName', 'appId', 'masterKey', 'serverURL'].forEach((key) => {
    if (!config[key]) {
      promise = promise.then(() => getKey(key, config));
    }
  });
  return promise.then(() => config);
}

const getEnvironmentConfiguration = function() {
  const appId = process.env.PARSE_SERVER_APPLICATION_ID;
  const masterKey = process.env.PARSE_SERVER_MASTER_KEY;
  const serverURL = process.env.PARSE_SERVER_URL;
  return {
    appId,
    masterKey,
    serverURL
  }
}

const getConfiguration = function(withPrint = true) {
  return optionsFromArgs().then((config) => {
    if (config.config) {
      return readParseServerConfig(config.config);
    }
    if (withPrint) {
      process.stdout.write('Configure the dashboard from: \n');
      process.stdout.write('1. parse-server\'s config\n');
      process.stdout.write('2. environment variables\n');
      process.stdout.write('3. manually\n');
      process.stdout.write('Make a selection: ');
    }
    return waitForLine().then((res) => {
      switch (res) {
        case '1': return getParseServerConfig();
        case '2': return getEnvironmentConfiguration();
        case '3': return getManualConfiguration();
        default: 
          console.error('Invalid choice (valid choice is 1, 2 or 3)\n');
          return getConfiguration(false);
      }
    })
      .then((config) => {
        if (!config.appId || !config.masterKey || !config.serverURL) {
          console.error('Some options are missing');
          return getManualConfiguration(config);
        }
        return config;
      })
      .catch(() => getConfiguration())
  })
}

const readParseServerConfig =  function(file) {
  try {
    let { appId,
      masterKey,
      serverURL,
      publicServerURL,
      mountPath, 
      port,
      appName } = require(path.resolve(process.cwd(), file));
    if (publicServerURL) {
      serverURL = publicServerURL;
    } else if (!serverURL) {
      const defaultPort = 1337;
      const defaultMountPath = 'parse';
      if (!mountPath) {
        mountPath = defaultMountPath;
      }
      if (!port) {
        port = defaultPort;
      }
      serverURL = `http://localhost:${port}/${mountPath}`;
    }
    return { appId, masterKey, serverURL, appName };
  } catch(e) {
    console.error(e);
    console.error('Unable to load ', file);
    throw e;
  }
}

const getParseServerConfig = function() {
  process.stdout.write('Enter the path to parse-server\'s config file: ');
  return waitForLine()
    .then(readParseServerConfig);
}

const installParseDashboard = function(directory) {
  execSync(`mkdir -p ${directory}`); // Make the target directory
  console.log(`${CHECK} Created ${BOLD}${directory}${RESET}`);
  const defaultPackage = {
    "private": true,
    "scripts": {
      "start": "parse-dashboard --config config.json"
    },
    "dependencies": {
      "parse-dashboard": "^1.0.0"
    },
    "repository": "",
    "licence": ""
  }
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify(defaultPackage, null, 2));
  console.log(`${CHECK} Written ${BOLD}package.json${RESET}`);
  execSync(`npm i`, {cwd: directory, stdio: 'inherit'});
  console.log(`${CHECK} Installed ${BOLD}parse-dashboard${RESET}`);
  return directory;
}

const writeConfiguration = function(directory, configuration) {
  const config = {
    apps: [configuration],
  }
  fs.writeFileSync(path.join(directory, 'config.json'), JSON.stringify(config, null, 2));
  console.log(`${CHECK} Written ${BOLD}config.json${RESET}`);
}

let installationDirectory;

const setInstallationDirectory = function(dir) {
  installationDirectory = dir;
  return dir;
};

Promise.resolve()
  .then(getInstallationDirectory)
  .then(setInstallationDirectory)
  .then(installParseDashboard)
  .then(getConfiguration)
  .then((config) => writeConfiguration(installationDirectory, config))
  .then(() => {
    console.log(`${CHECK} Installation successful!`);
    console.log(`run: '${BOLD}npm start${RESET}' to start the dashboard`);
  })
  .catch((err) => {
    console.error('ERR: There was an issue', err);
  });