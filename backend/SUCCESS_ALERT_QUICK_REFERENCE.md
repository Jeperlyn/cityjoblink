# Success Alert - Quick Reference

## 5-Minute Setup

### 1. Include in Layout
```blade
@include('components.success-alert')
```

### 2. Show Alert
```javascript
SuccessAlert.show('Success!');
```

### 3. With Flash Messages
```php
return back()->with('success_alert', 'Done!');
```

---

## API Cheat Sheet

### Show Alert
```javascript
SuccessAlert.show(message, callback?)

// Examples:
SuccessAlert.show('Profile updated!');

SuccessAlert.show('Redirecting...', function() {
    window.location.href = '/dashboard';
});
```

### Close Alert
```javascript
SuccessAlert.close();
```

### Close on ESC or Overlay Click
Automatic - no code needed!

---

## Common Patterns

### Basic Success
```php
public function update(Request $request)
{
    Auth::user()->update($request->validated());
    return back()->with('success_alert', 'Changes saved!');
}
```

### With Redirect
```php
public function register(Request $request)
{
    User::create($request->validated());
    return redirect('/onboarding')
        ->with('success_alert', 'Welcome! Complete your profile.');
}
```

### Payment Confirmation
```php
public function processPayment(Request $request)
{
    Payment::charge($request->amount);
    return redirect('/orders')
        ->with('success_alert', 'Payment successful!');
}
```

### Multiple Steps
```javascript
SuccessAlert.show('Step 1 complete');
setTimeout(() => SuccessAlert.show('Step 2 complete'), 1000);
setTimeout(() => {
    SuccessAlert.show('Done!', () => location.reload());
}, 2000);
```

---

## Customization Tips

### Change Color
```blade
<!-- SVG checkmark -->
<path class="fill-none stroke-blue-500 ..." />

<!-- Button -->
<button class="bg-blue-500 hover:bg-blue-600 ..." />
```

### Change Size
```blade
<!-- Smaller -->
<div class="w-full max-w-xs ...">

<!-- Larger -->
<div class="w-full max-w-lg ...">
```

### Faster Animation
```css
animation: animateCheckmark 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
           /* 0.3s instead of 0.6s, 0.2s delay instead of 0.3s */
```

---

## Flash Message Integration

In your layout's `<script>` section:

```blade
<script>
    document.addEventListener('DOMContentLoaded', function() {
        @if (session('success_alert'))
            SuccessAlert.show("{{ session('success_alert') }}");
        @endif
    });
</script>
```

---

## Best Uses

✅ **Success Alert**: Account creation, payments, critical confirmations  
✅ **Toast Notifications**: Regular feedback, form submissions, info messages  
❌ **Browser alert()**: Never - use these components instead

---

## Demo Page
See `resources/views/examples/success-alert-demo.blade.php` for interactive examples.

---

## File Locations
```
resources/
  views/
    components/
      success-alert.blade.php          ← Main component
    examples/
      success-alert-demo.blade.php    ← Demo page
SUCCESS_ALERT_DOCUMENTATION.md         ← Full docs
SUCCESS_ALERT_QUICK_REFERENCE.md       ← This file
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Alert not showing | Add `@include('components.success-alert')` to layout |
| Message not displaying | Check `success_alert` session key name |
| Animation choppy | Check browser GPU/hardware acceleration |
| Callback not working | Ensure it's a valid function |
| Styling wrong | Verify Tailwind CSS compilation |

---

Created: February 2026 | Production Ready
