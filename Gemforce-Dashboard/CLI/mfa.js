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
  const config = { mfa: secret.base32 };
  config.app = app;
  config.url = url;
  if (algorithm !== 'SHA1') {
    config.mfaAlgorithm = algorithm;
  }
  if (digits != 6) {
    config.mfaDigits = digits;
  }
  if (period != 30) {
    config.mfaPeriod = period;
  }
  return { config };
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

const showInstructions = ({ app, username, passwordCopied, encrypt, config }) => {
  const {secret, url} = config;
  const mfaJSON = {...config};
  delete mfaJSON.url;
  let orderCounter = 0;
  const getOrder = () => {
    orderCounter++;
    return orderCounter;
  }
  console.log(
    '------------------------------------------------------------------------------' +
    '\n\nFollow these steps to complete the set-up:'
  );

  console.log(
    `\n${getOrder()}. Add the following settings for user "${username}" ${app ? `in app "${app}" ` : '' }to the Parse Dashboard configuration.` +
    `\n\n   ${JSON.stringify(mfaJSON)}`
  );

  if (passwordCopied) {
    console.log(
      `\n${getOrder()}. Securely store the generated login password that has been copied to your clipboard.`
    );
  }

  if (secret) {
    console.log(
      `\n${getOrder()}. Open the authenticator app to scan the QR code above or enter this secret code:` +
      `\n\n   ${secret}` +
      '\n\n   If the secret code generates incorrect one-time passwords, try this alternative:' +
      `\n\n   ${url}` +
      `\n\n${getOrder()}. Destroy any records of the QR code and the secret code to secure the account.`
    );
  }

  if (encrypt) {
    console.log(
      `\n${getOrder()}. Make sure that "useEncryptedPasswords" is set to "true" in your dashboard configuration.` +
      '\n   You chose to generate an encrypted password for this user.' +
      '\n   Any existing users with non-encrypted passwords will require newly created, encrypted passwords.'
      );
  }
  console.log(
    '\n------------------------------------------------------------------------------\n'
  );
}

module.exports = {
  async createUser() {
    const data = {};

    console.log('');
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
    data.user = username;
    if (!password) {
      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: phrases.enterPassword
        }
      ]);
      data.pass = password;
    } else {
      const password = crypto.randomBytes(20).toString('base64');
      data.pass = password;
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
      // Copy the raw password to clipboard
      copy(data.pass);

      // Encrypt password
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      data.pass = bcrypt.hashSync(data.pass, salt);
    }
    const config = {};
    if (mfa) {
      const { app } = await inquirer.prompt([
        {
          type: 'input',
          name: 'app',
          message: phrases.enterAppName
        }
      ]);
      const { algorithm, digits, period } = await getAlgorithm();
      const secret  =generateSecret({ app, username, algorithm, digits, period });
      Object.assign(config, secret.config);
      showQR(secret.config.url);
    }
    config.user = data.user;
    config.pass = data.pass ;
    showInstructions({ app: data.app, username, passwordCopied: true, encrypt, config });
  },
  async createMFA() {
    console.log('');
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

    const { config } = generateSecret({ app, username, algorithm, digits, period });
    showQR(config.url);
    // Compose config
    showInstructions({ app, username, config });
  }
};
