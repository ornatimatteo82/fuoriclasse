// Script per aggiornare il pacchetto 01-code.zip con version.json e nuovi timestamp
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const versionFile = path.join(rootDir, 'version.json');

// 1. Aggiorna build in version.json
const now = new Date();
const buildTime = now.getTime();
const versionData = {
  version: '34.0.0',
  build: buildTime,
  updatedAt: now.toISOString(),
  description: 'Fuoriclasse Multi-Sport + Auto-Refresh on Deploy'
};

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + '\n', 'utf8');
console.log(`✓ version.json aggiornato con build: ${buildTime}`);

// 2. Crea/Aggiorna deploy-packages/01-code.zip
const targetZip = path.join(rootDir, 'deploy-packages', '01-code.zip');
const filesToZip = [
  'index.html',
  'app.js',
  'style.css',
  'mobile.css',
  'dark-theme.css',
  'sw.js',
  'manifest.webmanifest',
  'icon.svg',
  'mascot.svg',
  '.htaccess',
  'version.json'
];

try {
  fs.unlinkSync(targetZip);
} catch (_) {}

execSync(`zip -q -9 "${targetZip}" ${filesToZip.join(' ')}`, { cwd: rootDir });
const stats = fs.statSync(targetZip);
console.log(`✓ ${targetZip} creato con successo (${(stats.size / 1024).toFixed(1)} KB)`);

// 3. Aggiorna anche i pacchetti dati 2015-2026 minificati
const dataPackages = [
  { zip: '02-data-calcio.zip', files: ['data/curriculum.json', 'data/curriculum.schema.json'] },
  { zip: '03-data-f1.zip', files: ['data/curriculum-f1.json'] },
  { zip: '04-data-basket.zip', files: ['data/curriculum-basket.json'] },
  { zip: '05-assets.zip', files: ['assets/*.jpg', 'assets/*.svg'] }
];

for (const pkg of dataPackages) {
  const pkgPath = path.join(rootDir, 'deploy-packages', pkg.zip);
  try { fs.unlinkSync(pkgPath); } catch (_) {}
  execSync(`zip -q -9 "${pkgPath}" ${pkg.files.join(' ')}`, { cwd: rootDir });
  const st = fs.statSync(pkgPath);
  console.log(`✓ ${pkg.zip} aggiornato (${(st.size / 1024).toFixed(1)} KB)`);
}
