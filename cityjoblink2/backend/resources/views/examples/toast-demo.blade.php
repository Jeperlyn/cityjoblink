{{-- Resources > Views > Examples > ToastExample.blade.php --}}<x-app-layout>


























































































































































































@endsection</div>    </div>        </ul>            </li>                <span><strong>Dark Mode:</strong> Built-in dark mode support</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>No Dependencies:</strong> Pure JavaScript and Tailwind CSS</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Customizable:</strong> Override duration and other settings</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Responsive:</strong> Works perfectly on mobile and desktop</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Laravel Integration:</strong> Works with session flash messages</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Smooth Animations:</strong> Slide-in and fade transitions</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Manual Close:</strong> Users can click the X button to close anytime</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">            </li>                <span><strong>Auto-Dismiss:</strong> Toasts automatically disappear after 5 seconds</span>                <span class="text-green-500 font-bold mt-1">✓</span>            <li class="flex items-start gap-3">        <ul class="space-y-3 text-gray-700">        <h2 class="text-2xl font-bold mb-6 text-gray-900">Features</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Features --}}    </div>        </div>            </div>                </div>                    </div>                        <p class="text-sm text-blue-700">For informational messages</p>                        <p class="font-semibold text-blue-800">Info</p>                    <div class="border border-blue-200 bg-blue-50 p-4 rounded">                    </div>                        <p class="text-sm text-yellow-700">For warnings and confirmations</p>                        <p class="font-semibold text-yellow-800">Warning</p>                    <div class="border border-yellow-200 bg-yellow-50 p-4 rounded">                    </div>                        <p class="text-sm text-red-700">For error messages</p>                        <p class="font-semibold text-red-800">Error</p>                    <div class="border border-red-200 bg-red-50 p-4 rounded">                    </div>                        <p class="text-sm text-green-700">For successful operations</p>                        <p class="font-semibold text-green-800">Success</p>                    <div class="border border-green-200 bg-green-50 p-4 rounded">                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">                <h3 class="text-lg font-semibold mb-3 text-gray-800">Notification Types</h3>            <div>            {{-- Types --}}            </div>                </ul>                    <li><strong>options</strong> (object): Configuration overrides (duration, etc.)</li>                    <li><strong>type</strong> (string): 'success', 'error', 'warning', or 'info'</li>                    <li><strong>message</strong> (string): The notification message</li>                <ul class="list-disc list-inside space-y-2 text-sm text-gray-700">                <h3 class="text-lg font-semibold mb-3 text-gray-800">Parameters</h3>            <div>            {{-- Parameters --}}            </div>                </div>                    <p><span class="text-purple-600">Toast.dismissAll</span>()</p>                    <p><span class="text-purple-600">Toast.dismiss</span>(element)</p>                    <p><span class="text-blue-600">Toast.info</span>(message, options)</p>                    <p><span class="text-yellow-600">Toast.warning</span>(message, options)</p>                    <p><span class="text-red-600">Toast.error</span>(message, options)</p>                    <p><span class="text-green-600">Toast.success</span>(message, options)</p>                    <p><span class="text-blue-600">Toast.show</span>(message, type, options)</p>                <div class="space-y-3 text-sm font-mono bg-gray-50 p-4 rounded">                <h3 class="text-lg font-semibold mb-3 text-gray-800">Methods</h3>            <div>            {{-- Methods --}}        <div class="space-y-6">                <h2 class="text-2xl font-bold mb-6 text-gray-900">API Reference</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- API Reference --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.success('Long message here', { duration: 10000 });</code></pre>        </button>            Show Long Toast        >            class="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"            onclick="Toast.success('This notification will stay for 10 seconds', { duration: 10000 })"        <button         <p class="text-gray-600 mb-4">Show a toast that stays for 10 seconds:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Custom Duration</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Custom Duration Example --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.show('Custom notification message', 'success');</code></pre>        </button>            Show Generic Toast        >            class="px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition"            onclick="Toast.show('Custom notification message', 'success')"        <button         <p class="text-gray-600 mb-4">You can use the generic show() method with any type:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Generic Show Method</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Generic Show Method --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.info('New updates are available. Please refresh your browser.');</code></pre>        </button>            Show Info Toast        >            class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"            onclick="Toast.info('New updates are available. Please refresh your browser.')"        <button         <p class="text-gray-600 mb-4">Click the button to show an info notification:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Info Toast</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Info Example --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.warning('This action cannot be undone. Please proceed with caution.');</code></pre>        </button>            Show Warning Toast        >            class="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"            onclick="Toast.warning('This action cannot be undone. Please proceed with caution.')"        <button         <p class="text-gray-600 mb-4">Click the button to show a warning notification:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Warning Toast</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Warning Example --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.error('An error occurred while processing your request. Please try again.');</code></pre>        </button>            Show Error Toast        >            class="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"            onclick="Toast.error('An error occurred while processing your request. Please try again.')"        <button         <p class="text-gray-600 mb-4">Click the button to show an error notification:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Error Toast</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Error Example --}}    </div>        <pre class="mt-4 bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>Toast.success('Your changes have been saved successfully!');</code></pre>        </button>            Show Success Toast        >            class="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"            onclick="Toast.success('Your changes have been saved successfully!')"        <button         <p class="text-gray-600 mb-4">Click the button to show a success notification:</p>        <h2 class="text-2xl font-bold mb-6 text-gray-900">Success Toast</h2>    <div class="bg-white rounded-lg shadow p-8">    {{-- Success Example --}}    </div>        <p class="text-gray-600">A production-ready toast notification system with Laravel integration</p>        <h1 class="text-4xl font-bold text-gray-900 mb-2">Toast Notifications</h1>    <div class="text-center">    {{-- Header --}}<div class="space-y-12">@section('content')@section('title', 'Toast Notification Examples')@extends('layouts.app')    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="px-4 py-6 sm:px-0">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Toast Notifications Demo</h1>
            <p class="text-slate-600 dark:text-slate-400">Examples of using the toast notification system</p>
        </div>

        <!-- Examples Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-6 sm:px-0">
            
            <!-- Flash Message Examples -->
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Flash Message Examples</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    These buttons demonstrate flash messages that automatically appear as toasts.
                </p>

                <div class="space-y-2">
                    <form action="{{ route('example.success') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            Success Message
                        </button>
                    </form>

                    <form action="{{ route('example.error') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            Error Message
                        </button>
                    </form>

                    <form action="{{ route('example.warning') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                            Warning Message
                        </button>
                    </form>

                    <form action="{{ route('example.info') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Info Message
                        </button>
                    </form>
                </div>
            </div>

            <!-- JavaScript Examples -->
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">JavaScript Examples</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    These buttons use JavaScript to trigger toasts directly without page reload.
                </p>

                <div class="space-y-2">
                    <button onclick="Toast.success('Success! This is a success notification.')" 
                            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        JS Success
                    </button>

                    <button onclick="Toast.error('Error! Something went wrong.')" 
                            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        JS Error
                    </button>

                    <button onclick="Toast.warning('Warning! Please review this message.')" 
                            class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                        JS Warning
                    </button>

                    <button onclick="Toast.info('Info: This is an informational message.')" 
                            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        JS Info
                    </button>
                </div>
            </div>

            <!-- Advanced Examples -->
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Advanced Examples</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    More complex scenarios and custom durations.
                </p>

                <div class="space-y-2">
                    <button onclick="Toast.show('Custom duration - stays for 10 seconds!', 'info', 10000)" 
                            class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Long Duration (10s)
                    </button>

                    <button onclick="Toast.show('No auto-dismiss - click X to close', 'info', 0)" 
                            class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        No Auto-Dismiss
                    </button>

                    <button onclick="multipleToasts()" 
                            class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Multiple Toasts
                    </button>

                    <button onclick="Toast.dismissAll()" 
                            class="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                        Dismiss All
                    </button>
                </div>
            </div>

            <!-- Form Example -->
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Form Validation Example</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Submit the form to see validation feedback.
                </p>

                <form id="demoForm" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input type="email" required 
                               class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                    </div>
                    <button type="submit" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Validate Form
                    </button>
                </form>
            </div>
        </div>

        <!-- Code Examples Section -->
        <div class="mt-12 px-4 py-6 sm:px-0">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Usage Examples</h2>

            <div class="grid grid-cols-1 gap-6">
                <!-- Basic Usage -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Basic Usage</h3>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto text-sm"><code>// Simple notifications
