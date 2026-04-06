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
            $table->string('educational_attainment')->nullable()->after('parsed_skill');
        });

        Schema::table('jobs_catalog', function (Blueprint $table) {
            $table->string('educational_attainment_required')->nullable()->after('required_skills');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs_catalog', function (Blueprint $table) {
            $table->dropColumn('educational_attainment_required');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('educational_attainment');
        });
    }
};
