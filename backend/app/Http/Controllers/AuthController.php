<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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
            $user->resume_path = 'storage/' . $storedPath;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Resume uploaded successfully.',
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload resume. Please try again.',
            ], 500);
        }
    }
}