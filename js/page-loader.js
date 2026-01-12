/* ============================================
   NALA AIRCON - PAGE LOADER
   Handle page transitions with loading animation
   ============================================ */

class PageLoader {
    constructor() {
        this.loader = null;
        this.isLoading = false;
        this.minLoadTime = 400; // Minimum loading time in ms
        this.init();
    }

    init() {
        // Create loader element
        this.createLoader();
        
        // Intercept navigation
        this.interceptNavigation();
        
        // Handle back/forward navigation
        window.addEventListener('popstate', () => this.show('Loading...'));
        
        console.log('🔄 PageLoader initialized');
    }

    createLoader() {
        // Create loader HTML
        const loaderHTML = `
            <div class="page-loader" id="pageLoader">
                <div class="loader-container">
                    <!-- AC Unit Loader -->
                    <div class="ac-loader">
                        <!-- Progress Ring -->
                        <div class="progress-ring">
                            <svg viewBox="0 0 110 110">
                                <circle class="bg" cx="55" cy="55" r="50"/>
                                <circle class="progress" cx="55" cy="55" r="50"/>
                            </svg>
                        </div>
                        
                        <!-- AC Unit -->
                        <div class="ac-unit">
                            <div class="ac-led"></div>
                        </div>
                        
                        <!-- Air Particles -->
                        <div class="air-particles">
                            <div class="air-particle"></div>
                            <div class="air-particle"></div>
                            <div class="air-particle"></div>
                            <div class="air-particle"></div>
                            <div class="air-particle"></div>
                        </div>
                    </div>
                    
                    <!-- Loading Text -->
                    <div class="loader-text">
                        <span>Memuat</span>
                        <span class="module-name" id="loaderModuleName">halaman</span>
                        <div class="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="loader-progress">
                    <div class="loader-progress-bar"></div>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', loaderHTML);
        this.loader = document.getElementById('pageLoader');
        this.moduleNameEl = document.getElementById('loaderModuleName');
    }

    interceptNavigation() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindLinks());
        } else {
            this.bindLinks();
        }
    }

    bindLinks() {
        // Get all sidebar navigation links
        const navLinks = document.querySelectorAll('.sidebar-nav a.nav-link, .sidebar a[href]');
        
        navLinks.forEach(link => {
            // Skip external links, anchors, and javascript: links
            const href = link.getAttribute('href');
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('javascript:') || 
                href.startsWith('http://') || 
                href.startsWith('https://') ||
                link.hasAttribute('data-no-loader')) {
                return;
            }

            // Add click handler
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(href, this.getModuleName(link));
            });
        });

        // Also intercept any links with data-module attribute
        const moduleLinks = document.querySelectorAll('[data-module]');
        moduleLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const moduleName = link.getAttribute('data-module') || this.getModuleName(link);
                    this.navigateTo(href, moduleName);
                });
            }
        });
    }

    getModuleName(link) {
        // Try to get module name from various sources
        const textEl = link.querySelector('.nav-text');
        if (textEl) return textEl.textContent.trim();
        
        const title = link.getAttribute('title');
        if (title) return title;
        
        const text = link.textContent.trim();
        if (text && text.length < 30) return text;
        
        return 'halaman';
    }

    async navigateTo(url, moduleName = 'halaman') {
        // Show loader
        this.show(moduleName);

        // Add transitioning class to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('transitioning');
        }

        // Wait minimum time for smooth UX
        const startTime = Date.now();
        
        // Navigate to new page
        await new Promise(resolve => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, this.minLoadTime - elapsed);
            
            setTimeout(() => {
                window.location.href = url;
                resolve();
            }, remainingTime);
        });
    }

    show(moduleName = 'halaman') {
        if (this.isLoading) return;
        this.isLoading = true;

        // Update module name
        if (this.moduleNameEl) {
            this.moduleNameEl.textContent = moduleName;
        }

        // Show loader
        if (this.loader) {
            this.loader.classList.add('active');
        }

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.isLoading = false;

        // Hide loader
        if (this.loader) {
            this.loader.classList.remove('active');
        }

        // Restore scrolling
        document.body.style.overflow = '';

        // Remove transitioning class
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('transitioning');
            mainContent.classList.add('page-enter');
            
            // Remove animation class after it completes
            setTimeout(() => {
                mainContent.classList.remove('page-enter');
            }, 400);
        }
    }

    // Force show loader (for manual use)
    forceShow(moduleName = 'halaman') {
        this.show(moduleName);
    }

    // Force hide loader (for manual use)
    forceHide() {
        this.hide();
    }
}

// Alternative Loader Styles
class LoaderStyles {
    static pulse(container) {
        container.innerHTML = `
            <div class="pulse-loader">
                <div class="pulse"></div>
                <div class="pulse"></div>
                <div class="pulse"></div>
                <div class="center">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </div>
            </div>
        `;
    }

    static snowflake(container) {
        container.innerHTML = `
            <div class="snowflake-spinner">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/>
                    <path d="m9 5-3-3M15 5l3-3M9 19l-3 3M15 19l3 3M5 9l-3-3M5 15l-3 3M19 9l3-3M19 15l3 3"/>
                </svg>
            </div>
        `;
    }

    static cube(container) {
        container.innerHTML = `
            <div class="cube-loader">
                <div class="cube">
                    <div class="face front"></div>
                    <div class="face back"></div>
                </div>
            </div>
        `;
    }
}

// Initialize page loader
let pageLoader;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pageLoader = new PageLoader();
    });
} else {
    pageLoader = new PageLoader();
}

// Hide loader when page is fully loaded (for direct access)
window.addEventListener('load', () => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
        if (pageLoader) {
            pageLoader.hide();
        }
    }, 100);
});

// Export for manual use
window.PageLoader = PageLoader;
window.pageLoader = pageLoader;
window.LoaderStyles = LoaderStyles;

// Utility function for programmatic navigation with loader
window.navigateWithLoader = function(url, moduleName) {
    if (pageLoader) {
        pageLoader.navigateTo(url, moduleName);
    } else {
        window.location.href = url;
    }
};
