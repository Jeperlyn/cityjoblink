<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;
use App\Models\User; // ✅ IMPORT USER MODEL

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================
// 1. AUTHENTICATION
// ==========================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/jobs', [JobController::class, 'store']);
Route::get('/jobs', [JobController::class, 'index']);

// ==========================
// 2. ADMIN DASHBOARD ROUTES
// ==========================

// ✅ GET ALL USERS: This fixes your empty Admin Dashboard
Route::get('/users', function () {
    // Returns all users sorted by newest first
    // React filters this to show only 'Employer' roles
    return User::orderBy('created_at', 'desc')->get();
});

// ✅ VERIFY EMPLOYER: This makes the Approve/Reject buttons work
Route::post('/verify-employer/{id}', function ($id, Request $request) {
    $user = User::find($id);
    
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // React sends { status: 'approved' } or { status: 'rejected' }
    $status = $request->input('status');
    
    if ($status === 'approved') {
        $user->is_verified = true;
    } else {
        $user->is_verified = false;
        // Optional: clear the image so they have to upload again
        // $user->id_image = null; 
    }
    
    $user->save();

    return response()->json([
        'message' => 'Verification status updated',
        'user' => $user
    ]);
});

// ==========================
// 3. FILE UPLOADS
// ==========================

// ✅ EMPLOYER DOC UPLOAD: Allows uploading permit inside the Dashboard
Route::post('/user/upload-docs/{id}', function ($id, Request $request) {
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if ($request->hasFile('id_image')) {
        // Save file to 'storage/app/public/id_images'
        // Make sure you ran: php artisan storage:link
        $path = $request->file('id_image')->store('id_images', 'public');
        
        $user->id_image = $path; // Updates database column
        $user->save();

        return response()->json([
            'message' => 'Document uploaded successfully',
            'path' => $path
        ]);
    }

    return response()->json(['message' => 'No file uploaded'], 400);
});

// ==========================
// 4. JOB ROUTES
// ==========================
Route::get('/jobs', [JobController::class, 'index']); // Public job list

// Protected Routes (Require Login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs', [JobController::class, 'store']); // Post a job
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});