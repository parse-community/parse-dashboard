const inquirer = require('inquirer');
const OTPAuth = require('otpauth');
module.exports = {
  async getAlgorithm() {
    let { algorithm } = await inquirer.prompt([
      {
        type: 'list',
        name: 'algorithm',
        message: 'What hashing algorithm would you like to use?',
        default: 'SHA256',
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
          message: "Please enter the hashing algorithm you would like to use:"
        }
      ]);
      algorithm = result.algorithm;
    }
    return { algorithm }
  },
  generateSecret({app, username, algorithm}) {
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: app,
      label: username,
      algorithm,
      digits: 6,
      period: 30,
      secret
    });
    const url = totp.toString();
    return { secret: secret.base32, url }
  },
  showQR(text) {
    const QRCode = require('qrcode')
    QRCode.toString(text, {type:'terminal'}, (err, url) => {
      console.log(url)
    })
  },
  copy(text) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(text);
    proc.stdin.end();
  }
};
