<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeatureController extends Controller
{
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

        $applicationId = DB::table('applications')->insertGetId([
            'job_id' => $request->job_id,
            'seeker_id' => $seeker->id,
            'status' => 'Pending',
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('notifications')->insert([
            'to_user_id' => $job->employer_id,
            'content' => "{$seeker->name} applied for {$job->title}.",
            'meta' => json_encode([
                'type' => 'new_application',
                'application_id' => $applicationId,
                'job_id' => $job->id,
                'seeker_id' => $seeker->id,
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
        $request->validate([
            'email' => ['required', 'email'],
            'application_id' => ['required', 'integer', 'exists:applications,id'],
        ]);

        $seeker = User::where('email', $request->email)->first();
        if (!$seeker) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $application = DB::table('applications')
            ->where('id', $request->application_id)
            ->where('seeker_id', $seeker->id)
            ->first();

        if (!$application) {
            return response()->json(['status' => 'error', 'message' => 'Application not found for this user.'], 404);
        }

        DB::table('applications')
            ->where('id', $request->application_id)
            ->update([
                'status' => 'Withdrawn',
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Application withdrawn.',
        ]);
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
            ->where('a.seeker_id', $seeker->id)
            ->orderByDesc('a.created_at')
            ->select([
                'a.id',
                'a.job_id',
                'a.status',
                'a.applied_at',
                'a.rejection_reason',
                'a.created_at',
                'j.title as job_title',
                'j.company',
                'j.location',
                'j.employment_type',
                'j.educational_attainment_required',
            ])
            ->get()
            ->map(function ($item) {
                $ribbon = $this->mapRibbon((string) $item->status);
                $item->ribbon_label = $ribbon['label'];
                $item->ribbon_variant = $ribbon['variant'];
                return $item;
            })
            ->values();

        $withdrawnStatuses = ['Withdrawn', 'Cancelled'];

        $active = $applications->filter(fn ($app) => !in_array($app->status, $withdrawnStatuses, true))->values();
        $withdrawn = $applications->filter(fn ($app) => in_array($app->status, $withdrawnStatuses, true))->values();

        return response()->json([
            'status' => 'success',
            'active_applications' => $active,
            'withdrawn_applications' => $withdrawn,
        ]);
    }

    public function jobs(Request $request)
    {
        $query = DB::table('jobs_catalog');

        if (!$request->boolean('include_closed')) {
            $query->where('status', 'Open');
        }

        if ($request->filled('q')) {
            $keyword = $request->string('q')->toString();
            $query->where(function ($inner) use ($keyword) {
                $inner->where('title', 'ilike', '%' . $keyword . '%')
                    ->orWhere('company', 'ilike', '%' . $keyword . '%')
                    ->orWhere('description', 'ilike', '%' . $keyword . '%');
            });
        }

        if ($request->filled('location')) {
            $query->where('location', $request->string('location')->toString());
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->string('employment_type')->toString());
        }

        if ($request->filled('industry')) {
            $query->where('industry', $request->string('industry')->toString());
        }

        $jobs = $query->orderByDesc('created_at')->get();

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
            'educational_attainment_required' => $request->educational_attainment_required,
            'description' => $request->description,
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $job = DB::table('jobs_catalog')->where('id', $jobId)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Job posted successfully.',
            'job' => $job,
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
                'uploaded_docs',
                'verification_doc_path',
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
        $employer->is_verified = $approved;

        if (!$approved) {
            $employer->uploaded_docs = false;
        }

        $employer->save();

        return response()->json([
            'status' => 'success',
            'message' => $approved ? 'Employer approved.' : 'Employer rejected.',
            'employer' => $employer,
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

        return response()->json([
            'status' => 'success',
            'trainings' => $trainings,
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
            ->whereNotIn('status', ['Withdrawn', 'Cancelled'])
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

        $applications = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->join('users as s', 's.id', '=', 'a.seeker_id')
            ->where('j.employer_id', $employer->id)
            ->orderByDesc('a.created_at')
            ->select([
                'a.id',
                'a.job_id',
                'a.seeker_id',
                'a.status',
                'a.rejection_reason',
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

                $item->fit_score = $metrics['score'];
                $item->matched_skills = $metrics['matched_skills'];
                $item->missing_skills = $metrics['missing_skills'];
                $item->education_match = $metrics['education_match'];

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
            'status' => ['required', 'string', 'in:Pending,Viewing,Interview,Hired,Rejected'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $employer = User::where('email', $request->email)->first();
        if (!$employer || ($employer->role ?? '') !== 'Employer') {
            return response()->json(['status' => 'error', 'message' => 'Employer not found.'], 404);
        }

        $application = DB::table('applications as a')
            ->join('jobs_catalog as j', 'j.id', '=', 'a.job_id')
            ->where('a.id', $request->application_id)
            ->where('j.employer_id', $employer->id)
            ->select('a.id', 'a.seeker_id', 'a.job_id', 'j.title as job_title')
            ->first();

        if (!$application) {
            return response()->json(['status' => 'error', 'message' => 'Application not found for this employer.'], 404);
        }

        $status = (string) $request->status;
        $rejectionReason = $status === 'Rejected' ? (string) ($request->rejection_reason ?? '') : null;

        DB::table('applications')
            ->where('id', $request->application_id)
            ->update([
                'status' => $status,
                'rejection_reason' => $rejectionReason,
                'updated_at' => now(),
            ]);

        DB::table('notifications')->insert([
            'to_user_id' => $application->seeker_id,
            'content' => "Your application for {$application->job_title} is now {$status}.",
            'meta' => json_encode([
                'type' => 'application_status',
                'application_id' => $application->id,
                'job_id' => $application->job_id,
                'status' => $status,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Application status updated.',
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

        DB::table('notifications')->insert([
            'to_user_id' => $request->to_user_id,
            'content' => 'You have a new message.',
            'meta' => json_encode([
                'type' => 'message',
                'message_id' => $messageId,
                'from_user_id' => $fromUser->id,
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
        return match ($status) {
            'Pending' => ['label' => 'Pending', 'variant' => 'info'],
            'Viewing' => ['label' => 'Viewing', 'variant' => 'warning'],
            'Interview' => ['label' => 'Interview', 'variant' => 'primary'],
            'Hired' => ['label' => 'Hired', 'variant' => 'success'],
            'Rejected' => ['label' => 'Rejected', 'variant' => 'danger'],
            'Withdrawn', 'Cancelled' => ['label' => 'Withdrawn', 'variant' => 'muted'],
            default => ['label' => $status, 'variant' => 'default'],
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

        $educationMatch = false;
        if ($jobRequiredEducation !== '') {
            $educationMatch = mb_strtolower($jobRequiredEducation) === mb_strtolower($userEducation);
        }

        return [
            'score' => $score,
            'matched_skills' => array_values(array_unique($matches)),
            'missing_skills' => array_values(array_unique($missing)),
            'required_skills_count' => count($requiredSkills),
            'user_skills_count' => count($userSkills),
            'education_match' => $jobRequiredEducation === '' ? null : $educationMatch,
            'job_required_education' => $jobRequiredEducation !== '' ? $jobRequiredEducation : null,
            'user_education' => $userEducation !== '' ? $userEducation : null,
        ];
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
}
