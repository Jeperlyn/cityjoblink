# Toast Notification System

A production-ready, reusable toast notification system for Laravel with Blade, Tailwind CSS, and vanilla JavaScript.

## Features

✅ **No Browser Dialogs** - Uses custom popups instead of alert(), confirm(), or prompt()  
✅ **Smooth Animations** - Spring curve slide-in/out animations with motion-safe fallback  
✅ **Multiple Types** - Success, error, warning, and info notifications  
✅ **Auto-Dismiss** - Automatically closes after 5 seconds (configurable)  
✅ **Manual Close** - X button for immediate dismissal  
✅ **Flash Message Integration** - Works seamlessly with Laravel session flash data  
✅ **Responsive** - Adapts to mobile, tablet, and desktop  
✅ **Dark Mode** - Full Tailwind dark mode support  
✅ **Accessible** - ARIA labels and keyboard support  
✅ **XSS Protection** - HTML escaping for user-generated content  
✅ **Production Ready** - Clean,documented, and battle-tested code

## Installation

### 1. Include Toast Container in Your Layout

Add the toast container component to your main layout file (once, at the app level):

```blade
<!-- In resources/views/layouts/app.blade.php -->
<body>
    <!-- Your content -->
    
    @include('components.toast-container')
    
    {{ $slot }}
</body>
```

The container includes:
- HTML markup for the toast display area
- Complete JavaScript logic (no external dependencies)
- CSS animations and styling

### 2. Add Example Layout (Optional)

Copy [resources/views/layouts/app.blade.php](resources/views/layouts/app.blade.php) to use the complete example layout with flash message handling built-in.

### 3. Register Example Routes (Optional)

Add to your `routes/web.php`:

```php
require base_path('routes/example-routes.php');
```

## Usage

### JavaScript API

```javascript
// Simple notifications (5 second auto-dismiss by default)
Toast.success('Operation successful!');
Toast.error('Something went wrong');
Toast.warning('Please review this');
Toast.info('Just so you know...');

// Custom duration (in milliseconds)
Toast.success('Staying longer!', 10000); // 10 seconds
Toast.info('No auto-dismiss', 0);        // Manual close only

// Full control with Toast.show()
Toast.show('Custom message', 'success', 5000);

// Manual control
const id = Toast.info('Persistent message', 0);
Toast.dismiss(id);      // Close by ID
Toast.dismissAll();     // Close all toasts
```

### Laravel Flash Messages

In your controller, use Laravel's redirect with flash messages:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $user = User::create($request->validated());
        
        // Redirect with success message (automatically displays as toast)
        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User created successfully!');
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return back()->with('success', 'User deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete user.');
        }
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->validated());
        
        return back()
            ->with('success', 'Changes saved successfully!')
            ->with('info', 'Some notifications may require administrator review.');
    }
}
```

### In Blade Templates

```blade
<form action="{{ route('users.store') }}" method="POST">
    @csrf
    
    <input type="text" name="name" required class="@error('name') border-red-500 @enderror">
    @error('name')
        <p class="text-red-500">{{ $message }}</p>
    @enderror
    
    <button type="submit">Create User</button>
</form>

<!-- JavaScript trigger example -->
<button onclick="Toast.success('Action completed!')">
    Complete Action
</button>

<!-- Multiple toasts with delay -->
<button onclick="showMultipleNotifications()">
    Show Multiple
</button>

<script>
function showMultipleNotifications() {
    Toast.info('Processing your request...');
    setTimeout(() => Toast.warning('Review this important info'), 500);
    setTimeout(() => Toast.success('All done!'), 1000);
}
</script>
```

## Styling & Customization

### Toast Types Color Reference

| Type    | Background      | Border          | Text            | Icon            |
|---------|-----------------|-----------------|-----------------|-----------------|
| Success | `bg-green-50`   | `border-green-200` | `text-green-800` | `text-green-600` |
| Error   | `bg-red-50`     | `border-red-200`   | `text-red-800`   | `text-red-600`   |
| Warning | `bg-yellow-50`  | `border-yellow-200` | `text-yellow-800` | `text-yellow-600` |
| Info    | `bg-blue-50`    | `border-blue-200`  | `text-blue-800`  | `text-blue-600`  |

All colors have dark mode variants (e.g., `dark:bg-green-900/20`).

### Customizing Toast Appearance

Edit the toast container template to modify:
- **Size**: Change `w-5 h-5` SVG dimensions or padding values
- **Position**: Modify `top-4 right-4` classes (top-left, bottom-right, etc.)
- **Colors**: Update the color classes in `getStylesByType()`
- **Animation**: Adjust `@keyframes slideIn/slideOut` timing in the `<style>` block
- **Duration**: Change the default `5000` milliseconds in method signatures

### Custom Toast Types

To add a custom toast type, extend the `getStylesByType()` function:

```javascript
function getStylesByType(type) {
    const styles = {
        // ... existing types
        custom: {
            icon: '<svg>...</svg>',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-200 dark:border-purple-700',
            textColor: 'text-purple-800 dark:text-purple-200',
            iconColor: 'text-purple-600 dark:text-purple-400'
        }
    };
    return styles[type] || styles.info;
}

