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
            // DITO NATIN ILALAGAY ANG MGA BAGONG COLUMNS:
            $table->string('role')->default('Seeker'); // Example: 'Admin', 'Employer', 'Seeker'
            $table->string('qc_id')->nullable();       // Para sa QCitizen ID
            $table->string('industry')->nullable();    // Para sa Employer Industry
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ITO NAMAN ANG MAGBUBURA PAG NAG-ROLLBACK TAYO:
            $table->dropColumn(['role', 'qc_id', 'industry']);
        });
    }
};