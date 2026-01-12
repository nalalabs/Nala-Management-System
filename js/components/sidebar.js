/* ============================================
   NALA AIRCON - SIDEBAR COMPONENT
   Sidebar navigation dan interaksi
   ============================================ */

class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('sidebarToggle');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.mobileOverlay = document.getElementById('mobileOverlay');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.isCollapsed = storage.get(CONFIG.storageKeys.sidebarState) || false;
        
        this.init();
    }

    init() {
        // Set initial state
        if (this.isCollapsed) {
            this.collapse();
        }

        // Bind events
        this.bindEvents();

        // Set active nav item
        this.setActiveNav();
    }

    bindEvents() {
        // Desktop toggle
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Mobile toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobile());
        }

        // Mobile overlay click
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => this.closeMobile());
        }

        // Nav link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        // Keyboard shortcut (Ctrl + B)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close mobile sidebar on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                this.closeMobile();
            }
        });
    }

    toggle() {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    collapse() {
        this.sidebar.classList.add('collapsed');
        this.mainContent.classList.add('sidebar-collapsed');
        this.isCollapsed = true;
        storage.set(CONFIG.storageKeys.sidebarState, true);
    }

    expand() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
        this.isCollapsed = false;
        storage.set(CONFIG.storageKeys.sidebarState, false);
    }

    toggleMobile() {
        this.sidebar.classList.toggle('mobile-open');
        this.mobileOverlay.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    }

    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        this.mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleNavClick(e, link) {
        // Remove active from all links
        this.navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active to clicked link
        link.classList.add('active');

        // Close mobile sidebar after click
        if (window.innerWidth <= 991) {
            setTimeout(() => this.closeMobile(), 150);
        }

        // Get module info
        const moduleId = link.dataset.module;
        if (moduleId) {
            const module = getModule(moduleId);
            if (module) {
                // Emit event for page loading
                window.dispatchEvent(new CustomEvent('moduleChange', { 
                    detail: { module } 
                }));
            }
        }
    }

    setActiveNav() {
        // Get current page from URL
        const currentPath = window.location.pathname;
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                link.classList.add('active');
            }
        });

        // Default to dashboard if no match
        if (!document.querySelector('.nav-link.active')) {
            const dashboardLink = document.querySelector('.nav-link[data-module="dashboard"]');
            if (dashboardLink) {
                dashboardLink.classList.add('active');
            }
        }
    }

    // Update badge count
    updateBadge(moduleId, count) {
        const link = document.querySelector(`.nav-link[data-module="${moduleId}"]`);
        if (link) {
            let badge = link.querySelector('.nav-badge');
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'nav-badge';
                    link.appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count;
            } else if (badge) {
                badge.remove();
            }
        }
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sidebar = new Sidebar();
});
