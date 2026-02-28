<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Example Controller
 * Demonstrates how to use Toast Notifications with Laravel Flash Messages
 */
class ExampleController extends Controller
{
    /**
     * Example: Show a success message after creating a record
     */
    public function store(Request $request)
    {
        // Validate and store data...
        // $record = Model::create($request->validated());

        // Flash success message to session
        return redirect()->back()->with('success', 'Record created successfully!');
    }

    /**
     * Example: Show an error message after a failed operation
     */
    public function delete($id)
    {
        try {
            // $record = Model::findOrFail($id);
            // $record->delete();

            return redirect()->back()->with('success', 'Record deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete record: ' . $e->getMessage());
        }
    }

    /**
     * Example: Show a warning message
     */
    public function update(Request $request, $id)
    {
        // Validate data...
        // $record = Model::findOrFail($id);
        // $record->update($request->validated());

        return redirect()->back()->with('warning', 'Changes will take effect after approval.');
    }

    /**
     * Example: Show an info message
     */
    public function show($id)
    {
        // $record = Model::findOrFail($id);

        return view('record.show', [
            // 'record' => $record,
        ])->with('info', 'This is a read-only view. Contact admin to edit.');
    }

    /**
     * Example: Show multiple flash messages using array
     */
    public function bulkAction(Request $request)
    {
        $successCount = 0;
        $errorCount = 0;

        foreach ($request->ids as $id) {
            try {
                // Process item
                $successCount++;
            } catch (\Exception $e) {
                $errorCount++;
            }
        }

        $message = "Processed $successCount records successfully.";
        if ($errorCount > 0) {
            $message .= " $errorCount records failed.";
        }

        return redirect()->back()
            ->with('success', $message)
            ->with('info', 'Bulk operation completed.');
    }

    /**
     * Example: Conditionally flash messages
     */
    public function complexLogic(Request $request)
    {
        $user = auth()->user();

        if (!$user->hasPermission('edit')) {
            return redirect()->back()->with('error', 'You do not have permission to perform this action.');
        }

        if ($request->password !== $request->password_confirmation) {
            return redirect()->back()
                ->with('error', 'Passwords do not match.')
                ->withInput();
        }

        // Perform action
        return redirect()->back()->with('success', 'Password updated successfully!');
    }
}
