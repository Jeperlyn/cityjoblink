<?php

use App\Http\Controllers\ExampleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Example Routes - Toast & Success Alert Systems
|--------------------------------------------------------------------------
|
| These routes demonstrate both toast notifications and animated 
| success alerts with flash messages and JavaScript triggers.
|
*/

// ============ TOAST NOTIFICATIONS ============

// Flash message examples (redirect and show toast on return)
Route::post('/example/success', [ExampleController::class, 'successExample'])
    ->name('example.success');

Route::post('/example/error', [ExampleController::class, 'errorExample'])
    ->name('example.error');

Route::post('/example/warning', [ExampleController::class, 'warningExample'])
    ->name('example.warning');

Route::post('/example/info', [ExampleController::class, 'infoExample'])
    ->name('example.info');

// ============ SUCCESS ALERTS ============

// Success alert example
Route::post('/example/success-alert', [ExampleController::class, 'successAlertExample'])
    ->name('example.success-alert');

// Registration with success alert
Route::post('/example/register', [ExampleController::class, 'registerUser'])
    ->name('example.register');

// Payment confirmation
Route::post('/example/payment', [ExampleController::class, 'processPayment'])
    ->name('example.payment');

// Delete account
Route::post('/example/delete-account', [ExampleController::class, 'deleteAccount'])
    ->name('example.delete-account');

// ============ ADVANCED EXAMPLES ============

// Form submission
Route::post('/example/form', [ExampleController::class, 'submitForm'])
    ->name('example.form');

// Bulk update
Route::post('/example/bulk-update', [ExampleController::class, 'bulkUpdate'])
    ->name('example.bulk-update');

// ============ DEMO PAGES ============

Route::get('/examples/toast', function () {
    return view('examples.toast-demo');
})->name('toast.demo');

Route::get('/examples/success-alert', function () {
    return view('examples.success-alert-demo');
})->name('success-alert.demo');
