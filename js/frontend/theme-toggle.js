/**
 * Theme Toggle System - Dark/Light Mode
 * ระบบสลับโหมดกลางวัน/กลางคืนสำหรับทั้งเว็บไซต์
 */

class ThemeToggle {
    constructor() {
        this.THEME_KEY = 'panderx-theme-mode';
        this.DARK_MODE = 'dark';
        this.LIGHT_MODE = 'light';
        this.init();
    }

    init() {
        // โหลด theme ที่บันทึกไว้ หรือใช้ค่าเริ่มต้นจากระบบ
        const savedTheme = this.getSavedTheme();
        const preferredTheme = savedTheme || this.getSystemPreference();
        this.setTheme(preferredTheme);
        
        // สร้างปุ่ม toggle
        this.createToggleButton();
        
        // ฟังการเปลี่ยนแปลงของระบบ
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getSavedTheme()) {
                    this.setTheme(e.matches ? this.DARK_MODE : this.LIGHT_MODE);
                }
            });
        }
    }

    getSavedTheme() {
        try {
            return localStorage.getItem(this.THEME_KEY);
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return this.DARK_MODE;
        }
        return this.LIGHT_MODE;
    }

    setTheme(theme) {
        const html = document.documentElement;
        const isDark = theme === this.DARK_MODE;
        
        // เพิ่ม/ลบ class 'dark' ใน <html>
        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        // บันทึกการเลือก
        try {
            localStorage.setItem(this.THEME_KEY, theme);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        
        // อัปเดตปุ่ม toggle
        this.updateToggleButton(isDark);
        
        // ส่ง event เพื่อให้ component อื่นๆ รู้ว่า theme เปลี่ยน
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.classList.contains('dark') ? this.DARK_MODE : this.LIGHT_MODE;
        const newTheme = currentTheme === this.DARK_MODE ? this.LIGHT_MODE : this.DARK_MODE;
        this.setTheme(newTheme);
    }

    createToggleButton() {
        // ค้นหา navbar หรือ header ที่มี id="navbar" หรือ class ที่เกี่ยวข้อง
        const navbar = document.querySelector('nav, [role="navigation"], .navbar, .header');
        if (!navbar) return;

        // สร้างปุ่ม toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggleBtn';
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        toggleBtn.setAttribute('title', 'สลับโหมดกลางวัน/กลางคืน');
        
        const isDark = document.documentElement.classList.contains('dark');
        toggleBtn.innerHTML = isDark ? 
            '<i class="fa-solid fa-sun"></i>' : 
            '<i class="fa-solid fa-moon"></i>';
        
        toggleBtn.addEventListener('click', () => this.toggleTheme());
        
        // หาตำแหน่งที่เหมาะสมในการวาง (ปกติจะอยู่ที่มุมขวาของ navbar)
        const navRight = navbar.querySelector('.nav-right, [class*="right"], [class*="end"]') || navbar;
        navRight.appendChild(toggleBtn);
    }

    updateToggleButton(isDark) {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.innerHTML = isDark ? 
                '<i class="fa-solid fa-sun"></i>' : 
                '<i class="fa-solid fa-moon"></i>';
        }
    }
}

// Initialize theme toggle เมื่อ DOM พร้อม
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeToggle = new ThemeToggle();
    });
} else {
    window.themeToggle = new ThemeToggle();
}
