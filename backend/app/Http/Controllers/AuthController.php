<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $role = (string) ($request->input('role') ?? 'Seeker');
            $isSeeker = $role === 'Seeker';

            $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'role' => ['nullable', 'in:Seeker,Employer,Admin'],
                'firstName' => ['nullable', 'string', 'max:100'],
                'lastName' => ['nullable', 'string', 'max:100'],
                'companyName' => ['nullable', 'string', 'max:255'],
                'industry' => ['nullable', 'string', 'max:255'],
                'companyAddress' => ['nullable', 'string', 'max:255'],
                'qcId' => $isSeeker ? ['required', 'string', 'max:100'] : ['nullable', 'string', 'max:100'],
                'isQcResident' => ['nullable', 'boolean'],
                'bdayMonth' => ['nullable', 'string', 'max:20'],
                'bdayDay' => ['nullable', 'string', 'max:2'],
                'bdayYear' => ['nullable', 'string', 'max:4'],
                'gender' => ['nullable', 'string', 'max:50'],
                'qcIdFile' => $isSeeker
                    ? ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240']
                    : ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
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

            $pendingSeekerIdDocument = null;
            if ($role === 'Seeker' && $request->hasFile('qcIdFile')) {
                $pendingSeekerIdDocument = $this->storePendingSeekerIdDocument($request->file('qcIdFile'));
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
                'seeker_id_doc_path' => $pendingSeekerIdDocument['path'] ?? null,
                'seeker_id_doc_original_name' => $pendingSeekerIdDocument['original_name'] ?? null,
                'seeker_id_doc_stored_name' => $pendingSeekerIdDocument['stored_name'] ?? null,
                'id_verification_status' => ($role === 'Seeker' && $pendingSeekerIdDocument) ? 'pending' : 'not_submitted',
                'is_priority_verified' => false,
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
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
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

    public function requestPasswordResetOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
            ]);

            $email = strtolower((string) $request->email);
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email is not registered.',
                ], 404);
            }

            $otpCode = (string) rand(100000, 999999);
            $cacheKey = 'password_reset_otp_' . $email;

            Cache::put($cacheKey, [
                'email' => $email,
                'otp' => $otpCode,
            ], now()->addMinutes(10));

            $mailDelivered = true;
            try {
                Mail::raw("Your CityJobLink password reset code is: {$otpCode}", function ($message) use ($email) {
                    $message->to($email)
                        ->subject('CityJobLink - Password Reset Code');
                });
            } catch (\Throwable $mailException) {
                $mailDelivered = false;
                Log::warning('Password reset OTP email delivery failed.', [
                    'email' => $email,
                    'error' => $mailException->getMessage(),
                ]);
            }

            if ($mailDelivered) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Password reset code sent to your email.',
                ]);
            }

            if (config('app.debug')) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Reset code generated, but email delivery failed. Use the dev reset code for local testing.',
                    'dev_otp' => $otpCode,
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Reset code could not be sent right now. Please try again later.',
            ], 503);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Password reset OTP request failed.', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to process password reset request.',
            ], 500);
        }
    }

    public function resetPasswordWithOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'otp' => ['required', 'digits:6'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $email = strtolower((string) $request->email);
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email is not registered.',
                ], 404);
            }

            $cacheKey = 'password_reset_otp_' . $email;
            $pendingReset = Cache::get($cacheKey);

            if (!$pendingReset || (string) ($pendingReset['otp'] ?? '') !== (string) $request->otp) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid or expired reset code.',
                ], 401);
            }

            $user->password = Hash::make((string) $request->password);
            $user->save();

            Cache::forget($cacheKey);

            return response()->json([
                'status' => 'success',
                'message' => 'Password has been reset successfully. You can now log in.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Password reset failed.', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to reset password right now.',
            ], 500);
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

            $isSeekerRole = ($pendingRegistration['role'] ?? 'Seeker') === 'Seeker';
            $hasSeekerIdDocument = !empty($pendingRegistration['seeker_id_doc_path']);

            $user = User::create([
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
                'uploaded_docs' => $hasSeekerIdDocument,
                // ✅ FIXED: Ipapasok na sa Database mula sa Cache
                'industry' => $pendingRegistration['industry'] ?? null,
                'address' => $pendingRegistration['address'] ?? null,
                'seeker_id_doc_path' => $pendingRegistration['seeker_id_doc_path'] ?? null,
                'seeker_id_doc_original_name' => $pendingRegistration['seeker_id_doc_original_name'] ?? null,
                'seeker_id_doc_stored_name' => $pendingRegistration['seeker_id_doc_stored_name'] ?? null,
                'id_verification_status' => $isSeekerRole && $hasSeekerIdDocument
                    ? ($pendingRegistration['id_verification_status'] ?? 'pending')
                    : 'not_submitted',
                'is_priority_verified' => false,
            ]);

            if ($isSeekerRole && $hasSeekerIdDocument) {
                $this->moveSeekerIdDocumentToUserFolder($user);
            }

            if ($isSeekerRole) {
                $this->triggerN8nSeekerRegistered($user);

                if (!empty($user->seeker_id_doc_path)) {
                    $this->triggerN8nSeekerIdVerification($user);
                }
            }

            Cache::forget($cacheKey);

            return response()->json(['status' => 'success', 'message' => 'Account verified successfully!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function triggerN8nSeekerRegistered(User $user): void
    {
        $webhookUrl = config('services.n8n.seeker_webhook_url');

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

            $response = $request->post($webhookUrl, [
                'event' => 'seeker_registered',
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'parsed_skill' => $user->parsed_skill,
                'educational_attainment' => $user->educational_attainment,
                'is_qc_resident' => $user->is_qc_resident,
            ]);

            if ($response->successful()) {
                Log::info("n8n seeker registration webhook success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            } else {
                Log::warning("n8n seeker registration webhook non-success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $error) {
            Log::error('n8n seeker registration webhook trigger failed: ' . $error->getMessage());
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

            $originalResumeName = (string) $request->file('resume')->getClientOriginalName();
            $extension = (string) $request->file('resume')->getClientOriginalExtension();
            $hashedBaseName = hash('sha256', $originalResumeName . '|' . Str::uuid() . '|' . microtime(true));
            $storedFileName = $hashedBaseName . ($extension !== '' ? ('.' . $extension) : '');
            $storedPath = $request->file('resume')->storeAs('resumes', $storedFileName, 'public');
            $absolutePath = Storage::disk('public')->path($storedPath);

            $resumeText = $this->extractResumeText($absolutePath);
            $parsedSkills = $this->extractSkillsFromText($resumeText);
            $educationalAttainment = $this->extractEducationalAttainment($resumeText);

            $user->resume_path = 'storage/' . $storedPath;
            $user->resume_original_name = $originalResumeName;
            $user->resume_stored_name = $storedFileName;
            $user->resume_text = $resumeText;
            $user->parsed_skill = $parsedSkills;
            $user->educational_attainment = $educationalAttainment;
            $user->uploaded_docs = true;
            $user->save();

            DB::table('job_matches')
                ->where('user_id', $user->id)
                ->delete();

            if (($user->role ?? '') === 'Seeker') {
                $this->triggerN8nSeekerResumeUploaded($user);
            }

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

    public function uploadSeekerIdDocument(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
                'qc_id' => ['nullable', 'string', 'max:100'],
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found.',
                ], 404);
            }

            if (($user->role ?? '') !== 'Seeker') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only seeker accounts can upload QC/ID verification documents.',
                ], 422);
            }

            if (!empty($user->seeker_id_doc_path)) {
                $oldPath = str_replace('storage/', '', (string) $user->seeker_id_doc_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $storedDocument = $this->storeSeekerIdDocumentForUser($user, $request->file('document'));

            if ($request->filled('qc_id')) {
                $user->qc_id = trim((string) $request->qc_id);
            }

            $user->seeker_id_doc_path = $storedDocument['path'];
            $user->seeker_id_doc_original_name = $storedDocument['original_name'];
            $user->seeker_id_doc_stored_name = $storedDocument['stored_name'];
            $user->id_verification_status = 'pending';
            $user->id_verification_reason = null;
            $user->id_verification_confidence = null;
            $user->id_verification_provider = null;
            $user->id_verification_reference = null;
            $user->id_verification_checked_at = null;
            $user->id_extracted_qc_id = null;
            $user->id_extracted_name = null;
            $user->id_ocr_text = null;
            $user->is_priority_verified = false;
            $user->uploaded_docs = true;
            $user->save();

            $this->triggerN8nSeekerIdVerification($user);

            return response()->json([
                'status' => 'success',
                'message' => 'ID document uploaded. Automated verification is now in progress.',
                'user' => $user,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Seeker ID upload failed.', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload ID document. Please try again.',
            ], 500);
        }
    }

    public function handleSeekerIdVerificationWebhook(Request $request)
    {
        try {
            $expectedSecret = trim((string) config('services.n8n.seeker_id_verification_callback_secret', ''));

            if ($expectedSecret !== '') {
                $incomingSecret = trim((string) $request->header('X-CityJobLink-Webhook-Secret', ''));

                if ($incomingSecret === '' || !hash_equals($expectedSecret, $incomingSecret)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unauthorized webhook signature.',
                    ], 401);
                }
            }

            $validated = $request->validate([
                'user_id' => ['required', 'integer', 'exists:users,id'],
                'status' => ['required', 'in:pending,verified,rejected,manual_review,error'],
                'reason' => ['nullable', 'string', 'max:2000'],
                'confidence' => ['nullable', 'numeric', 'between:0,1'],
                'provider' => ['nullable', 'string', 'max:100'],
                'reference_id' => ['nullable', 'string', 'max:191'],
                'extracted_qc_id' => ['nullable', 'string', 'max:100'],
                'extracted_name' => ['nullable', 'string', 'max:255'],
                'ocr_text' => ['nullable', 'string'],
            ]);

            $user = User::find((int) $validated['user_id']);
            if (!$user || ($user->role ?? '') !== 'Seeker') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Seeker account not found.',
                ], 404);
            }

            $status = (string) $validated['status'];
            $reason = isset($validated['reason']) ? trim((string) $validated['reason']) : null;

            $user->id_verification_status = $status;
            $user->id_verification_reason = $reason ?: null;
            $user->id_verification_confidence = array_key_exists('confidence', $validated)
                ? (float) $validated['confidence']
                : null;
            $user->id_verification_provider = $validated['provider'] ?? null;
            $user->id_verification_reference = $validated['reference_id'] ?? null;
            $user->id_verification_checked_at = now();
            $user->id_extracted_qc_id = $validated['extracted_qc_id'] ?? null;
            $user->id_extracted_name = $validated['extracted_name'] ?? null;
            $user->id_ocr_text = $validated['ocr_text'] ?? null;
            $user->is_priority_verified = $status === 'verified';
            $user->save();

            $this->storeIdVerificationNotification($user, $status, $reason ?: null);

            return response()->json([
                'status' => 'success',
                'message' => 'ID verification webhook processed.',
                'user_id' => $user->id,
                'verification_status' => $user->id_verification_status,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Failed handling seeker ID verification webhook.', [
                'error' => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process verification callback.',
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
            $user->resume_original_name = null;
            $user->resume_stored_name = null;
            $user->resume_text = null;
            $user->parsed_skill = null;
            $user->educational_attainment = null;
            $user->uploaded_docs = !empty($user->seeker_id_doc_path);
            $user->save();

            DB::table('job_matches')
                ->where('user_id', $user->id)
                ->delete();

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

    private function triggerN8nSeekerResumeUploaded(User $user): void
    {
        $webhookUrl = config('services.n8n.seeker_resume_webhook_url');

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

            $response = $request->post($webhookUrl, [
                'event' => 'seeker_resume_uploaded',
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'resume_path' => $user->resume_path,
                'resume_original_name' => $user->resume_original_name,
                'resume_stored_name' => $user->resume_stored_name,
                'resume_text' => $user->resume_text,
                'parsed_skill' => $user->parsed_skill,
                'educational_attainment' => $user->educational_attainment,
                'uploaded_docs' => $user->uploaded_docs,
            ]);

            if ($response->successful()) {
                Log::info("n8n seeker resume webhook success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            } else {
                Log::warning("n8n seeker resume webhook non-success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $error) {
            Log::error('n8n seeker resume webhook trigger failed: ' . $error->getMessage());
        }
    }

    private function triggerN8nSeekerIdVerification(User $user): void
    {
        if (($user->role ?? '') !== 'Seeker' || empty($user->seeker_id_doc_path)) {
            return;
        }

        $webhookUrl = config('services.n8n.seeker_id_verification_webhook_url');
        if (!$webhookUrl) {
            return;
        }

        $documentUrl = $this->buildPublicStorageUrl((string) $user->seeker_id_doc_path);
        if (!$documentUrl) {
            Log::warning('Skipping seeker ID verification trigger because document URL could not be resolved.', [
                'user_id' => $user->id,
                'seeker_id_doc_path' => $user->seeker_id_doc_path,
            ]);
            return;
        }

        $callbackUrl = $this->resolveSeekerIdVerificationCallbackUrl();
        if (!$callbackUrl) {
            Log::warning('Skipping seeker ID verification trigger because callback URL could not be resolved.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        try {
            $request = Http::timeout((int) config('services.n8n.timeout_seconds', 10));

            $authUser = config('services.n8n.basic_auth_user');
            $authPassword = config('services.n8n.basic_auth_password');

            if ($authUser !== null && $authPassword !== null && $authUser !== '' && $authPassword !== '') {
                $request = $request->withBasicAuth((string) $authUser, (string) $authPassword);
            }

            $response = $request->post($webhookUrl, [
                'event' => 'seeker_id_uploaded',
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_qc_resident' => (bool) $user->is_qc_resident,
                'expected_qc_id' => $user->qc_id,
                'document_path' => $user->seeker_id_doc_path,
                'document_url' => $documentUrl,
                'callback_url' => $callbackUrl,
            ]);

            if ($response->successful()) {
                Log::info("n8n seeker ID verification webhook success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            } else {
                Log::warning("n8n seeker ID verification webhook non-success for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $error) {
            Log::error('n8n seeker ID verification webhook trigger failed: ' . $error->getMessage());
        }
    }

    private function storePendingSeekerIdDocument(\Illuminate\Http\UploadedFile $document): array
    {
        return $this->storeSeekerIdDocument($document, 'seeker-id-documents/pending');
    }

    private function storeSeekerIdDocumentForUser(User $user, \Illuminate\Http\UploadedFile $document): array
    {
        return $this->storeSeekerIdDocument($document, 'seeker-id-documents/' . $user->id);
    }

    private function storeSeekerIdDocument(\Illuminate\Http\UploadedFile $document, string $directory): array
    {
        $originalName = (string) $document->getClientOriginalName();
        $extension = (string) $document->getClientOriginalExtension();
        $hashedBaseName = hash('sha256', $originalName . '|' . Str::uuid() . '|' . microtime(true));
        $storedName = $hashedBaseName . ($extension !== '' ? ('.' . $extension) : '');
        $storedPath = $document->storeAs($directory, $storedName, 'public');

        return [
            'path' => 'storage/' . $storedPath,
            'original_name' => $originalName,
            'stored_name' => $storedName,
        ];
    }

    private function moveSeekerIdDocumentToUserFolder(User $user): void
    {
        $currentDocumentPath = trim((string) ($user->seeker_id_doc_path ?? ''));
        if ($currentDocumentPath === '') {
            return;
        }

        $currentRelativePath = str_replace('storage/', '', $currentDocumentPath);
        if ($currentRelativePath === '' || !Storage::disk('public')->exists($currentRelativePath)) {
            return;
        }

        $targetRelativePath = 'seeker-id-documents/' . $user->id . '/' . ((string) ($user->seeker_id_doc_stored_name ?: basename($currentRelativePath)));
        if ($currentRelativePath === $targetRelativePath) {
            return;
        }

        Storage::disk('public')->makeDirectory('seeker-id-documents/' . $user->id);
        Storage::disk('public')->move($currentRelativePath, $targetRelativePath);

        $user->seeker_id_doc_path = 'storage/' . $targetRelativePath;
        $user->save();
    }

    private function buildPublicStorageUrl(string $storagePath): ?string
    {
        $normalizedPath = trim($storagePath);
        if ($normalizedPath === '') {
            return null;
        }

        if (Str::startsWith($normalizedPath, ['http://', 'https://'])) {
            return $normalizedPath;
        }

        $baseUrl = trim((string) config('services.n8n.backend_public_base_url', config('app.url')));
        $baseUrl = rtrim($baseUrl, '/');

        if ($baseUrl === '') {
            return null;
        }

        return $baseUrl . '/' . ltrim($normalizedPath, '/');
    }

    private function resolveSeekerIdVerificationCallbackUrl(): ?string
    {
        $configuredUrl = trim((string) config('services.n8n.seeker_id_verification_callback_url', ''));
        if ($configuredUrl !== '') {
            return $configuredUrl;
        }

        $baseUrl = trim((string) config('services.n8n.backend_public_base_url', config('app.url')));
        $baseUrl = rtrim($baseUrl, '/');

        if ($baseUrl === '') {
            return null;
        }

        return $baseUrl . '/api/webhooks/seeker-id-verification-result';
    }

    private function storeIdVerificationNotification(User $user, string $status, ?string $reason = null): void
    {
        $statusMessages = [
            'verified' => 'Your QC ID verification is complete. Priority verification is now active on your account.',
            'rejected' => 'Your uploaded ID could not be validated automatically. Please upload a clearer QC/valid ID.',
            'manual_review' => 'Your uploaded ID needs manual review. Our team will check it shortly.',
            'error' => 'Automated ID verification failed due to a processing error. Please try uploading again.',
            'pending' => 'Your ID verification is currently being processed.',
        ];

        $content = $statusMessages[$status] ?? 'Your ID verification status has been updated.';
        if ($reason !== null && $reason !== '') {
            $content .= ' Reason: ' . $reason;
        }

        try {
            DB::table('notifications')->insert([
                'to_user_id' => $user->id,
                'content' => $content,
                'meta' => json_encode([
                    'type' => 'seeker_id_verification',
                    'verification_status' => $status,
                    'is_priority_verified' => (bool) $user->is_priority_verified,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to insert seeker ID verification notification.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
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