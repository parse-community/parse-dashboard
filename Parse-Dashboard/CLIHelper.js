const crypto = require('crypto');
const inquirer = require('inquirer');
const { getAlgorithm, generateSecret, showQR, copy } = require('./CLI/mfa');

module.exports = {
  async createUser() {
    const result = {};
    const displayResult = {};
    const { username, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Please enter the username:'
      },
      {
        type: 'confirm',
        name: 'password',
        message: 'Would you like to generate a secure password?'
      }
    ]);
    displayResult.username = username;
    result.user = username;
    if (!password) {
      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: `Please enter the password for ${username}:`
        }
      ]);
      displayResult.password = password;
      result.pass = password;
    } else {
      const password = crypto.randomBytes(20).toString('base64');
      result.pass = password;
      displayResult.password = password;
    }
    const { mfa, encrypt } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'encrypt',
        message: `Would you like to use encrypted passwords?`
      },
      {
        type: 'confirm',
        name: 'mfa',
        message: `Would you like to enforce multi-factor authentication for ${username}?`
      }
    ]);
    if (encrypt) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      result.pass = bcrypt.hashSync(result.pass, salt);
    }
    if (mfa) {
      const { app } = await inquirer.prompt([
        {
          type: 'input',
          name: 'app',
          message: "What is your app's name?"
        }
      ]);
      const { algorithm } = await getAlgorithm();
      const { secret, url } = generateSecret({ app, username, algorithm });
      result.mfa = secret;
      displayResult.mfa = url;
      if (algorithm !== 'SHA256') {
        result.mfaAlgorithm = algorithm;
      }
      showQR(displayResult.mfa);
      console.log(`Ask ${username} to install an Authenticator app and scan this QR code on their device, or open this URL:

${url}

After you've shared the QR code ${username}, it is recommended to delete any photos or records of it.`);
    }
    copy(JSON.stringify(displayResult));
    console.log(`
Your new user details' raw credentials have been copied to your clipboard. Add the following to your Parse Dashboard config:

${JSON.stringify(result)}

`);
    if (encrypt) {
      console.log(
        `Be sure to set "useEncryptedPasswords": true in your config\n\n`
      );
    }
  },
  async createMFA() {
    const { username, app } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message:
          'Please enter the name of the user you would like to create a multi-factor authentication secret for:'
      },
      {
        type: 'input',
        name: 'app',
        message: "What is your app's name?"
      }
    ]);
    const { algorithm } = await getAlgorithm();

    const { url, secret } = generateSecret({ app, username, algorithm });
    showQR(url);
    console.log(`Ask ${username} to install an Authenticator app and scan this QR code on their device, or open this URL:

${url}

After you've shared the QR code ${username}, it is recommended to delete any photos or records of it.

Please add this to your dashboard config for ${username}.

"mfa":"${secret}"${
      algorithm !== 'SHA256' ? `,\n"mfaAlgorithm":"${algorithm}"` : ''
    }

`);
  }
};
