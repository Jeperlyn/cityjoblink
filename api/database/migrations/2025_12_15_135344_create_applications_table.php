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
    Schema::create('applications', function (Blueprint $table) {
        $table->id();
        $table->foreignId('job_id')->constrained()->onDelete('cascade');
        $table->foreignId('seeker_id')->constrained('users')->onDelete('cascade');
        $table->string('status')->default('Pending'); // Pending, Interview, Hired, Rejected
        $table->text('rejection_reason')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
