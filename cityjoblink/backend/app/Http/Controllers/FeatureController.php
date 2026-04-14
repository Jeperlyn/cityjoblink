<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FeatureController extends Controller
{
    public function skillDropdownOptions()
    {
        $rows = DB::table('skill_categories as c')
            ->join('skills as s', 's.category_id', '=', 'c.id')
            ->select([
                'c.id as category_id',
                'c.name as category_name',
                'c.slug as category_slug',
                's.id as skill_id',
                's.skill_name',
                's.slug as skill_slug',
            ])
            ->orderBy('c.name')
            ->orderBy('s.skill_name')
            ->get();

        $categories = [];

        foreach ($rows as $row) {
            $categoryKey = (string) $row->category_id;

            if (!isset($categories[$categoryKey])) {
                $categories[$categoryKey] = [
                    'id' => $row->category_id,
                    'name' => $row->category_name,
                    'slug' => $row->category_slug,
                    'skills' => [],
                ];
            }

            $categories[$categoryKey]['skills'][] = [
                'id' => $row->skill_id,
                'skill_name' => $row->skill_name,
                'slug' => $row->skill_slug,
            ];
        }

        return response()->json([
            'status' => 'success',
            'categories' => array_values($categories),
        ]);
    }

    public function seekerProfile(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $birthdayDisplay = $this->buildBirthdayDisplay($user);

        return response()->json([
            'status' => 'success',
            'user' => $user,
            'birthday_display' => $birthdayDisplay,
        ]);
    }

    public function updateSeekerProfile(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
        ]);

        $seeker = User::where('email', $validated['email'])->first();
        if (!$seeker || ($seeker->role ?? '') !== 'Seeker') {
            return response()->json(['status' => 'error', 'message' => 'Seeker not found.'], 404);
        }

        $normalizeUrl = static function ($value): ?string {
            if (!is_string($value)) {
                return null;
            }

            $trimmed = trim($value);
            return $trimmed === '' ? null : $trimmed;
        };

        $seeker->update([
            'portfolio_url' => $normalizeUrl($request->input('portfolio_url')),
            'linkedin_url' => $normalizeUrl($request->input('linkedin_url')),
            'github_url' => $normalizeUrl($request->input('github_url')),
            'facebook_url' => $normalizeUrl($request->input('facebook_url')),
            'instagram_url' => $normalizeUrl($request->input('instagram_url')),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Seeker profile updated successfully.',
            'user' => $seeker->fresh(),
        ]);
    }

    // ✅ NEW FEATURE: Get Saved Jobs
    public function getSavedJobs(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);
        
        $seeker = User::where('email', $request->email)->first();
        if (!$seeker) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        try {
            $savedJobs = DB::table('saved_jobs')
                ->where('seeker_id', $seeker->id)
                ->pluck('job_id')
                ->toArray();

            return response()->json([
                'status' => 'success',
                'saved_jobs' => $savedJobs,
            ]);
        } catch (\Exception $e) {
            // Graceful fallback if the 'saved_jobs' table hasn't been created yet
            return response()->json([
                'status' => 'success',
                'saved_jobs' => [],
            ]);
        }
    }

    // ✅ NEW FEATURE: Toggle Saved Job (Add/Remove)
    public function toggleSaveJob(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'job_id' => ['required', 'integer', 'exists:jobs_catalog,id'],
        ]);

        $seeker = User::where('email', $request->email)->first();
        if (!$seeker) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        try {
            $existing = DB::table('saved_jobs')
                ->where('seeker_id', $seeker->id)
                ->where('job_id', $request->job_id)
                ->first();

            if ($existing) {
                DB::table('saved_jobs')
                    ->where('seeker_id', $seeker->id)
                    ->where('job_id', $request->job_id)
                    ->delete();

                return response()->json([
                    'status' => 'success', 
                    'message' => 'Job removed from saved list.', 
                    'is_saved' => false
                ]);
            } else {
                DB::table('saved_jobs')->insert([
                    'seeker_id' => $seeker->id,
                    'job_id' => $request->job_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'status' => 'success', 
                    'message' => 'Job saved successfully.', 
                    'is_saved' => true
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database table not found. Admin needs to migrate saved_jobs table.',
            ], 500);
        }
    }

    public function applyJob(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'job_id' => ['required', 'integer', 'exists:jobs_catalog,id'],
        ]);

        $seeker = User::where('email', $request->email)->first();
        if (!$seeker) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        if ($seeker->id_verification_status !== 'verified') {
            $statusMessage = match ($seeker->id_verification_status) {
                'manual_review' => 'Your account is currently under review by an Admin. You cannot apply for jobs until your ID is verified.',
                'rejected'      => 'Your ID verification was rejected. Please upload a valid ID to apply for jobs.',
                default         => 'You must verify your identity by uploading a valid ID before applying for jobs.',
            };

            return response()->json([
                'status' => 'error',
                'message' => $statusMessage,
            ], 403);
        }

        if (empty($seeker->resume_path) || empty($seeker->educational_attainment) || $seeker->educational_attainment === 'Not Specified') {
            return response()->json([
                'status' => 'error',
                'message' => 'Please upload your resume in your Profile to set your educational attainment before applying.',
            ], 403);
        }

        $cooldownCutoff = Carbon::now()->subMonths(6);
        $latestDeclined = DB::table('applications')
            ->where('seeker_id', $seeker->id)
            ->whereIn('status', ['Declined', 'Rejected'])
            ->whereRaw('COALESCE(declined_at, updated_at, created_at, applied_at) >= ?', [$cooldownCutoff])
            ->orderByRaw('COALESCE(declined_at, updated_at, created_at, applied_at) DESC')
            ->first();

        if ($latestDeclined) {
            $declinedAt = Carbon::parse((string) ($latestDeclined->declined_at ?? $latestDeclined->updated_at ?? $latestDeclined->created_at ?? now()));
            $cooldownEndsAt = $declinedAt->copy()->addMonths(6);

            return response()->json([
                'status' => 'error',
                'message' => 'You can apply again after your 6-month cooldown ends on ' . $cooldownEndsAt->toFormattedDateString() . '.',
                'cooldown_end_at' => $cooldownEndsAt->toDateString(),
            ], 429);
        }

        $existing = DB::table('applications')
            ->where('job_id', $request->job_id)
            ->where('seeker_id', $seeker->id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already applied to this job.',
                'application' => $existing,
            ], 409);
        }

        $job = DB::table('jobs_catalog')->where('id', $request->job_id)->first();
        if (!$job) {
            return response()->json(['status' => 'error', 'message' => 'Job not found.'], 404);
        }

        $educationCheck = $this->evaluateEducationQualification(
            (string) ($job->educational_attainment_required ?? ''),
            (string) ($seeker->educational_attainment ?? '')
        );

        if ($educationCheck['is_required'] && !$educationCheck['qualified']) {
            $requiredLabel = $educationCheck['required_label'] ?? 'the required educational attainment';
            $candidateLabel = $educationCheck['candidate_label'] ?? 'Not specified';
            $rejectionReason = "Automatically declined: This job requires {$requiredLabel}, while your educational attainment is {$candidateLabel}. You are not qualified for this position.";

            $applicationId = DB::table('applications')->insertGetId([
                'job_id' => $request->job_id,
                'seeker_id' => $seeker->id,
                'status' => 'Declined',
                'rejection_reason' => $rejectionReason,
                'decline_reason_code' => 'auto_education',
                'decline_reason_text' => $rejectionReason,
                'declined_at' => now(),
                'applied_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $notifContent = $this->generateNotificationContent('application_auto_rejected_education', [
                'job_title' => $job->title,
                'required_education' => $requiredLabel,
            ]);

            DB::table('notifications')->insert([
                'to_user_id' => $seeker->id,
                'content' => $notifContent['content'],
                'meta' => json_encode([
                    'type' => 'application_auto_rejected_education',
                    'application_id' => $applicationId,
                    'job_id' => $job->id,
                    'required_education' => $requiredLabel,
                    'candidate_education' => $candidateLabel,
                    'emoji' => $notifContent['emoji'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $application = DB::table('applications')->where('id', $applicationId)->first();

            return response()->json([
                'status' => 'error',
                'code' => 'EDUCATION_NOT_QUALIFIED',
                'message' => $rejectionReason,
                'application' => $application,
            ], 422);
        }

        $applicationId = DB::table('applications')->insertGetId([
            'job_id' => $request->job_id,
            'seeker_id' => $seeker->id,
            'status' => 'Pending',
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $notifContent = $this->generateNotificationContent('new_application_to_employer', [
            'job_title' => $job->title,
            'seeker_name' => $seeker->name,
        ]);

        DB::table('notifications')->insert([
            'to_user_id' => $job->employer_id,
            'content' => $notifContent['content'],
            'meta' => json_encode([
                'type' => 'new_application',
                'application_id' => $applicationId,
                'job_id' => $job->id,
                'seeker_id' => $seeker->id,
                'emoji' => $notifContent['emoji'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $application = DB::table('applications')->where('id', $applicationId)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Application submitted successfully.',
            'application' => $application,
        ]);
    }

    public function withdrawApplication(Request $request)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Withdrawal is no longer available. Applications now follow Pending -> Interview -> Hired or Declined.',
        ], 410);
    }

    public function seekerApplications(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $seeker = User::where('email', $request->email)->first();
        if (!$seeker) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $applications = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->leftJoin('application_feedback as af', 'af.application_id', '=', 'a.id')
            ->where('a.seeker_id', $seeker->id)
            ->orderByDesc('a.created_at')
            ->select([
                'a.id',
                'a.job_id',
                'a.status',
                'a.applied_at',
                'a.rejection_reason',
                'a.decline_reason_code',
                'a.decline_reason_text',
                'a.declined_at',
                'a.created_at',
                'j.title as job_title',
                'j.company',
                'j.location',
                'j.employment_type',
                'j.status as job_status',
                'j.educational_attainment_required',
                'af.rating as feedback_rating',
                'af.feedback_comment',
                'af.submitted_at as feedback_submitted_at',
            ])
            ->get()
            ->map(function ($item) {
                $item->status = $this->normalizeApplicationStatus((string) $item->status);
                if ($item->status === 'Declined' && empty($item->decline_reason_text) && !empty($item->rejection_reason)) {
                    $item->decline_reason_text = $item->rejection_reason;
                }
                $ribbon = $this->mapRibbon((string) $item->status);
                $item->ribbon_label = $ribbon['label'];
                $item->ribbon_variant = $ribbon['variant'];
                return $item;
            })
            ->values();

        $active = $applications;
        $withdrawn = collect();

        return response()->json([
            'status' => 'success',
            'active_applications' => $active,
            'withdrawn_applications' => $withdrawn,
        ]);
    }

    public function jobs(Request $request)
    {
        $query = DB::table('jobs_catalog as j')
            ->leftJoin('users as e', 'e.id', '=', 'j.employer_id');

        if (!$request->boolean('include_closed')) {
            $query->where('j.status', 'Open');
        }

        if ($request->filled('q')) {
            $keyword = $request->string('q')->toString();
            $query->where(function ($inner) use ($keyword) {
                $inner->where('j.title', 'ilike', '%' . $keyword . '%')
                    ->orWhere('j.company', 'ilike', '%' . $keyword . '%')
                    ->orWhere('j.description', 'ilike', '%' . $keyword . '%');
            });
        }

        if ($request->filled('location')) {
            $query->where('j.location', $request->string('location')->toString());
        }

        if ($request->filled('employment_type')) {
            $query->where('j.employment_type', $request->string('employment_type')->toString());
        }

        if ($request->filled('industry')) {
            $query->where('j.industry', $request->string('industry')->toString());
        }

        $jobs = $query
            ->orderByDesc('j.created_at')
            ->select([
                'j.*',
                'e.company_website as employer_company_website',
            ])
            ->get();

        return response()->json([
            'status' => 'success',
            'jobs' => $jobs,
        ]);
    }

    public function createJob(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'required_skills' => ['nullable', 'array'],
            'required_skills.*' => ['string', 'max:100'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'educational_attainment_required' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
        ]);

        if ($request->filled('salary_min') && $request->filled('salary_max') && (int) $request->salary_max < (int) $request->salary_min) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maximum salary must be greater than or equal to minimum salary.',
            ], 422);
        }

        $employer = User::where('email', $request->email)->first();
        if (!$employer) {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        if (($employer->role ?? '') !== 'Employer') {
            return response()->json(['status' => 'error', 'message' => 'Only employer accounts can post jobs.'], 422);
        }

        if (!$employer->is_verified) {
            return response()->json(['status' => 'error', 'message' => 'Employer account must be verified before posting jobs.'], 403);
        }

        $normalizedMinimumEducation = $this->normalizeMinimumEducationRequirement(
            $request->input('educational_attainment_required')
        );

        $jobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $employer->id,
            'title' => $request->title,
            'company' => $employer->company_name ?: $employer->name,
            'location' => $request->location,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'employment_type' => $request->employment_type,
            'industry' => $request->industry,
            'required_skills' => json_encode($request->required_skills ?? []),
            'educational_attainment_required' => $normalizedMinimumEducation,
            'description' => $request->description,
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $job = DB::table('jobs_catalog')->where('id', $jobId)->first();

        $this->triggerN8nJobMatch($job);

        return response()->json([
            'status' => 'success',
            'message' => 'Job posted successfully.',
            'job' => $job,
        ]);
    }

    private function triggerN8nJobMatch(object $job): void
    {
        $webhookUrl = config('services.n8n.match_webhook_url');

        if (!$webhookUrl) {
            return;
        }

        try {
            $request = Http::timeout((int) config('services.n8n.timeout_seconds', 10));

            $authUser = config('services.n8n.basic_auth_user');
            $authPassword = config('services.n8n.basic_auth_password');

        if ($authUser !== null && $authPassword !== null && $authUser !== '' && $authPassword !== '') {
            $request = $request->withBasicAuth((string) $authUser, (string) $authPassword);
        }

            $skillsRequired = json_decode((string) ($job->required_skills ?? '[]'), true) ?: [];

            $response = $request->post($webhookUrl, [
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
                Log::info("n8n webhook success for job {$job->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            } else {
                Log::warning("n8n webhook non-success for job {$job->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $error) {
            Log::error('n8n webhook trigger failed: ' . $error->getMessage());
        }
    }

    // ✅ FEATURE: Updated to accept and save 'status'
    public function updateJob(Request $request, $id)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'required_skills' => ['nullable', 'array'],
            'required_skills.*' => ['string', 'max:100'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'educational_attainment_required' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:Open,Closed,Paused'], 
        ]);

        $employer = User::where('email', $request->email)->first();
        if (!$employer) {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $job = DB::table('jobs_catalog')->where('id', $id)->first();
        if (!$job) {
            return response()->json(['status' => 'error', 'message' => 'Job not found.'], 404);
        }

        if ((int) $job->employer_id !== (int) $employer->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to update this job.'], 403);
        }

        $normalizedMinimumEducation = $this->normalizeMinimumEducationRequirement(
            $request->input('educational_attainment_required')
        );

        DB::table('jobs_catalog')->where('id', $id)->update([
            'title' => $request->title,
            'location' => $request->location,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'employment_type' => $request->employment_type,
            'industry' => $request->industry,
            'required_skills' => json_encode($request->required_skills ?? []),
            'educational_attainment_required' => $normalizedMinimumEducation,
            'description' => $request->description,
            'status' => $request->input('status', $job->status), // Safely defaults to existing if null
            'updated_at' => now(),
        ]);

        $updatedJob = DB::table('jobs_catalog')->where('id', $id)->first();
        if ($updatedJob) {
            $this->triggerN8nJobMatch($updatedJob);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Job updated successfully.',
            'job' => $updatedJob,
        ]);
    }

    public function deleteJob(Request $request, $id)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $employer = User::where('email', $request->email)->first();
        if (!$employer) {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $job = DB::table('jobs_catalog')->where('id', $id)->first();
        if (!$job) {
            return response()->json(['status' => 'error', 'message' => 'Job not found.'], 404);
        }

        if ((int) $job->employer_id !== (int) $employer->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to delete this job.'], 403);
        }

        DB::table('jobs_catalog')->where('id', $id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Job deleted successfully.',
        ]);
    }

    public function adminEmployers()
    {
        $employers = DB::table('users')
            ->where('role', 'Employer')
            ->orderByDesc('created_at')
            ->select([
                'id',
                'name',
                'company_name',
                'email',
                'is_verified',
                'employer_verification_status',
                'uploaded_docs',
                'verification_doc_path',
                'verification_doc_bir_path',
                'verification_doc_sec_path',
                'verification_doc_business_permit_path',
                'created_at',
            ])
            ->get();

        return response()->json([
            'status' => 'success',
            'employers' => $employers,
        ]);
    }

    public function reviewEmployer(Request $request)
    {
        $request->validate([
            'employer_id' => ['required', 'integer', 'exists:users,id'],
            'approved' => ['required', 'boolean'],
        ]);

        $employer = User::find($request->employer_id);
        if (!$employer || ($employer->role ?? '') !== 'Employer') {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $approved = (bool) $request->approved;
        $hasCompleteDocuments = !empty($employer->verification_doc_bir_path)
            && !empty($employer->verification_doc_sec_path)
            && !empty($employer->verification_doc_business_permit_path);

        if ($approved && !$hasCompleteDocuments) {
            return response()->json([
                'status' => 'error',
                'message' => 'Employer cannot be approved until BIR, SEC, and Business Permit files are complete.',
            ], 422);
        }

        $employer->is_verified = $approved;
        $employer->uploaded_docs = !empty($employer->verification_doc_bir_path)
            || !empty($employer->verification_doc_sec_path)
            || !empty($employer->verification_doc_business_permit_path);
        $employer->employer_verification_status = $approved
            ? 'verified'
            : ($hasCompleteDocuments ? 'under_review' : 'pending');
        $employer->employer_verified_at = $approved ? now() : null;

        $employer->save();

        return response()->json([
            'status' => 'success',
            'message' => $approved ? 'Employer approved.' : 'Employer moved to pending so documents can be updated.',
            'employer' => $employer,
        ]);
    }

    public function adminAnalytics()
    {
        $windowStart = now()->subDays(30);

        $totalEmployers = DB::table('users')
            ->where('role', 'Employer')
            ->count();

        $verifiedEmployers = DB::table('users')
            ->where('role', 'Employer')
            ->where('is_verified', true)
            ->count();

        $pendingEmployerReviews = DB::table('users')
            ->where('role', 'Employer')
            ->where(function ($query) {
                $query
                    ->whereIn('employer_verification_status', ['pending', 'under_review'])
                    ->orWhere(function ($legacyQuery) {
                        $legacyQuery->where('uploaded_docs', true)->where('is_verified', false);
                    });
            })
            ->count();

        $pendingSeekerReviews = DB::table('users')
            ->where('role', 'Seeker')
            ->whereNotNull('seeker_id_doc_path')
            ->whereIn('id_verification_status', ['manual_review', 'not_submitted'])
            ->count();

        $totalFeedback = DB::table('application_feedback')->count();
        $averageRating = (float) (DB::table('application_feedback')->avg('rating') ?? 0);

        $ratingCounts = DB::table('application_feedback')
            ->select('rating', DB::raw('COUNT(*) as total'))
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $ratingBreakdown = collect(range(5, 1))
            ->map(function (int $rating) use ($ratingCounts) {
                return [
                    'rating' => $rating,
                    'total' => (int) ($ratingCounts[$rating] ?? 0),
                ];
            })
            ->values();

        $statusCounts = DB::table('applications')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $decisionBreakdown = collect(['Pending', 'Interview', 'Hired', 'Declined'])
            ->map(function (string $status) use ($statusCounts) {
                return [
                    'status' => $status,
                    'total' => (int) ($statusCounts[$status] ?? 0),
                ];
            })
            ->values();

        $topEmployers = DB::table('users as u')
            ->leftJoin('jobs_catalog as j', 'j.employer_id', '=', 'u.id')
            ->leftJoin('applications as a', 'a.job_id', '=', 'j.id')
            ->leftJoin('application_feedback as af', 'af.application_id', '=', 'a.id')
            ->where('u.role', 'Employer')
            ->groupBy('u.id', 'u.name', 'u.company_name', 'u.email', 'u.is_verified', 'u.employer_verification_status')
            ->select([
                'u.id',
                'u.name',
                'u.company_name',
                'u.email',
                'u.is_verified',
                'u.employer_verification_status',
                DB::raw('COUNT(DISTINCT j.id) as total_jobs'),
                DB::raw('COUNT(DISTINCT a.id) as total_applications'),
                DB::raw("SUM(CASE WHEN a.status = 'Hired' THEN 1 ELSE 0 END) as hired_count"),
                DB::raw("SUM(CASE WHEN a.status = 'Interview' THEN 1 ELSE 0 END) as interview_count"),
                DB::raw('COUNT(DISTINCT af.id) as feedback_count'),
                DB::raw('COALESCE(ROUND(AVG(af.rating), 2), 0) as average_rating'),
            ])
            ->orderByDesc('hired_count')
            ->orderByDesc('average_rating')
            ->orderByDesc('total_applications')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $totalApplications = (int) ($item->total_applications ?? 0);
                $hiredCount = (int) ($item->hired_count ?? 0);

                $item->employer_label = trim((string) ($item->company_name ?: $item->name ?: $item->email ?: 'Unknown employer'));
                $item->total_jobs = (int) ($item->total_jobs ?? 0);
                $item->total_applications = $totalApplications;
                $item->hired_count = $hiredCount;
                $item->interview_count = (int) ($item->interview_count ?? 0);
                $item->feedback_count = (int) ($item->feedback_count ?? 0);
                $item->average_rating = (float) ($item->average_rating ?? 0);
                $item->conversion_rate = $totalApplications > 0
                    ? round(($hiredCount / $totalApplications) * 100, 1)
                    : 0;

                return $item;
            })
            ->values();

        $employerAnalyticsTopCompanies = $topEmployers->map(function ($item) {
            return [
                'id' => $item->id,
                'label' => $item->employer_label,
                'email' => $item->email,
                'isVerified' => (bool) $item->is_verified,
                'totalJobs' => (int) ($item->total_jobs ?? 0),
                'totalApplications' => (int) ($item->total_applications ?? 0),
                'hiredCount' => (int) ($item->hired_count ?? 0),
                'interviewCount' => (int) ($item->interview_count ?? 0),
                'feedbackCount' => (int) ($item->feedback_count ?? 0),
                'averageRating' => (float) ($item->average_rating ?? 0),
                'conversionRate' => (float) ($item->conversion_rate ?? 0),
            ];
        })->values();

        $companyFairSignals = DB::table('job_fairs')
            ->where('created_at', '>=', $windowStart)
            ->select('companies')
            ->get()
            ->flatMap(function ($fair) {
                $companies = json_decode($fair->companies ?? '[]', true);

                if (!is_array($companies)) {
                    return [];
                }

                return collect($companies)
                    ->filter(fn ($company) => trim((string) $company) !== '')
                    ->map(fn ($company) => mb_strtolower(trim((string) $company)))
                    ->all();
            })
            ->countBy();

        $employerAnalyticsTopCompanies = $employerAnalyticsTopCompanies->map(function ($item) use ($companyFairSignals) {
            $companyKey = mb_strtolower(trim((string) $item['label']));
            $item['jobFairSignals'] = (int) ($companyFairSignals[$companyKey] ?? 0);

            return $item;
        });

        $seekerRows = DB::table('users')
            ->where('role', 'Seeker')
            ->select([
                'id',
                'gender',
                'id_extracted_gender',
                'is_qc_resident',
                'bday_year',
                'id_verification_status',
                'created_at',
            ])
            ->get();

        $ageBreakdown = [
            'Under 18' => 0,
            '18-24' => 0,
            '25-34' => 0,
            '35-44' => 0,
            '45+' => 0,
            'Unknown' => 0,
        ];
        $genderBreakdown = [
            'Male' => 0,
            'Female' => 0,
            'Other/Unspecified' => 0,
        ];
        $residencyBreakdown = [
            'QC' => 0,
            'Non-QC' => 0,
        ];

        foreach ($seekerRows as $seeker) {
            $age = null;
            if (!empty($seeker->bday_year) && is_numeric($seeker->bday_year)) {
                $age = (int) now()->year - (int) $seeker->bday_year;
            }

            if ($age === null || $age < 0) {
                $ageBreakdown['Unknown']++;
            } elseif ($age < 18) {
                $ageBreakdown['Under 18']++;
            } elseif ($age <= 24) {
                $ageBreakdown['18-24']++;
            } elseif ($age <= 34) {
                $ageBreakdown['25-34']++;
            } elseif ($age <= 44) {
                $ageBreakdown['35-44']++;
            } else {
                $ageBreakdown['45+']++;
            }

            $gender = mb_strtolower(trim((string) ($seeker->id_extracted_gender ?: $seeker->gender ?: '')));
            if (in_array($gender, ['male', 'm'], true)) {
                $genderBreakdown['Male']++;
            } elseif (in_array($gender, ['female', 'f'], true)) {
                $genderBreakdown['Female']++;
            } else {
                $genderBreakdown['Other/Unspecified']++;
            }

            if ((bool) $seeker->is_qc_resident) {
                $residencyBreakdown['QC']++;
            } else {
                $residencyBreakdown['Non-QC']++;
            }
        }

        $windowedApplications = DB::table('applications')
            ->where('created_at', '>=', $windowStart);

        $stageCounts = (clone $windowedApplications)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $hiredSeekerIds = (clone $windowedApplications)
            ->where('status', 'Hired')
            ->pluck('seeker_id');

        $hiredSeekers = DB::table('users')
            ->whereIn('id', $hiredSeekerIds)
            ->get();

        $seekerAnalytics = [
            'summary' => [
                'totalSeekers' => (int) $seekerRows->count(),
                'qcSeekers' => $residencyBreakdown['QC'],
                'nonQcSeekers' => $residencyBreakdown['Non-QC'],
                'verifiedSeekers' => (int) $seekerRows->where('id_verification_status', 'verified')->count(),
                'applicationsInWindow' => (int) $windowedApplications->clone()->count(),
                'hiredSeekers' => (int) $hiredSeekers->count(),
            ],
            'ageBreakdown' => $ageBreakdown,
            'genderBreakdown' => $genderBreakdown,
            'residencyBreakdown' => $residencyBreakdown,
            'applicationStageBreakdown' => collect(['Pending', 'Interview', 'Hired', 'Declined'])
                ->mapWithKeys(fn ($status) => [$status => (int) ($stageCounts[$status] ?? 0)])
                ->all(),
            'hiredByResidency' => [
                'QC' => (int) $hiredSeekers->where('is_qc_resident', true)->count(),
                'Non-QC' => (int) $hiredSeekers->where('is_qc_resident', false)->count(),
            ],
            'hiredByGender' => [
                'Male' => (int) $hiredSeekers->filter(fn ($seeker) => in_array(mb_strtolower(trim((string) ($seeker->id_extracted_gender ?: $seeker->gender ?: ''))), ['male', 'm'], true))->count(),
                'Female' => (int) $hiredSeekers->filter(fn ($seeker) => in_array(mb_strtolower(trim((string) ($seeker->id_extracted_gender ?: $seeker->gender ?: ''))), ['female', 'f'], true))->count(),
                'Other/Unspecified' => (int) $hiredSeekers->filter(fn ($seeker) => !in_array(mb_strtolower(trim((string) ($seeker->id_extracted_gender ?: $seeker->gender ?: ''))), ['male', 'm', 'female', 'f'], true))->count(),
            ],
        ];

        return response()->json([
            'status' => 'success',
            'analytics' => [
                'summary' => [
                    'total_employers' => $totalEmployers,
                    'verified_employers' => $verifiedEmployers,
                    'pending_employer_reviews' => $pendingEmployerReviews,
                    'pending_seeker_reviews' => $pendingSeekerReviews,
                    'total_feedback' => $totalFeedback,
                    'average_rating' => round($averageRating, 2),
                ],
                'rating_breakdown' => $ratingBreakdown,
                'decision_breakdown' => $decisionBreakdown,
                'top_employers' => $topEmployers,
                'employer_analytics' => [
                    'summary' => [
                        'totalEmployers' => $totalEmployers,
                        'verifiedEmployers' => $verifiedEmployers,
                        'pendingEmployerReviews' => $pendingEmployerReviews,
                        'totalJobsPosted' => DB::table('jobs_catalog')->where('created_at', '>=', $windowStart)->count(),
                        'totalApplicationsReceived' => (int) (clone $windowedApplications)->count(),
                        'hiresInWindow' => (int) (clone $windowedApplications)->where('status', 'Hired')->count(),
                        'jobFairParticipationSignals' => (int) $companyFairSignals->sum(),
                        'totalFeedback' => $totalFeedback,
                        'averageRating' => round($averageRating, 2),
                    ],
                    'topCompanies' => $employerAnalyticsTopCompanies,
                ],
                'seeker_analytics' => $seekerAnalytics,
            ],
        ]);
    }

    public function adminSeekers()
    {
        $seekers = DB::table('users')
            ->where('role', 'Seeker')
            ->whereNotNull('seeker_id_doc_path')
            ->orderByRaw("CASE
                WHEN id_verification_status = 'manual_review' THEN 0
                WHEN id_verification_status = 'not_submitted' THEN 1
                WHEN id_verification_status = 'rejected' THEN 2
                WHEN id_verification_status = 'verified' THEN 3
                ELSE 4
            END")
            ->orderByDesc('updated_at')
            ->select([
                'id',
                'name',
                'email',
                'qc_id',
                'uploaded_docs',
                'seeker_id_doc_path',
                'seeker_id_doc_original_name',
                'seeker_id_doc_stored_name',
                'id_verification_status',
                'id_verification_reason',
                'id_verification_checked_at',
                'id_extracted_name',
                'id_extracted_birthdate',
                'id_extracted_gender',
                'id_birthdate_matches_profile',
                'id_gender_matches_profile',
                'is_priority_verified',
                'created_at',
                'updated_at',
            ])
            ->get();

        return response()->json([
            'status' => 'success',
            'seekers' => $seekers,
        ]);
    }

    public function reviewSeekerId(Request $request)
    {
        $request->validate([
            'seeker_id' => ['required', 'integer', 'exists:users,id'],
            'approved' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $seeker = User::find($request->seeker_id);
        if (!$seeker || ($seeker->role ?? '') !== 'Seeker') {
            return response()->json(['status' => 'error', 'message' => 'Seeker not found.'], 404);
        }

        if (empty($seeker->seeker_id_doc_path)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This seeker has no uploaded ID document to review.',
            ], 422);
        }

        $approved = (bool) $request->approved;
        $reason = trim((string) ($request->reason ?? ''));

        if (!$approved && $reason === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'A reason is required when marking a seeker as unverified.',
            ], 422);
        }

        $seeker->id_verification_status = $approved ? 'verified' : 'rejected';
        $seeker->id_verification_reason = $approved ? null : $reason;
        $seeker->id_verification_provider = 'admin_manual_review';
        $seeker->id_verification_checked_at = now();
        $seeker->is_priority_verified = $approved;
        $seeker->save();

        DB::table('notifications')->insert([
            'to_user_id' => $seeker->id,
            'content' => $approved
                ? 'Your QC ID has been verified by the admin team.'
                : 'Your QC ID could not be verified: ' . $reason,
            'meta' => json_encode([
                'type' => 'seeker_id_review',
                'approved' => $approved,
                'reason' => $approved ? null : $reason,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $approved ? 'Seeker ID verified.' : 'Seeker ID marked as unverified.',
            'seeker' => $seeker->fresh(),
        ]);
    }

    public function trainings(Request $request)
    {
        $query = DB::table('trainings as t')
            ->leftJoin('training_registrations as tr', 'tr.training_id', '=', 't.id')
            ->groupBy('t.id', 't.title', 't.provider', 't.start_date', 't.end_date', 't.slots', 't.type', 't.description', 't.created_at', 't.updated_at')
            ->select([
                't.id',
                't.title',
                't.provider',
                't.start_date',
                't.end_date',
                't.slots',
                't.type',
                't.description',
                't.created_at',
                't.updated_at',
            ])
            ->selectRaw('COUNT(tr.id) as registered_count')
            ->selectRaw('GREATEST(t.slots - COUNT(tr.id), 0) as available_slots');

        if ($request->filled('q')) {
            $keyword = $request->string('q')->toString();
            $query->where(function ($inner) use ($keyword) {
                $inner->where('t.title', 'ilike', '%' . $keyword . '%')
                    ->orWhere('t.provider', 'ilike', '%' . $keyword . '%')
                    ->orWhere('t.description', 'ilike', '%' . $keyword . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('t.type', $request->string('type')->toString());
        }

        $trainings = $query->orderBy('t.start_date')->get();

        $registeredByTraining = DB::table('training_registrations')
            ->select('training_id', 'user_id')
            ->get()
            ->groupBy('training_id');

        $trainings = $trainings->map(function ($training) use ($registeredByTraining) {
            $registeredUserIds = ($registeredByTraining->get($training->id) ?? collect())
                ->pluck('user_id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $training->registered_user_ids = $registeredUserIds;

            return $training;
        });

        return response()->json([
            'status' => 'success',
            'trainings' => $trainings,
        ]);
    }

    public function registerTraining(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'training_id' => ['required', 'integer', 'exists:trainings,id'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $training = DB::table('trainings')->where('id', $request->training_id)->first();
        if (!$training) {
            return response()->json(['status' => 'error', 'message' => 'Training not found.'], 404);
        }

        $alreadyRegistered = DB::table('training_registrations')
            ->where('training_id', $training->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyRegistered) {
            return response()->json([
                'status' => 'success',
                'message' => 'Already registered for this training.',
            ]);
        }

        $registeredCount = DB::table('training_registrations')
            ->where('training_id', $training->id)
            ->count();

        if ((int) $registeredCount >= (int) ($training->slots ?? 0)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No available slots for this training.',
            ], 422);
        }

        DB::table('training_registrations')->insert([
            'training_id' => $training->id,
            'user_id' => $user->id,
            'registered_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Training registration successful.',
        ]);
    }

    public function withdrawTraining(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'training_id' => ['required', 'integer', 'exists:trainings,id'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $deleted = DB::table('training_registrations')
            ->where('training_id', $request->training_id)
            ->where('user_id', $user->id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not registered for this training.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Training withdrawal successful.',
        ]);
    }

    public function notifications(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $notifications = DB::table('notifications')
            ->where('to_user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationRead(Request $request)
    {
        $request->validate([
            'notification_id' => ['required', 'integer', 'exists:notifications,id'],
        ]);

        DB::table('notifications')
            ->where('id', $request->notification_id)
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read.',
        ]);
    }

    public function generatePulse(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $activeApplicationsCount = DB::table('applications')
            ->where('seeker_id', $user->id)
            ->whereIn('status', ['Pending', 'Interview'])
            ->count();

        $content = "Pulse update: You currently have {$activeApplicationsCount} active application(s).";

        $notificationId = DB::table('notifications')->insertGetId([
            'to_user_id' => $user->id,
            'content' => $content,
            'meta' => json_encode(['type' => 'pulse']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pulse generated.',
            'notification_id' => $notificationId,
            'content' => $content,
        ]);
    }

    public function matchMetrics(Request $request)
    {
        $request->validate([
            'job_id' => ['required', 'integer', 'exists:jobs_catalog,id'],
            'email' => ['nullable', 'email'],
            'seeker_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (!$request->filled('email') && !$request->filled('seeker_id')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Either email or seeker_id is required.',
            ], 422);
        }

        $user = $request->filled('seeker_id')
            ? User::find($request->seeker_id)
            : User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $job = DB::table('jobs_catalog')->where('id', $request->job_id)->first();
        if (!$job) {
            return response()->json(['status' => 'error', 'message' => 'Job not found.'], 404);
        }

        $metrics = $this->calculateMatchMetricsForJobAndSeeker($job, $user);
        $n8nMatch = $this->getLatestN8nMatch((int) $job->id, (int) $user->id);

        if ($n8nMatch && $metrics['education_match'] !== false) {
            $metrics['score'] = (int) $n8nMatch->match_score;
        }

        return response()->json([
            'status' => 'success',
            'score' => $metrics['score'],
            'matched_skills' => $metrics['matched_skills'],
            'missing_skills' => $metrics['missing_skills'],
            'required_skills_count' => $metrics['required_skills_count'],
            'user_skills_count' => $metrics['user_skills_count'],
            'education_match' => $metrics['education_match'],
            'job_required_education' => $metrics['job_required_education'],
            'user_education' => $metrics['user_education'],
            'match_reasons' => $n8nMatch?->match_reasons,
        ]);
    }

    public function seekerRecommendations(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'min_score' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || ($user->role ?? '') !== 'Seeker') {
            return response()->json(['status' => 'error', 'message' => 'Seeker not found.'], 404);
        }

        $minScore = (int) ($request->input('min_score', 50));

        $latestMatches = DB::table('job_matches as jm')
            ->select('jm.job_id', 'jm.user_id', DB::raw('MAX(jm.id) as latest_id'))
            ->where('jm.user_id', $user->id)
            ->groupBy('jm.job_id', 'jm.user_id');

        $recommendations = DB::table('jobs_catalog as j')
            ->joinSub($latestMatches, 'latest', function ($join) {
                $join->on('latest.job_id', '=', 'j.id');
            })
            ->join('job_matches as jm', 'jm.id', '=', 'latest.latest_id')
            ->leftJoin('users as e', 'e.id', '=', 'j.employer_id')
            ->where('j.status', 'Open')
            ->where('jm.match_score', '>=', $minScore)
            ->orderByDesc('jm.match_score')
            ->orderByDesc('j.created_at')
            ->select([
                'j.id',
                'j.employer_id',
                'j.title',
                'j.company',
                'j.location',
                'j.salary_min',
                'j.salary_max',
                'j.employment_type',
                'j.industry',
                'j.description',
                'j.required_skills',
                'j.educational_attainment_required',
                'j.status',
                'j.created_at',
                'e.company_website as employer_company_website',
                'jm.match_score',
                'jm.match_reasons',
            ])
            ->get()
            ->filter(function ($item) use ($user) {
                $job = (object) [
                    'required_skills' => $item->required_skills,
                    'educational_attainment_required' => $item->educational_attainment_required,
                ];

                $metrics = $this->calculateMatchMetricsForJobAndSeeker($job, $user);

                return $metrics['education_match'] !== false;
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'recommendations' => $recommendations,
        ]);
    }

    public function employerApplications(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $employer = User::where('email', $request->email)->first();
        if (!$employer || ($employer->role ?? '') !== 'Employer') {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $latestMatches = DB::table('job_matches as jm')
            ->select('jm.job_id', 'jm.user_id', DB::raw('MAX(jm.id) as latest_id'))
            ->groupBy('jm.job_id', 'jm.user_id');

        $applications = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->join('users as s', 's.id', '=', 'a.seeker_id')
            ->leftJoinSub($latestMatches, 'latest', function ($join) {
                $join->on('latest.job_id', '=', 'a.job_id')
                    ->on('latest.user_id', '=', 'a.seeker_id');
            })
            ->leftJoin('job_matches as jm', 'jm.id', '=', 'latest.latest_id')
            ->where('j.employer_id', $employer->id)
            ->orderByDesc('a.created_at')
            ->select([
                'a.id',
                'a.job_id',
                'a.seeker_id',
                'a.status',
                'a.rejection_reason',
                'a.decline_reason_code',
                'a.decline_reason_text',
                'a.declined_at',
                'a.applied_at',
                'a.created_at',
                'j.title as job_title',
                'j.company',
                'j.location',
                'j.employment_type',
                'j.required_skills',
                'j.educational_attainment_required',
                's.name as seeker_name',
                's.email as seeker_email',
                's.qc_id as seeker_qc_id',
                's.bday_month',
                's.bday_day',
                's.bday_year',
                's.gender as seeker_gender',
                's.resume_path as seeker_resume_path',
                's.resume_text as seeker_resume_text',
                's.parsed_skill as seeker_parsed_skill',
                's.educational_attainment as seeker_educational_attainment',
                's.portfolio_url as seeker_portfolio_url',
                's.linkedin_url as seeker_linkedin_url',
                's.github_url as seeker_github_url',
                's.facebook_url as seeker_facebook_url',
                's.instagram_url as seeker_instagram_url',
                'jm.match_score as n8n_match_score',
                'jm.match_reasons as n8n_match_reasons',
            ])
            ->get()
            ->map(function ($item) {
                $job = (object) [
                    'required_skills' => $item->required_skills,
                    'educational_attainment_required' => $item->educational_attainment_required,
                ];

                $seeker = (object) [
                    'parsed_skill' => $item->seeker_parsed_skill,
                    'educational_attainment' => $item->seeker_educational_attainment,
                ];

                $metrics = $this->calculateMatchMetricsForJobAndSeeker($job, $seeker);

                $item->fit_score = $item->n8n_match_score !== null
                    ? (int) $item->n8n_match_score
                    : $metrics['score'];
                $item->matched_skills = $metrics['matched_skills'];
                $item->missing_skills = $metrics['missing_skills'];
                $item->education_match = $metrics['education_match'];
                $item->match_reasons = $item->n8n_match_reasons;

                if ($metrics['education_match'] === false) {
                    $item->fit_score = 0;
                    $educationReason = 'Auto-disqualified: educational attainment does not meet the job requirement.';
                    $item->match_reasons = $item->n8n_match_reasons
                        ? $item->n8n_match_reasons . ' | ' . $educationReason
                        : $educationReason;
                }

                return $item;
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'applications' => $applications,
        ]);
    }

    public function updateApplicationStatus(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'application_id' => ['required', 'integer', 'exists:applications,id'],
            'status' => ['required', 'string', 'in:Pending,Interview,Hired,Declined'],
            'decline_reason_code' => ['nullable', 'string', 'in:skills_mismatch,education_requirement_not_met,failed_interview,position_filled,salary_expectation_mismatch,no_show,others'],
            'decline_reason_text' => ['nullable', 'string', 'max:1000'],
        ]);

        $employer = User::where('email', $request->email)->first();
        if (!$employer || ($employer->role ?? '') !== 'Employer') {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $application = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->where('a.id', $request->application_id)
            ->where('j.employer_id', $employer->id)
            ->select('a.id', 'a.seeker_id', 'a.job_id', 'a.status', 'j.title as job_title')
            ->first();

        if (!$application) {
            return response()->json(['status' => 'error', 'message' => 'Application not found for this employer.'], 404);
        }

        $status = $this->normalizeApplicationStatus((string) $request->status);
        $currentStatus = $this->normalizeApplicationStatus((string) ($application->status ?? 'Pending'));

        $allowedTransitions = [
            'Pending' => ['Interview'],
            'Interview' => ['Hired', 'Declined'],
            'Hired' => [],
            'Declined' => [],
        ];

        if ($status !== $currentStatus && !in_array($status, $allowedTransitions[$currentStatus] ?? [], true)) {
            return response()->json([
                'status' => 'error',
                'message' => "Invalid status transition from {$currentStatus} to {$status}.",
            ], 422);
        }

        $declineReasonCode = null;
        $declineReasonText = null;
        $declinedAt = null;

        if ($status === 'Declined') {
            $declineReasonCode = trim((string) $request->input('decline_reason_code', ''));
            if ($declineReasonCode === '') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'A decline reason is required when setting status to Declined.',
                ], 422);
            }

            $declineReasonText = trim((string) $request->input('decline_reason_text', ''));
            if ($declineReasonCode === 'others' && $declineReasonText === '') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please provide details when decline reason is Others.',
                ], 422);
            }

            $declineReasonMap = [
                'skills_mismatch' => 'Applicant skills did not match job requirements.',
                'education_requirement_not_met' => 'Applicant did not meet educational requirement.',
                'failed_interview' => 'Applicant did not pass interview assessment.',
                'salary_expectation_mismatch' => 'Applicant salary expectations did not align with budget.',
                'no_show' => 'Applicant did not show up to interview.',
                'position_filled' => 'Position was already filled.',
                'others' => $declineReasonText,
            ];

            $declineReasonText = $declineReasonMap[$declineReasonCode] ?? $declineReasonText;
            $declinedAt = now();
        }

        DB::table('applications')
            ->where('id', $request->application_id)
            ->update([
                'status' => $status,
                'rejection_reason' => $status === 'Declined' ? $declineReasonText : null,
                'decline_reason_code' => $declineReasonCode,
                'decline_reason_text' => $declineReasonText,
                'declined_at' => $declinedAt,
                'updated_at' => now(),
            ]);

        $notificationType = match ($status) {
            'Interview' => 'application_interview',
            'Hired' => 'application_hired',
            'Declined' => 'application_declined',
            default => 'application_status',
        };

        $notifContent = $this->generateNotificationContent($notificationType, [
            'job_title' => $application->job_title,
        ]);

        DB::table('notifications')->insert([
            'to_user_id' => $application->seeker_id,
            'content' => $notifContent['content'],
            'meta' => json_encode([
                'type' => 'application_status',
                'application_id' => $application->id,
                'job_id' => $application->job_id,
                'status' => $status,
                'decline_reason_code' => $declineReasonCode,
                'decline_reason_text' => $declineReasonText,
                'emoji' => $notifContent['emoji'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Application status updated.',
        ]);
    }

    public function submitEmployerFeedback(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'application_id' => ['required', 'integer', 'exists:applications,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'feedback_comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $seeker = User::where('email', $request->email)->first();
        if (!$seeker || ($seeker->role ?? '') !== 'Seeker') {
            return response()->json(['status' => 'error', 'message' => 'Seeker not found.'], 404);
        }

        $application = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->where('a.id', $request->application_id)
            ->where('a.seeker_id', $seeker->id)
            ->select([
                'a.id',
                'a.status',
                'a.job_id',
                'j.employer_id',
                'j.title as job_title',
                'j.company as company_name',
            ])
            ->first();

        if (!$application) {
            return response()->json([
                'status' => 'error',
                'message' => 'Application found for this seeker.',
            ], 404);
        }

        if (!in_array($this->normalizeApplicationStatus((string) $application->status), ['Hired', 'Declined'], true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback can only be submitted after the final application decision.',
            ], 422);
        }

        $comment = trim((string) ($request->feedback_comment ?? ''));
        $existingFeedback = DB::table('application_feedback')
            ->where('application_id', $application->id)
            ->first();

        $payload = [
            'job_id' => $application->job_id,
            'employer_id' => $application->employer_id,
            'seeker_id' => $seeker->id,
            'rating' => (int) $request->rating,
            'feedback_comment' => $comment !== '' ? $comment : null,
            'submitted_at' => now(),
            'updated_at' => now(),
        ];

        if ($existingFeedback) {
            DB::table('application_feedback')
                ->where('application_id', $application->id)
                ->update($payload);
        } else {
            DB::table('application_feedback')->insert([
                'application_id' => $application->id,
                'created_at' => now(),
                ...$payload,
            ]);
        }

        $preview = $comment !== ''
            ? (mb_strlen($comment) > 120 ? mb_substr($comment, 0, 117) . '...' : $comment)
            : null;

        DB::table('notifications')->insert([
            'to_user_id' => $application->employer_id,
            'content' => $preview
                ? "A seeker rated your hiring process {$request->rating}/5 for {$application->job_title}: {$preview}"
                : "A seeker rated your hiring process {$request->rating}/5 for {$application->job_title}.",
            'meta' => json_encode([
                'type' => 'employer_feedback',
                'application_id' => $application->id,
                'job_id' => $application->job_id,
                'rating' => (int) $request->rating,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $feedback = DB::table('application_feedback')
            ->where('application_id', $application->id)
            ->first();

        return response()->json([
            'status' => 'success',
            'message' => $existingFeedback ? 'Feedback updated successfully.' : 'Feedback submitted successfully.',
            'feedback' => $feedback,
        ]);
    }

    public function messages(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $messages = DB::table('messages as m')
            ->leftJoin('users as from_user', 'from_user.id', '=', 'm.from_user_id')
            ->leftJoin('users as to_user', 'to_user.id', '=', 'm.to_user_id')
            ->where('m.from_user_id', $user->id)
            ->orWhere('m.to_user_id', $user->id)
            ->orderByDesc('m.created_at')
            ->select([
                'm.id',
                'm.from_user_id',
                'm.to_user_id',
                'm.content',
                'm.read_at',
                'm.created_at',
                'm.updated_at',
                'from_user.name as from_name',
                'from_user.company_name as from_company_name',
                'to_user.name as to_name',
                'to_user.company_name as to_company_name',
            ])
            ->get();

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'to_user_id' => ['required', 'integer', 'exists:users,id'],
            'content' => ['required', 'string', 'max:3000'],
        ]);

        $fromUser = User::where('email', $request->email)->first();
        if (!$fromUser) {
            return response()->json(['status' => 'error', 'message' => 'Sender not found.'], 404);
        }

        if ((int) $fromUser->id === (int) $request->to_user_id) {
            return response()->json(['status' => 'error', 'message' => 'Cannot send message to self.'], 422);
        }

        $messageId = DB::table('messages')->insertGetId([
            'from_user_id' => $fromUser->id,
            'to_user_id' => $request->to_user_id,
            'content' => $request->content,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $senderLabel = trim((string) ($fromUser->company_name ?: $fromUser->name ?: 'New message'));
        $messagePreview = trim((string) $request->content);
        if (mb_strlen($messagePreview) > 120) {
            $messagePreview = mb_substr($messagePreview, 0, 117) . '...';
        }

        DB::table('notifications')->insert([
            'to_user_id' => $request->to_user_id,
            'content' => $senderLabel . ': ' . $messagePreview,
            'meta' => json_encode([
                'type' => 'message',
                'message_id' => $messageId,
                'from_user_id' => $fromUser->id,
                'message_preview' => $messagePreview,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $message = DB::table('messages')->where('id', $messageId)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent.',
            'data' => $message,
        ]);
    }

    public function markMessagesRead(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'contact_user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        DB::table('messages')
            ->where('from_user_id', $request->contact_user_id)
            ->where('to_user_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Messages marked as read.',
        ]);
    }

    private function buildBirthdayDisplay(User $user): ?string
    {
        if (!$user->bday_month || !$user->bday_day || !$user->bday_year) {
            return null;
        }

        return trim("{$user->bday_month} {$user->bday_day}, {$user->bday_year}");
    }

    private function mapRibbon(string $status): array
    {
        $normalizedStatus = $this->normalizeApplicationStatus($status);

        return match ($normalizedStatus) {
            'Pending' => ['label' => 'Pending', 'variant' => 'info'],
            'Interview' => ['label' => 'Interview', 'variant' => 'primary'],
            'Hired' => ['label' => 'Hired', 'variant' => 'success'],
            'Declined' => ['label' => 'Declined', 'variant' => 'danger'],
            default => ['label' => $normalizedStatus, 'variant' => 'default'],
        };
    }

    private function normalizeApplicationStatus(string $status): string
    {
        return match ($status) {
            'Viewing' => 'Pending',
            'Rejected', 'Withdrawn', 'Cancelled' => 'Declined',
            default => $status,
        };
    }

    private function calculateMatchMetricsForJobAndSeeker(object $job, object $user): array
    {
        $userSkills = $this->toArraySkills($user->parsed_skill ?? null);
        $requiredSkills = $this->toArraySkills($job->required_skills ?? null);

        $normalizedUserSkills = array_map(fn ($s) => mb_strtolower(trim((string) $s)), $userSkills);
        $normalizedRequired = array_map(fn ($s) => mb_strtolower(trim((string) $s)), $requiredSkills);

        $matches = [];
        foreach ($normalizedRequired as $index => $requiredSkill) {
            if (in_array($requiredSkill, $normalizedUserSkills, true)) {
                $matches[] = $requiredSkills[$index] ?? $requiredSkill;
            }
        }

        $missing = [];
        foreach ($normalizedRequired as $index => $requiredSkill) {
            if (!in_array($requiredSkill, $normalizedUserSkills, true)) {
                $missing[] = $requiredSkills[$index] ?? $requiredSkill;
            }
        }

        $score = count($requiredSkills) > 0
            ? (int) round((count($matches) / count($requiredSkills)) * 100)
            : 0;

        $jobRequiredEducation = trim((string) ($job->educational_attainment_required ?? ''));
        $userEducation = trim((string) ($user->educational_attainment ?? ''));

        $educationCheck = $this->evaluateEducationQualification($jobRequiredEducation, $userEducation);
        $educationMatch = $educationCheck['is_required'] ? $educationCheck['qualified'] : null;

        if ($educationMatch === false) {
            $score = 0;
        }

        return [
            'score' => $score,
            'matched_skills' => array_values(array_unique($matches)),
            'missing_skills' => array_values(array_unique($missing)),
            'required_skills_count' => count($requiredSkills),
            'user_skills_count' => count($userSkills),
            'education_match' => $educationMatch,
            'job_required_education' => $educationCheck['required_label'],
            'user_education' => $educationCheck['candidate_label'],
        ];
    }

    private function evaluateEducationQualification(string $requiredEducation, string $candidateEducation): array
    {
        $requiredLabel = trim($requiredEducation);
        $candidateLabel = trim($candidateEducation);

        $requiredNormalized = mb_strtolower($requiredLabel);
        $isRequired = $requiredNormalized !== '' && !in_array($requiredNormalized, ['any', 'not specified', 'n/a', 'na', 'none'], true);

        if (!$isRequired) {
            return [
                'is_required' => false,
                'qualified' => true,
                'required_label' => null,
                'candidate_label' => $candidateLabel !== '' ? $candidateLabel : null,
                'required_level' => null,
                'candidate_level' => $this->inferEducationLevel($candidateLabel),
            ];
        }

        $requiredLevel = $this->inferEducationLevel($requiredLabel);
        $candidateLevel = $this->inferEducationLevel($candidateLabel);

        $qualified = false;

        if ($requiredLevel !== null && $candidateLevel !== null) {
            $qualified = $this->educationLevelRank($candidateLevel) >= $this->educationLevelRank($requiredLevel);
        } else {
            $candidateNormalized = mb_strtolower($candidateLabel);
            $qualified = $candidateNormalized !== ''
                && ($candidateNormalized === $requiredNormalized || str_contains($candidateNormalized, $requiredNormalized));
        }

        return [
            'is_required' => true,
            'qualified' => $qualified,
            'required_label' => $requiredLabel !== '' ? $requiredLabel : null,
            'candidate_label' => $candidateLabel !== '' ? $candidateLabel : null,
            'required_level' => $requiredLevel,
            'candidate_level' => $candidateLevel,
        ];
    }

    private function inferEducationLevel(string $value): ?string
    {
        $normalized = mb_strtolower(trim($value));
        if ($normalized === '' || in_array($normalized, ['any', 'not specified', 'n/a', 'na', 'none'], true)) {
            return null;
        }

        $map = [
            'doctorate' => ['doctorate', 'doctoral', 'phd', 'doctor of philosophy'],
            'masters' => ['master', 'masters', "master's", 'm.s', 'ms', 'm.a', 'ma', 'mba'],
            'bachelors' => ['bachelor', 'bachelors', "bachelor's", 'b.s', 'bs', 'b.a', 'ba', 'college graduate', 'college grad'],
            'associate' => ['associate degree', 'associate'],
            'vocational' => ['vocational', 'tesda', 'certificate', 'technical-vocational', 'nc ii', 'nc iii'],
            'highschool' => ['high school', 'secondary', 'senior high', 'shs'],
        ];

        foreach ($map as $level => $keywords) {
            foreach ($keywords as $keyword) {
                if (preg_match('/\b' . preg_quote($keyword, '/') . '\b/u', $normalized)) {
                    return $level;
                }
            }
        }

        return null;
    }

    private function normalizeMinimumEducationRequirement(?string $value): ?string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        $normalized = mb_strtolower($raw);
        if (in_array($normalized, ['any', 'not specified', 'n/a', 'na', 'none'], true)) {
            return null;
        }

        $level = $this->inferEducationLevel($raw);

        return match ($level) {
            'highschool' => 'At least High School',
            'vocational' => 'At least Vocational / TESDA',
            'associate' => 'At least Associate Degree',
            'bachelors' => "At least Bachelor's Degree",
            'masters' => "At least Master's Degree",
            'doctorate' => 'At least Doctorate',
            default => $raw,
        };
    }

    private function educationLevelRank(string $level): int
    {
        return match ($level) {
            'highschool' => 1,
            'associate', 'vocational' => 2,
            'bachelors' => 3,
            'masters' => 4,
            'doctorate' => 5,
            default => 0,
        };
    }

    private function getLatestN8nMatch(int $jobId, int $userId): ?object
    {
        return DB::table('job_matches')
            ->where('job_id', $jobId)
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->first(['match_score', 'match_reasons']);
    }

    private function toArraySkills(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($item) => is_string($item) || is_numeric($item)));
        }

        if (is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_values(array_filter($decoded, fn ($item) => is_string($item) || is_numeric($item)));
            }
        }

        return [];
    }

    /**
     * Shorten job titles for notifications.
     * Abbreviates common patterns and truncates if needed.
     * Examples:
     * - "Senior Full-Stack Developer" => "Sr. Full-Stack Developer" (25 chars)
     * - "Very Long Job Title Description Here" => "Very Long Job Title D..." (25 chars)
     */
    private function shortenJobTitle(string $title, int $maxLength = 25): string
    {
        $title = trim($title);
        
        // Abbreviate common prefixes
        $abbreviations = [
            '/^Senior /' => 'Sr. ',
            '/^Junior /' => 'Jr. ',
            '/^Lead /' => 'Lead ',
            '/^Principal /' => 'Principal ',
            '/^Staff /' => 'Staff ',
            '/^Chief /' => 'Chief ',
        ];
        
        foreach ($abbreviations as $pattern => $replacement) {
            if (preg_match($pattern, $title)) {
                $title = preg_replace($pattern, $replacement, $title, 1);
                break;
            }
        }
        
        // Truncate if too long
        if (mb_strlen($title) > $maxLength) {
            return mb_substr($title, 0, $maxLength - 3) . '...';
        }
        
        return $title;
    }

    /**
     * Generate user-friendly notification content based on type.
     * Returns both the display text and optional emoji for meta storage.
     */
    private function generateNotificationContent(string $type, array $data): array
    {
        $jobTitleShort = $this->shortenJobTitle($data['job_title'] ?? 'the position');
        
        return match ($type) {
            'application_submitted' => [
                'content' => "Your application for {$jobTitleShort} was submitted. We'll review it and get back to you soon.",
                'emoji' => '✔️',
            ],
            'application_interview' => [
                'content' => "Next step: Interview for {$jobTitleShort}. You'll hear from us soon.",
                'emoji' => '📝',
            ],
            'application_hired' => [
                'content' => "🎉 Congratulations! You've been hired for {$jobTitleShort}. Check your email for next steps.",
                'emoji' => '🎉',
            ],
            'application_declined' => [
                'content' => "Unfortunately, we've moved forward with other candidates for {$jobTitleShort}. Keep applying—your next opportunity is waiting!",
                'emoji' => '💪',
            ],
            'application_auto_rejected_education' => [
                'content' => "Your profile didn't match the requirements for {$jobTitleShort} (requires {$data['required_education']}). We recommend upskilling and reapplying!",
                'emoji' => '📚',
            ],
            'new_application_to_employer' => [
                'content' => "{$data['seeker_name']} applied for {$jobTitleShort}.",
                'emoji' => '👤',
            ],
            default => [
                'content' => $data['fallback'] ?? 'New notification.',
                'emoji' => '🔔',
            ],
        };
    }
}