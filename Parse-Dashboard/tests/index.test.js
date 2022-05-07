const path = require('path');
const spawn = require('child_process').spawn;

const TIMEOUT = 1000; // ms

describe('port, config, appId, serverURL, masterKey, appName, graphQLServerURL options should not be ignored.', () => {
  it('Should start with port 4041.', async () => {
    const result = await startParseDashboardAndGetOutput(['--port', '4041']);

    expect(result).toContain('The dashboard is now available at http://0.0.0.0:4041/');
  });

  it('Should return an error message if config and appId options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--appId', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and serverURL options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--serverURL', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and masterKey options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--masterKey', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and appName options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--appName', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and graphQLServerURL options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--graphQLServerURL', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });
});

function startParseDashboardAndGetOutput(args) {
  return new Promise((resolve) => {
    const indexFilePath = path.resolve('./Parse-Dashboard/index.js');
    const child = spawn('node', [indexFilePath, ...args], { cwd: '.', timeout: TIMEOUT });
    setTimeout(() => { child.kill(); }, TIMEOUT); // node.js 12 hack (spawn timeout option is not supported.)

    let output = '';
    child.on('error', () => { resolve(output); });
    child.on('close', () => { resolve(output); });

    if (child.stdout) {
      child.stdout.on('data', data => {
        output += `STDOUT: ${data}\n`;
      });
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        output += `STDERROR: ${data}\n`;
      });
    }
  });
}
