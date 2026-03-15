/**
 * PanderX Index Page
 * เช็ค Role: admin, super_admin → แสดงปุ่ม Admin Panel
 */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// Utility Functions
// ============================================

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatBalance(num) {
    const n = Number(num);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ใช้ ?? ไม่ใช่ || (ตาม SKILL.md)
function safeBalance(val) {
    return val ?? 0;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = escapeHtml(message);
    container.appendChild(toast);
    
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Admin Role Check (สำคัญ)
// ============================================

/**
 * เช็คว่าเป็น Admin หรือไม่ (รองรับทั้ง admin และ super_admin)
 * @param {string} role - role จาก Firestore
 * @returns {boolean}
 */
function checkIsAdmin(role) {
    if (!role) return false;
    const r = String(role).toLowerCase().trim();
    return r === 'admin' || r === 'super_admin';
}

/**
 * แสดง UI สำหรับ Admin (ปุ่ม Admin Panel)
 */
function showAdminUI() {
    // แสดงใน Dropdown
    const dropdownBtn = document.getElementById('adminPanelBtn');
    if (dropdownBtn) {
        dropdownBtn.style.display = 'flex';
    }
    
    // แสดงใน Sidebar
    const sidebarBtn = document.getElementById('sidebarAdminBtn');
    if (sidebarBtn) {
        sidebarBtn.style.display = 'flex';
    }
    
    console.log('[Admin] Admin UI activated');
}

// ============================================
// UI Updates
// ============================================

function updateBalanceDisplay(balance) {
    const fmt = formatBalance(balance);
    const ids = ['userBalance', 'dropdownBalance', 'sidebarBalance'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = (id === 'userBalance') ? fmt : fmt + ' ฿';
    });
}

function updateNameDisplay(name) {
    const cleanName = escapeHtml((name || 'ผู้ใช้').trim());
    const initial = cleanName.charAt(0).toUpperCase();
    
    ['displayName', 'dropdownName', 'sidebarUsername'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = cleanName;
    });
    
    ['userAvatar', 'dropdownAvatar', 'sidebarAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = initial;
    });
}

// ============================================
// Auth Management
// ============================================

async function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        const sidebarUserStrip = document.getElementById('sidebarUserStrip');
        const sidebarAuthGuest = document.getElementById('sidebarAuthGuest');
        const sidebarAuthUser = document.getElementById('sidebarAuthUser');

        if (!user) {
            // Guest mode
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
            if (sidebarUserStrip) sidebarUserStrip.style.display = 'none';
            if (sidebarAuthGuest) sidebarAuthGuest.style.display = 'block';
            if (sidebarAuthUser) sidebarAuthUser.style.display = 'none';
            return;
        }

        // Logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (sidebarUserStrip) sidebarUserStrip.style.display = 'flex';
        if (sidebarAuthGuest) sidebarAuthGuest.style.display = 'none';
        if (sidebarAuthUser) sidebarAuthUser.style.display = 'block';

        // Optimistic UI
        const authName = user.displayName || user.email?.split('@')[0] || 'ผู้ใช้';
        updateNameDisplay(authName);
        updateBalanceDisplay(0);

        // Load from Firestore
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                
                // Update name
                const displayName = data.displayName?.trim() || authName;
                updateNameDisplay(displayName);
                
                // Update balance (ใช้ ?? ตาม SKILL.md)
                const balance = safeBalance(data.balance);
                updateBalanceDisplay(balance);
                
                // ============================================
                // เช็ค Role และแสดง Admin Panel
                // ============================================
                const userRole = data.role;
                if (checkIsAdmin(userRole)) {
                    showAdminUI();
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            showToast('โหลดข้อมูลไม่สำเร็จ', 'error');
        }
    });
}

// ============================================
// Data Loading
// ============================================

