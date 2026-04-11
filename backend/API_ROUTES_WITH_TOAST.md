# Toast Integration - API Routes Setup

This file provides example routes that use the toast notification system.

## File Location
`backend/routes/api.php`

## Job Fair & Training Registration Routes

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\JobFair;
use App\Models\Training;

Route::middleware('auth:sanctum')->group(function () {
    
    /**
     * Register user for a training
     * Route: POST /api/trainings/{id}/register
     * 
     * Controller Flash Message:
     * return redirect()->with('success', 'Successfully registered for training!');
     * 
     * AJAX Success Response:
     * { success: true, message: "Registration successful" }
     * 
     * Toast Display: Green success toast with checkmark
     */
    Route::post('/trainings/{training}/register', function (Training $training) {
        try {
            auth()->user()->trainings()->attach($training->id);
            
            // For AJAX requests, return JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully registered for training!',
                    'data' => $training
                ]);
            }
            
            // For form submissions, redirect with flash message
            return redirect()->back()->with('success', 'Successfully registered for training!');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Registration failed'], 400);
            }
            return redirect()->back()->with('error', 'Failed to register for training');
        }
    });

    /**
     * Withdraw from training
     * Route: DELETE /api/trainings/{id}/withdraw
     * 
     * Flash Message:
     * return redirect()->with('success', 'Withdrawn from training successfully');
     * 
     * Toast Display: Green success toast
     */
    Route::delete('/trainings/{training}/withdraw', function (Training $training) {
        try {
            auth()->user()->trainings()->detach($training->id);
            
            if (request()->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Withdrawn successfully']);
            }
            
            return redirect()->back()->with('success', 'Withdrawn from training successfully');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Withdrawal failed'], 400);
            }
            return redirect()->back()->with('error', 'Failed to withdraw from training');
        }
    });

    /**
     * Register user for a job fair
     * Route: POST /api/job-fairs/{id}/register
     * 
     * Flash Message:
     * return redirect()->with('success', 'Successfully registered for job fair!');
     * 
     * Toast Display: Green success toast with checkmark
     */
    Route::post('/job-fairs/{jobFair}/register', function (JobFair $jobFair) {
        try {
            auth()->user()->jobFairs()->attach($jobFair->id);
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully registered for job fair!',
                    'data' => $jobFair
                ]);
            }
            
            return redirect()->back()->with('success', 'Successfully registered for job fair!');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Registration failed'], 400);
            }
            return redirect()->back()->with('error', 'Failed to register for job fair');
        }
    });

    /**
     * Withdraw from job fair
     * Route: DELETE /api/job-fairs/{id}/withdraw
     * 
     * Flash Message:
     * return redirect()->with('success', 'Withdrawn from job fair successfully');
     * 
     * Toast Display: Green success toast
     */
    Route::delete('/job-fairs/{jobFair}/withdraw', function (JobFair $jobFair) {
        try {
            auth()->user()->jobFairs()->detach($jobFair->id);
            
            if (request()->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Withdrawn successfully']);
            }
            
            return redirect()->back()->with('success', 'Withdrawn from job fair successfully');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Withdrawal failed'], 400);
            }
            return redirect()->back()->with('error', 'Failed to withdraw from job fair');
        }
    });

    /**
     * Get user's registered trainings
     * Route: GET /api/user/trainings
     * 
     * Returns:
     * { success: true, data: [training1, training2, ...] }
     * 
     * Toast Display: Optional info toast while loading
     */
    Route::get('/user/trainings', function (Request $request) {
        $trainings = auth()->user()->trainings()->get();
        
        return response()->json([
            'success' => true,
            'data' => $trainings,
            'count' => $trainings->count()
        ]);
    });

    /**
     * Get user's registered job fairs
     * Route: GET /api/user/job-fairs
     * 
     * Returns:
     * { success: true, data: [jobFair1, jobFair2, ...] }
     * 
     * Toast Display: Optional info toast while loading
     */
    Route::get('/user/job-fairs', function (Request $request) {
        $jobFairs = auth()->user()->jobFairs()->get();
        
        return response()->json([
            'success' => true,
            'data' => $jobFairs,
            'count' => $jobFairs->count()
        ]);
    });

    /**
     * Check if user is registered for training
     * Route: GET /api/trainings/{id}/is-registered
     * 
     * Returns:
     * { registered: true }
     */
    Route::get('/trainings/{training}/is-registered', function (Training $training) {
        $registered = auth()->user()->trainings()->where('training_id', $training->id)->exists();
        
        return response()->json(['registered' => $registered]);
    });

    /**
     * Check if user is registered for job fair
     * Route: GET /api/job-fairs/{id}/is-registered
     * 
     * Returns:
     * { registered: true }
     */
    Route::get('/job-fairs/{jobFair}/is-registered', function (JobFair $jobFair) {
        $registered = auth()->user()->jobFairs()->where('job_fair_id', $jobFair->id)->exists();
        
        return response()->json(['registered' => $registered]);
    });
});
```

## Frontend Integration Example

```blade
{{-- resources/views/trainings/show.blade.php --}}

