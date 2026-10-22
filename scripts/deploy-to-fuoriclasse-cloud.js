// Script di deploy automatico su Aruba per https://www.fuoriclasse.cloud/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_HASH = 'f1_Lw'; // Root di fuoriclasse.cloud

function runAppleScript(script) {
  const tmpScript = path.join('/tmp', `run_as_${Date.now()}.applescript`);
  fs.writeFileSync(tmpScript, script, 'utf8');
  try {
    const res = execSync(`osascript "${tmpScript}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return res.trim();
  } finally {
    try { fs.unlinkSync(tmpScript); } catch (_) {}
  }
}

function runChromeJs(jsCode) {
  const escapedJs = jsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const as = `
tell application "Google Chrome"
    set foundTab to missing value
    repeat with aWindow in every window
        repeat with aTab in every tab of aWindow
            if URL of aTab contains "fm.aruba.it" then
                set foundTab to aTab
                exit repeat
            end if
        end repeat
        if foundTab is not missing value then exit repeat
    end repeat
    
    if foundTab is missing value then
        error "Tab Aruba File Manager non trovato in Chrome!"
    end if
    
    tell foundTab
        execute javascript "${escapedJs}"
    end tell
end tell
`;
  return runAppleScript(as);
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function uploadAndExtractZip(zipPath, zipFilename) {
  console.log(`\n📦 Preparazione upload di ${zipFilename} (${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB)...`);
  const zipBuffer = fs.readFileSync(zipPath);
  const base64 = zipBuffer.toString('base64');
  const chunkSize = 250000;
  const numChunks = Math.ceil(base64.length / chunkSize);

  runChromeJs('window.__b64 = ""; window.__deployStatus = null;');

  process.stdout.write(`- Trasferimento dati (${numChunks} chunk): `);
  for (let i = 0; i < numChunks; i++) {
    const chunk = base64.slice(i * chunkSize, (i + 1) * chunkSize);
    runChromeJs(`window.__b64 += "${chunk}";`);
    process.stdout.write('■');
  }
  console.log(' OK');

  console.log('- Esecuzione upload in elFinder...');
  const uploadJs = `
(async () => {
  try {
    const b64 = window.__b64;
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/zip' });
    const fd = new FormData();
    fd.append('cmd', 'upload');
    fd.append('target', '${ROOT_HASH}');
    fd.append('upload[]', blob, '${zipFilename}');

    const upRes = await fetch('php/connector.minimal.php', { method: 'POST', body: fd });
    const upJson = await upRes.json();
    if (upJson.error) {
      window.__deployStatus = { error: 'Upload failed: ' + JSON.stringify(upJson.error) };
      return;
    }

    const added = upJson.added || [];
    const zipFile = added.find(f => f.name === '${zipFilename}') || added[0];
    if (!zipFile || !zipFile.hash) {
      window.__deployStatus = { error: 'Zip file hash non trovato dopo upload' };
      return;
    }

    // Estrazione file
    const extRes = await fetch('php/connector.minimal.php?cmd=extract&target=' + encodeURIComponent(zipFile.hash));
    const extJson = await extRes.json();
    if (extJson.error) {
      window.__deployStatus = { error: 'Extract failed: ' + JSON.stringify(extJson.error) };
      return;
    }

    // Eliminazione file zip
    await fetch('php/connector.minimal.php?cmd=rm&targets%5B%5D=' + encodeURIComponent(zipFile.hash));

    window.__deployStatus = {
      success: true,
      extractedCount: (extJson.added || []).length,
      sample: (extJson.added || []).slice(0, 5).map(f => f.name)
    };
  } catch (e) {
    window.__deployStatus = { error: e.message };
  }
})();
`;

  runChromeJs(uploadJs);

  console.log('- Attesa completamento upload ed estrazione...');
  let attempts = 0;
  while (attempts < 60) {
    sleep(1000);
    const statusStr = runChromeJs('JSON.stringify(window.__deployStatus)');
    if (statusStr && statusStr !== 'null' && statusStr !== '""') {
      try {
        const status = JSON.parse(statusStr);
        if (status.error) {
          throw new Error(status.error);
        }
        if (status.success) {
          console.log(`✓ ${zipFilename} estratto con successo! File: ${status.extractedCount}`);
          return status;
        }
      } catch (err) {
        if (err.message.includes('failed') || err.message.includes('non trovato')) {
          throw err;
        }
      }
    }
    attempts++;
  }
  throw new Error(`Timeout attesa completamento per ${zipFilename}`);
}

async function removeDefaultIndexPhp() {
  console.log('🗑️ Rimozione eventuale index.php segnaposto Aruba dalla root...');
  const rmJs = `
(async () => {
  try {
    const listRes = await fetch('php/connector.minimal.php?cmd=open&target=${ROOT_HASH}');
    const listJson = await listRes.json();
    const files = listJson.files || [];
    const indexPhp = files.find(f => f.name === 'index.php' || f.name === 'index.htm');
    if (indexPhp && indexPhp.hash) {
      await fetch('php/connector.minimal.php?cmd=rm&targets%5B%5D=' + encodeURIComponent(indexPhp.hash));
      window.__rmStatus = { success: true, removed: indexPhp.name };
    } else {
      window.__rmStatus = { success: true, skipped: true };
    }
  } catch (e) {
    window.__rmStatus = { error: e.message };
  }
})();
`;
  runChromeJs(rmJs);
  sleep(1500);
  console.log('✓ index.php segnaposto gestito.');
}

async function main() {
  console.log('🚀 AVVIO DEPLOY PRODUZIONE UFFICIALE SU https://www.fuoriclasse.cloud/\n');

  // 1. Rimuovi index.php segnaposto Aruba
  await removeDefaultIndexPhp();

  // 2. Carica ed estrai tutti i pacchetti chunked
  const packagesDir = path.join(__dirname, '..', 'deploy-packages');
  const files = fs.readdirSync(packagesDir).filter(f => f.endsWith('.zip')).sort();

  for (const f of files) {
    const fullPath = path.join(packagesDir, f);
    uploadAndExtractZip(fullPath, f);
  }

  console.log('\n========================================');
  console.log('🏆 DEPLOY COMPLETATO CON SUCCESSO SU https://www.fuoriclasse.cloud/!');
  console.log('========================================\n');
}

main().catch(err => {
  console.error('\n❌ ERRORE DEPLOY:', err);
  process.exit(1);
});
