<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\EmployerController;

// --- Auth Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/upload/resume', [AuthController::class, 'uploadResume']);
Route::delete('/upload/resume', [AuthController::class, 'deleteResume']);
Route::post('/upload/employer-documents', [AuthController::class, 'uploadEmployerDocuments']);

// --- Job Routes ---
Route::get('/jobs', [FeatureController::class, 'jobs']);
Route::post('/jobs', [FeatureController::class, 'createJob']);
// ✅ DAGDAG: Ito ang kailangan para sa Update functionality (PUT/PATCH)
Route::put('/jobs/{id}', [FeatureController::class, 'updateJob']); 
Route::delete('/jobs/{id}', [FeatureController::class, 'deleteJob']); // Bonus: para sa delete functionality

// --- Application Routes ---
Route::get('/seeker/profile', [FeatureController::class, 'seekerProfile']);
Route::get('/seeker/recommendations', [FeatureController::class, 'seekerRecommendations']);
Route::post('/applications/apply', [FeatureController::class, 'applyJob']);
Route::patch('/applications/withdraw', [FeatureController::class, 'withdrawApplication']);
Route::get('/applications/seeker', [FeatureController::class, 'seekerApplications']);
Route::get('/applications/employer', [FeatureController::class, 'employerApplications']);
Route::patch('/applications/status', [FeatureController::class, 'updateApplicationStatus']);

// --- Other Features ---
Route::get('/trainings', [FeatureController::class, 'trainings']);
Route::get('/admin/employers', [FeatureController::class, 'adminEmployers']);
Route::patch('/admin/employers/review', [FeatureController::class, 'reviewEmployer']);
Route::post('/employer/jobs', [EmployerController::class, 'storeJob']);

// --- Notifications & Pulse ---
Route::get('/notifications', [FeatureController::class, 'notifications']);
Route::patch('/notifications/read', [FeatureController::class, 'markNotificationRead']);
Route::post('/pulse/generate', [FeatureController::class, 'generatePulse']);

// --- Messaging ---
Route::get('/messages', [FeatureController::class, 'messages']);
Route::post('/messages/send', [FeatureController::class, 'sendMessage']);
Route::patch('/messages/read', [FeatureController::class, 'markMessagesRead']);

// --- Metrics & Profile ---
Route::get('/match-metrics', [FeatureController::class, 'matchMetrics']);
Route::post('/employer/update-profile', [EmployerController::class, 'updateProfile']);