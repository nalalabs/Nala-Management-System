/* ============================================
   NALA AIRCON - TOAST COMPONENT
   Toast notifications dan alerts
   ============================================ */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('toastStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'toastStyles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                top: var(--spacing-6);
                right: var(--spacing-6);
                z-index: var(--z-toast);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-3);
                max-width: 400px;
                pointer-events: none;
            }

            @media (max-width: 575px) {
                .toast-container {
                    top: var(--spacing-4);
                    right: var(--spacing-4);
                    left: var(--spacing-4);
                    max-width: none;
                }
            }

            .toast {
                display: flex;
                align-items: flex-start;
                gap: var(--spacing-3);
                padding: var(--spacing-4) var(--spacing-5);
                background: var(--bg-card);
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-xl);
                border-left: 4px solid var(--toast-color, var(--color-primary));
                pointer-events: auto;
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.hiding {
                transform: translateX(120%);
                opacity: 0;
            }

            .toast-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                color: var(--toast-color, var(--color-primary));
            }

            .toast-icon svg {
                width: 100%;
                height: 100%;
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-title {
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                margin-bottom: var(--spacing-1);
            }

            .toast-message {
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
                line-height: var(--line-height-normal);
            }

            .toast-close {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-muted);
                cursor: pointer;
                border-radius: var(--border-radius-sm);
                transition: all var(--transition-fast);
                flex-shrink: 0;
            }

            .toast-close:hover {
                background: var(--color-gray-100);
                color: var(--text-primary);
            }

            .toast-close svg {
                width: 16px;
                height: 16px;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--toast-color, var(--color-primary));
                border-radius: 0 0 0 var(--border-radius-lg);
                opacity: 0.3;
            }

            /* Toast Types */
            .toast.success { --toast-color: var(--color-success); }
            .toast.warning { --toast-color: var(--color-warning); }
            .toast.danger, .toast.error { --toast-color: var(--color-danger); }
            .toast.info { --toast-color: var(--color-info); }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @returns {string} Toast ID
     */
    show(options = {}) {
        const {
            title = '',
            message = '',
            type = 'info', // info, success, warning, danger/error
            duration = 5000, // ms, 0 for no auto-hide
            closable = true,
            showProgress = true,
            onClick = null
        } = options;

        const id = `toast_${Date.now()}`;
        
        const icons = {
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
        };

        const toastHTML = `
            <div class="toast ${type}" id="${id}" style="position: relative;">
                <div class="toast-icon">
                    ${icons[type] || icons.info}
                </div>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    ${message ? `<div class="toast-message">${message}</div>` : ''}
                </div>
                ${closable ? `
                    <button class="toast-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                    </button>
                ` : ''}
                ${showProgress && duration > 0 ? `
                    <div class="toast-progress" style="width: 100%; transition: width ${duration}ms linear;"></div>
                ` : ''}
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastEl = document.getElementById(id);
        
        // Store toast info
        this.toasts.push({ id, duration });

        // Bind events
        if (closable) {
            toastEl.querySelector('.toast-close')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(id);
            });
        }

        if (onClick) {
            toastEl.style.cursor = 'pointer';
            toastEl.addEventListener('click', onClick);
        }

        // Animate in
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
            
            // Start progress bar
            if (showProgress && duration > 0) {
                const progress = toastEl.querySelector('.toast-progress');
                if (progress) {
                    requestAnimationFrame(() => {
                        progress.style.width = '0%';
                    });
                }
            }
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    /**
     * Hide a toast
     * @param {string} id - Toast ID
     */
    hide(id) {
        const toastEl = document.getElementById(id);
        if (!toastEl) return;

        toastEl.classList.add('hiding');
        toastEl.classList.remove('show');

        setTimeout(() => {
            toastEl.remove();
            this.toasts = this.toasts.filter(t => t.id !== id);
        }, 300);
    }

    /**
     * Hide all toasts
     */
    hideAll() {
        [...this.toasts].forEach(toast => {
            this.hide(toast.id);
        });
    }

    // Shorthand methods
    success(message, title = 'Berhasil') {
        return this.show({ type: 'success', title, message });
    }

    error(message, title = 'Error') {
        return this.show({ type: 'danger', title, message });
    }

    warning(message, title = 'Peringatan') {
        return this.show({ type: 'warning', title, message });
    }

    info(message, title = 'Info') {
        return this.show({ type: 'info', title, message });
    }
}

// Initialize toast when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.toast = new Toast();
});
