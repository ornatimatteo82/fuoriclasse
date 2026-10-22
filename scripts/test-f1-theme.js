const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
            if URL of aTab contains "fuoriclasse.cloud" then
                set foundTab to aTab
                exit repeat
            end if
        end repeat
        if foundTab is not missing value then exit repeat
    end repeat
    
    if foundTab is missing value then
        error "Tab Fuoriclasse non trovato in Chrome!"
    end if
    
    tell foundTab
        return execute javascript "${escapedJs}"
    end tell
end tell
`;
  return runAppleScript(as);
}

const res = runChromeJs(`
  (function() {
    window.switchSport('f1');
    const activeNav = document.querySelector('.sidebar-nav .nav-item.active');
    const cs = activeNav ? window.getComputedStyle(activeNav) : null;
    const bodySport = document.body.getAttribute('data-sport');
    const heroTitle = document.getElementById('heroTitle') ? document.getElementById('heroTitle').textContent : '';
    const macroActive = document.querySelector('.macro-sport-btn[data-sport=\"f1\"].active');
    const macroBg = macroActive ? window.getComputedStyle(macroActive).backgroundColor : null;

    return JSON.stringify({
      bodySport: bodySport,
      heroTitle: heroTitle,
      navBg: cs ? cs.backgroundColor : null,
      navColor: cs ? cs.color : null,
      navBorder: cs ? cs.borderColor : null,
      macroBg: macroBg,
      catalogUnits: window.catalog ? window.catalog.units.length : 0
    });
  })()
`);

console.log('RISULTATO TEST F1 THEME:');
console.log(res);
