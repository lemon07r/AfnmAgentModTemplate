const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'afnm-template-smoke-'));
const copyRoot = path.join(tempRoot, 'sample-mod');
const excluded = new Set([
  '.git',
  'node_modules',
  'dist',
  'builds',
  'tmp',
]);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: copyRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`,
    );
  }
}

try {
  fs.cpSync(root, copyRoot, {
    recursive: true,
    filter: (source) => !excluded.has(path.basename(source)),
  });
  run('node', [
    'scripts/setup.js',
    '--name',
    'afnm-smoke-mod',
    '--author',
    'Smoke Test',
    '--description',
    'Generated scaffold smoke test',
    '--skip-install',
    '--skip-uploader',
    '--skip-verify',
  ]);
  run('bun', ['install', '--frozen-lockfile']);
  run('bun', ['run', 'typecheck']);
  run('bun', ['run', 'build']);
  run('bun', ['run', 'package:validate']);
  console.log('Generated-project smoke test passed');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
