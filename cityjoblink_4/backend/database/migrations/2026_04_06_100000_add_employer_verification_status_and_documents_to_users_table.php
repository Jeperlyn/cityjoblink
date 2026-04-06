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
            $table->string('employer_verification_status', 32)->nullable()->after('is_verified');
            $table->string('verification_doc_bir_path')->nullable()->after('verification_doc_path');
            $table->string('verification_doc_sec_path')->nullable()->after('verification_doc_bir_path');
            $table->string('verification_doc_business_permit_path')->nullable()->after('verification_doc_sec_path');
            $table->timestamp('employer_docs_submitted_at')->nullable()->after('verification_doc_business_permit_path');
            $table->timestamp('employer_verified_at')->nullable()->after('employer_docs_submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employer_verification_status',
                'verification_doc_bir_path',
                'verification_doc_sec_path',
                'verification_doc_business_permit_path',
                'employer_docs_submitted_at',
                'employer_verified_at',
            ]);
        });
    }
};
