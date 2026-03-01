<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['nullable', 'in:Seeker,Employer,Admin'],
                'firstName' => ['nullable', 'string', 'max:100'],
                'lastName' => ['nullable', 'string', 'max:100'],
                'companyName' => ['nullable', 'string', 'max:255'],
            ]);

            $role = $request->role ?? 'Seeker';

            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email is already registered. Please login instead.'
                ], 422);
            }

            $otpCode = rand(100000, 999999);

            $fullName = trim(($request->firstName ?? '') . ' ' . ($request->lastName ?? ''));
            $resolvedName = $role === 'Employer'
                ? trim((string) ($request->companyName ?? ''))
                : $fullName;

            if ($resolvedName === '') {
                return response()->json([
                    'status' => 'error',
                    'message' => $role === 'Employer'
                        ? 'Company name is required for employer registration.'
                        : 'First name and last name are required for seeker registration.',
                ], 422);
            }

            $cacheKey = 'pending_registration_' . strtolower((string) $request->email);
            Cache::put($cacheKey, [
                'name' => $resolvedName,
                'company_name' => $role === 'Employer' ? $request->companyName : null,
                'qc_id' => $request->qcId,
                'bday_month' => $request->bdayMonth,
                'bday_day' => $request->bdayDay,
                'bday_year' => $request->bdayYear,
                'gender' => $request->gender,
                'is_qc_resident' => $role === 'Seeker' ? ($request->isQcResident ?? true) : false,
                'email' => $request->email,
                'role' => $role,
                'password' => Hash::make($request->password),
                'otp' => (string) $otpCode,
                // ✅ FIXED: Idinagdag sa Cache para hindi makalimutan bago ang OTP verification
                'industry' => $role === 'Employer' ? $request->industry : null,
                'address' => $role === 'Employer' ? $request->companyAddress : null,
            ], now()->addMinutes(10));

            $mailDelivered = true;
            try {
                Mail::raw("Your CityJobLink verification code is: {$otpCode}", function ($message) use ($request) {
                    $message->to($request->email)
                        ->subject('CityJobLink - Your Verification Code');
                });
            } catch (\Throwable $mailException) {
                $mailDelivered = false;
                Log::warning('OTP email delivery failed during registration.', [
                    'email' => $request->email,
                    'role' => $role,
                    'error' => $mailException->getMessage(),
                ]);
            }

            if ($mailDelivered) {
                return response()->json(['status' => 'success', 'message' => 'OTP sent to email.']);
            }

            if (config('app.debug')) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'OTP generated, but email delivery failed. Use the provided dev OTP for local testing.',
                    'dev_otp' => (string) $otpCode,
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'OTP could not be sent right now. Please try again later.',
            ], 503);
        } catch (\Exception $e) {
            Log::error('Registration failed.', [
                'email' => $request->email,
                'role' => $request->role,
                'error' => $e->getMessage(),
            ]);

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
                'is_verified' => ($pendingRegistration['role'] ?? 'Seeker') === 'Employer' ? false : true,
                'uploaded_docs' => false,
                // ✅ FIXED: Ipapasok na sa Database mula sa Cache
                'industry' => $pendingRegistration['industry'] ?? null,
                'address' => $pendingRegistration['address'] ?? null,
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
                'resume' => ['required', 'file', 'mimes:pdf,docx', 'max:10240'],
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found.',
                ], 404);
            }

            if (!empty($user->resume_path)) {
                $oldPath = str_replace('storage/', '', (string) $user->resume_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $storedPath = $request->file('resume')->store('resumes', 'public');
            $absolutePath = Storage::disk('public')->path($storedPath);

            $resumeText = $this->extractResumeText($absolutePath);
            $parsedSkills = $this->extractSkillsFromText($resumeText);
            $educationalAttainment = $this->extractEducationalAttainment($resumeText);

            $user->resume_path = 'storage/' . $storedPath;
            $user->resume_text = $resumeText;
            $user->parsed_skill = $parsedSkills;
            $user->educational_attainment = $educationalAttainment;
            $user->uploaded_docs = true;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Resume securely saved and parsed!',
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Upload failed. Please check file size/format and parser setup.',
            ], 500);
        }
    }

    public function uploadEmployerDocuments(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'],
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found.',
                ], 404);
            }

            if (($user->role ?? '') !== 'Employer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only employer accounts can upload verification documents.',
                ], 422);
            }

            if (!empty($user->verification_doc_path)) {
                $oldPath = str_replace('storage/', '', (string) $user->verification_doc_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $storedPath = $request->file('document')->store('employer-documents', 'public');

            $user->verification_doc_path = 'storage/' . $storedPath;
            $user->uploaded_docs = true;
            $user->is_verified = false;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Verification documents submitted successfully.',
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload verification documents. Please try again.',
            ], 500);
        }
    }

    public function deleteResume(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found.',
                ], 404);
            }

            if (!empty($user->resume_path)) {
                $storedPath = str_replace('storage/', '', (string) $user->resume_path);
                if (Storage::disk('public')->exists($storedPath)) {
                    Storage::disk('public')->delete($storedPath);
                }
            }

            $user->resume_path = null;
            $user->resume_text = null;
            $user->parsed_skill = null;
            $user->uploaded_docs = false;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Resume removed successfully.',
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove resume.',
            ], 500);
        }
    }

    private function extractResumeText(string $filePath): string
    {
        if (!file_exists($filePath)) {
            return '';
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if ($extension === 'pdf') {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);

            return $this->normalizeText($pdf->getText());
        }

        if ($extension === 'docx') {
            $zip = new ZipArchive();
            if ($zip->open($filePath) === true) {
                $documentXml = $zip->getFromName('word/document.xml');
                $zip->close();

                if ($documentXml !== false) {
                    $text = preg_replace('/<[^>]+>/', ' ', $documentXml);
                    return $this->normalizeText(html_entity_decode((string) $text, ENT_QUOTES | ENT_XML1, 'UTF-8'));
                }
            }
        }

        return '';
    }

    private function extractSkillsFromText(string $text): array
    {
        $dictionary = [
            'php', 'laravel', 'javascript', 'typescript', 'react', 'vue', 'angular',
            'node.js', 'nodejs', 'sql', 'postgresql', 'mysql', 'mongodb', 'html', 'css',
            'tailwind', 'bootstrap', 'git', 'github', 'docker', 'kubernetes', 'python',
            'java', 'c#', 'c++', 'aws', 'azure', 'api', 'rest', 'graphql', 'figma',
            'communication', 'leadership', 'problem solving', 'project management'
        ];

        $normalizedText = Str::lower($text);
        $found = [];

        foreach ($dictionary as $skill) {
            if (str_contains($normalizedText, Str::lower($skill))) {
                $found[] = $skill;
            }
        }

        return array_values(array_unique($found));
    }

    private function extractEducationalAttainment(string $text): ?string
    {
        $normalized = Str::lower($text);

        if ($normalized === '') {
            return null;
        }

        if (str_contains($normalized, 'doctor') || str_contains($normalized, 'phd')) {
            return 'Doctorate';
        }

        if (str_contains($normalized, 'master') || str_contains($normalized, 'graduate school')) {
            return 'Master\'s Degree';
        }

        if (str_contains($normalized, 'bachelor') || str_contains($normalized, 'college graduate')) {
            return 'Bachelor\'s Degree';
        }

        if (str_contains($normalized, 'associate')) {
            return 'Associate Degree';
        }

        if (str_contains($normalized, 'senior high') || str_contains($normalized, 'high school')) {
            return 'High School Diploma';
        }

        return null;
    }

    private function normalizeText(string $text): string
    {
        $text = preg_replace('/\s+/', ' ', $text);

        return trim((string) $text);
    }
}