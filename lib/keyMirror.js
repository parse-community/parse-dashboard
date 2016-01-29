/**
 * Takes an array of keys, and turns it into an object mapping keys to
 * themselves
 */
export default function keyMirror(keys) {
  let map = {};
  for (let i = 0; i < keys.length; i++) {
    map[keys[i]] = keys[i];
  }
  return map;
}
