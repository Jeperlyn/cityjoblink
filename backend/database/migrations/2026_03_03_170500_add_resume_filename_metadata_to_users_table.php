<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'resume_original_name')) {
                $table->string('resume_original_name')->nullable()->after('resume_path');
            }

            if (!Schema::hasColumn('users', 'resume_stored_name')) {
                $table->string('resume_stored_name')->nullable()->after('resume_original_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drop = [];

            if (Schema::hasColumn('users', 'resume_stored_name')) {
                $drop[] = 'resume_stored_name';
            }

            if (Schema::hasColumn('users', 'resume_original_name')) {
                $drop[] = 'resume_original_name';
            }

            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
