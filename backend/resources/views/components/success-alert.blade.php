<!-- Success Alert Container -->
<div id="success-alert-overlay" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center hidden opacity-0 transition-opacity duration-300" onclick="if(event.target === this) SuccessAlert.close();">
</div>

<div id="success-alert-modal" class="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none opacity-0 transform scale-95 transition-all duration-300">
    <div class="w-full max-w-sm mx-4 bg-white rounded-[3rem] p-10 shadow-2xl pointer-events-auto">
        <!-- SVG Checkmark with Animation -->
        <div class="flex justify-center mb-8">
            <svg class="w-20 h-20 text-green-500" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" id="success-checkmark">
                <!-- Circle background -->
                <circle cx="50" cy="50" r="45" class="fill-none stroke-green-100 stroke-[3]"/>
                
                <!-- Animated checkmark -->
                <path 
                    d="M 30 50 L 45 65 L 70 35" 
                    class="fill-none stroke-green-500 stroke-[4] stroke-linecap-round stroke-linejoin-round"
                    stroke-dasharray="50"
                    stroke-dashoffset="50"
                    id="checkmark-path"
                />
            </svg>
        </div>

        <!-- Message -->
        <div id="success-message" class="text-center mb-8">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight mb-2">Success!</h2>
            <p id="success-text" class="text-gray-600 text-sm leading-relaxed">Operation completed successfully.</p>
        </div>

        <!-- OK Button -->
        <button 
            onclick="SuccessAlert.close()" 
            class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl uppercase tracking-wider transition-colors duration-200 shadow-lg">
            OK
        </button>
    </div>
</div>

<script>
    /**
     * Success Alert System
     * Displays an animated success modal with SVG checkmark animation
     */
    window.SuccessAlert = (function() {
        const overlay = document.getElementById('success-alert-overlay');
        const modal = document.getElementById('success-alert-modal');
        const messageP = document.getElementById('success-text');
        const checkmarkPath = document.getElementById('checkmark-path');

        /**
         * Show success alert with animated checkmark
         * @param {string} message - The success message to display
         * @param {function} callback - Optional callback when alert is closed
         */
        function show(message = 'Operation completed successfully.', callback = null) {
            // Update message
            messageP.textContent = message;

            // Reset animation
            if (checkmarkPath) {
                checkmarkPath.style.animation = 'none';
                // Trigger reflow to restart animation
                void checkmarkPath.offsetWidth;
                checkmarkPath.style.animation = null;
            }

            // Show overlay and modal
            overlay.classList.remove('hidden');
            modal.classList.remove('pointer-events-none');

            // Trigger animation
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                modal.classList.remove('opacity-0', 'scale-95');
            }, 10);

            // Store callback
            modal.dataset.callback = callback ? 'true' : 'false';
            if (callback) {
                modal.dataset.callbackFn = callback.toString();
            }
        }

        /**
         * Close the alert
         */
        function close() {
            // Hide animation
            overlay.classList.add('opacity-0');
            modal.classList.add('opacity-0', 'scale-95');

            // Hide after animation
            setTimeout(() => {
                overlay.classList.add('hidden');
                modal.classList.add('pointer-events-none');
                
                // Execute callback if provided
                const hasCallback = modal.dataset.callback === 'true';
                if (hasCallback && modal.dataset.callbackFn) {
                    try {
                        const fn = eval('(' + modal.dataset.callbackFn + ')');
                        fn();
                    } catch (e) {
                        console.error('Error executing callback:', e);
                    }
                }
            }, 300);
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                close();
            }
        });

        return {
            show,
            close
        };
    })();
</script>

<style>
    #checkmark-path {
        animation: animateCheckmark 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    }

    @keyframes animateCheckmark {
        from {
            stroke-dashoffset: 50;
            opacity: 0;
        }
        to {
            stroke-dashoffset: 0;
            opacity: 1;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        #checkmark-path {
            animation: none !important;
            stroke-dashoffset: 0;
            opacity: 1;
        }
    }
</style>
