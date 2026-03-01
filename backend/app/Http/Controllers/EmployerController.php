<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\JobCatalog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmployerController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        $user->update([
            'company_name'    => $request->companyName,
            'address'         => $request->companyAddress, 
            'industry'        => $request->industry,
            'contact_number'  => $request->contactNumber,
            'company_website' => $request->companyWebsite,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully!',
            'user' => $user->fresh() 
        ]);
    }

    public function getJobMatches($id)
    {
        // Fetch results from the job_matches table you created earlier
        $matches = DB::table('job_matches')
            ->join('users', 'job_matches.user_id', '=', 'users.id')
            ->where('job_id', $id)
            ->select(
                'users.name', 
                'users.email', 
                'job_matches.match_score', 
                'job_matches.match_reasons'
            )
            ->orderBy('match_score', 'desc')
            ->get();

        return response()->json($matches);
    }

    public function storeJob(Request $request)
    {
        // 1. Validate incoming request
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'required_skills' => 'required|array',
            'educational_attainment_required' => 'nullable|string',
        ]);

        // 2. SAVE THE JOB (No more mocking!)
        $job = JobCatalog::create([
            'title'           => $validated['title'],
            'description'     => $validated['description'],
            'required_skills' => $validated['required_skills'],
            'educational_attainment_required' => $request->educational_attainment_required ?? 'Not Specified',
            'status'          => 'active',
        ]);

        // 3. Trigger n8n with the REAL ID and Basic Auth
        $webhookUrl = config('services.n8n.match_webhook_url');
        
        if ($webhookUrl) {
            try {
                $request = Http::timeout((int) config('services.n8n.timeout_seconds', 10));

                $authUser = config('services.n8n.basic_auth_user');
                $authPassword = config('services.n8n.basic_auth_password');

                if ($authUser !== null && $authPassword !== null && $authUser !== '' && $authPassword !== '') {
                    $request = $request->withBasicAuth((string) $authUser, (string) $authPassword);
                }

                $skillsRequired = is_array($job->required_skills)
                    ? $job->required_skills
                    : (json_decode((string) ($job->required_skills ?? '[]'), true) ?: []);

                $response = $request->post($webhookUrl, [
                    'event'                           => 'job_created',
                    'job_id'                          => $job->id,
                    'title'                           => $job->title,
                    'description'                     => $job->description,
                    'skills_required'                 => $skillsRequired,
                    'required_skills'                 => $skillsRequired,
                    'educational_attainment_required' => $job->educational_attainment_required,
                ]);

                if ($response->successful()) {
                    Log::info("n8n workflow trigger success for Job ID: {$job->id}", [
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);
                } else {
                    Log::warning("n8n workflow trigger non-success for Job ID: {$job->id}", [
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error("n8n connection failed: " . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Job posted successfully! Match results will appear shortly.',
            'job' => $job
        ], 201);
    }
}