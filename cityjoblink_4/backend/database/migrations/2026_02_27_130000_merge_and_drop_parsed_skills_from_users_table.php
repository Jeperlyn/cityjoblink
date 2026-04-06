<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('users', 'parsed_skills') && Schema::hasColumn('users', 'parsed_skill')) {
            DB::statement('UPDATE users SET parsed_skill = parsed_skills WHERE parsed_skill IS NULL AND parsed_skills IS NOT NULL');

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('parsed_skills');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('users', 'parsed_skills')) {
            Schema::table('users', function (Blueprint $table) {
                $table->json('parsed_skills')->nullable()->after('resume_text');
            });
        }

        if (Schema::hasColumn('users', 'parsed_skills') && Schema::hasColumn('users', 'parsed_skill')) {
            DB::statement('UPDATE users SET parsed_skills = parsed_skill WHERE parsed_skills IS NULL AND parsed_skill IS NOT NULL');
        }
    }
};
