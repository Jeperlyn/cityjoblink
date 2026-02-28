{{-- Resources > Views > Examples > FormWithToast.blade.php --}}

@extends('layouts.app')

@section('title', 'Form with Toast Notifications')

@section('content')
<div class="max-w-2xl mx-auto space-y-8">
    {{-- Header --}}
    <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Register as Seeker</h1>
        <p class="text-gray-600">Complete the form below to create your job seeker account</p>
    </div>

    {{-- Form --}}
    <div class="bg-white rounded-lg shadow p-8">
        <form id="registrationForm" method="POST" action="{{ route('register') }}" class="space-y-6">
            @csrf

            {{-- Name Field --}}
            <div>
                <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    value="{{ old('name') }}"
                >
                @error('name')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            {{-- Email Field --}}
            <div>
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                    value="{{ old('email') }}"
                >
                @error('email')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            {{-- Password Field --}}
            <div>
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                >
                @error('password')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            {{-- Confirm Password Field --}}
            <div>
                <label for="password_confirmation" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input 
                    type="password" 
                    id="password_confirmation" 
                    name="password_confirmation" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                >
            </div>

            {{-- Submit Button --}}
            <button 
                type="submit"
                class="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                id="submitBtn"
            >
                Create Account
            </button>

            {{-- Alternative: AJAX Submit Example --}}
            <div class="pt-6 border-t">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">Or try with AJAX:</h3>
                <button 
                    type="button"
                    onclick="submitFormAjax()"
                    class="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                    Submit via AJAX
                </button>
            </div>
        </form>
    </div>

    {{-- Usage Instructions --}}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="font-semibold text-blue-900 mb-3">How Toasts Are Used Here:</h3>
        <ul class="space-y-2 text-sm text-blue-800">
            <li>✓ <strong>Form Submission:</strong> After successful registration, a success toast appears</li>
            <li>✓ <strong>Error Handling:</strong> Any validation errors display as error toasts</li>
            <li>✓ <strong>AJAX Submissions:</strong> Click "Submit via AJAX" to see real-time feedback</li>
            <li>✓ <strong>Flash Messages:</strong> Laravel flash messages automatically convert to toasts</li>
        </ul>
    </div>
</div>

{{-- JavaScript for Form Handling --}}
@section('scripts')
<script>
    /**
     * Handle regular form submission
     */
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        // Disable submit button to prevent double submission
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        // Note: Form will submit normally and Laravel will handle flash messages
        // Toast will appear after page reload from the session flash data
    });

    /**
     * Handle AJAX form submission with toast notifications
     */
    function submitFormAjax() {
        const form = document.getElementById('registrationForm');
        const formData = new FormData(form);

        // Show loading toast
        Toast.info('Creating your account...');

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Toast.success('Account created successfully! Redirecting...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = data.redirect || '/dashboard';
                }, 2000);
            } else {
                Toast.error(data.message || 'An error occurred. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Toast.error('Network error. Please check your connection and try again.');
        });
    }

    /**
     * Real-time form validation with toasts
     */
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirmation');

    passwordConfirmInput.addEventListener('blur', function() {
        if (this.value && passwordInput.value !== this.value) {
            Toast.warning('Passwords do not match');
            this.classList.add('border-red-500');
        } else if (this.value) {
            Toast.success('Passwords match ✓');
            this.classList.remove('border-red-500');
        }
    });

    /**
     * Email validation
     */
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const email = this.value;
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (email && !isValid) {
            Toast.warning('Please enter a valid email address');
        }
    });
</script>
@endsection
