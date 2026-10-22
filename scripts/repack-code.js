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
