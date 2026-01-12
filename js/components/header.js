/* ============================================
   NALA AIRCON - HEADER COMPONENT
   Top navigation bar dan interaksi
   ============================================ */

class Header {
    constructor() {
        this.header = document.getElementById('header');
        this.timeElement = document.getElementById('headerTime');
        this.dateElement = document.getElementById('headerDate');
        this.searchInput = document.getElementById('headerSearch');
        this.userDropdown = document.getElementById('userDropdown');
        this.notificationBtn = document.getElementById('notificationBtn');
        this.syncStatus = document.getElementById('syncStatus');
        
        this.currentUser = null;
        this.notifications = [];
        
        this.init();
    }

    init() {
        // Start clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Bind events
        this.bindEvents();

        // Load user info
        this.loadUserInfo();
    }

    bindEvents() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.searchInput.value = '';
                    this.searchInput.blur();
                }
            });
        }

        // User dropdown
        if (this.userDropdown) {
            const trigger = this.userDropdown.querySelector('.header-user');
            if (trigger) {
                trigger.addEventListener('click', () => this.toggleUserDropdown());
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.userDropdown.contains(e.target)) {
                    this.closeUserDropdown();
                }
            });
        }

        // Notification button
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => this.toggleNotifications());
        }

        // Keyboard shortcut for search (Ctrl + K)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.searchInput?.focus();
            }
        });
    }

    updateClock() {
        const now = new Date();
        
        if (this.timeElement) {
            this.timeElement.textContent = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        if (this.dateElement) {
            this.dateElement.textContent = now.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    handleSearch(query) {
        if (query.length < 2) return;

        // Emit search event
        window.dispatchEvent(new CustomEvent('globalSearch', {
            detail: { query }
        }));

        console.log('Searching:', query);
    }

    toggleUserDropdown() {
        this.userDropdown.classList.toggle('active');
    }

    closeUserDropdown() {
        this.userDropdown.classList.remove('active');
    }

    toggleNotifications() {
        // TODO: Implement notification panel
        console.log('Toggle notifications');
    }

    loadUserInfo() {
        // Get user from storage
        const userData = storage.get(CONFIG.storageKeys.user);
        
        if (userData) {
            this.currentUser = userData;
            this.updateUserDisplay();
        } else {
            // Default user for demo
            this.currentUser = {
                id: 'demo_user',
                name: 'Administrator',
                email: 'admin@nalaaircon.com',
                role: 'admin',
                avatar: null
            };
            this.updateUserDisplay();
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        // Update header user display
        const nameEl = document.querySelector('.header-user-name');
        const roleEl = document.querySelector('.header-user-role');
        const avatarEl = document.querySelector('.header-user-avatar');

        if (nameEl) nameEl.textContent = this.currentUser.name;
        if (roleEl) roleEl.textContent = CONFIG.roles[this.currentUser.role]?.name || 'User';
        if (avatarEl) avatarEl.textContent = getInitials(this.currentUser.name);

        // Update sidebar user display
        const sidebarName = document.querySelector('.sidebar-user-name');
        const sidebarRole = document.querySelector('.sidebar-user-role');
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');

        if (sidebarName) sidebarName.textContent = this.currentUser.name;
        if (sidebarRole) sidebarRole.textContent = CONFIG.roles[this.currentUser.role]?.name || 'User';
        if (sidebarAvatar) sidebarAvatar.textContent = getInitials(this.currentUser.name);
    }

    // Sync status methods
    setSyncStatus(status) {
        if (!this.syncStatus) return;

        this.syncStatus.classList.remove('syncing', 'error');
        
        switch (status) {
            case 'syncing':
                this.syncStatus.classList.add('syncing');
                this.syncStatus.innerHTML = `
                    <span class="sync-status-dot"></span>
                    <span>Syncing...</span>
                `;
                break;
            case 'error':
                this.syncStatus.classList.add('error');
                this.syncStatus.innerHTML = `
                    <span class="sync-status-dot"></span>
                    <span>Sync Error</span>
                `;
                break;
            case 'synced':
            default:
                this.syncStatus.innerHTML = `
                    <span class="sync-status-dot"></span>
                    <span>Synced</span>
                `;
                break;
        }
    }

    // Update notification badge
    updateNotificationBadge(count) {
        if (!this.notificationBtn) return;

        let badge = this.notificationBtn.querySelector('.badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge';
                this.notificationBtn.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count;
        } else if (badge) {
            badge.remove();
        }
    }

    // Set page title in header
    setPageTitle(title, subtitle = null) {
        const titleEl = document.querySelector('.page-title');
        const subtitleEl = document.querySelector('.page-subtitle');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) {
            subtitleEl.textContent = subtitle || '';
            subtitleEl.style.display = subtitle ? 'block' : 'none';
        }

        // Update document title
        document.title = `${title} - ${CONFIG.app.name}`;
    }

    // Logout
    logout() {
        storage.remove(CONFIG.storageKeys.user);
        storage.remove(CONFIG.storageKeys.token);
        window.location.href = '/login.html';
    }
}

// Initialize header when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.header = new Header();
});
