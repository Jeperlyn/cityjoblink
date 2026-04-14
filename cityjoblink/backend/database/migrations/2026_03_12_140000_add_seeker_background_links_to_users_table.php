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
            if (!Schema::hasColumn('users', 'portfolio_url')) {
                $table->string('portfolio_url')->nullable()->after('company_website');
            }

            if (!Schema::hasColumn('users', 'linkedin_url')) {
                $table->string('linkedin_url')->nullable()->after('portfolio_url');
            }

            if (!Schema::hasColumn('users', 'github_url')) {
                $table->string('github_url')->nullable()->after('linkedin_url');
            }

            if (!Schema::hasColumn('users', 'facebook_url')) {
                $table->string('facebook_url')->nullable()->after('github_url');
            }

            if (!Schema::hasColumn('users', 'instagram_url')) {
                $table->string('instagram_url')->nullable()->after('facebook_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [
                'instagram_url',
                'facebook_url',
                'github_url',
                'linkedin_url',
                'portfolio_url',
            ];

            $existingColumns = array_filter($columnsToDrop, static fn (string $column): bool => Schema::hasColumn('users', $column));

            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};