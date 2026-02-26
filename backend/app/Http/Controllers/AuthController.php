<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Smalot\PdfParser\Parser;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email is already registered. Please login instead.'
                ], 422);
            }

            // 1. Generate a random 6-digit OTP
            $otpCode = rand(100000, 999999);

            // 2. Store registration data temporarily until OTP is verified
            $cacheKey = 'pending_registration_' . strtolower((string) $request->email);
            Cache::put($cacheKey, [
                'name' => trim(($request->firstName ?? '') . ' ' . ($request->lastName ?? '')),
                'company_name' => $request->companyName,
                'qc_id' => $request->qcId,
                'bday_month' => $request->bdayMonth,
                'bday_day' => $request->bdayDay,
                'bday_year' => $request->bdayYear,
                'gender' => $request->gender,
                'is_qc_resident' => $request->isQcResident ?? true,
                'email' => $request->email,
                'role' => $request->role ?? 'Seeker',
                'password' => Hash::make($request->password),
                'otp' => (string) $otpCode,
            ], now()->addMinutes(10));

            // 3. Send the email OTP
            Mail::raw("Your CityJobLink verification code is: {$otpCode}", function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('CityJobLink - Your Verification Code');
            });

            return response()->json(['status' => 'success', 'message' => 'OTP sent to email.']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Connection is unstable, please try registering again.'
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['status' => 'error', 'message' => 'Invalid email or password'], 401);
            }

            return response()->json(['status' => 'success', 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        try {
            $cacheKey = 'pending_registration_' . strtolower((string) $request->email);
            $pendingRegistration = Cache::get($cacheKey);

            if (!$pendingRegistration) {
                return response()->json(['status' => 'error', 'message' => 'Invalid or expired OTP code.'], 401);
            }

            if ((string) ($pendingRegistration['otp'] ?? '') !== (string) $request->otp) {
                return response()->json(['status' => 'error', 'message' => 'Invalid or expired OTP code.'], 401);
            }

            $alreadyRegistered = User::where('email', $pendingRegistration['email'])->exists();
            if ($alreadyRegistered) {
                Cache::forget($cacheKey);
                return response()->json(['status' => 'error', 'message' => 'Email is already registered. Please login instead.'], 409);
            }

            User::create([
                'name' => $pendingRegistration['name'],
                'company_name' => $pendingRegistration['company_name'],
                'qc_id' => $pendingRegistration['qc_id'],
                'bday_month' => $pendingRegistration['bday_month'],
                'bday_day' => $pendingRegistration['bday_day'],
                'bday_year' => $pendingRegistration['bday_year'],
                'gender' => $pendingRegistration['gender'],
                'is_qc_resident' => $pendingRegistration['is_qc_resident'],
                'email' => $pendingRegistration['email'],
                'role' => $pendingRegistration['role'],
                'password' => $pendingRegistration['password'],
                'otp' => null,
                'is_verified' => true,
                'uploaded_docs' => false,
            ]);

            Cache::forget($cacheKey);

            return response()->json(['status' => 'success', 'message' => 'Account verified successfully!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadResume(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'resumeFile' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            ]);

            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found for the provided email.',
                ], 404);
            }

            if (!empty($user->resume_path)) {
                $oldPath = str_replace('storage/', '', (string) $user->resume_path);
                if ($oldPath !== '' && Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $storedPath = $request->file('resumeFile')->store('resumes', 'public');
            $resumeExtension = strtolower((string) $request->file('resumeFile')->getClientOriginalExtension());

            $parsedText = null;
            $extractedSkills = [];
            $parseMessage = 'Resume uploaded. Parsing skipped for this file type.';

            if ($resumeExtension === 'pdf') {
                $absolutePath = Storage::disk('public')->path($storedPath);
                $parser = new Parser();
                $pdf = $parser->parseFile($absolutePath);
                $parsedText = trim((string) $pdf->getText());

                if ($parsedText !== '') {
                    $knownSkills = $this->getKnownSkills();
                    $extractedSkills = $this->extractSkillsFromText($parsedText, $knownSkills);
                    $parseMessage = count($extractedSkills) > 0
                        ? 'Resume uploaded and parsed successfully.'
                        : 'Resume uploaded, but no known skills were detected.';
                } else {
                    $parseMessage = 'Resume uploaded, but no readable text was found in the PDF.';
                }
            }

            $user->resume_path = 'storage/' . $storedPath;
            $user->resume_text = $parsedText;
            $user->parsed_skills = $extractedSkills;
            $user->save();

            $topMatches = $this->buildTopMatches($extractedSkills);

            return response()->json([
                'status' => 'success',
                'message' => $parseMessage,
                'extracted_skills' => $extractedSkills,
                'top_matches' => $topMatches,
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload resume. Please try again.',
            ], 500);
        }
    }

    public function topMatches(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
            ]);

            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found for the provided email.',
                ], 404);
            }

            $skills = collect($user->parsed_skills ?? [])->filter()->values()->all();
            $matches = $this->buildTopMatches($skills);

            return response()->json([
                'status' => 'success',
                'skills' => $skills,
                'matches' => $matches,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to load top matches. Please try again.',
            ], 500);
        }
    }

    private function getKnownSkills(): array
    {
        $fallbackSkills = [
            'Communication',
            'Customer Service',
            'English Proficiency',
            'Problem Solving',
            'Management',
            'JavaScript',
            'React',
            'HTML/CSS',
            'Microsoft Office',
            'Organizing',
        ];

        $skillsFromJobs = [];
        $rows = DB::table('jobs_catalog')->select('required_skills')->get();

        foreach ($rows as $row) {
            $normalizedSkills = $this->normalizeSkills($row->required_skills ?? []);
            foreach ($normalizedSkills as $skill) {
                $skillsFromJobs[] = $skill;
            }
        }

        return array_values(array_unique(array_merge($fallbackSkills, $skillsFromJobs)));
    }

    private function normalizeSkills($value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $value = $decoded;
            } else {
                $value = explode(',', $value);
            }
        }

        if ($value instanceof \stdClass) {
            $value = (array) $value;
        }

        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(function ($item) {
            return is_string($item) ? trim($item) : '';
        }, $value)));
    }

    private function extractSkillsFromText(string $text, array $knownSkills): array
    {
        $normalizedText = strtolower(preg_replace('/\s+/', ' ', $text));
        $matches = [];

        foreach ($knownSkills as $skill) {
            $normalizedSkill = strtolower(trim($skill));
            if ($normalizedSkill === '') {
                continue;
            }

            $pattern = '/(^|[^a-z0-9])' . preg_quote($normalizedSkill, '/') . '([^a-z0-9]|$)/i';
            if (preg_match($pattern, $normalizedText) === 1) {
                $matches[] = $skill;
            }
        }

        return array_values(array_unique($matches));
    }

    private function calculateMatchScore(array $requiredSkills, array $userSkills): array
    {
        $required = array_values(array_filter(array_map('trim', $requiredSkills)));
        if (count($required) === 0) {
            return ['score' => 0, 'matches' => [], 'missing' => []];
        }

        $normalizedUserSkills = array_map(fn ($skill) => strtolower(trim((string) $skill)), $userSkills);
        $matched = [];

        foreach ($required as $requiredSkill) {
            $requiredNormalized = strtolower($requiredSkill);
            foreach ($normalizedUserSkills as $userSkill) {
                if ($requiredNormalized === $userSkill || str_contains($userSkill, $requiredNormalized) || str_contains($requiredNormalized, $userSkill)) {
                    $matched[] = $requiredSkill;
                    break;
                }
            }
        }

        $matched = array_values(array_unique($matched));
        $missing = array_values(array_diff($required, $matched));
        $score = (int) round((count($matched) / count($required)) * 100);

        return [
            'score' => $score,
            'matches' => $matched,
            'missing' => $missing,
        ];
    }

    private function buildTopMatches(array $skills): array
    {
        $jobs = DB::table('jobs_catalog')
            ->where('status', 'Open')
            ->orderByDesc('id')
            ->get();

        $scored = [];
        foreach ($jobs as $job) {
            $requiredSkills = $this->normalizeSkills($job->required_skills ?? []);
            $matchData = $this->calculateMatchScore($requiredSkills, $skills);

            $scored[] = [
                'job_id' => $job->id,
                'title' => $job->title,
                'company' => $job->company,
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'score' => $matchData['score'],
                'matched_skills' => $matchData['matches'],
                'missing_skills' => $matchData['missing'],
            ];
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($scored, 0, 5);
    }
}