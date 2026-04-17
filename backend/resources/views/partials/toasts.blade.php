{{-- Toast Notification Container --}}
<div id="toast-container" class="fixed top-6 right-6 space-y-3 z-50 pointer-events-none max-w-md w-full md:w-96">
    {{-- Toasts will be inserted here by JavaScript --}}
</div>

{{-- Inline Script for Flash Messages (Initial Load) --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Display Laravel Flash Messages as Toasts
        const flashMessages = {
            @if ($message = session('success'))
                success: "{!! $message !!}",
            @endif
            @if ($message = session('error'))
                error: "{!! $message !!}",
            @endif
            @if ($message = session('warning'))
                warning: "{!! $message !!}",
            @endif
            @if ($message = session('info'))
                info: "{!! $message !!}",
            @endif
        };

        // Display each flash message
        Object.entries(flashMessages).forEach(([type, message]) => {
            if (message) {
                Toast.show(message, type);
            }
        });
    });
</script>
