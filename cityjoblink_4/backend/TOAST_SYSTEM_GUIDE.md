# Toast Notification System - Complete Guide

## Overview

The Toast Notification System is a production-ready, reusable notification framework for the CityJobLink Laravel application. It provides a consistent, user-friendly way to display success, error, warning, and informational messages throughout the application.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Frontend Usage (Blade Templates)](#frontend-usage-blade-templates)
3. [Backend Usage (Controllers)](#backend-usage-controllers)
4. [JavaScript API Reference](#javascript-api-reference)
5. [Styling & Customization](#styling--customization)
6. [Real-World Examples](#real-world-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Step 1: Include Assets

Add the following to your main layout file (e.g., `resources/views/layouts/app.blade.php`):

```blade
<!DOCTYPE html>
<html>
<head>
    <!-- ... existing head content ... -->
    <link rel="stylesheet" href="{{ asset('css/toast.css') }}">
</head>
<body>
    <!-- ... existing body content ... -->

    {{-- Include the toast container and flash message handler --}}
    @include('partials.toasts')

    {{-- Include the toast JavaScript library --}}
    <script src="{{ asset('js/toast.js') }}"></script>

    @yield('scripts')
</body>
</html>
```

### Step 2: Verify File Structure

Ensure these files exist in your project:

```
backend/
├── public/
│   ├── css/
│   │   └── toast.css
│   └── js/
│       └── toast.js
├── resources/
│   └── views/
│       ├── partials/
│       │   └── toasts.blade.php
│       └── examples/
│           ├── toast-demo.blade.php
│           └── form-with-toast.blade.php
└── app/
    └── Http/
        └── Controllers/
            └── ExampleToastController.php
```

## Frontend Usage (Blade Templates)

### Using Flash Messages in Controllers

Flash messages are automatically converted to toasts when the page loads:

```php
// In your controller
public function store(Request $request)
{
    // Your logic here...
    
    return redirect()->back()->with('success', 'Record created successfully!');
}
```

The toast will automatically appear when the page reloads.

### Direct JavaScript Toast Calls

For immediate feedback (without page reload), call the Toast API directly:

```javascript
// Success notification
Toast.success('Item registered successfully!');

// Error notification
Toast.error('Failed to register. Please try again.');

// Warning notification
Toast.warning('This action cannot be undone.');

// Info notification
Toast.info('Please check your email for confirmation.');
```

### Customizing Toast Duration

Override the default 5-second auto-dismiss:

```javascript
// Toast that stays for 10 seconds
Toast.show('Custom message', 'success', { duration: 10000 });

// Toast that never auto-dismisses (user must close manually)
Toast.show('Important message', 'warning', { duration: 0 });
```

## Backend Usage (Controllers)

### Basic Flash Messages

```php
<?php

namespace App\Http\Controllers;

class JobFairController extends Controller
{
    public function register(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'job_fair_id' => 'required|exists:job_fairs,id',
        ]);

        // Register user to job fair
        $user = auth()->user();
        $user->jobFairs()->attach($validated['job_fair_id']);

        // Redirect with success message
        return redirect()->route('dashboard')
            ->with('success', 'Successfully registered for the job fair!');
    }

    public function withdraw(Request $request)
    {
        try {
            $jobFair = JobFair::findOrFail($request->job_fair_id);
            auth()->user()->jobFairs()->detach($jobFair->id);

            return redirect()->back()
                ->with('success', 'Withdrawn from job fair.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Could not withdraw from job fair.')
                ->withInput();
        }
    }
}
```

### Conditional Messages

```php
public function update(Request $request, $id)
{
    $record = Record::findOrFail($id);
    
    $oldValue = $record->status;
    $record->update($request->validated());

    if ($oldValue !== $record->status) {
        $message = "Status changed from '{$oldValue}' to '{$record->status}'";
    } else {
        $message = 'Record updated successfully.';
    }

    return redirect()->back()
        ->with('success', $message);
}
```

### Multiple Flash Messages

```php
public function bulkAction(Request $request)
{
    $results = $this->processBulkItems($request->items);

    return redirect()->back()
        ->with('success', "{$results['success']} items processed")
        ->with('warning', "{$results['skipped']} items were skipped")
        ->with('info', "Total: {$results['total']} items");
}
```

### With Input Persistence

For form validation errors, preserve user input:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|unique:users|email',
        'name' => 'required|string',
    ]);

    // If validation passes, create user
    User::create($validated);

    return redirect()->route('users.index')
        ->with('success', 'User created successfully!');
}

// Validation errors are automatically converted to error toast
```

## JavaScript API Reference

### Toast.show()

Base method for displaying notifications:

```javascript
Toast.show(message, type, options)
```

**Parameters:**
- `message` (string): The notification text
- `type` (string): One of `'success'`, `'error'`, `'warning'`, `'info'`
- `options` (object): Configuration object
  - `duration` (number): Auto-dismiss time in milliseconds. Default: 5000. Set to 0 to disable.

**Example:**
```javascript
Toast.show('Custom notification', 'success', { duration: 7000 });
```

### Toast.success()

Display a success notification:

```javascript
Toast.success('Item saved successfully!')
// With custom duration
Toast.success('Item saved!', { duration: 3000 })
```

### Toast.error()

Display an error notification:

```javascript
Toast.error('Something went wrong!')
Toast.error('Validation failed', { duration: 0 }) // Never auto-dismiss
```

### Toast.warning()

Display a warning notification:

```javascript
Toast.warning('This action cannot be undone')
```

### Toast.info()

Display an info notification:

```javascript
Toast.info('New updates available')
```

### Toast.dismiss()

Dismiss a specific toast by its ID:

```javascript
const toastId = Toast.success('Some message');
setTimeout(() => {
    Toast.dismiss(toastId);
}, 3000);
```

### Toast.dismissAll()

Dismiss all active toasts:

```javascript
Toast.dismissAll();
```

## Styling & Customization

### Toast Types

Each type has distinct styling:

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Successful operations (save, register, delete) |
| `error` | Red | Failed operations, errors, validation failures |
| `warning` | Yellow | Caution messages, confirmation needed |
| `info` | Blue | Informational messages, status updates |

### Customizing Colors

Edit `public/css/toast.css` to change colors:

```css
/* Success (green) */
.toast-success {
    @apply bg-green-50 border-green-300 text-green-800;
}

/* Change to your brand color */
.toast-success {
    @apply bg-emerald-50 border-emerald-300 text-emerald-800;
}
```

### Customizing Position

Default position is top-right. To change:

```css
/* In toast.css */
#toast-container {
    @apply fixed top-4 right-4; /* Top-right (default) */
    /* Or change to:
    @apply fixed top-4 left-4; /* Top-left */
    @apply fixed bottom-4 right-4; /* Bottom-right */
    @apply fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2; /* Center */
    */
}
```

### Dark Mode Support

The toast system automatically respects the user's dark mode preference:

```css
@media (prefers-color-scheme: dark) {
    .toast {
        @apply bg-gray-900 text-white shadow-lg;
    }

    .toast-success {
        @apply bg-green-900/30 border-green-800;
    }
}
```

## Real-World Examples

### Example 1: Training Registration

**Frontend (Blade):**
```blade
<button onclick="registerTraining({{ $training->id }})">
    Register Now
</button>

<script>
function registerTraining(trainingId) {
    fetch('/api/trainings/' + trainingId + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Toast.success('Successfully registered for training!');
            // Refresh training list after 1 second
            setTimeout(() => location.reload(), 1000);
        } else {
            Toast.error(data.message || 'Registration failed');
        }
    })
    .catch(error => {
        Toast.error('Network error. Please try again.');
    });
}
</script>
```

**Backend (Controller):**
```php
public function register(Training $training)
{
    auth()->user()->trainings()->attach($training->id);
    
    return response()->json([
        'success' => true,
        'message' => 'Registered successfully'
    ]);
}
```

### Example 2: Form Validation Feedback

**Blade Template:**
```blade
<form method="POST" action="{{ route('profile.update') }}" id="profileForm">
    @csrf
    
    <input type="email" name="email" value="{{ old('email') }}" required>
    
    <button type="submit">Update Profile</button>
