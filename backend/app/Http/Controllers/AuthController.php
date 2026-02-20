<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            // 1. Generate a random 6-digit OTP
            $otpCode = rand(100000, 999999);

            // 2. Create the user and save the OTP
            $user = User::create([
                'name' => $request->firstName . ' ' . $request->lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'otp' => $otpCode // Save it to the database
            ]);

            // 3. Send the Email using your .env Gmail credentials
            Mail::raw("Your CityJobLink verification code is: {$otpCode}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('CityJobLink - Your Verification Code');
            });

            return response()->json(['status' => 'success', 'message' => 'OTP sent to email.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
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
            // Find the user with the matching email and OTP code
            $user = User::where('email', $request->email)
                        ->where('otp', $request->otp)
                        ->first();

            if (!$user) {
                return response()->json(['status' => 'error', 'message' => 'Invalid or expired OTP code.'], 401);
            }

            // Success! Clear the OTP so it can't be reused
            $user->otp = null;
            $user->save();

            return response()->json(['status' => 'success', 'message' => 'Account verified successfully!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}