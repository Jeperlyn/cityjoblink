<!-- Toast Container -->
<div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"></div>

<script>
    /**
     * Toast Notification System
     * Handles showing, hiding, and managing toast notifications
     */
    window.Toast = (function() {
        const container = document.getElementById('toast-container');
        const toasts = new Map();
        let toastId = 0;

        /**
         * Create and display a toast notification
         * @param {string} message - The notification message
         * @param {string} type - Type: 'success', 'error', 'warning', 'info'
         * @param {number} duration - Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
         * @returns {number} Toast ID for manual control
         */
        function show(message, type = 'info', duration = 5000) {
            const id = ++toastId;
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = 'toast-item pointer-events-auto';
            toast.setAttribute('data-toast-id', id);
            
            // Get icon and colors based on type
            const { icon, bgColor, borderColor, textColor, iconColor } = getStylesByType(type);
            
            toast.innerHTML = `
                <div class="flex items-start gap-3 p-4 rounded-lg ${bgColor} border ${borderColor} shadow-lg animate-slide-in">
                    <div class="${iconColor} flex-shrink-0 mt-0.5">
                        ${icon}
                    </div>
                    <div class="flex-1 ${textColor} text-sm font-medium break-words">
                        ${escapeHtml(message)}
                    </div>
                    <button class="close-btn flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity" 
                            aria-label="Close notification">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add close button handler
            const closeBtn = toast.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => dismiss(id));
            
            // Add to container
            container.appendChild(toast);
            toasts.set(id, { element: toast, timeout: null });
            
            // Auto-dismiss if duration > 0
            if (duration > 0) {
                const timeout = setTimeout(() => dismiss(id), duration);
                toasts.get(id).timeout = timeout;
            }
            
            return id;
        }

        /**
         * Dismiss a specific toast
         * @param {number} id - Toast ID to dismiss
         */
        function dismiss(id) {
            const toastData = toasts.get(id);
            if (!toastData) return;
            
            const { element, timeout } = toastData;
            
            // Clear timeout if exists
            if (timeout) clearTimeout(timeout);
            
            // Add fade-out animation
            element.classList.add('animate-slide-out');
            
            // Remove after animation completes
            setTimeout(() => {
                element.remove();
                toasts.delete(id);
            }, 300);
        }

        /**
         * Dismiss all toasts
         */
        function dismissAll() {
            toasts.forEach((_, id) => dismiss(id));
        }

        /**
         * Get styling information based on notification type
         */
        function getStylesByType(type) {
            const styles = {
                success: {
                    icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    borderColor: 'border-green-200 dark:border-green-700',
                    textColor: 'text-green-800 dark:text-green-200',
                    iconColor: 'text-green-600 dark:text-green-400'
                },
                error: {
                    icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-700',
                    textColor: 'text-red-800 dark:text-red-200',
                    iconColor: 'text-red-600 dark:text-red-400'
                },
                warning: {
                    icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    borderColor: 'border-yellow-200 dark:border-yellow-700',
                    textColor: 'text-yellow-800 dark:text-yellow-200',
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                },
                info: {
                    icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-700',
                    textColor: 'text-blue-800 dark:text-blue-200',
                    iconColor: 'text-blue-600 dark:text-blue-400'
                }
            };
            
            return styles[type] || styles.info;
        }

        /**
         * Escape HTML to prevent XSS
         */
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Public API
        return {
            show,
            dismiss,
            dismissAll,
            success: (msg, duration = 5000) => show(msg, 'success', duration),
            error: (msg, duration = 5000) => show(msg, 'error', duration),
            warning: (msg, duration = 5000) => show(msg, 'warning', duration),
            info: (msg, duration = 5000) => show(msg, 'info', duration)
        };
    })();
</script>

<style>
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(420px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(420px);
        }
    }

    .animate-slide-in {
        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .animate-slide-out {
        animation: slideOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @media (prefers-reduced-motion: reduce) {
        .animate-slide-in,
        .animate-slide-out {
            animation: none !important;
        }
    }
</style>
