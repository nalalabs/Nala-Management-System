/* ============================================
   NALA AIRCON - MODAL COMPONENT
   Dialog, popup, dan confirmation modals
   ============================================ */

class Modal {
    constructor() {
        this.activeModals = [];
        this.init();
    }

    init() {
        // Create modal container if not exists
        if (!document.getElementById('modalContainer')) {
            const container = document.createElement('div');
            container.id = 'modalContainer';
            document.body.appendChild(container);
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                this.close();
            }
        });
    }

    /**
     * Open a modal
     * @param {Object} options - Modal options
     */
    open(options = {}) {
        const {
            id = `modal_${Date.now()}`,
            title = '',
            content = '',
            size = 'md', // sm, md, lg, xl
            closable = true,
            footer = null,
            onOpen = null,
            onClose = null
        } = options;

        const modalHTML = `
            <div class="nala-modal-backdrop" id="${id}" data-closable="${closable}">
                <div class="nala-modal nala-modal-${size}">
                    <div class="nala-modal-header">
                        <h3 class="nala-modal-title">${title}</h3>
                        ${closable ? `
                            <button class="nala-modal-close" data-action="close">
                                ${Cards.getIcon('x')}
                            </button>
                        ` : ''}
                    </div>
                    <div class="nala-modal-body">
                        ${content}
                    </div>
                    ${footer ? `
                        <div class="nala-modal-footer">
                            ${footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.insertAdjacentHTML('beforeend', modalHTML);

        const modalEl = document.getElementById(id);
        
        // Add to active modals
        this.activeModals.push({ id, onClose });

        // Bind close events
        if (closable) {
            modalEl.querySelector('.nala-modal-close')?.addEventListener('click', () => this.close(id));
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    this.close(id);
                }
            });
        }

        // Animate in
        requestAnimationFrame(() => {
            modalEl.classList.add('active');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Callback
        if (onOpen) onOpen(modalEl);

        return id;
    }

    /**
     * Close modal
     * @param {string} id - Modal ID (optional, closes last if not provided)
     */
    close(id = null) {
        if (this.activeModals.length === 0) return;

        const modalInfo = id 
            ? this.activeModals.find(m => m.id === id)
            : this.activeModals[this.activeModals.length - 1];

        if (!modalInfo) return;

        const modalEl = document.getElementById(modalInfo.id);
        if (!modalEl) return;

        // Check if closable
        if (modalEl.dataset.closable === 'false' && !id) return;

        // Animate out
        modalEl.classList.remove('active');

        // Remove after animation
        setTimeout(() => {
            modalEl.remove();
            
            // Remove from active modals
            this.activeModals = this.activeModals.filter(m => m.id !== modalInfo.id);

            // Restore body scroll if no more modals
            if (this.activeModals.length === 0) {
                document.body.style.overflow = '';
            }

            // Callback
            if (modalInfo.onClose) modalInfo.onClose();
        }, 250);
    }

    /**
     * Close all modals
     */
    closeAll() {
        [...this.activeModals].forEach(modal => {
            this.close(modal.id);
        });
    }

    /**
     * Confirm dialog
     * @param {Object} options - Confirm options
     * @returns {Promise<boolean>}
     */
    confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Konfirmasi',
                message = 'Apakah Anda yakin?',
                confirmText = 'Ya, Lanjutkan',
                cancelText = 'Batal',
                confirmClass = 'btn-primary',
                icon = 'alert'
            } = options;

            const content = `
                <div class="text-center">
                    <div class="empty-card-icon" style="margin: 0 auto var(--spacing-4);">
                        ${Cards.getIcon(icon)}
                    </div>
                    <p class="text-secondary mb-0">${message}</p>
                </div>
            `;

            const footer = `
                <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                <button class="btn ${confirmClass}" data-action="confirm">${confirmText}</button>
            `;

            const modalId = this.open({
                title,
                content,
                footer,
                size: 'sm',
                closable: true,
                onClose: () => resolve(false)
            });

            const modalEl = document.getElementById(modalId);
            
            modalEl.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close(modalId);
                resolve(false);
            });

            modalEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.close(modalId);
                resolve(true);
            });
        });
    }

    /**
     * Alert dialog
     * @param {Object} options - Alert options
     * @returns {Promise<void>}
     */
    alert(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Informasi',
                message = '',
                buttonText = 'OK',
                type = 'info' // info, success, warning, danger
            } = options;

            const icons = {
                info: 'info',
                success: 'check',
                warning: 'alert',
                danger: 'x'
            };

            const colors = {
                info: 'var(--color-info)',
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                danger: 'var(--color-danger)'
            };

            const content = `
                <div class="text-center">
                    <div class="empty-card-icon" style="margin: 0 auto var(--spacing-4); background: ${colors[type]}20;">
                        <svg style="color: ${colors[type]};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${Cards.getIcon(icons[type]).match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1] || ''}
                        </svg>
                    </div>
                    <p class="text-secondary mb-0">${message}</p>
                </div>
            `;

            const footer = `
                <button class="btn btn-primary" data-action="ok">${buttonText}</button>
            `;

            const modalId = this.open({
                title,
                content,
                footer,
                size: 'sm',
                closable: true,
                onClose: () => resolve()
            });

            const modalEl = document.getElementById(modalId);
            modalEl.querySelector('[data-action="ok"]').addEventListener('click', () => {
                this.close(modalId);
                resolve();
            });
        });
    }

    /**
     * Prompt dialog
     * @param {Object} options - Prompt options
     * @returns {Promise<string|null>}
     */
    prompt(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Input',
                message = '',
                placeholder = '',
                defaultValue = '',
                confirmText = 'OK',
                cancelText = 'Batal',
                inputType = 'text'
            } = options;

            const content = `
                <div>
                    ${message ? `<p class="text-secondary mb-4">${message}</p>` : ''}
                    <input type="${inputType}" class="form-input" id="promptInput" 
                           placeholder="${placeholder}" value="${defaultValue}">
                </div>
            `;

            const footer = `
                <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
            `;

            const modalId = this.open({
                title,
                content,
                footer,
                size: 'sm',
                closable: true,
                onClose: () => resolve(null),
                onOpen: (el) => {
                    setTimeout(() => {
                        el.querySelector('#promptInput')?.focus();
                    }, 100);
                }
            });

            const modalEl = document.getElementById(modalId);
            const input = modalEl.querySelector('#promptInput');

            // Enter key submits
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.close(modalId);
                    resolve(input.value);
                }
            });

            modalEl.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close(modalId);
                resolve(null);
            });

            modalEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.close(modalId);
                resolve(input.value);
            });
        });
    }

    /**
     * Form modal
     * @param {Object} options - Form options
     * @returns {Promise<Object|null>}
     */
    form(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Form',
                fields = [],
                confirmText = 'Simpan',
                cancelText = 'Batal',
                size = 'md'
            } = options;

            let content = '<form id="modalForm">';
            
            fields.forEach(field => {
                content += `
                    <div class="form-group">
                        <label class="form-label ${field.required ? 'required' : ''}">${field.label}</label>
                `;

                switch (field.type) {
                    case 'select':
                        content += `
                            <select class="form-select" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">Pilih ${field.label}</option>
                                ${field.options.map(opt => `
                                    <option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>
                                        ${opt.label}
                                    </option>
                                `).join('')}
                            </select>
                        `;
                        break;
                    case 'textarea':
                        content += `
                            <textarea class="form-textarea" name="${field.name}" 
                                placeholder="${field.placeholder || ''}" 
                                ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
                        `;
                        break;
                    default:
                        content += `
                            <input type="${field.type || 'text'}" class="form-input" name="${field.name}"
                                placeholder="${field.placeholder || ''}"
                                value="${field.value || ''}"
                                ${field.required ? 'required' : ''}>
                        `;
                }

                if (field.hint) {
                    content += `<span class="form-hint">${field.hint}</span>`;
                }

                content += '</div>';
            });

            content += '</form>';

            const footer = `
                <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                <button class="btn btn-primary" data-action="submit">${confirmText}</button>
            `;

            const modalId = this.open({
                title,
                content,
                footer,
                size,
                closable: true,
                onClose: () => resolve(null)
            });

            const modalEl = document.getElementById(modalId);
            const form = modalEl.querySelector('#modalForm');

            modalEl.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close(modalId);
                resolve(null);
            });

            modalEl.querySelector('[data-action="submit"]').addEventListener('click', () => {
                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    this.close(modalId);
                    resolve(data);
                } else {
                    form.reportValidity();
                }
            });
        });
    }
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.modal = new Modal();
});
