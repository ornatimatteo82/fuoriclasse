// Script per caricare ed estrarre solo 01-code.zip su Aruba fuoriclasse.cloud
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const ROOT_HASH = 'f1_Lw'; // Root di fuoriclasse.cloud
const DATA_HASH = 'f1_ZGF0YQ'; // Cartella data/ di fuoriclasse.cloud

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

function runChromeJsOnUrl(urlMatch, jsCode) {
  const escapedJs = jsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const as = `
tell application "Google Chrome"
    set foundTab to missing value
    repeat with aWindow in every window
        repeat with aTab in every tab of aWindow
            if URL of aTab contains "${urlMatch}" then
                set foundTab to aTab
            end if
        end repeat
    end repeat
    
    if foundTab is missing value then
        error "Tab ${urlMatch} non trovato in Chrome!"
    end if
    
    tell foundTab
        execute javascript "${escapedJs}"
    end tell
end tell
`;
  return runAppleScript(as);
}

function runChromeJs(jsCode) {
  return runChromeJsOnUrl('fm.aruba.it', jsCode);
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function ensureFreshSession() {
  try {
    runChromeJs(`
      window.__sessionOk = null;
      fetch('php/connector.minimal.php?cmd=open&target=${ROOT_HASH}&init=1')
        .then(r => r.json())
        .then(d => { window.__sessionOk = !(d && d.error); })
        .catch(() => { window.__sessionOk = false; });
    `);
    sleep(1500);
    const ok = runChromeJs('String(window.__sessionOk)');
    if (ok === 'true') return true;
  } catch (_) {}

  console.log('🔄 Sessione elFinder scaduta o chiusa. Riapertura automatica da admin.aruba.it...');
  try {
    // 1. Se siamo su LoginDomain.aspx (selettore dominio), clicca fuoriclasse.cloud
    try {
      const clickedDomain = runChromeJsOnUrl('admin.aruba.it', `
        (() => {
          const domBtn = Array.from(document.querySelectorAll('input, button, a')).find(el => {
            const v = (el.value || el.innerText || '').toLowerCase();
            return v.includes('fuoriclasse.cloud');
          });
          if (domBtn) { domBtn.click(); return "CLICKED_DOMAIN"; }
          return "ALREADY_IN_PANEL";
        })()
      `);
      if (clickedDomain === 'CLICKED_DOMAIN') {
        console.log('✓ Dominio fuoriclasse.cloud selezionato, attesa caricamento pannello...');
        sleep(4500);
      }
    } catch (_) {}

    // 2. Apri BridgePost in un nuovo tab nativo AppleScript (non bloccato dal popup blocker)
    runAppleScript(`
tell application "Google Chrome"
    make new tab at end of tabs of window 1 with properties {URL:"https://admin.aruba.it/PannelloAdmin/BridgePost.aspx?Servizio=Gestione_NewLinuxfileManager"}
end tell
`);
    sleep(6000);
  } catch (e) {
    console.warn('⚠️ Impossibile riaprire automaticamente da admin.aruba.it:', e.message);
  }
  return false;
}

async function uploadSinglePackage(zipFilename) {
  ensureFreshSession();
  const zipPath = path.join(__dirname, '..', 'deploy-packages', zipFilename);
  const expectedSize = fs.statSync(zipPath).size;

  console.log(`\n📦 Upload pacchetto: ${zipFilename} (${(expectedSize / 1024).toFixed(1)} KB)...`);
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

  console.log('- Esecuzione upload ed estrazione in elFinder...');
  const uploadJs = `
(async () => {
  try {
    await fetch('php/connector.minimal.php?cmd=open&target=${ROOT_HASH}&init=1&tree=1');
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
    fd.append('overwrite', '1');
    fd.append('upload[]', blob, '${zipFilename}');
    const upRes = await fetch('php/connector.minimal.php', { method: 'POST', body: fd });
    const upJson = await upRes.json();

    if (!upJson || upJson.error) {
      window.__deployStatus = { error: 'Upload failed: ' + JSON.stringify(upJson && upJson.error) };
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
    // Eliminazione file zip anche in caso di errore
    await fetch('php/connector.minimal.php?cmd=rm&targets%5B%5D=' + encodeURIComponent(zipFile.hash));

    if (extJson.error) {
      window.__deployStatus = { error: 'Extract failed: ' + JSON.stringify(extJson.error) };
      return;
    }

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

async function cleanupPartFiles() {
  ensureFreshSession();
  runChromeJs(`
    (async () => {
      try {
        const res = await fetch('php/connector.minimal.php?cmd=open&target=${DATA_HASH}');
        const d = await res.json();
        const parts = (d.files || []).filter(f => f.name.endsWith('.part'));
        for (const p of parts) {
          await fetch('php/connector.minimal.php?cmd=rm&targets%5B%5D=' + encodeURIComponent(p.hash));
        }
      } catch (_) {}
    })();
  `);
  sleep(1500);
}

async function uploadAndExtractCodeUpdate() {
  console.log('🚀 Avvio upload pacchetti aggiornati su Aruba...');
  await cleanupPartFiles();
  await uploadSinglePackage('01-code.zip');
  if (process.argv.includes('--with-data') || process.argv.includes('--data-only')) {
    await uploadSinglePackage('02-data-calcio.zip');
    await uploadSinglePackage('02b-data-gael.zip');
    await uploadSinglePackage('02c-data-pastore.zip');
  }
  console.log('🎉 Tutti i pacchetti caricati ed estratti con successo!');
}

uploadAndExtractCodeUpdate().catch(err => {
  console.error('\n❌ ERRORE:', err);
  process.exit(1);
});
