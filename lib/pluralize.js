export default function pluralize(count, word, plural) {
  if (count === 1) {
    return String(count) + ' ' + word;
  }
  return String(count) + ' ' + (plural || word + 's');
}
