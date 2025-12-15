<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. USERS TABLE (With your custom fields)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role'); // Admin, Employer, Seeker
            $table->rememberToken();
            $table->timestamps();

            // ✅ Custom Fields for CityJobLink
            $table->string('qc_id')->nullable();
            $table->string('industry')->nullable();
            $table->string('id_image')->nullable();
            $table->string('company_name')->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('website')->nullable();
            $table->string('gender')->nullable();
            $table->date('birthdate')->nullable();
            
            // ✅ Admin Verification Status
            $table->boolean('is_verified')->default(false); 
        });

        // 2. PASSWORD RESET TOKENS TABLE (Standard Laravel Requirement)
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 3. SESSIONS TABLE (Crucial: This fixes your 500 Error)
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};