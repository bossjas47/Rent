
function applyThemeVars(vars) {
    const root = document.documentElement;
    if (vars.primary) { root.style.setProperty('--color-primary', vars.primary); updateSwatchUI('primary', vars.primary); }
    if (vars.secondary) { root.style.setProperty('--color-secondary', vars.secondary); updateSwatchUI('secondary', vars.secondary); }
    if (vars.accent) { root.style.setProperty('--color-accent', vars.accent); updateSwatchUI('accent', vars.accent); }
    if (vars.bg) { root.style.setProperty('--color-bg', vars.bg); document.body.style.background = vars.bg; updateSwatchUI('bg', vars.bg); }
    if (vars.text) { root.style.setProperty('--color-text', vars.text); updateSwatchUI('text', vars.text); }
    if (vars.textMuted) root.style.setProperty('--color-text-muted', vars.textMuted);
    if (vars.headerBg) { root.style.setProperty('--color-header-bg', vars.headerBg); updateSwatchUI('headerBg', vars.headerBg); }
    if (vars.footerBg) { root.style.setProperty('--color-footer-bg', vars.footerBg); updateSwatchUI('footerBg', vars.footerBg); }
    if (vars.fontFamily) { document.body.style.fontFamily = vars.fontFamily; livePreviewFont(vars.fontFamily, false); }
    if (vars.fontSize) livePreviewFontSize(vars.fontSize, false);
    updateThemePreviewBar();
}

function updateSwatchUI(key, value) {
    const el = document.getElementById(`tc_${key}`);
    const valEl = document.getElementById(`tc_${key}_val`);
    if (el) el.value = value;
    if (valEl) valEl.textContent = value;
    // Update preview dots
    const dots = { primary:'previewPrimary', secondary:'previewSecondary', accent:'previewAccent', bg:'previewBg', headerBg:'previewHeader', text:'previewText' };
    if (dots[key]) {
        const dot = document.getElementById(dots[key]);
        if (dot) {
            if (key === 'text') { dot.style.color = value; }
            else { dot.style.background = value; }
        }
    }
}

function updateThemePreviewBar() {
    const bar = document.getElementById('themePreviewBar');
    if (bar) {
        const p = document.getElementById('tc_primary')?.value || '#0ea5e9';
        const s = document.getElementById('tc_secondary')?.value || '#6366f1';
        bar.style.background = `linear-gradient(90deg, ${p} 0%, ${s} 100%)`;
    }
}

function livePreviewColor(key, value) {
    const keyMap = { primary:'--color-primary', secondary:'--color-secondary', accent:'--color-accent', bg:'--color-bg', text:'--color-text', textMuted:'--color-text-muted', headerBg:'--color-header-bg', footerBg:'--color-footer-bg' };
    if (keyMap[key]) document.documentElement.style.setProperty(keyMap[key], value);
    const valEl = document.getElementById(`tc_${key}_val`);
    if (valEl) valEl.textContent = value;
    if (key === 'bg') document.body.style.background = value;
    // update preview dots
    const dots = { primary:'previewPrimary', secondary:'previewSecondary', accent:'previewAccent', bg:'previewBg', headerBg:'previewHeader' };
    if (dots[key]) { const d = document.getElementById(dots[key]); if(d) d.style.background = value; }
    if (key === 'text') { const d = document.getElementById('previewText'); if(d) d.style.color = value; }
    updateThemePreviewBar();
}

function livePreviewFont(value, apply = true) {
    if (apply) document.body.style.fontFamily = value;
    const sel = document.getElementById('tc_fontFamily');
    if (sel) sel.value = value;
}

function livePreviewFontSize(value, apply = true) {
    value = parseInt(value);
    if (apply) document.documentElement.style.fontSize = value + 'px';
    const el = document.getElementById('tc_fontSize');
    const valEl = document.getElementById('tc_fontSize_val');
    if (el) el.value = value;
    if (valEl) valEl.textContent = value + 'px';
}

function applyPreset(name) {
    const p = themePresets[name];
    if (!p) return;
    applyThemeVars(p);
    showToast(`ใช้ธีม "${name}" แล้ว`, 'success');
}

function resetTheme() {
    if (!confirm('รีเซ็ตธีมเป็นค่าเริ่มต้น?')) return;
    applyThemeVars(themeDefaults);
    showToast('รีเซ็ตธีมแล้ว', 'info');
}

async function saveTheme() {
    if (!checkAccess('manage_settings')) return;
    try {
        const { doc, setDoc } = window.firestoreFns;
        const themeData = {
            primary: document.getElementById('tc_primary')?.value || themeDefaults.primary,
            secondary: document.getElementById('tc_secondary')?.value || themeDefaults.secondary,
            accent: document.getElementById('tc_accent')?.value || themeDefaults.accent,
            bg: document.getElementById('tc_bg')?.value || themeDefaults.bg,
            text: document.getElementById('tc_text')?.value || themeDefaults.text,
            textMuted: document.getElementById('tc_textMuted')?.value || themeDefaults.textMuted,
            headerBg: document.getElementById('tc_headerBg')?.value || themeDefaults.headerBg,
            footerBg: document.getElementById('tc_footerBg')?.value || themeDefaults.footerBg,
            fontFamily: document.getElementById('tc_fontFamily')?.value || themeDefaults.fontFamily,
            fontSize: parseInt(document.getElementById('tc_fontSize')?.value || 16),
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'system', 'theme'), themeData, { merge: true });
        applyThemeVars(themeData);
        showToast('บันทึกธีมสำเร็จ ✓', 'success');
    } catch (e) {
        console.error('Save theme error:', e);
        showToast('บันทึกธีมไม่สำเร็จ: ' + e.message, 'error');
    }
}

async function loadTheme() {
    try {
        const { doc, getDoc } = window.firestoreFns;
        const snap = await getDoc(doc(db, 'system', 'theme'));
        if (snap.exists()) {
            applyThemeVars(snap.data());
        }
    } catch (e) {
        console.warn('Load theme error (using defaults):', e);
    }
}

