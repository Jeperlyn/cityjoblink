/**
 * Toast Notification System
 * Reusable, production-ready toast notifications with auto-dismiss and manual close
 * 
 * Usage:
 *   Toast.show('Success message', 'success');
 *   Toast.show('Error message', 'error');
 *   Toast.show('Warning message', 'warning');
 *   Toast.show('Info message', 'info');
 */

class Toast {
    /**
     * Toast configuration
     */
    static config = {
        container: '#toast-container',
        duration: 5000, // Auto-dismiss after 5 seconds
        animationDuration: 300, // Fade/slide animation duration
    };

    /**
     * Show a toast notification
     * @param {string} message - The notification message
     * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
     * @param {object} options - Optional configuration overrides
     */
    static show(message, type = 'info', options = {}) {
        const config = { ...this.config, ...options };
        const container = document.querySelector(config.container);

        if (!container) {
            console.error('Toast container not found');
            return;
        }

        // Create toast element
        const toast = this.createToastElement(message, type);

        // Add to container
        container.appendChild(toast);

        // Trigger animation (small delay for CSS animation to register)
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        // Auto-dismiss
        const timeout = setTimeout(() => {
            this.dismiss(toast);
        }, config.duration);

        // Allow manual close button to clear timeout
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeout);
                this.dismiss(toast);
            });
        }

        return toast;
    }

    /**
     * Create toast DOM element
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     */
    static createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const typeConfig = this.getTypeConfig(type);

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${typeConfig.icon}
                </div>
                <div class="toast-message">
                    ${message}
                </div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        `;

        return toast;
    }

    /**
     * Get configuration for toast type
     * @param {string} type - Toast type
     * @returns {object} Type configuration with icon and colors
     */
    static getTypeConfig(type) {
        const configs = {
            success: {
                icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
            },
            error: {
                icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
            },
            warning: {
                icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
            },
            info: {
                icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
            },
        };

        return configs[type] || configs.info;
    }

    /**
     * Dismiss a toast notification
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    static dismiss(toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');

        setTimeout(() => {
            toast.remove();
        }, this.config.animationDuration);
    }

    /**
     * Dismiss all toasts
     */
    static dismissAll() {
        const container = document.querySelector(this.config.container);
        if (container) {
            const toasts = container.querySelectorAll('.toast');
            toasts.forEach(toast => this.dismiss(toast));
        }
    }

    /**
     * Convenience methods
     */
    static success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    static error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    static warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    static info(message, options = {}) {
        return this.show(message, 'info', options);
    }
}

/**
 * Make Toast globally available
 */
window.Toast = Toast;
