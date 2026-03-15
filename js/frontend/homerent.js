// ==========================================
// homerent.js — Website Singularity V1
// โหลดสินค้าจาก Firestore 'products' collection
// เหมือนกับที่แก้ใน Admin Panel
// ==========================================

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser     = null;
let currentUserData = {};
let allProducts     = [];
let selectedProduct = null;
let selectedDays    = 30;
let balanceUnsub    = null;

// ── Toast ─────────────────────────────────────────────────────────────────────
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const colors = { success: '#10b981', error: '#ef4444', info: '#38bdf8', warning: '#f59e0b' };
    const icons  = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

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

// ── Auth navigation ───────────────────────────────────────────────────────────
window.goToLogin    = () => { window.location.href = './login.html'; };
window.goToRegister = () => { window.location.href = './register.html'; };

window.handleLogout = async function() {
    closeDropdown();
    try {
        await signOut(auth);
        window.showToast('ออกจากระบบสำเร็จ', 'success');
        setTimeout(() => window.location.reload(), 800);
    } catch { window.showToast('เกิดข้อผิดพลาด', 'error'); }
};

window.handleMenuClick = function(action) {
    closeDropdown();
    const routes = { profile:'./profile.html', orders:'./orders.html', topup:'./topup.html' };
    if (routes[action]) window.location.href = routes[action];
    else window.showToast('ฟีเจอร์นี้กำลังพัฒนา', 'info');
};

// ── Profile dropdown (FIX: ใช้ class 'active' ให้ตรงกับ CSS) ─────────────────
function closeDropdown() {
    document.getElementById('profileDropdown')?.classList.remove('active');
    const arrow = document.getElementById('dropdownArrow');
    const trig  = document.getElementById('profileTrigger');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (trig)  trig.classList.remove('active');
}

window.toggleProfileDropdown = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();

    const dropdown = document.getElementById('profileDropdown');
    const arrow    = document.getElementById('dropdownArrow');
    const trigger  = document.getElementById('profileTrigger');
    if (!dropdown) return;

    const isOpen = dropdown.classList.toggle('active');
    if (arrow) arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    if (trigger) trigger.classList.toggle('active', isOpen);
};

// ── Mobile menu ───────────────────────────────────────────────────────────────
window.toggleMobileMenu = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburgerBtn');
    if (!menu) return;
    const isActive = menu.classList.toggle('active');
    if (btn) btn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
};

window.closeMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburgerBtn');
    if (menu) menu.classList.remove('active');
    if (btn)  btn.classList.remove('active');
    document.body.style.overflow = '';
};

// ── Render user / guest UI ────────────────────────────────────────────────────
function showUserUI(user, userData) {
    const name    = userData?.displayName || user.displayName || user.email?.split('@')[0] || 'User';
    const balance = Number(userData?.balance ?? 0).toLocaleString('th-TH');
    const initial = name.charAt(0).toUpperCase();
    const isAdmin = userData?.role === 'super_admin' || userData?.role === 'admin';

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('displayName',    name);
    set('dropdownName',   name);
    set('userAvatar',     initial);
    set('dropdownAvatar', initial);
    set('mobileUsername', name);
    set('mobileAvatar',   initial);
    set('userBalance',    balance);
    set('dropdownBalance', balance);
    set('mobileBalance',  balance);

    // FIX: ใช้ style.display แทน classList เพื่อ override .hidden ที่มี !important
    const hide = (id) => { const el = document.getElementById(id); if(el) { el.style.display='none'; } };
    const show = (id, disp='flex') => { const el = document.getElementById(id); if(el) { el.style.display=disp; el.classList.remove('hidden'); } };

    hide('authLoading');
    hide('guestButtons');
    show('userProfile', 'flex');
    hide('mobileAuthButtons');
    show('mobileLogoutButton', 'block');
    show('mobileUserSection', 'block');

    if (isAdmin) {
        show('adminShortcut', 'block');
    }
}

function showGuestUI() {
    const hide = (id) => { const el = document.getElementById(id); if(el) { el.style.display='none'; } };
    const show = (id, disp='flex') => { const el = document.getElementById(id); if(el) { el.style.display=disp; el.classList.remove('hidden'); } };

    hide('authLoading');
    hide('userProfile');
    show('guestButtons', 'flex');
    show('mobileAuthButtons', 'flex');
    hide('mobileLogoutButton');
    hide('mobileUserSection');
    hide('adminShortcut');
}

