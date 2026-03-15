// ==========================================
// homerent.js — Dashboard Style
// ==========================================

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser     = null;
let currentUserData = {};
let balanceUnsub    = null;

// ── Toast ─────────────────────────────────────────────────────────────────────
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const colors = { success: '#10b981', error: '#ef4444', info: '#38bdf8', warning: '#f59e0b' };
    const icons  = { success: '✕', error: '✕', info: 'ℹ', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    toast.innerHTML = `
        <span style="color:${colors[type]};font-weight:bold;font-size:18px;">${icons[type] || 'ℹ'}</span>
        <span style="font-weight:500;color:#1e293b;">${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

// ── Auth & Navigation ─────────────────────────────────────────────────────────
window.handleLogout = async function() {
    try {
        await signOut(auth);
        window.showToast('ออกจากระบบสำเร็จ', 'success');
        setTimeout(() => window.location.reload(), 800);
    } catch { window.showToast('เกิดข้อผิดพลาด', 'error'); }
};

window.toggleSidebar = function(e) {
    if (e) e.stopPropagation();
    document.getElementById('sidebarDrawer')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
};

window.closeSidebar = function() {
    document.getElementById('sidebarDrawer')?.classList.remove('active');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
};

// ── Render User UI ────────────────────────────────────────────────────────────
function updateUI(user, userData) {
    const name = userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้';
    const balance = Number(userData?.balance ?? 0).toLocaleString('th-TH');
    const initial = name.charAt(0).toUpperCase();

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('sidebarUsername', name);
    set('sidebarAvatar', initial);
    set('userAvatar', initial);
    set('userBalance', balance);
    set('sidebarBalance', balance);
}

// ── Init ──────────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        startBalanceListener(user.uid);
        // UI toggle handled by inline script in HTML for speed
    } else {
        currentUser = null;
        if (balanceUnsub) balanceUnsub();
    }
});

function startBalanceListener(uid) {
    if (balanceUnsub) balanceUnsub();
    balanceUnsub = onSnapshot(doc(db, 'users', uid), (snap) => {
        if (!snap.exists()) return;
        currentUserData = snap.data();
        updateUI(currentUser, currentUserData);
    });
}

// ── Mock Data for Dashboard Table ─────────────────────────────────────────────
function renderMockTable() {
    const tableBody = document.getElementById('shopTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // ในที่นี้เราแสดงเป็น Empty State ตามรูปภาพที่ส่งมา (เพราะยังไม่มีร้านค้า)
    if (tableBody && emptyState) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderMockTable();
});
