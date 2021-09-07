const crypto = require('crypto');
const inquirer = require('inquirer');
const OTPAuth = require('otpauth');
const { copy } = require('./utils.js');
const phrases = {
  enterPassword: 'Enter a password:',
  enterUsername: 'Enter a username:',
  enterAppName: 'Enter the app name:',

}
const getAlgorithm = async () => {
  let { algorithm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'algorithm',
      message: 'Which hashing algorithm do you want to use?',
      default: 'SHA1',
      choices: [
        'SHA1',
        'SHA224',
        'SHA256',
        'SHA384',
        'SHA512',
        'SHA3-224',
        'SHA3-256',
        'SHA3-384',
        'SHA3-512',
        'Other'
      ]
    }
  ]);
  if (algorithm === 'Other') {
    const result = await inquirer.prompt([
      {
        type: 'input',
        name: 'algorithm',
        message: 'Enter the hashing algorithm you want to use:'
      }
    ]);
    algorithm = result.algorithm;
  }
  const { digits, period } = await inquirer.prompt([
    {
      type: 'number',
      name: 'digits',
      default: 6,
      message: 'Enter the number of digits the one-time password should have:'
    },
    {
      type: 'number',
      name: 'period',
      default: 30,
      message: 'Enter how long the one-time password should be valid (in seconds):'
    }
  ])
  return { algorithm, digits, period};
};
const generateSecret = ({ app, username, algorithm, digits, period }) => {
  const secret = new OTPAuth.Secret();
  const totp = new OTPAuth.TOTP({
    issuer: app,
    label: username,
    algorithm,
    digits,
    period,
    secret
  });
  const url = totp.toString();
  return { secret: secret.base32, url };
};
const showQR = text => {
  const QRCode = require('qrcode');
  QRCode.toString(text, { type: 'terminal' }, (err, url) => {
    console.log(
      '\n------------------------------------------------------------------------------' +
      `\n\n${url}`
    );
  });
};

const showInstructions = ({ app, username, mfaUrl, encrypt, config }) => {
  let orderCounter = 0;
  const getOrder = () => {
    orderCounter++;
    return orderCounter;
  }
  console.log(
    '------------------------------------------------------------------------------' +
    '\n\nFollow these steps to complete the set-up:'
  );

  copy(JSON.stringify(config));
  console.log(
    `\n${getOrder()}. Add the following settings for user "${username}" ${app ? `in app "${app}" ` : '' }to the Parse Dashboard configuration.` +
    '\n   The settings have been copied to your clipboard.' + 
    `\n\n   ${JSON.stringify(config)}`
  );

  if (mfaUrl) {
    console.log(
      `\n${getOrder()}. Ask the user to install an authenticator app and scan the QR code above, or open this link:` + 
      `\n\n   ${mfaUrl}` + 
      `\n\n${getOrder()}. After you have shared these details, make sure to destroy any records of it.`
    );
  }
  
  if (encrypt) {
    console.log(
      `\n${getOrder()}. Make sure that "useEncryptedPasswords" is set to "true" in your dashboard configuration.` +
      '\n   You chose to generate an encrypted password for this user.' +
      '\n   If there are existing users with non-encrypted passwords, you need to create new passwords for them.'
      );
  }
  console.log(
    '\n------------------------------------------------------------------------------\n'
  );
}

module.exports = {
  async createUser() {
    const result = {};
    const displayResult = {};
    const { username, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: phrases.enterUsername
      },
      {
        type: 'confirm',
        name: 'password',
        message: 'Do you want to auto-generate a password?'
      }
    ]);
    displayResult.username = username;
    result.user = username;
    if (!password) {
      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: phrases.enterPassword
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
        message: 'Should the password be encrypted? (strongly recommended, otherwise it is stored in clear-text)'
      },
      {
        type: 'confirm',
        name: 'mfa',
        message: 'Do you want to enable multi-factor authentication?'
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
          message: phrases.enterAppName
        }
      ]);
      const { algorithm, digits, period } = await getAlgorithm();
      const { secret, url } = generateSecret({ app, username, algorithm, digits, period });
      result.mfa = secret;
      result.app = app;
      displayResult.mfa = url;
      if (algorithm !== 'SHA1') {
        result.mfaAlgorithm = algorithm;
      }
      showQR(displayResult.mfa);
    }
    showInstructions({ app: result.app, username, mfaUrl: displayResult.mfa, encrypt, config: displayResult });
  },
  async createMFA() {
    const { username, app } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message:
          'Enter the username for which you want to enable multi-factor authentication:'
      },
      {
        type: 'input',
        name: 'app',
        message: phrases.enterAppName
      }
    ]);
    const { algorithm, digits, period } = await getAlgorithm();

    const { url, secret } = generateSecret({ app, username, algorithm, digits, period });
    showQR(url);
    
    // Compose config
    const config = { mfa: secret };
    if (algorithm !== 'SHA1') {
      config.mfaAlgorithm = algorithm;
    }
    showInstructions({ app, username, url, config: config });
  }
};
