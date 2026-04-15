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
Route::post('/forgot-password/request', [AuthController::class, 'requestPasswordResetOtp']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPasswordWithOtp']);
Route::post('/upload/resume', [AuthController::class, 'uploadResume']);
Route::delete('/upload/resume', [AuthController::class, 'deleteResume']);
Route::post('/upload/employer-documents', [AuthController::class, 'uploadEmployerDocuments']);
Route::post('/upload/seeker-id-document', [AuthController::class, 'uploadSeekerIdDocument']);
Route::post('/n8n/seeker-id-verification/callback', [AuthController::class, 'handleN8nSeekerIdVerificationCallback']);

// --- Job Routes ---
Route::get('/jobs', [FeatureController::class, 'jobs']);
Route::get('/dropdowns/skills', [FeatureController::class, 'skillDropdownOptions']);
Route::post('/jobs', [FeatureController::class, 'createJob']);
// ✅ DAGDAG: Ito ang kailangan para sa Update functionality (PUT/PATCH)
Route::put('/jobs/{id}', [FeatureController::class, 'updateJob']); 
Route::delete('/jobs/{id}', [FeatureController::class, 'deleteJob']); // Bonus: para sa delete functionality

// --- Application Routes ---
Route::get('/seeker/profile', [FeatureController::class, 'seekerProfile']);
Route::post('/seeker/update-profile', [FeatureController::class, 'updateSeekerProfile']);
Route::get('/seeker/recommendations', [FeatureController::class, 'seekerRecommendations']);
Route::post('/applications/apply', [FeatureController::class, 'applyJob']);
Route::patch('/applications/withdraw', [FeatureController::class, 'withdrawApplication']);
Route::get('/applications/seeker', [FeatureController::class, 'seekerApplications']);
Route::get('/applications/employer', [FeatureController::class, 'employerApplications']);
Route::patch('/applications/status', [FeatureController::class, 'updateApplicationStatus']);
Route::post('/applications/feedback', [FeatureController::class, 'submitEmployerFeedback']);
Route::get('/seeker/saved-jobs', [FeatureController::class, 'getSavedJobs']);
Route::post('/seeker/saved-jobs/toggle', [FeatureController::class, 'toggleSaveJob']);

// --- Other Features ---
Route::get('/trainings', [FeatureController::class, 'trainings']);
Route::post('/trainings/register', [FeatureController::class, 'registerTraining']);
Route::patch('/trainings/withdraw', [FeatureController::class, 'withdrawTraining']);
Route::get('/admin/analytics', [FeatureController::class, 'adminAnalytics']);
Route::get('/admin/employers', [FeatureController::class, 'adminEmployers']);
Route::patch('/admin/employers/review', [FeatureController::class, 'reviewEmployer']);
Route::get('/admin/seekers', [FeatureController::class, 'adminSeekers']);
Route::patch('/admin/seekers/review', [FeatureController::class, 'reviewSeekerId']);
Route::post('/admin/trainings', [FeatureController::class, 'adminCreateTraining']);
Route::delete('/admin/trainings/{id}', [FeatureController::class, 'adminDeleteTraining']);
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

// --- Job Fair Routes ---
Route::get('/job-fairs', [FeatureController::class, 'getJobFairs']);
Route::post('/job-fairs/join', [FeatureController::class, 'joinJobFair']);
Route::patch('/job-fairs/leave', [FeatureController::class, 'leaveJobFair']);
Route::post('/job-fairs', [FeatureController::class, 'createJobFair']);
