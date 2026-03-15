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
            if (!Schema::hasColumn('users', 'seeker_id_doc_path')) {
                $table->string('seeker_id_doc_path')->nullable()->after('verification_doc_path');
            }

            if (!Schema::hasColumn('users', 'seeker_id_doc_original_name')) {
                $table->string('seeker_id_doc_original_name')->nullable()->after('seeker_id_doc_path');
            }

            if (!Schema::hasColumn('users', 'seeker_id_doc_stored_name')) {
                $table->string('seeker_id_doc_stored_name')->nullable()->after('seeker_id_doc_original_name');
            }

            if (!Schema::hasColumn('users', 'id_verification_status')) {
                $table->string('id_verification_status')->default('not_submitted')->after('seeker_id_doc_stored_name');
            }

            if (!Schema::hasColumn('users', 'id_verification_reason')) {
                $table->text('id_verification_reason')->nullable()->after('id_verification_status');
            }

            if (!Schema::hasColumn('users', 'id_verification_confidence')) {
                $table->decimal('id_verification_confidence', 5, 4)->nullable()->after('id_verification_reason');
            }

            if (!Schema::hasColumn('users', 'id_verification_provider')) {
                $table->string('id_verification_provider')->nullable()->after('id_verification_confidence');
            }

            if (!Schema::hasColumn('users', 'id_verification_reference')) {
                $table->string('id_verification_reference')->nullable()->after('id_verification_provider');
            }

            if (!Schema::hasColumn('users', 'id_verification_checked_at')) {
                $table->timestamp('id_verification_checked_at')->nullable()->after('id_verification_reference');
            }

            if (!Schema::hasColumn('users', 'id_extracted_qc_id')) {
                $table->string('id_extracted_qc_id')->nullable()->after('id_verification_checked_at');
            }

            if (!Schema::hasColumn('users', 'id_extracted_name')) {
                $table->string('id_extracted_name')->nullable()->after('id_extracted_qc_id');
            }

            if (!Schema::hasColumn('users', 'id_ocr_text')) {
                $table->longText('id_ocr_text')->nullable()->after('id_extracted_name');
            }

            if (!Schema::hasColumn('users', 'is_priority_verified')) {
                $table->boolean('is_priority_verified')->default(false)->after('id_ocr_text');
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
                'is_priority_verified',
                'id_ocr_text',
                'id_extracted_name',
                'id_extracted_qc_id',
                'id_verification_checked_at',
                'id_verification_reference',
                'id_verification_provider',
                'id_verification_confidence',
                'id_verification_reason',
                'id_verification_status',
                'seeker_id_doc_stored_name',
                'seeker_id_doc_original_name',
                'seeker_id_doc_path',
            ];

            $existingColumns = array_filter($columnsToDrop, static fn (string $column): bool => Schema::hasColumn('users', $column));

            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
