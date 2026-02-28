<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'admin@peso.gov.ph',
        ], [
            'name' => 'PESO Admin',
            'role' => 'Admin',
            'password' => Hash::make('admin'),
            'is_verified' => true,
            'uploaded_docs' => true,
            'otp' => null,
        ]);

        User::updateOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'role' => 'Seeker',
            'password' => Hash::make('password'),
            'is_verified' => true,
            'uploaded_docs' => false,
            'otp' => null,
        ]);
    }
}
