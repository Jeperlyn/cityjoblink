<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Job;

class JobController extends Controller
{
    public function index() { return Job::all(); }

    public function store(Request $request) {
        $validated = $request->validate([
            'title' => 'required', 'company' => 'required', 'location' => 'required',
            'type' => 'required', 'salary' => 'required', 'description' => 'nullable'
        ]);
        $job = Job::create($validated);
        return response()->json(['message' => 'Job posted', 'job' => $job], 201);
    }
}