// Then use it
Toast.show('Custom notification', 'custom', 5000);
```

## API Reference

### Methods

#### `Toast.show(message, type, duration)`
Display a toast notification.

**Parameters:**
- `message` (string) - The notification message (HTML-escaped for safety)
- `type` (string) - `'success'`, `'error'`, `'warning'`, or `'info'` (default: `'info'`)
- `duration` (number) - Auto-dismiss time in milliseconds (default: `5000`, use `0` for manual only)

**Returns:** (number) Toast ID for manual control

**Example:**
```javascript
const toastId = Toast.show('Processing...', 'info', 0);
setTimeout(() => Toast.dismiss(toastId), 3000);
```

#### `Toast.success(message, duration)`
Display a success notification (green).

#### `Toast.error(message, duration)`
Display an error notification (red).

#### `Toast.warning(message, duration)`
Display a warning notification (yellow/amber).

#### `Toast.info(message, duration)`
Display an info notification (blue).

#### `Toast.dismiss(id)`
Manually close a specific toast by ID.

**Example:**
```javascript
const id = Toast.info('Loading...', 0);
// Later...
Toast.dismiss(id);
```

#### `Toast.dismissAll()`
Close all active toasts immediately.

## Accessibility

The system includes:
- **ARIA Labels** - Close button has `aria-label="Close notification"`
- **Keyboard Support** - Can be closed via click or keyboard on the close button
- **Motion Safety** - Respects `prefers-reduced-motion` media query
- **Color Contrast** - WCAG AA compliant colors
- **Text Only** - Users can read full message, not relying on icons alone

## Performance

- **No Dependencies** - Pure vanilla JavaScript, no jQuery or libraries
- **Minimal DOM** - Single container with dynamically added toasts
- **Efficient Animations** - Uses CSS animations, not JavaScript animations
- **Memory Management** - Cleans up DOM nodes and timeouts when dismissed
- **XSS Safe** - All user content is HTML-escaped using `textContent`

## Security

- **No `innerHTML`** - Uses `textContent` and `createElement` for safe content insertion
- **HTML Escaping** - User messages are escaped to prevent XSS
- **No Eval** - No dynamic JavaScript execution
- **CSRF Tokens** - Works seamlessly with Laravel's CSRF protection

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

CSS animations gracefully degrade in older browsers while maintaining functionality.

## Dark Mode

Full Tailwind dark mode support included. Automatically adapts when:
- System prefers dark mode
- User sets `dark` class on `<html>` element
- Using Tailwind's dark mode configuration

## Testing

### Manual Testing Checklist

- [ ] Toast appears in top-right corner
- [ ] Auto-dismisses after 5 seconds
- [ ] Close button (X) works
- [ ] All 4 types display with correct colors
- [ ] Multiple toasts stack properly
- [ ] Animations are smooth
- [ ] Flash messages trigger on page load
- [ ] Responsive on mobile (375px)
- [ ] Dark mode works correctly
- [ ] No XSS with special characters: `<script>`, `'`, `"`

### Unit Test Examples

```javascript
// Test: Toast displays
test('Toast.success shows notification', () => {
    Toast.success('Test message');
    expect(document.querySelector('#toast-container').children.length).toBe(1);
});

// Test: Auto-dismiss
test('Toast auto-dismisses after duration', (done) => {
    Toast.info('Test', 100);
    setTimeout(() => {
        expect(document.querySelector('#toast-container').children.length).toBe(0);
        done();
    }, 150);
});

// Test: Manual dismiss
test('Toast.dismiss removes notification', () => {
    const id = Toast.warning('Test', 0);
    Toast.dismiss(id);
    expect(document.querySelector('#toast-container').children.length).toBe(0);
});
```

## Files Included

- `resources/views/components/toast-container.blade.php` - Main component with HTML, JS, and CSS
- `resources/views/layouts/app.blade.php` - Example layout with flash message handling
- `app/Http/Controllers/ExampleController.php` - Controller examples
- `resources/views/examples/toast-demo.blade.php` - Demo page with interactive examples
- `routes/example-routes.php` - Route definitions for examples

## Troubleshooting

**Toasts not appearing?**
- Ensure `@include('components.toast-container')` is in your layout
- Check browser console for JavaScript errors
- Verify Tailwind CSS is compiled with the toast component files

**Flash messages not showing?**
- Verify `session('success')`, `session('error')`, etc. are being set in your controller
- Check that the flash message script is in your layout
- Make sure you're using `back()`, `redirect()`, or `route()` to redirect after setting flash

**Animations are choppy?**
- Check if browser prefers reduced motion
- Verify GPU acceleration isn't disabled
- Test on different browser/hardware combo

**Styling looks wrong?**
- Ensure Tailwind CSS is properly compiled
- Check for CSS conflicts with other components
- Verify dark mode configuration if needed

## License

This system is provided as-is for use in your Laravel applications.

## Support & Contributions

For improvements or modifications:
1. Test thoroughly in your application
2. Document any changes
3. Consider accessibility impact
4. Maintain backwards compatibility

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** Production Ready
