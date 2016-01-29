import Parse from 'parse';

export default function getFileName(name) {
  if (name instanceof Parse.File) {
    return getFileName(name.name());
  }
  let offset = 37;
  if (name.indexOf('tfss-') === 0) {
    offset += 5;
  }
  return name.substr(offset);
}
