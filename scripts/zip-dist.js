const { zip } = require('zip-a-folder');
const path = require('path');
const fs = require('fs');
const { packageJson, buildDistPackageJson } = require('./mod-package');

function copyTranslations(distPath) {
  const translationsDir = path.resolve(__dirname, '../translations');
  if (!fs.existsSync(translationsDir)) return;

  const distTranslationsDir = path.resolve(distPath, 'translations');
  const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) return;

  fs.mkdirSync(distTranslationsDir, { recursive: true });
  for (const file of files) {
    fs.copyFileSync(
      path.resolve(translationsDir, file),
      path.resolve(distTranslationsDir, file),
    );
  }
  console.log(`Copied ${files.length} translation file(s) to dist`);
}

async function zipDist() {
  const distPath = path.resolve(__dirname, `../dist/${packageJson.name}`);
  const buildsDir = path.resolve(__dirname, '../builds');
  const zipPath = path.resolve(buildsDir, `${packageJson.name}.zip`);
  const distPackageJsonPath = path.resolve(distPath, 'package.json');

  try {
    if (!fs.existsSync(buildsDir)) {
      fs.mkdirSync(buildsDir, { recursive: true });
    }

    fs.writeFileSync(
      distPackageJsonPath,
      `${JSON.stringify(buildDistPackageJson(), null, 2)}\n`,
      'utf8',
    );
    console.log('Wrote dist package.json with afnm-types gameVersion');

    copyTranslations(distPath);

    await zip(distPath, zipPath);
    console.log(`Successfully zipped ${packageJson.name} to ${zipPath}`);
  } catch (error) {
    console.error('Error zipping dist folder:', error);
    process.exitCode = 1;
  }
}

zipDist();
