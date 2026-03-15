<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\User;
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
        $validated = $request->validate([
            'email' => ['nullable', 'email'],
            'employer_id' => ['nullable', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'industry' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'required_skills' => ['required', 'array'],
            'required_skills.*' => ['string', 'max:100'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'educational_attainment_required' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['email']) && empty($validated['employer_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Either email or employer_id is required.',
            ], 422);
        }

        if (isset($validated['salary_min'], $validated['salary_max']) && (int) $validated['salary_max'] < (int) $validated['salary_min']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maximum salary must be greater than or equal to minimum salary.',
            ], 422);
        }

        $employerQuery = User::query();
        if (!empty($validated['employer_id'])) {
            $employerQuery->where('id', $validated['employer_id']);
        } else {
            $employerQuery->where('email', $validated['email']);
        }

        $employer = $employerQuery->first();
        if (!$employer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Employer not found.',
            ], 404);
        }

        if (($employer->role ?? '') !== 'Employer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only employer accounts can post jobs.',
            ], 422);
        }

        if (!$employer->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Employer account must be verified before posting jobs.',
            ], 403);
        }

        $jobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $employer->id,
            'title' => $validated['title'],
            'company' => $validated['company'] ?? ($employer->company_name ?: $employer->name),
            'location' => $validated['location'] ?? ($employer->address ?: 'Unspecified'),
            'salary_min' => $validated['salary_min'] ?? null,
            'salary_max' => $validated['salary_max'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'Full-time',
            'industry' => $validated['industry'] ?? $employer->industry,
            'required_skills' => json_encode($validated['required_skills']),
            'description' => $validated['description'] ?? null,
            'educational_attainment_required' => $validated['educational_attainment_required'] ?? 'Not Specified',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $job = DB::table('jobs_catalog')->where('id', $jobId)->first();

        $webhookUrl = config('services.n8n.match_webhook_url');
        if ($webhookUrl) {
            try {
                $httpRequest = Http::timeout((int) config('services.n8n.timeout_seconds', 10));

                $authUser = config('services.n8n.basic_auth_user');
                $authPassword = config('services.n8n.basic_auth_password');

                if ($authUser !== null && $authPassword !== null && $authUser !== '' && $authPassword !== '') {
                    $httpRequest = $httpRequest->withBasicAuth((string) $authUser, (string) $authPassword);
                }

                $skillsRequired = json_decode((string) ($job->required_skills ?? '[]'), true) ?: [];

                $response = $httpRequest->post($webhookUrl, [
                    'event' => 'job_created',
                    'job_id' => $job->id,
                    'title' => $job->title,
                    'company' => $job->company,
                    'location' => $job->location,
                    'employment_type' => $job->employment_type,
                    'industry' => $job->industry,
                    'description' => $job->description,
                    'skills_required' => $skillsRequired,
                    'required_skills' => $skillsRequired,
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
                Log::error("n8n connection failed: {$e->getMessage()}");
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Job posted successfully! Match results will appear shortly.',
            'job' => $job,
        ], 201);
    }
}
