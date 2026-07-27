const path = require('path');
const packageJson = require('../package.json');
const { readAfnmGameVersion } = require('./mod-package');
const { readZipFiles } = require('./read-zip');

const root = path.resolve(__dirname, '..');
const zipPath = path.join(root, 'builds', `${packageJson.name}.zip`);

async function main() {
  const { entries, files } = await readZipFiles(zipPath, [
    'package.json',
    'mod.js',
  ]);
  const packageEntry = entries.find((entry) => entry.endsWith('package.json'));
  const modEntry = entries.find((entry) => entry.endsWith('mod.js'));
  if (!packageEntry || !modEntry) {
    throw new Error('ZIP missing package.json/mod.js');
  }

  const manifest = JSON.parse(files.get(packageEntry));
  const bundle = files.get(modEntry);
  const expectedGameVersion = readAfnmGameVersion();
  if (
    manifest.version !== packageJson.version ||
    manifest.gameVersion !== expectedGameVersion
  ) {
    throw new Error(
      `Generated metadata mismatch: expected ${packageJson.version} / AFNM ${expectedGameVersion}, received ${manifest.version} / AFNM ${manifest.gameVersion}`,
    );
  }
  if (
    bundle.includes('node_modules/afnm-types') ||
    bundle.includes('GAME_VERSION')
  ) {
    throw new Error('Starter bundle includes runtime afnm-types JavaScript');
  }
  console.log(
    `Validated ${path.relative(root, zipPath)} (${entries.length} files)`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
