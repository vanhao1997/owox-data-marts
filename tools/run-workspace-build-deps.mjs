import { spawnSync } from 'node:child_process';

// Turbo already builds dependency tasks in graph order. Nested dependency
// builds race with that graph, so only run them for direct workspace builds.
if (process.env.TURBO_HASH) {
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'build:dep'], {
  stdio: 'inherit',
  // Windows exposes npm as a .cmd shim, which requires shell execution.
  shell: process.platform === 'win32',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
