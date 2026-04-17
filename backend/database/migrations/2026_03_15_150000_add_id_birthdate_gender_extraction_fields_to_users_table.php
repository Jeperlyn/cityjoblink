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
            if (!Schema::hasColumn('users', 'id_extracted_birthdate')) {
                $table->string('id_extracted_birthdate', 20)->nullable()->after('id_extracted_name');
            }

            if (!Schema::hasColumn('users', 'id_extracted_gender')) {
                $table->string('id_extracted_gender', 10)->nullable()->after('id_extracted_birthdate');
            }

            if (!Schema::hasColumn('users', 'id_birthdate_matches_profile')) {
                $table->boolean('id_birthdate_matches_profile')->nullable()->after('id_extracted_gender');
            }

            if (!Schema::hasColumn('users', 'id_gender_matches_profile')) {
                $table->boolean('id_gender_matches_profile')->nullable()->after('id_birthdate_matches_profile');
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
                'id_gender_matches_profile',
                'id_birthdate_matches_profile',
                'id_extracted_gender',
                'id_extracted_birthdate',
            ];

            $existingColumns = array_filter($columnsToDrop, static fn (string $column): bool => Schema::hasColumn('users', $column));

            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
