### แก้ใน homerent.html

```html
<div class="action-btns">
    <button class="btn-action btn-black">
        <i class="fa-solid fa-plus" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"></i>
        สร้างร้านค้า
    </button>
    <button class="btn-action btn-white">
        <i class="fa-solid fa-filter" style="color: #38bdf8;"></i>
        ฟิลเตอร์
    </button>
    <button class="btn-action btn-white">
        <i class="fa-solid fa-eye" style="color: #818cf8;"></i>
        แสดงคอลัมน์
    </button>
</div>

```

### แก้ใน homerent.css
```css
<style>
    :root {
        --glass-bg: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(255, 255, 255, 0.9);
        --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    }
    
    html, body {
        overflow-x: hidden;
        width: 100%;
        max-width: 100%;
    }
    
    body {
        background: linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 50%, #f8fafc 100%);
        background-attachment: fixed;
        min-height: 100vh;
    }

    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px 16px;
    }
    
    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 24px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(12px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.8);
        width: fit-content;
    }
    
    .breadcrumb a { 
        color: #0ea5e9; 
        font-weight: 500;
        transition: all 0.2s;
    }
    .breadcrumb a:hover { color: #0284c7; }
    .breadcrumb span { color: #94a3b8; }

    /* Liquid Glass Search Bar */
    .search-bar-container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.6);
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }
    
    .search-bar-container:focus-within {
        box-shadow: 0 8px 30px rgba(56, 189, 248, 0.15), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.6);
        border-color: rgba(56, 189, 248, 0.3);
        transform: translateY(-1px);
    }
    
    .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 1rem;
        color: #1e293b;
        background: transparent;
        font-family: 'Prompt', sans-serif;
    }
    .search-input::placeholder { color: #94a3b8; }

    /* Liquid Glass Action Buttons */
    .action-btns {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }
    
    .btn-action {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 100px;
        font-weight: 600;
        font-size: 0.9375rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        cursor: pointer;
        font-family: 'Prompt', sans-serif;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .btn-action:active {
        transform: translateY(0);
    }

    .btn-black {
        background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
    }
    
    .btn-black:hover {
        box-shadow: 0 8px 25px rgba(56, 189, 248, 0.4);
    }
    
    .btn-white {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        color: #475569;
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .btn-white:hover {
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
    
    /* Liquid Glass Data Table */
    .data-table-container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.9);
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    
    .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        text-align: left;
    }
    
    .data-table th {
        padding: 18px 20px;
        background: rgba(241, 245, 249, 0.6);
        color: #64748b;
        font-weight: 600;
        font-size: 0.875rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.6);
        backdrop-filter: blur(10px);
    }
    
    .data-table td {
        padding: 18px 20px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.4);
        color: #334155;
        font-size: 0.9375rem;
        transition: background 0.2s;
    }
    
    .data-table tr:hover td {
        background: rgba(56, 189, 248, 0.03);
    }
    
    .data-table tr:last-child td {
        border-bottom: none;
    }
    
    /* Glass Empty State */
    .empty-state {
        padding: 80px 20px;
        text-align: center;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        margin: 20px;
        border: 2px dashed rgba(148, 163, 184, 0.3);
    }
    
    /* Liquid Glass Pagination */
    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        background: rgba(241, 245, 249, 0.5);
        border-top: 1px solid rgba(226, 232, 240, 0.6);
        color: #64748b;
        font-size: 0.875rem;
        backdrop-filter: blur(10px);
    }
    
    .btn-page {
        padding: 8px 18px;
        border-radius: 12px;
        border: 1px solid rgba(226, 232, 240, 0.8);
        background: rgba(255, 255, 255, 0.7);
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
        color: #475569;
        backdrop-filter: blur(10px);
    }
    
    .btn-page:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(56, 189, 248, 0.4);
        color: #0ea5e9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .btn-page:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: rgba(241, 245, 249, 0.4);
    }

    /* Profile Dropdown Standard - Right Aligned */
    .profile-dropdown-container {
        position: relative;
    }
    
    .glass-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 280px;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 100;
        transform: scale(0.95) translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(20px);
    }
    
    .glass-dropdown.active {
        transform: scale(1) translateY(0);
        opacity: 1;
        visibility: visible;
    }
    
    /* Hamburger Animation */
    .hamburger-btn {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 8px;
        transition: all 0.3s ease;
        border-radius: 10px;
        align-items: center;
        justify-content: center;
    }
    
    .hamburger-btn:hover {
        background: rgba(255, 255, 255, 0.9);
    }
    
    .hamburger-bar {
        width: 18px;
        height: 2px;
        background: linear-gradient(90deg, #38bdf8, #818cf8);
        border-radius: 2px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
    }
    
    .hamburger-btn.active .hamburger-bar:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
    }
    
    .hamburger-btn.active .hamburger-bar:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
    }
    
    .hamburger-btn.active .hamburger-bar:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        margin: 2px 8px;
        color: #475569;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        border-radius: 8px;
    }
    
    .dropdown-item:hover {
        background: rgba(56, 189, 248, 0.08);
        color: #0ea5e9;
    }
    
    .logout-item {
        color: #ef4444 !important;
        border-top: 1px solid rgba(226, 232, 240, 0.6);
        margin-top: 4px !important;
        border-radius: 0 0 8px 8px !important;
    }
    
    .logout-item:hover {
        background: rgba(239, 68, 68, 0.05) !important;
    }

    .profile-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(226, 232, 240, 0.6);
        border-radius: 100px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        backdrop-filter: blur(10px);
    }
    
    .profile-trigger:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(56, 189, 248, 0.3);
        box-shadow: 0 4px 12px rgba(56, 189, 248, 0.1);
    }
    
    .profile-trigger.active {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(56, 189, 248, 0.5);
    }

    .balance-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: rgba(56, 189, 248, 0.1);
        color: #0ea5e9;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba(56, 189, 248, 0.2);
    }
    
    .avatar-glass {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
        color: white;
        border-radius: 50%;
        font-weight: 700;
        font-size: 0.875rem;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(56, 189, 248, 0.3);
    }

    /* Responsive */
    @media (max-width: 640px) {
        .action-btns {
            justify-content: stretch;
        }
        
        .btn-action {
            flex: 1;
            justify-content: center;
        }
        
        .data-table th,
        .data-table td {
            padding: 14px 16px;
        }
    }
</style>

```
### แก้ใน homerent.css เพิ่มใน style
```css
/* Shimmer effect for empty state */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.empty-state {
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.6) 50%,
        rgba(255, 255, 255, 0.4) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
}

```