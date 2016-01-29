import { unescape } from 'lib/StringEscaping';

let currentToken = null;

export function getToken() {
  if (!currentToken) {
    let tokenScript = document.getElementById('csrf');
    if (tokenScript) {
      currentToken = JSON.parse(unescape(tokenScript.innerHTML));
    }
  }
  return currentToken;
}