<div class="p-6 bg-white rounded-lg shadow">
    <h1>{{ $training->title }}</h1>
    <p>{{ $training->description }}</p>
    
    <div id="registration-status">
        <button id="registerBtn" onclick="registerTraining({{ $training->id }})" class="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Register Now
        </button>
        
        <button id="withdrawBtn" onclick="withdrawTraining({{ $training->id }})" class="px-4 py-2 bg-red-500 text-white rounded-lg hidden">
            Withdraw
        </button>
    </div>
</div>

<script>
// Check if user is already registered
async function checkRegistration(trainingId) {
    const response = await fetch(`/api/trainings/${trainingId}/is-registered`);
    const data = await response.json();
    
    if (data.registered) {
        document.getElementById('registerBtn').classList.add('hidden');
        document.getElementById('withdrawBtn').classList.remove('hidden');
    }
}

// Register for training with toast notification
function registerTraining(trainingId) {
    Toast.info('Registering for training...');
    
    fetch(`/api/trainings/${trainingId}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Toast.success(data.message);
            checkRegistration(trainingId);
            
            // Reload dashboard if present
            if (window.reloadDashboard) {
                setTimeout(window.reloadDashboard, 1500);
            }
        } else {
            Toast.error(data.message || 'Registration failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Toast.error('Network error. Please try again.');
    });
}

// Withdraw from training with toast notification
function withdrawTraining(trainingId) {
    Toast.warning('Withdrawing from training...');
    
    fetch(`/api/trainings/${trainingId}/withdraw`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Toast.success(data.message);
            checkRegistration(trainingId);
        } else {
            Toast.error(data.message || 'Withdrawal failed');
        }
    })
    .catch(error => {
        Toast.error('Network error. Please try again.');
    });
}

// Check registration status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkRegistration({{ $training->id }});
});
</script>
```

## Testing the Routes

### Test with cURL (from command line)

```bash
# Register for training
curl -X POST http://localhost:8000/api/trainings/1/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Check registration status
curl -X GET http://localhost:8000/api/trainings/1/is-registered \
  -H "Authorization: Bearer YOUR_TOKEN"

# Withdraw from training
curl -X DELETE http://localhost:8000/api/trainings/1/withdraw \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test with Postman

1. Create new request (POST)
2. URL: `http://localhost:8000/api/trainings/1/register`
3. Headers tab:
   - Authorization: Bearer `YOUR_SANCTUM_TOKEN`
   - Content-Type: application/json
4. Click Send
5. Response should show: `{ "success": true, "message": "Successfully registered..." }`

## Toast Messages Reference

| Action | Success Message | Error Message | Toast Type |
|--------|-----------------|---------------|------------|
| Register Training | "Successfully registered for training!" | "Failed to register for training" | success / error |
| Withdraw Training | "Withdrawn from training successfully" | "Failed to withdraw from training" | success / error |
| Register Job Fair | "Successfully registered for job fair!" | "Failed to register for job fair" | success / error |
| Withdraw Job Fair | "Withdrawn from job fair successfully" | "Failed to withdraw from job fair" | success / error |

---

**Last Updated:** 2026-02-23  
**Status:** Ready to Implement
