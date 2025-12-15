<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    // 1. Get all jobs (for the list)
    public function index()
    {
        return DB::table('jobs')->orderBy('created_at', 'desc')->get();
    }

    // 2. Save a new job (for the "Post Job" button)
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'employer_id' => 'required',
            'company_name' => 'required',
            'title' => 'required',
            'description' => 'required',
            'location' => 'required',
            'type' => 'required',
            'salary' => 'required',
            'required_skills' => 'nullable'
        ]);

        // Insert into Database
        $id = DB::table('jobs')->insertGetId([
            'employer_id' => $validated['employer_id'],
            'company_name' => $validated['company_name'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'type' => $validated['type'],
            'salary' => $validated['salary'],
            'required_skills' => $validated['required_skills'] ?? '',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Job posted successfully!', 'id' => $id], 201);
    }
}