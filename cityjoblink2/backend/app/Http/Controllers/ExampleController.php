<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Example Controller showing Toast & Success Alert usage
 * 
 * Demonstrates both toast notifications and animated success alerts
 * with Laravel flash messages and session data.
 */
class ExampleController extends Controller
{
    /**
     * Show a success notification example
     */
    public function successExample(Request $request)
    {
        return back()->with('success', 'Operation completed successfully!');
    }

    /**
     * Show an error notification example
     */
    public function errorExample(Request $request)
    {
        return back()->with('error', 'An unexpected error occurred. Please try again.');
    }

    /**
     * Show a warning notification example
     */
    public function warningExample(Request $request)
    {
        return back()->with('warning', 'Please review your input before proceeding.');
    }

    /**
     * Show an info notification example
     */
    public function infoExample(Request $request)
    {
        return back()->with('info', 'Your profile has been updated.');
    }

    /**
     * Example: Success alert (centered modal with animated checkmark)
     */
    public function successAlertExample(Request $request)
    {
        return back()->with('success_alert', 'Your account has been created successfully!');
    }

    /**
     * Example: Registration with success alert
     */
    public function registerUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        // Create user (pseudo-code)
        // $user = User::create($validated);

        // Use success alert for important operations
        return redirect()->route('dashboard')
                       ->with('success_alert', 'Welcome! Your account is ready. Let\'s build your profile.');
    }

    /**
     * Example: Form submission with validation
     */
    public function submitForm(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ], [
            'name.required' => 'Please provide your name.',
            'email.unique' => 'This email is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        // Process the form
        // $user = User::create($validated);

        // Use toast for regular feedback
        return redirect()->route('dashboard')
                       ->with('success', 'Your account has been created successfully!');
    }

    /**
     * Example: Bulk update operation
     */
    public function bulkUpdate(Request $request)
    {
        try {
            $updated = 0;

            foreach ($request->get('items', []) as $item) {
                // Update logic
                $updated++;
            }

            if ($updated === 0) {
                return back()->with('warning', 'No items were selected for update.');
            }

            // Use toast for bulk operations
            return back()->with('success', "Successfully updated {$updated} item(s).");
        } catch (\Exception $e) {
            return back()->with('error', 'Bulk update failed. Please check your data and try again.');
        }
    }

    /**
     * Example: Critical action confirmation with success alert
     */
    public function deleteAccount(Request $request)
    {
        try {
            // Verify password
            // Delete user account

            // Use success alert for critical actions
            return redirect('/')
                   ->with('success_alert', 'Your account has been deleted. We hope to see you again!');
        } catch (\Exception $e) {
            return back()->with('error', 'Could not delete account. Please contact support.');
        }
    }

    /**
     * Example: Payment confirmation
     */
    public function processPayment(Request $request)
    {
        try {
            // Process payment
            // $transaction = Payment::charge(...);

            // Use success alert for important confirmations
            return redirect()->route('dashboard')
                           ->with('success_alert', 'Payment processed successfully! Your order is confirmed.');
        } catch (\Exception $e) {
            return back()->with('error', 'Payment failed. Please try again or contact support.');
        }
    }
}
