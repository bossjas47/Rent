### แก้ใน homerent.html ค้นหา  <div id="sidebarAuthUser" class="sidebar-auth-section" style="display:none;">  และเพิ่มเมนูก่อนปุ่ม "ออกจากระบบ":

```html
<div id="sidebarAuthUser" class="sidebar-auth-section" style="display:none;">
    <p class="sidebar-section-label">บัญชีของฉัน</p>
    <a href="./profile.html" class="sidebar-item">
        <span class="sidebar-item-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></span>
        โปรไฟล์
    </a>
    <a href="./orders.html" class="sidebar-item">
        <span class="sidebar-item-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg></span>
        ประวัติการสั่งซื้อ
    </a>
    <a href="./topup.html" class="sidebar-item">
        <span class="sidebar-item-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg></span>
        เติมเงิน
    </a>
    <!-- เพิ่มเมนูนี้ -->
    <a href="./topup.html" class="sidebar-item">
        <span class="sidebar-item-icon" style="color: #f59e0b;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
        </span>
        <span style="color: #d97706; font-weight: 600;">อัปเกรด</span>
    </a>
    <button onclick="window.handleLogout()" class="sidebar-item sidebar-logout">
        <span class="sidebar-item-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
        ออกจากระบบ
    </button>
</div>

```
### แก้ homerent.html 
```css
.glass-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    /* แก้ตรงนี้: จาก right: 0 เป็น left: 0 */
    left: 0;
    right: auto;
    width: 280px;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    z-index: 200;
    /* แก้ transform-origin ด้วย */
    transform-origin: top left;
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.glass-dropdown.active {
    transform: scale(1) translateY(0);
    opacity: 1;
    visibility: visible;
}

/* สำหรับ mobile ให้ชิดขวาเหมือนเดิมเพื่อไม่ให้ล้นจอซ้าย */
@media (max-width: 640px) {
    .glass-dropdown {
        left: auto;
        right: 0;
        transform-origin: top right;
        width: 260px;
    }
}

```
