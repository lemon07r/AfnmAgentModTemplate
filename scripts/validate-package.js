const { execFileSync } = require('child_process');
const path = require('path');
const packageJson = require('../package.json');

const root = path.resolve(__dirname, '..');
const zipPath = path.join(root, 'builds', `${packageJson.name}.zip`);
const entries = execFileSync('unzip', ['-Z1', zipPath], {
  encoding: 'utf8',
})
  .trim()
  .split('\n');
const packageEntry = entries.find((entry) => entry.endsWith('package.json'));
const modEntry = entries.find((entry) => entry.endsWith('mod.js'));
if (!packageEntry || !modEntry) throw new Error('ZIP missing package.json/mod.js');
const manifest = JSON.parse(
  execFileSync('unzip', ['-p', zipPath, packageEntry], { encoding: 'utf8' }),
);
const bundle = execFileSync('unzip', ['-p', zipPath, modEntry], {
  encoding: 'utf8',
});
if (
  manifest.version !== packageJson.version ||
  manifest.gameVersion !== '0.7.6'
) {
  throw new Error('Generated metadata does not target AFNM 0.7.6');
}
if (bundle.includes('node_modules/afnm-types') || bundle.includes('GAME_VERSION')) {
  throw new Error('Starter bundle includes runtime afnm-types JavaScript');
}
console.log(`Validated ${path.relative(root, zipPath)} (${entries.length} files)`);
