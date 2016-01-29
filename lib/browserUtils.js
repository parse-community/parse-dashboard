
export function isSafari() {
  return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
}

export function isChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}
