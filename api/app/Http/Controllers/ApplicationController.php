<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    // 1. Submit an Application
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'seeker_id' => 'required|exists:users,id',
        ]);

        // Check if already applied
        $exists = DB::table('applications')
            ->where('job_id', $validated['job_id'])
            ->where('seeker_id', $validated['seeker_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already applied to this job.'], 400);
        }

        $id = DB::table('applications')->insertGetId([
            'job_id' => $validated['job_id'],
            'seeker_id' => $validated['seeker_id'],
            'status' => 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Application sent!', 'id' => $id], 201);
    }

    // 2. Get All Applications (For Dashboards)
    public function index()
    {
        // Join tables so we get Job Title and Seeker Name easily
        $apps = DB::table('applications')
            ->join('jobs', 'applications.job_id', '=', 'jobs.id')
            ->join('users', 'applications.seeker_id', '=', 'users.id')
            ->select(
                'applications.*',
                'jobs.title as job_title',
                'jobs.employer_id',
                'users.name as seeker_name',
                'users.email as seeker_email',
                'users.resume_path', // Needed for employer to view resume
                'users.id_image',
                'users.contact_number'
            )
            ->get();

        return response()->json($apps);
    }

    // 3. Update Status (For Employer: Hire/Reject)
    public function updateStatus(Request $request, $id)
    {
        DB::table('applications')
            ->where('id', $id)
            ->update([
                'status' => $request->status,
                'rejection_reason' => $request->rejection_reason ?? null,
                'updated_at' => now()
            ]);

        return response()->json(['message' => 'Status updated']);
    }
}