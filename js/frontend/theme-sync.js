/**
 * Theme Sync - ซิงค์ theme จาก Admin Panel ไปยัง Frontend ทุกหน้า
 * ใช้ CSS Variables เพื่อให้สามารถเปลี่ยนสีได้อย่างอิสระ
 */

import { db } from '../firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class ThemeSync {
    constructor() {
        this.currentTheme = null;
        this.unsubscribe = null;
    }

    /**
     * Initialize theme sync
     */
    init() {
        this.subscribeToTheme();
    }

    /**
     * Subscribe to theme changes from Firestore
     */
    subscribeToTheme() {
        try {
            this.unsubscribe = onSnapshot(doc(db, 'system', 'theme'), (snap) => {
                if (snap.exists()) {
                    const theme = snap.data();
                    this.applyTheme(theme);
                    this.currentTheme = theme;
                }
            }, (error) => {
                console.warn('Failed to subscribe to theme:', error);
            });
        } catch (e) {
            console.warn('Theme sync initialization failed:', e);
        }
    }

    /**
     * Apply theme to CSS variables
     */
    applyTheme(theme) {
        if (!theme) return;

        const root = document.documentElement;

        // Apply color variables
        if (theme.primary) root.style.setProperty('--primary', theme.primary);
        if (theme.secondary) root.style.setProperty('--secondary', theme.secondary);
        if (theme.accent) root.style.setProperty('--accent', theme.accent);
        if (theme.bg) root.style.setProperty('--bg-color', theme.bg);
        if (theme.text) root.style.setProperty('--text-color', theme.text);
        if (theme.textMuted) root.style.setProperty('--text-muted', theme.textMuted);
        if (theme.headerBg) root.style.setProperty('--header-bg', theme.headerBg);
        if (theme.footerBg) root.style.setProperty('--footer-bg', theme.footerBg);

        // Apply font family
        if (theme.fontFamily) {
            document.body.style.fontFamily = theme.fontFamily;
            root.style.setProperty('--font-family', theme.fontFamily);
        }

        // Apply font size
        if (theme.fontSize) {
            root.style.fontSize = theme.fontSize + 'px';
            root.style.setProperty('--font-size-base', theme.fontSize + 'px');
        }

        // Update body background gradient if available
        if (theme.bgStart || theme.bgMid) {
            const bgStart = theme.bgStart || theme.bg || '#e0f2fe';
            const bgMid = theme.bgMid || '#f3e8ff';
            document.body.style.background = `linear-gradient(135deg, ${bgStart} 0%, ${bgMid} 50%, #f8fafc 100%)`;
        } else if (theme.bg) {
            document.body.style.background = theme.bg;
        }

        // Update text color
        if (theme.text) {
            document.body.style.color = theme.text;
        }

        // Dispatch custom event for other scripts to listen
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Get specific theme color
     */
    getColor(colorKey) {
        if (!this.currentTheme) return null;
        return this.currentTheme[colorKey];
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize theme sync when DOM is ready
const themeSync = new ThemeSync();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeSync.init();
    });
} else {
    themeSync.init();
}

// Make available globally
window.themeSync = themeSync;

export { ThemeSync, themeSync };
