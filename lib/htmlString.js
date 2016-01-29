import { escape } from 'lib/StringEscaping';

export default function htmlString(pieces, ...vars) {
  let result = pieces[0];
  for (let i = 0; i < vars.length; i++) {
    result += escape(vars[i]) + pieces[i + 1];
  }
  return result;
}
