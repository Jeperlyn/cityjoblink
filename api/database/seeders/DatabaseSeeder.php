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
        User::create([
            'name' => 'PESO Admin',
            'email' => 'admin@peso.gov.ph', // Ito na ang gamitin natin
            'password' => Hash::make('admin'), // Password: 'admin'
            'role' => 'Admin',
        ]);

        // Backup Admin (Optional)
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        // 2. EMPLOYER ACCOUNT
        User::create([
            'name' => 'Telco Solutions Inc.',
            'email' => 'employer@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'Employer',
            'industry' => 'BPO / Call Center',
        ]);

        // 3. JOB SEEKER ACCOUNT
        User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'Seeker',
            'qc_id' => 'QC-12345678',
        ]);

        // 4. SAMPLE JOBS (Galing sa mockData mo dati)
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