Toast.success('Operation successful!');
Toast.error('Something went wrong');
Toast.warning('Please review this');
Toast.info('Just so you know...');

// With custom duration (5000ms default)
Toast.success('Long message', 10000);

// Full control
Toast.show('Custom message', 'info', 5000);</code></pre>
                </div>

                <!-- Flash Messages in Controller -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Laravel Flash Messages</h3>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto text-sm"><code>// In your controller
public function store(Request $request)
{
    $user = User::create($request->validated());
    
    return redirect()
        ->route('user.show', $user)
        ->with('success', 'User created successfully!');
}</code></pre>
                </div>

                <!-- Layout Integration -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Layout Integration</h3>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto text-sm"><code>{{-- In your app.blade.php layout --}}
&lt;body&gt;
    {{-- Your content --}}
    
    {{-- Include toast container once at mount point --}}
    @include('components.toast-container')
    
    {{ $slot }}
&lt;/body&gt;

{{-- Flash messages auto-display via built-in script --}}</code></pre>
                </div>

                <!-- API Reference -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">API Reference</h3>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto text-sm"><code>// Show notifications
Toast.success(message, duration?)
Toast.error(message, duration?)
Toast.warning(message, duration?)
Toast.info(message, duration?)
Toast.show(message, type, duration?)

// Control
Toast.dismiss(toastId)
Toast.dismissAll()

// Duration: 0 = no auto-dismiss, 5000 = 5 seconds (default)</code></pre>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Example: Form validation
        document.getElementById('demoForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (email.includes('@')) {
                Toast.success('Email is valid!');
                this.reset();
            } else {
                Toast.error('Please enter a valid email address');
            }
        });

        // Example: Multiple toasts
        function multipleToasts() {
            Toast.info('First notification');
            setTimeout(() => Toast.warning('Second notification'), 300);
            setTimeout(() => Toast.success('Third notification'), 600);
        }
    </script>
</x-app-layout>