// ── Update balance realtime ───────────────────────────────────────────────────
function startBalanceListener(uid) {
    if (balanceUnsub) balanceUnsub();
    balanceUnsub = onSnapshot(doc(db, 'users', uid), (snap) => {
        if (!snap.exists()) return;
        const bal = Number(snap.data().balance ?? 0).toLocaleString('th-TH');
        const set = (id) => { const el=document.getElementById(id); if(el) el.textContent=bal; };
        set('userBalance'); set('dropdownBalance'); set('mobileBalance');
        currentUserData.balance = snap.data().balance ?? 0;
    });
}

// ── Load Products from Firestore 'products' (same as Admin Panel) ─────────────
async function loadProducts() {
    const container = document.getElementById('plansContainer');
    if (!container) return;

    try {
        let products = [];

        try {
            const q    = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            snap.forEach(d => products.push({ id: d.id, ...d.data() }));
        } catch {
            const snap = await getDocs(collection(db, 'products'));
            snap.forEach(d => products.push({ id: d.id, ...d.data() }));
        }

        // แสดงเฉพาะที่ isActive !== false
        allProducts = products.filter(p => p.isActive !== false);

        renderCards(allProducts);

        // ตรวจ ?product=ID จาก URL
        const urlParams  = new URLSearchParams(window.location.search);
        const preselect  = urlParams.get('product');
        if (preselect) {
            const prod = allProducts.find(p => p.id === preselect);
            if (prod) setTimeout(() => openOrderModal(prod), 600);
        }

    } catch (e) {
        console.error('Load products error:', e);
        container.innerHTML = `
            <div class="col-span-full glass-card-white p-8 text-center text-slate-400">
                โหลดสินค้าไม่สำเร็จ: ${e.message}
            </div>`;
    }
}

// ── Render product cards ──────────────────────────────────────────────────────
function renderCards(products) {
    const container = document.getElementById('plansContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass-card-white p-12 text-center">
                <div style="font-size:3rem;margin-bottom:1rem;">📦</div>
                <p style="font-weight:700;color:#374151;font-size:1.1rem;margin-bottom:0.25rem;">ยังไม่มีสินค้า</p>
                <p style="color:#94a3b8;font-size:0.875rem;">ผู้ดูแลระบบกำลังเพิ่มสินค้า กรุณารอสักครู่</p>
            </div>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const price    = p.price ? `฿${Number(p.price).toLocaleString()}` : 'ติดต่อ';
        const catBadge = p.category
            ? `<span style="position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.9);color:#0284c7;font-size:0.7rem;padding:4px 10px;border-radius:50px;font-weight:700;">${p.category}</span>`
            : '';
        const imgHtml  = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name || ''}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" class="product-img" loading="lazy"
                    onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e0f2fe,#e0e7ff);font-size:3.5rem;\\'>🌐</div>'">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e0f2fe,#e0e7ff);font-size:3.5rem;">🌐</div>`;
        const stockBadge = p.stock != null
            ? `<span style="font-size:0.72rem;color:#94a3b8;">คงเหลือ ${p.stock}</span>`
            : `<span style="font-size:0.72rem;color:#10b981;font-weight:600;">✓ พร้อมใช้งาน</span>`;

        // encode product data เพื่อส่งเข้า openOrderModal
        const dataAttr = encodeURIComponent(JSON.stringify({ id:p.id, name:p.name, description:p.description, price:p.price, imageUrl:p.imageUrl, category:p.category }));

        return `
        <article class="glass-card-white" style="overflow:hidden;display:flex;flex-direction:column;cursor:default;"
            onmouseenter="this.querySelector('.product-img')&&(this.querySelector('.product-img').style.transform='scale(1.05)')"
            onmouseleave="this.querySelector('.product-img')&&(this.querySelector('.product-img').style.transform='scale(1)')">
            <div style="position:relative;width:100%;height:220px;background:#f1f5f9;overflow:hidden;">
                ${imgHtml}
                ${catBadge}
            </div>
            <div style="padding:1.5rem;display:flex;flex-direction:column;flex:1;">
                <h3 style="font-weight:700;color:#1e293b;font-size:1.15rem;margin-bottom:0.5rem;">${p.name || 'ไม่มีชื่อ'}</h3>
                <p style="font-size:0.875rem;color:#64748b;flex:1;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
                    ${p.description || 'ไม่มีคำอธิบาย'}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(226,232,240,0.6);padding-top:1rem;">
                    <div>
                        <div style="color:#0284c7;font-weight:800;font-size:1.5rem;">${price}</div>
                        ${stockBadge}
                    </div>
                    <button data-product="${dataAttr}" onclick="openOrderModalFromBtn(this)"
                            class="btn-liquid"
                            style="padding:0.625rem 1.25rem;font-size:0.875rem;font-weight:600;border-radius:1rem;border:none;cursor:pointer;display:flex;align-items:center;gap:0.375rem;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        สั่งซื้อ
                    </button>
                </div>
            </div>
        </article>`;
    }).join('');
}

