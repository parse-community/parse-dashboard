module.exports = {
  copy(text) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(text);
    proc.stdin.end();
  }
}
