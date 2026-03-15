/**
 * font-loader.js — Global Font Loader
 * โหลด font setting จาก Firestore (system/site_settings) แล้ว apply ทุกหน้า
 * Path: js/font-loader.js
 * 
 * วิธีใช้: ใส่ใน <head> ของทุก HTML ก่อน CSS อื่น
 * <script type="module" src="js/font-loader.js"></script>
 */

import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ── รายการ Font ที่รองรับ ─────────────────────────────────────────
export const AVAILABLE_FONTS = [
    {
        id: 'Prompt',
        label: 'Prompt (ค่าเริ่มต้น)',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap',
        stack: "'Prompt', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Sarabun',
        label: 'Sarabun',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap',
        stack: "'Sarabun', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Kanit',
        label: 'Kanit',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap',
        stack: "'Kanit', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Mitr',
        label: 'Mitr',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;600;700&display=swap',
        stack: "'Mitr', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Noto Sans Thai',
        label: 'Noto Sans Thai',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap',
        stack: "'Noto Sans Thai', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'IBM Plex Sans Thai',
        label: 'IBM Plex Sans Thai',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap',
        stack: "'IBM Plex Sans Thai', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Chakra Petch',
        label: 'Chakra Petch',
        category: 'thai',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&display=swap',
        stack: "'Chakra Petch', sans-serif",
        preview: 'Aa ก ข ค'
    },
    {
        id: 'Inter',
        label: 'Inter',
        category: 'international',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        stack: "'Inter', sans-serif",
        preview: 'Aa Bb Cc'
    },
    {
        id: 'Poppins',
        label: 'Poppins',
        category: 'international',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
        stack: "'Poppins', sans-serif",
        preview: 'Aa Bb Cc'
    },
    {
        id: 'Roboto',
        label: 'Roboto',
        category: 'international',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
        stack: "'Roboto', sans-serif",
        preview: 'Aa Bb Cc'
    },
    {
        id: 'Nunito',
        label: 'Nunito',
        category: 'international',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap',
        stack: "'Nunito', sans-serif",
        preview: 'Aa Bb Cc'
    },
    {
        id: 'Outfit',
        label: 'Outfit',
        category: 'international',
        googleUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
        stack: "'Outfit', sans-serif",
        preview: 'Aa Bb Cc'
    }
];

// ── Default Font ──────────────────────────────────────────────────
export const DEFAULT_FONT_ID = 'Prompt';

// ── Apply font to document ────────────────────────────────────────
export function applyFont(fontId) {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId) || AVAILABLE_FONTS.find(f => f.id === DEFAULT_FONT_ID);
    if (!font) return;

    // 1. Inject Google Fonts <link> ถ้ายังไม่มี
    const existingLink = document.querySelector(`link[data-font-id="${font.id}"]`);
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.googleUrl;
        link.setAttribute('data-font-id', font.id);
        document.head.insertBefore(link, document.head.firstChild);
    }

    // 2. Apply CSS variable + body font-family
    document.documentElement.style.setProperty('--site-font', font.stack);
    document.body.style.fontFamily = font.stack;

    // 3. Inject global override style ถ้ายังไม่มี
    let styleEl = document.getElementById('site-font-override');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'site-font-override';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
        *, *::before, *::after {
            font-family: ${font.stack} !important;
        }
    `;

    // 4. บันทึก font ที่ใช้ปัจจุบันไว้ใน localStorage เพื่อใช้ก่อน Firestore โหลด
    try { localStorage.setItem('site_font', font.id); } catch {}

    return font;
}

// ── Load font from Firestore ──────────────────────────────────────
async function loadAndApplyFont() {
    // Apply จาก localStorage ก่อน (ป้องกัน FOUT)
    const cached = (() => { try { return localStorage.getItem('site_font'); } catch { return null; } })();
    if (cached) applyFont(cached);

    try {
        const snap = await getDoc(doc(db, 'system', 'site_settings'));
        if (!snap.exists()) {
            applyFont(DEFAULT_FONT_ID);
            return;
        }
        const fontId = snap.data().fontId || DEFAULT_FONT_ID;
        applyFont(fontId);
    } catch (e) {
        console.warn('[font-loader] Firestore error, using cached/default font:', e);
        applyFont(cached || DEFAULT_FONT_ID);
    }
}

// ── Auto-run ──────────────────────────────────────────────────────
// Apply cached font ทันที (ก่อน DOMContentLoaded เพื่อป้องกัน FOUT)
const _cached = (() => { try { return localStorage.getItem('site_font'); } catch { return null; } })();
applyFont(_cached || DEFAULT_FONT_ID);

// โหลดจาก Firestore หลัง DOM พร้อม
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApplyFont);
} else {
    loadAndApplyFont();
}

// Export สำหรับใช้ใน admin panel
export { loadAndApplyFont };
