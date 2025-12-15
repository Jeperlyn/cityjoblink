<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request) 
    {
        // 1. Validate ALL incoming fields
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required',
            
            // New Fields
            'qc_id' => 'nullable|string',
            'industry' => 'nullable|string',
            'company_name' => 'nullable|string',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'website' => 'nullable|string',
            'gender' => 'nullable|string',
            'birthdate' => 'nullable|string', 
            
            // File Validation
            'id_image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // 2. Handle File Upload
            $imagePath = null;
            if ($request->hasFile('id_image')) {
                // This saves the file to "storage/app/public/qc_ids"
                $imagePath = $request->file('id_image')->store('qc_ids', 'public');
            }

            // 3. Handle Birthdate (Convert "1 Jan 2005" to "2005-01-01")
            $formattedBirthdate = null;
            if ($request->birthdate) {
                $formattedBirthdate = date('Y-m-d', strtotime($request->birthdate));
            }

            // 4. Create User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'qc_id' => $request->qc_id,
                'industry' => $request->industry,
                
                // Save new fields
                'id_image' => $imagePath,
                'company_name' => $request->company_name,
                'address' => $request->address,
                'contact_number' => $request->contact_number,
                'website' => $request->website,
                'gender' => $request->gender,
                'birthdate' => $formattedBirthdate,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully', 
                'user' => $user,
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            // Log the error so you can see it in storage/logs/laravel.log
            Log::error("Registration Error: " . $e->getMessage());
            
            return response()->json([
                'status' => 'error', 
                'message' => 'Server Error', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request) {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Logged in successfully',
            'user' => $user, 
            'token' => $token
        ]);
    }
}