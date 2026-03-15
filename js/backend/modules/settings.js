// ==================== SITE SETTINGS ====================

let _currentKeywords = [];
let _currentShopTypes = [];

// รายชื่อ Google Fonts URL สำหรับ preview
const _FONT_GOOGLE_URLS = {
    'Prompt':             'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap',
    'Sarabun':            'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap',
    'Kanit':              'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap',
    'Mitr':               'https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;600;700&display=swap',
    'Noto Sans Thai':     'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap',
    'IBM Plex Sans Thai': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap',
    'Chakra Petch':       'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&display=swap',
    'Inter':              'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'Poppins':            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
    'Roboto':             'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
    'Nunito':             'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap',
    'Outfit':             'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
};

async function loadSiteSettings() {
    try {
        const { doc, getDoc } = window.firestoreFns;
        const snap = await getDoc(doc(db, 'system', 'site_settings'));
        if (!snap.exists()) return;
        const d = snap.data();
        if (document.getElementById('ss_siteName')) document.getElementById('ss_siteName').value = d.siteName || '';
        if (document.getElementById('ss_description')) document.getElementById('ss_description').value = d.description || '';
        if (document.getElementById('ss_seoTitle')) document.getElementById('ss_seoTitle').value = d.seoTitle || '';
        if (document.getElementById('ss_siteUrl')) document.getElementById('ss_siteUrl').value = d.siteUrl || '';
        if (document.getElementById('ss_favicon')) document.getElementById('ss_favicon').value = d.favicon || '';
        if (document.getElementById('ss_ogImage')) document.getElementById('ss_ogImage').value = d.ogImage || '';
        if (document.getElementById('ss_line')) document.getElementById('ss_line').value = d.line || '';
        if (document.getElementById('ss_facebook')) document.getElementById('ss_facebook').value = d.facebook || '';
        if (document.getElementById('ss_discord')) document.getElementById('ss_discord').value = d.discord || '';
        if (document.getElementById('ss_phone')) document.getElementById('ss_phone').value = d.phone || '';
        if (document.getElementById('ss_email')) document.getElementById('ss_email').value = d.email || '';
        if (document.getElementById('ss_tiktok')) document.getElementById('ss_tiktok').value = d.tiktok || '';
        // Shop types
        _currentShopTypes = d.shopTypes || [];
        document.querySelectorAll('#shopTypeTags .seo-tag').forEach(tag => {
            const type = tag.getAttribute('data-type');
            tag.classList.toggle('selected', _currentShopTypes.includes(type));
        });
        // Keywords
        _currentKeywords = d.keywords || [];
        renderKeywordTags();
        // Update SEO preview
        updateSeoPreview();
        // Propagate to admin brand on load
        if (d.siteName) {
            const name   = d.siteName;
            const letter = name.charAt(0).toUpperCase();
            const adminName   = document.getElementById('adminSiteName');
            const adminLetter = document.getElementById('adminLogoLetter');
            if (adminName)   adminName.textContent   = name;
            if (adminLetter) adminLetter.textContent = letter;
            document.title = name + ' | Admin Panel';
        }
        // ── Font Setting ──
        const fontId = d.fontId || 'Prompt';
        const fontSel = document.getElementById('ss_fontId');
        if (fontSel) {
            fontSel.value = fontId;
            if (typeof window.previewFont === 'function') {
                window.previewFont(fontId);
            }
        }
        // ── EasySlip API Key (โหลดจาก system/config) ──
        try {
            const configSnap = await getDoc(doc(db, 'system', 'config'));
            if (configSnap.exists()) {
                const cfg = configSnap.data();
                const easyslipEl = document.getElementById('ss_easyslipApiKey');
                if (easyslipEl && cfg.easyslipApiKey) {
                    easyslipEl.value = cfg.easyslipApiKey;
                }
            }
        } catch (e2) {
            console.warn('Load easyslip key error:', e2);
        }
    } catch (e) {
        console.warn('Load site settings error:', e);
    }
}

async function saveSiteSettings() {
    if (!checkAccess('manage_settings')) return;
    try {
        const { doc, setDoc } = window.firestoreFns;
        const fontId = document.getElementById('ss_fontId')?.value || 'Prompt';
        const data = {
            siteName:    document.getElementById('ss_siteName')?.value    || '',
            description: document.getElementById('ss_description')?.value || '',
            seoTitle:    document.getElementById('ss_seoTitle')?.value    || '',
            siteUrl:     document.getElementById('ss_siteUrl')?.value     || '',
            favicon:     document.getElementById('ss_favicon')?.value     || '',
            ogImage:     document.getElementById('ss_ogImage')?.value     || '',
            line:        document.getElementById('ss_line')?.value        || '',
            facebook:    document.getElementById('ss_facebook')?.value    || '',
            discord:     document.getElementById('ss_discord')?.value     || '',
            phone:       document.getElementById('ss_phone')?.value       || '',
            email:       document.getElementById('ss_email')?.value       || '',
            tiktok:      document.getElementById('ss_tiktok')?.value      || '',
            shopTypes:   _currentShopTypes,
            keywords:    _currentKeywords,
            fontId,
            updatedAt:   new Date().toISOString()
        };

        // ── EasySlip API Key: บันทึกลง system/config ──
        const easyslipApiKey = document.getElementById('ss_easyslipApiKey')?.value?.trim() || '';
        if (easyslipApiKey !== undefined) {
            await setDoc(doc(db, 'system', 'config'), { easyslipApiKey }, { merge: true });
        }

        await setDoc(doc(db, 'system', 'site_settings'), data, { merge: true });

        // ── Propagate site name across all admin UI elements ──
        if (data.siteName) {
            const name   = data.siteName;
            const letter = name.charAt(0).toUpperCase();
            const adminName = document.getElementById('adminSiteName');
            if (adminName) adminName.textContent = name;
            const adminLetter = document.getElementById('adminLogoLetter');
            if (adminLetter) adminLetter.textContent = letter;
            const sidebarTitle = document.querySelector('#sidebar h1');
            if (sidebarTitle) sidebarTitle.textContent = name;
            document.title = name + ' | Admin Panel';
            document.querySelectorAll('.site-name, .sidebar-site-name, #sidebarSiteName').forEach(el => {
                el.textContent = name;
            });
        }
        // ── Apply font ทันที ──
        if (typeof window.previewFont === 'function') {
            window.previewFont(fontId);
        }
        // บันทึก font ลง localStorage เพื่อให้ทุกหน้าใช้ได้ทันที
        try { localStorage.setItem('site_font', fontId); } catch {}
        showToast('บันทึกการตั้งค่าสำเร็จ ✓  Font: ' + fontId, 'success');
    } catch (e) {
        console.error('Save site settings error:', e);
        showToast('บันทึกไม่สำเร็จ: ' + e.message, 'error');
    }
}

