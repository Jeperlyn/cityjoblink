<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class EmployerController extends Controller
{
    public function updateProfile(Request $request)
    {
        // 1. Find the employer using the email sent from the frontend
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        // 2. Update the database columns
        // Note: address and industry are the columns we added in the migration
        $user->update([
            'company_name'    => $request->companyName,
            'address'         => $request->companyAddress, 
            'industry'        => $request->industry,
            'contact_number'  => $request->contactNumber,
            'company_website' => $request->companyWebsite,
        ]);

        // 3. Return the FRESH user data so React can update the UI
        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully!',
            'user' => $user->fresh() 
        ]);
    }
}