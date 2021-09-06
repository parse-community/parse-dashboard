const crypto = require('crypto');
const inquirer = require('inquirer');
const OTPAuth = require('otpauth');
const { copy } = require('./utils.js');
const getAlgorithm = async () => {
  let { algorithm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'algorithm',
      message: 'What hashing algorithm would you like to use?',
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
        message: 'Please enter the hashing algorithm you would like to use:'
      }
    ]);
    algorithm = result.algorithm;
  }
  const { digits, period } = await inquirer.prompt([
    {
      type: 'number',
      name: 'digits',
      default: 6,
      message: 'How many digits should the OTP contain?'
    },
    {
      type: 'number',
      name: 'period',
      default: 30,
      message: 'How many seconds should the OTP last for?'
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
    console.log(url);
  });
};

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
        message: 'Would you like to use encrypted passwords?'
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
      const { algorithm, digits, period } = await getAlgorithm();
      const { secret, url } = generateSecret({ app, username, algorithm, digits, period });
      result.mfa = secret;
      displayResult.mfa = url;
      if (algorithm !== 'SHA1') {
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
        'Be sure to set "useEncryptedPasswords": true in your config\n\n'
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
    const { algorithm, digits, period } = await getAlgorithm();

    const { url, secret } = generateSecret({ app, username, algorithm, digits, period });
    showQR(url);
    console.log(`Ask ${username} to install an Authenticator app and scan this QR code on their device, or open this URL:

${url}

After you've shared the QR code ${username}, it is recommended to delete any photos or records of it.

Please add this to your dashboard config for ${username}.

"mfa":"${secret}"${
      algorithm !== 'SHA1' ? `,\n"mfaAlgorithm":"${algorithm}"` : ''
    }

`);
  }
};
