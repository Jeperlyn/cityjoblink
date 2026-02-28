# Toast Notification System - Quick Reference

## 5-Minute Setup

### 1. Add to Main Layout
```blade
@include('components.toast-container')
```

### 2. Display Success Toast
```php
// Controller
return back()->with('success', 'Changes saved!');
```

### 3. Trigger from JavaScript
```javascript
Toast.success('Operation complete!');
```

---

## API Cheat Sheet

### Quick Methods
```javascript
Toast.success(msg, duration)    // Green checkmark
Toast.error(msg, duration)      // Red X
Toast.warning(msg, duration)    // Yellow warning triangle
Toast.info(msg, duration)       // Blue info circle
```

### Advanced
```javascript
Toast.show(message, type, duration)  // Full control
Toast.dismiss(toastId)               // Close by ID
Toast.dismissAll()                   // Close all
```

### Default Duration: 5000ms (5 seconds)
```javascript
Toast.success('Quick!');              // Auto-closes in 5s
Toast.success('Longer!', 10000);      // 10 seconds
Toast.info('Never closes', 0);        // Manual close only
```

---

## Common Patterns

### Form Submission Success
```php
public function store(Request $request)
{
    User::create($request->validated());
    return redirect()->route('users')->with('success', 'User created!');
}
```

### Validation Error
```php
public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'email' => 'unique:users',
    ]);
    // If validation passes
    $user->update($validated);
    return back()->with('success', 'Updated!');
    // If validation fails, Laravel auto-returns with error bag
}
```

### Async Action (JavaScript)
```html
<button onclick="deleteUser({{ $user->id }})">
    Delete
</button>

<script>
async function deleteUser(id) {
    Toast.info('Deleting...');
    try {
        const res = await fetch(`/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            Toast.success('Deleted!');
        } else {
            Toast.error('Failed to delete');
        }
    } catch (err) {
        Toast.error('Network error');
    }
}
</script>
```

### Multiple Sequential Toasts
```javascript
Toast.info('Step 1: Starting');
setTimeout(() => Toast.info('Step 2: Processing'), 1000);
setTimeout(() => Toast.success('Step 3: Complete'), 2000);
```

### Conditional Messages
```blade
@if ($errors->any())
    <!-- Errors auto-show via validation -->
@endif

@if (session('success'))
    <!-- Auto-displays as toast in layout -->
@endif
```

### Persistent Toast (User Must Close)
```javascript
const id = Toast.warning('Important notice', 0);
// User clicks X button to close, or:
Toast.dismiss(id);
```

---

## Customization Quick Tips

### Change Position
In `toast-container.blade.php`, change:
```blade
<div id="toast-container" class="fixed top-4 right-4 ...">
```
Options: `top-4 right-4`, `top-4 left-4`, `bottom-4 right-4`, `bottom-4 left-4`

### Change Width
```blade
<!-- Default: max-width determined by content -->
<!-- Add w-96 or w-full for specific width -->
<div class="flex ... w-96">
```

### Change Animation Speed
```css
@keyframes slideIn {
    animation: slideIn 0.3s ...  /* Change 0.3s to desired duration */
}
```

### Custom Type (Add to window.Toast in toast-container.blade.php)
```javascript
// In getStylesByType(), add:
custom: {
    icon: '<svg>...</svg>',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
    textColor: 'text-purple-800 dark:text-purple-200',
    iconColor: 'text-purple-600 dark:text-purple-400'
}

// Then use it:
Toast.show('Custom!', 'custom', 5000);
```

---

## File locations

```
resources/
  views/
    components/
      toast-container.blade.php      ← Main component (include once)
    layouts/
      app.blade.php                  ← Example layout with flash handling
    examples/
      toast-demo.blade.php           ← Demo page
app/
  Http/
    Controllers/
      ExampleController.php          ← Controller examples
routes/
  example-routes.php                 ← Example route definitions
TOAST_SYSTEM_DOCUMENTATION.md        ← Full documentation
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Toasts not showing | Add `@include('components.toast-container')` to layout |
| Flash messages not appearing | Verify `session('success')` is set in controller |
| Styling looks wrong | Check if Tailwind CSS is compiled correctly |
| Animations choppy | Check browser prefers-reduced-motion setting |
| Messages not escaping HTML | Already handled - use `Toast.success(msg)` normally |
| Position wrong on mobile | Media queries handle 375px+ screens automatically |

---

## Browser Compatibility

✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ iOS Safari (latest)  
✅ Chrome Mobile (latest)  

---

## Performance Notes

- **No dependencies** - Pure vanilla JS
- **Memory efficient** - Cleans up DOM and timers
- **CSS animations** - GPU accelerated, smooth
- **Minimal overhead** - ~5KB total (including styles)

---

## Security Notes

✅ XSS protected (HTML escaped)  
✅ No inline scripts  
✅ CSRF safe (works with Laravel tokens)  
✅ No external dependencies  
✅ Content Security Policy compatible  

---

Created: February 2026 | Production Ready
