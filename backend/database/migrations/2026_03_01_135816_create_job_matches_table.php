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
    Schema::create('job_matches', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('job_id'); // From job_catalog
        $table->unsignedBigInteger('user_id'); // The Seeker's ID
        $table->integer('match_score'); // e.g., 85
        $table->text('match_reasons')->nullable(); // e.g., "Degree Aligned | 3 skills matched"
        $table->timestamps();

        // Foreign keys to keep the data clean
        $table->foreign('job_id')->references('id')->on('jobs_catalog')->onDelete('cascade');
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_matches');
    }
};