function toggleShopType(el, type) {
    el.classList.toggle('selected');
    if (el.classList.contains('selected')) {
        if (!_currentShopTypes.includes(type)) _currentShopTypes.push(type);
    } else {
        _currentShopTypes = _currentShopTypes.filter(t => t !== type);
    }
    document.getElementById('ss_shopTypes').value = _currentShopTypes.join(',');
}

function addKeyword(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = document.getElementById('ss_keywordInput');
    const kw = input.value.trim();
    if (!kw || _currentKeywords.includes(kw)) { input.value = ''; return; }
    _currentKeywords.push(kw);
    input.value = '';
    renderKeywordTags();
    document.getElementById('ss_keywords').value = _currentKeywords.join(',');
}

function removeKeyword(kw) {
    _currentKeywords = _currentKeywords.filter(k => k !== kw);
    renderKeywordTags();
}

function renderKeywordTags() {
    const container = document.getElementById('keywordTags');
    if (!container) return;
    container.innerHTML = _currentKeywords.map(kw => `
        <span class="seo-tag selected">
            ${kw}
            <span class="remove-tag" onclick="removeKeyword('${kw}')"><i class="fa-solid fa-xmark"></i></span>
        </span>
    `).join('');
}

function updateSeoPreview() {
    const title = document.getElementById('ss_seoTitle')?.value || document.getElementById('ss_siteName')?.value || 'ชื่อเว็บไซต์ของคุณ';
    const url = document.getElementById('ss_siteUrl')?.value || 'yourdomain.com';
    const desc = document.getElementById('ss_description')?.value || 'คำอธิบายเว็บไซต์จะปรากฏที่นี่...';
    const el1 = document.getElementById('seoTitlePreview');
    const el2 = document.getElementById('seoUrlPreview');
    const el3 = document.getElementById('seoDescPreview');
    if (el1) el1.textContent = title;
    if (el2) el2.textContent = 'https://' + url;
    if (el3) el3.textContent = desc;
}

// ── EasySlip API Key toggle visibility ──
function toggleApiKeyVisibility() {
    const input = document.getElementById('ss_easyslipApiKey');
    const icon  = document.getElementById('apiKeyEyeIcon');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
    } else {
        input.type = 'password';
        if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
    }
}

// ── ทดสอบ EasySlip API Key ──
async function testEasySlipKey() {
    const key = document.getElementById('ss_easyslipApiKey')?.value?.trim();
    const resultEl = document.getElementById('easyslipTestResult');
    if (!key) { showToast('กรุณาใส่ API Key ก่อน', 'error'); return; }
    if (resultEl) {
        resultEl.className = 'mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700';
        resultEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>กำลังทดสอบ API Key...';
        resultEl.classList.remove('hidden');
    }
    try {
        const res = await fetch('https://developer.easyslip.com/api/v1/verify', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: 'test' })
        });
        if (res.status === 401 || res.status === 403) {
            if (resultEl) {
                resultEl.className = 'mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700';
                resultEl.innerHTML = '<i class="fa-solid fa-circle-xmark mr-2"></i>API Key ไม่ถูกต้องหรือหมดอายุ';
            }
        } else {
            if (resultEl) {
                resultEl.className = 'mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700';
                resultEl.innerHTML = '<i class="fa-solid fa-circle-check mr-2"></i>API Key ถูกต้อง — พร้อมใช้งานสแกนสลิปอัตโนมัติ';
            }
        }
    } catch (e) {
        if (resultEl) {
            resultEl.className = 'mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700';
            resultEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-2"></i>ไม่สามารถทดสอบได้ (CORS) — ลองบันทึกแล้วทดสอบจากหน้า Topup';
        }
    }
}

// Description char counter
document.addEventListener('DOMContentLoaded', () => {
    const descEl = document.getElementById('ss_description');
    const seoTitleEl = document.getElementById('ss_seoTitle');
    const siteNameEl = document.getElementById('ss_siteName');
    if (descEl) {
        descEl.addEventListener('input', () => {
            const len = descEl.value.length;
            const counter = document.getElementById('descCharCount');
            if (counter) { counter.textContent = len + '/160'; counter.className = 'text-xs ' + (len > 160 ? 'text-red-500' : 'text-slate-400'); }
            updateSeoPreview();
        });
    }
    if (seoTitleEl) seoTitleEl.addEventListener('input', updateSeoPreview);
    if (siteNameEl) siteNameEl.addEventListener('input', updateSeoPreview);
});
