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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Seeker')->after('email')->index();
            $table->string('company_name')->nullable()->after('name');
            $table->boolean('is_verified')->default(false)->after('otp')->index();
            $table->boolean('uploaded_docs')->default(false)->after('is_verified');
        });

        Schema::create('jobs_catalog', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company');
            $table->string('location');
            $table->integer('salary_min')->nullable();
            $table->integer('salary_max')->nullable();
            $table->string('employment_type')->default('Full-time');
            $table->string('industry')->nullable();
            $table->json('required_skills')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('Open')->index();
            $table->timestamps();

            $table->index(['employer_id', 'status']);
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('jobs_catalog')->cascadeOnDelete();
            $table->foreignId('seeker_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('Pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();

            $table->unique(['job_id', 'seeker_id']);
            $table->index(['seeker_id', 'status']);
        });

        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('provider');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('slots')->default(0);
            $table->string('type')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('training_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_id')->constrained('trainings')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();

            $table->unique(['training_id', 'user_id']);
        });

        Schema::create('job_fairs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->date('event_date')->nullable();
            $table->string('time')->nullable();
            $table->string('organizer')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->json('highlights')->nullable();
            $table->json('companies')->nullable();
            $table->timestamps();
        });

        Schema::create('job_fair_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_fair_id')->constrained('job_fairs')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();

            $table->unique(['job_fair_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['from_user_id', 'to_user_id']);
            $table->index(['to_user_id', 'read_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['to_user_id', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('job_fair_participants');
        Schema::dropIfExists('job_fairs');
        Schema::dropIfExists('training_registrations');
        Schema::dropIfExists('trainings');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('jobs_catalog');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'company_name', 'is_verified', 'uploaded_docs']);
        });
    }
};
