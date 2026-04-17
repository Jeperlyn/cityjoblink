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
            if (!Schema::hasColumn('users', 'resume_text')) {
                $table->longText('resume_text')->nullable()->after('resume_path');
            }

            if (!Schema::hasColumn('users', 'parsed_skill')) {
                $table->json('parsed_skill')->nullable()->after('resume_text');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'parsed_skill')) {
                $table->dropColumn('parsed_skill');
            }

            if (Schema::hasColumn('users', 'resume_text')) {
                $table->dropColumn('resume_text');
            }
        });
    }
};
