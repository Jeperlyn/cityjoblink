<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Job;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ADMIN ACCOUNT (Yung gusto mong email)
        // Using firstOrCreate to prevent "Duplicate Entry" errors if you run seed twice
        User::firstOrCreate(
            ['email' => 'admin@peso.gov.ph'],
            [
                'name' => 'PESO Admin',
                'password' => Hash::make('admin'), // Password: 'admin'
                'role' => 'Admin',
            ]
        );

        // Backup Admin (Optional)
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'Admin',
            ]
        );

        // 2. EMPLOYER ACCOUNT
        User::firstOrCreate(
            ['email' => 'employer@gmail.com'],
            [
                'name' => 'Telco Solutions Inc.',
                'password' => Hash::make('password'),
                'role' => 'Employer',
                'industry' => 'BPO / Call Center',
            ]
        );

        // 3. JOB SEEKER ACCOUNT
        User::firstOrCreate(
            ['email' => 'juan@gmail.com'],
            [
                'name' => 'Juan Dela Cruz',
                'password' => Hash::make('password'),
                'role' => 'Seeker',
                'qc_id' => 'QC-12345678',
            ]
        );

        // 4. SAMPLE JOBS (Only runs if Job model exists)
        if (class_exists(Job::class)) {
            Job::create([
                'title' => 'Customer Service Manager',
                'company' => 'Telco Solutions Inc.',
                'location' => 'Quezon City, District 1',
                'salary' => '₱25k - ₱35k',
                'type' => 'Full-time',
                'description' => 'We are looking for an experienced Customer Service Manager to provide excellent customer service.',
            ]);

            Job::create([
                'title' => 'Administrative Assistant',
                'company' => 'QC Local Government',
                'location' => 'Quezon City Hall',
                'salary' => '₱18k - ₱22k',
                'type' => 'Contract',
                'description' => 'Responsible for handling clerical tasks in our office.',
            ]);
        }
    }
}