// ── Search ────────────────────────────────────────────────────────────────────
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        const filtered = q
            ? allProducts.filter(p =>
                (p.name||'').toLowerCase().includes(q) ||
                (p.description||'').toLowerCase().includes(q) ||
                (p.category||'').toLowerCase().includes(q))
            : allProducts;
        renderCards(filtered);
    });
}

// ── Order Modal ───────────────────────────────────────────────────────────────
window.openOrderModalFromBtn = function(btn) {
    try {
        const data = JSON.parse(decodeURIComponent(btn.dataset.product));
        openOrderModal(data);
    } catch(e) { console.error(e); }
};

function openOrderModal(product) {
    if (!currentUser) {
        window.showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');
        setTimeout(() => window.location.href = './login.html', 1200);
        return;
    }

    selectedProduct = product;
    selectedDays    = 30;

    document.getElementById('modalTitle').textContent  = `สั่งซื้อ: ${product.name}`;
    document.getElementById('modalDesc').textContent   = product.description || '';
    document.getElementById('modalPrice').textContent  = product.price ? `฿${Number(product.price).toLocaleString()}` : 'ติดต่อ';

    const imgEl = document.getElementById('modalProductImg');
    imgEl.innerHTML = product.imageUrl
        ? `<img src="${product.imageUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${product.name}">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e0f2fe,#e0e7ff);font-size:3rem;">🌐</div>`;

    // Show modal
    const modal = document.getElementById('orderModal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    setDuration(30);
}

window.closeOrderModal = function() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    selectedProduct = null;
};

window.setDuration = function(days) {
    selectedDays = days;

    document.querySelectorAll('.dur-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.days) === days);
    });

    if (selectedProduct?.price) {
        const total = selectedProduct.price * days;
        document.getElementById('modalDays').textContent  = `${days} วัน`;
        document.getElementById('modalTotal').textContent = `฿${total.toLocaleString()}`;
    } else {
        document.getElementById('modalDays').textContent  = `${days} วัน`;
        document.getElementById('modalTotal').textContent = 'ติดต่อแอดมิน';
    }
};

window.confirmOrder = async function() {
    if (!selectedProduct || !currentUser) return;

    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    btn.innerHTML = `<svg width="20" height="20" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25"/><path fill="currentColor" style="opacity:0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> กำลังสั่งซื้อ...`;

    try {
        const totalAmount = (selectedProduct.price || 0) * selectedDays;

        await addDoc(collection(db, 'orders'), {
            productId:    selectedProduct.id,
            productName:  selectedProduct.name,
            userId:       currentUser.uid,
            userEmail:    currentUser.email,
            durationDays: selectedDays,
            totalAmount,
            status:       'pending',
            type:         'website_rent',
            createdAt:    serverTimestamp()
        });

        window.showToast('สั่งซื้อสำเร็จ! รอการยืนยันจากแอดมิน', 'success');
        window.closeOrderModal();

    } catch (e) {
        console.error('Order error:', e);
        window.showToast('สั่งซื้อไม่สำเร็จ: ' + e.message, 'error');
        btn.disabled = false;
        btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ยืนยันคำสั่งซื้อ`;
    }
};

// close modal on backdrop click
document.getElementById('orderModal')?.addEventListener('click', function(e) {
    if (e.target === this) window.closeOrderModal();
});

// ── Global event listeners ────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profileDropdown');
    const trigger  = document.getElementById('profileTrigger');
    if (dropdown?.classList.contains('active')) {
        if (!dropdown.contains(e.target) && !(trigger && trigger.contains(e.target))) {
            closeDropdown();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDropdown();
        window.closeOrderModal?.();
        window.closeMobileMenu?.();
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────
// Show loading skeleton on auth section
const authLoading = document.getElementById('authLoading');
const guestButtons = document.getElementById('guestButtons');
const userProfile  = document.getElementById('userProfile');
if (authLoading)  authLoading.style.display  = 'flex';
if (guestButtons) guestButtons.style.display = 'none';
if (userProfile)  userProfile.style.display  = 'none';

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            currentUserData = snap.exists() ? snap.data() : {};
        } catch {
            currentUserData = {};
        }
        showUserUI(user, currentUserData);
        startBalanceListener(user.uid);
    } else {
        showGuestUI();
    }

    // โหลดสินค้า + ตั้ง search ทุกกรณี
    await loadProducts();
    setupSearch();
});