async function loadStats() {
    try {
        const snap = await getDoc(doc(db, 'system', 'stats'));
        let data = {};
        
        if (snap.exists()) {
            data = snap.data();
        } else {
            const q = query(collection(db, 'orders'), where('status', '==', 'approved'));
            const orders = await getDocs(q);
            data.totalCount = orders.size;
        }

        const ageEl = document.getElementById('serviceAge');
        if (ageEl && data.launchDate?.toDate) {
            const days = Math.floor((Date.now() - data.launchDate.toDate()) / 86400000);
            ageEl.textContent = `ให้บริการมาแล้ว ${days.toLocaleString('th-TH')} วัน`;
        } else if (ageEl) {
            ageEl.textContent = 'บริการเว็บไซต์สำเร็จรูปคุณภาพสูง';
        }

        const stats = {
            'statToday': data.todayCount ?? 0,
            'statWeek': data.weekCount ?? 0,
            'statMonth': data.monthCount ?? 0,
            'statTotal': data.totalCount ?? 0
        };

        Object.entries(stats).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = Number(val).toLocaleString('th-TH');
        });
    } catch (err) {
        console.error('Stats error:', err);
    }
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // Show skeleton
    grid.innerHTML = Array(4).fill(0).map(() => `
        <div class="bg-white p-3 rounded-xl border border-slate-200 animate-pulse">
            <div class="bg-slate-200 rounded-lg w-full aspect-video mb-3"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
    `).join('');

    try {
        const q = query(
            collection(db, 'products'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(8)
        );
        
        const snap = await getDocs(q);
        
        if (snap.empty) {
            grid.innerHTML = '<p class="text-slate-400 text-center col-span-full py-8">ยังไม่มีสินค้า</p>';
            return;
        }

        let html = '';
        snap.forEach((doc, index) => {
            const p = doc.data();
            const name = escapeHtml(p.name || 'ไม่มีชื่อ');
            const price = Number(p.price || 0).toLocaleString('th-TH');
            const img = p.imageUrl ? escapeHtml(p.imageUrl) : null;
            
            html += `
                <div class="bg-white p-3 rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer" data-product-index="${index}">
                    <div class="aspect-video rounded-lg bg-gradient-to-br from-sky-100 to-purple-100 mb-3 overflow-hidden">
                        ${img ? `<img src="${img}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">` : ''}
                    </div>
                    <h3 class="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">${name}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-sky-600 font-bold text-sm">${price} ฿</span>
                        <button class="bg-gradient-to-r from-sky-400 to-indigo-400 text-white text-xs px-3 py-1.5 rounded-full product-rent-btn">
                            เช่า
                        </button>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        
        // Add event listeners instead of inline onclick
        grid.querySelectorAll('[data-product-index]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-rent-btn')) {
                    window.location.href = './homerent.html';
                }
            });
            
            card.querySelector('.product-rent-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = './homerent.html';
            });
        });
    } catch (err) {
        console.error('Products error:', err);
        grid.innerHTML = '<p class="text-slate-400 text-center col-span-full py-8">ไม่สามารถโหลดสินค้าได้</p>';
    }
}

// ============================================
// Event Handlers (ครบถ้วน)
// ============================================

window.toggleProfileDropdown = function(e) {
    e?.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('dropdownArrow');
    const trigger = document.getElementById('profileTrigger');
    
    if (dropdown) {
        const isActive = dropdown.classList.toggle('active');
        if (arrow) arrow.style.transform = isActive ? 'rotate(180deg)' : '';
        if (trigger) trigger.classList.toggle('active', isActive);
    }
};

window.handleMenuClick = function(page) {
    const routes = {
        profile: './profile.html',
        orders: './orders.html',
        topup: './topup.html',
        settings: './settings.html'
    };
    if (routes[page]) window.location.href = routes[page];
};

window.handleLogout = async function() {
    try {
        await signOut(auth);
        showToast('ออกจากระบบสำเร็จ', 'success');
        setTimeout(() => window.location.href = './login.html', 500);
    } catch (err) {
        showToast('ออกจากระบบไม่สำเร็จ', 'error');
    }
};

window.goToLogin = function() {
    window.location.href = './login.html';
};

window.goToRegister = function() {
    window.location.href = './register.html';
};

window.toggleSidebar = function(e) {
    if (e) e.stopPropagation();
    const drawer = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('hamburgerBtn');
    
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    
    if (overlay) overlay.classList.toggle('open', isOpen);
    if (btn) {
        btn.classList.toggle('active', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
};

window.closeSidebar = function() {
    const drawer = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('hamburgerBtn');
    
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setTimeout(loadStats, 100);
    setTimeout(loadProducts, 200);
    
    // Close dropdown when click outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('profileDropdown');
        const trigger = document.getElementById('profileTrigger');
        
        if (dropdown && trigger && 
            !trigger.contains(e.target) && 
            !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
            const arrow = document.getElementById('dropdownArrow');
            if (arrow) arrow.style.transform = '';
            trigger.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });
});
