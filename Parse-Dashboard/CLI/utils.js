import { spawn } from 'node:child_process';

export function copy(text) {
  const proc = spawn('pbcopy');
  proc.stdin.write(text);
  proc.stdin.end();
}
