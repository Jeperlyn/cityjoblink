<!-- Example Blade Template using Success Alert -->
<x-app-layout>
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Success Alert Demo</h1>
            <p class="text-gray-600">Examples of using the custom animated success alert</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-6 sm:px-0">
            <!-- Basic Success Alert -->
            <div class="bg-white rounded-[2rem] shadow p-6 border border-gray-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Basic Success Alert</h2>
                <button 
                    onclick="SuccessAlert.show('Profile updated successfully!')" 
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                    Show Success
                </button>
            </div>

            <!-- Custom Message -->
            <div class="bg-white rounded-[2rem] shadow p-6 border border-gray-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Custom Message</h2>
                <button 
                    onclick="SuccessAlert.show('Your application has been submitted. We will review it within 48 hours.')" 
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                    Show Custom Message
                </button>
            </div>

            <!-- With Callback -->
            <div class="bg-white rounded-[2rem] shadow p-6 border border-gray-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4">With Callback</h2>
                <button 
                    onclick="showWithCallback()" 
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                    Show & Redirect
                </button>
            </div>

            <!-- Multiple Actions -->
            <div class="bg-white rounded-[2rem] shadow p-6 border border-gray-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Multiple Actions</h2>
                <button 
                    onclick="multipleAlerts()" 
                    class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                    Show Sequence
                </button>
            </div>
        </div>

        <!-- Code Examples -->
        <div class="mt-12 px-4 py-6 sm:px-0">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Usage Examples</h2>
            
            <div class="bg-slate-50 rounded-[1.5rem] border border-gray-200 p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Basic Usage</h3>
                <pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm"><code>// Show success alert
SuccessAlert.show('Operation completed successfully!');

// With custom message
SuccessAlert.show('Your profile has been updated.');

// Manual close
SuccessAlert.close();</code></pre>
            </div>

            <div class="bg-slate-50 rounded-[1.5rem] border border-gray-200 p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Laravel Flash Message Integration</h3>
                <pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm"><code>// In your controller
public function store(Request $request)
{
    $user = User::create($request->validated());
    
    return redirect()
        ->route('dashboard')
        ->with('success_alert', 'Your account has been created successfully!');
}

// In your Blade layout
@if (session('success_alert'))
    &lt;script&gt;
        document.addEventListener('DOMContentLoaded', function() {
            SuccessAlert.show("{{ session('success_alert') }}");
        });
    &lt;/script&gt;
@endif</code></pre>
            </div>

            <div class="bg-slate-50 rounded-[1.5rem] border border-gray-200 p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">With Callback Function</h3>
                <pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm"><code>// Show alert and execute callback when closed
SuccessAlert.show(
    'Redirecting to dashboard...',
    function() {
        window.location.href = '/dashboard';
    }
);

// Variable callback
function onSuccess() {
    console.log('Success action completed!');
    // Do something else...
}

SuccessAlert.show('Done!', onSuccess);</code></pre>
            </div>

            <div class="bg-slate-50 rounded-[1.5rem] border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">API Reference</h3>
                <pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm"><code>// Show alert
SuccessAlert.show(message, callback?)
  - message (string): The success message to display
  - callback (function): Optional callback when alert closes

// Close alert
SuccessAlert.close()
  - Manually closes the alert

// Example with all parameters
SuccessAlert.show('All set!', () => {
    console.log('Alert closed!');
});</code></pre>
            </div>
        </div>
    </div>

    <script>
        function showWithCallback() {
            SuccessAlert.show(
                'Redirecting to your profile...',
                function() {
                    console.log('Callback executed!');
                    // Could redirect: window.location.href = '/profile';
                }
            );
        }

        function multipleAlerts() {
            SuccessAlert.show('Step 1: Processing your request');
            setTimeout(() => {
                SuccessAlert.show('Step 2: Saving changes');
            }, 2000);
            setTimeout(() => {
                SuccessAlert.show('Step 3: Complete!');
            }, 4000);
        }
    </script>
</x-app-layout>
