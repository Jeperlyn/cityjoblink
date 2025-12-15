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
            // ✅ ADD THIS LINE:
            // nullable() is important so it doesn't break existing users
            $table->string('resume_path')->nullable()->after('id_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ✅ ADD THIS LINE (Good practice to clean up if you roll back):
            $table->dropColumn('resume_path');
        });
    }
};