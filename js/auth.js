/* ============================================
   NALA AIRCON - AUTHENTICATION
   Session management and auth checks
   ============================================ */

const NalaAuth = {
    // Session storage keys
    SESSION_KEY: 'nala_session',
    
    // Check if user is authenticated
    isAuthenticated() {
        const session = this.getSession();
        return session !== null;
    },
    
    // Get current session
    getSession() {
        // Check localStorage first (remember me)
        let session = localStorage.getItem(this.SESSION_KEY);
        if (!session) {
            // Then check sessionStorage
            session = sessionStorage.getItem(this.SESSION_KEY);
        }
        
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    // Get current user info
    getUser() {
        const session = this.getSession();
        if (session) {
            return {
                username: session.username,
                role: session.role,
                loginTime: session.loginTime
            };
        }
        return null;
    },
    
    // Check if user has specific role
    hasRole(role) {
        const user = this.getUser();
        if (!user) return false;
        
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    },
    
    // Logout user
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },
    
    // Redirect to login if not authenticated
    requireAuth(allowedRoles = null) {
        if (!this.isAuthenticated()) {
            // Store intended destination
            sessionStorage.setItem('nala_redirect', window.location.href);
            window.location.href = 'login.html';
            return false;
        }
        
        // Check role if specified
        if (allowedRoles && !this.hasRole(allowedRoles)) {
            console.warn('Access denied: insufficient permissions');
            // Optionally redirect to unauthorized page
            return false;
        }
        
        return true;
    },
    
    // Get greeting based on time of day
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    },
    
    // Display user info in header/sidebar
    displayUserInfo() {
        const user = this.getUser();
        if (!user) return;
        
        // Update username displays
        const usernameEls = document.querySelectorAll('[data-user-name]');
        usernameEls.forEach(el => {
            el.textContent = user.username;
        });
        
        // Update role displays
        const roleEls = document.querySelectorAll('[data-user-role]');
        roleEls.forEach(el => {
            const roleNames = {
                admin: 'Administrator',
                manager: 'Manager',
                finance: 'Finance'
            };
            el.textContent = roleNames[user.role] || user.role;
        });
        
        // Update greeting
        const greetingEls = document.querySelectorAll('[data-greeting]');
        greetingEls.forEach(el => {
            el.textContent = `${this.getGreeting()}, ${user.username}!`;
        });
    },
    
    // Initialize auth on page load
    init(options = {}) {
        const { requireAuth = true, allowedRoles = null } = options;
        
        if (requireAuth) {
            if (!this.requireAuth(allowedRoles)) {
                return false;
            }
        }
        
        // Display user info
        this.displayUserInfo();
        
        // Setup logout buttons
        const logoutBtns = document.querySelectorAll('[data-logout]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
        
        return true;
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the login page
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!isLoginPage) {
        // Require auth for all other pages
        NalaAuth.init({ requireAuth: true });
    }
});

// Export for global use
window.NalaAuth = NalaAuth;