</form>

<script>
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    Toast.info('Updating your profile...');
    
    fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Toast.success('Profile updated successfully!');
        } else {
            Toast.error(data.errors?.[0] || 'Update failed');
        }
    });
});
</script>
```

**Controller:**
```php
public function update(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email|unique:users',
        'name' => 'required|string'
    ]);

    auth()->user()->update($validated);

    return response()->json(['success' => true]);
}
```

### Example 3: Batch Operations

**JavaScript:**
```javascript
async function deleteSelectedItems() {
    const selected = document.querySelectorAll('input[name="items[]"]:checked');
    
    if (selected.length === 0) {
        Toast.warning('Please select at least one item');
        return;
    }

    Toast.warning(`Deleting ${selected.length} items...`);

    try {
        const response = await fetch('/api/items/delete-batch', {
            method: 'POST',
            body: JSON.stringify({
                ids: Array.from(selected).map(cb => cb.value)
            }),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });

        const data = await response.json();

        if (data.success) {
            Toast.success(`${data.deleted} items deleted successfully`);
            refreshTable();
        } else {
            Toast.error(data.message);
        }
    } catch (error) {
        Toast.error('Failed to delete items. Please try again.');
    }
}
```

## Best Practices

### ✅ DO:

1. **Use clear, concise messages**
   ```javascript
   Toast.success('Profile saved successfully'); // Good
   Toast.success('Done'); // Too vague
   ```

2. **Match message type to action outcome**
   ```javascript
   Toast.success('Item created'); // Success for successful creation
   Toast.error('Email already exists'); // Error for validation failure
   Toast.warning('Unsaved changes'); // Warning for pending actions
   Toast.info('Syncing...'); // Info for status updates
   ```

3. **Provide actionable feedback**
   ```javascript
   Toast.error('Email already in use. Please try another.'); // Helpful
   Toast.error('Error'); // Not helpful
   ```

4. **Use appropriate duration**
   ```javascript
   Toast.success('Item saved', { duration: 3000 }); // Quick feedback
   Toast.info('Loading...', { duration: 0 }); // Manual dismiss if needed
   ```

### ❌ DON'T:

1. **Don't display too many toasts at once**
   ```javascript
   // Avoid this:
   Toast.success('Step 1');
   Toast.success('Step 2');
   Toast.success('Step 3');
   Toast.success('Step 4');
   
   // Better:
   Toast.success('All 4 steps completed');
   ```

2. **Don't use capitalized "TOAST" or all caps unnecessarily**
   ```javascript
   Toast.error('ERROR: VALIDATION FAILED'); // Too aggressive
   Toast.error('Please enter a valid email'); // Better
   ```

3. **Don't show sensitive information**
   ```javascript
   // Avoid:
   Toast.error(`Database error: ${error.message}`);
   
   // Better:
   Toast.error('Something went wrong. Please try again or contact support.');
   ```

## Troubleshooting

### Toast not appearing?

1. **Check if assets are linked:**
   ```blade
   {{-- In your layout --}}
   @include('partials.toasts')
   <script src="{{ asset('js/toast.js') }}"></script>
   <link rel="stylesheet" href="{{ asset('css/toast.css') }}">
   ```

2. **Verify CSS/JS files exist:**
   ```bash
   ls backend/public/js/toast.js
   ls backend/public/css/toast.css
   ```

3. **Check browser console for errors:**
   ```
   F12 > Console tab > Look for red errors
   ```

### Toast appearing behind other elements?

Increase z-index in CSS:
```css
#toast-container {
    z-index: 9999; /* Increase from 9999 if needed */
}
```

### Flash messages not showing?

1. **Ensure toasts.blade.php is included:**
   ```blade
   @include('partials.toasts')
   {{-- This must be in your main layout --}}
   ```

2. **Check that route redirects with flash:**
   ```php
   return redirect()->back()->with('success', 'Message');
   ```

3. **Verify session is running:**
   ```bash
   # Message persists in session
   # Session middleware should be active (checked in Kernel.php)
   ```

### Styling issues?

1. **Check Tailwind is configured:**
   - Ensure `tailwind.config.js` includes CSS file paths
   - Run `npm run build` to compile Tailwind

2. **Check dark mode preference:**
   ```javascript
   // Check if user has dark mode enabled
   window.matchMedia('(prefers-color-scheme: dark)').matches
   ```

## Integration Checklist

- [ ] Files copied to correct locations
- [ ] Assets linked in layout template
- [ ] `@include('partials.toasts')` added to layout
- [ ] `<script>` tag for toast.js in layout
- [ ] `<link>` tag for toast.css in layout `<head>`
- [ ] Tested flash messages from controller
- [ ] Tested JavaScript Toast API
- [ ] Validated styling (colors, animations)
- [ ] Tested on mobile/tablet
- [ ] Checked dark mode appearance
- [ ] Verified no JavaScript errors in console

## Support & Issues

For issues or feature requests:

1. Check the troubleshooting section above
2. Review `resources/views/examples/toast-demo.blade.php` for working examples
3. Review `resources/views/examples/form-with-toast.blade.php` for form integration
4. Check `app/Http/Controllers/ExampleToastController.php` for controller patterns

---

**Last Updated:** 2026-02-23  
**Version:** 1.0.0  
**Status:** Production Ready ✓
