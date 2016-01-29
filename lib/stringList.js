/**
 * stringList combines an array of strings into a human-friendly list:
 * Input: ['apples'], Output: 'apples'
 * Input: ['apples', 'bananas'], Output: 'apples and bananas'
 * Input: ['apples', 'bananas', 'coconuts'], Output: 'apples, bananas, and coconuts'
 *
 * TODO: i18n
 *
 * @param  {Array} strings  - List of strings
 * @return {String} human  - friendly list
 */
export default function stringList(strings, endDelineator = 'and') {
  let progress = [];
  strings.forEach((s, i) => {
    if (i > 0) {
      if (i === strings.length - 1) {
        if (progress.length > 1) {
          progress.push(',');
        }
        progress.push(` ${endDelineator} `);
      } else {
        progress.push(', ');
      }
    }
    progress.push(s);
  });
  return progress.join('');
};
