// Script per caricare ed estrarre solo 01-code.zip su Aruba fuoriclasse.cloud
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

async function uploadSinglePackage(zipFilename) {
  const zipPath = path.join(__dirname, '..', 'deploy-packages', zipFilename);

  console.log(`\n📦 Upload pacchetto: ${zipFilename} (${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB)...`);
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
      sample: (extJson.added || []).map(f => f.name)
    };
  } catch (e) {
    window.__deployStatus = { error: e.message };
  }
})();
`;

  runChromeJs(uploadJs);

  console.log('- Attesa completamento estrazione...');
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
          console.log(`✓ ${zipFilename} estratto con successo! File aggiornati: ${status.extractedCount}`);
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

async function uploadAndExtractCodeUpdate() {
  console.log('🚀 Avvio upload pacchetti aggiornati su Aruba...');
  await uploadSinglePackage('01-code.zip');
  console.log('🎉 Tutti i pacchetti caricati ed estratti con successo!');
}

uploadAndExtractCodeUpdate().catch(err => {
  console.error('\n❌ ERRORE:', err);
  process.exit(1);
});
