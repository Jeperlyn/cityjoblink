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
        // Add columns only if they don't already exist (prevents duplicate column errors)
        if (!Schema::hasColumn('users', 'company_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('company_name')->nullable();
            });
        }

        if (!Schema::hasColumn('users', 'address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('address')->nullable();
            });
        }

        if (!Schema::hasColumn('users', 'industry')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('industry')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop columns only if they exist
        $drop = [];
        if (Schema::hasColumn('users', 'company_name')) {
            $drop[] = 'company_name';
        }
        if (Schema::hasColumn('users', 'address')) {
            $drop[] = 'address';
        }
        if (Schema::hasColumn('users', 'industry')) {
            $drop[] = 'industry';
        }

        if (!empty($drop)) {
            Schema::table('users', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }
};