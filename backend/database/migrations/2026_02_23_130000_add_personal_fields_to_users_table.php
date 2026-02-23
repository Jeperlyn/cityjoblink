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
            $table->string('qc_id')->nullable()->after('company_name');
            $table->string('bday_month')->nullable()->after('qc_id');
            $table->unsignedTinyInteger('bday_day')->nullable()->after('bday_month');
            $table->unsignedSmallInteger('bday_year')->nullable()->after('bday_day');
            $table->string('gender')->nullable()->after('bday_year');
            $table->boolean('is_qc_resident')->default(true)->after('gender');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'qc_id',
                'bday_month',
                'bday_day',
                'bday_year',
                'gender',
                'is_qc_resident',
            ]);
        });
    }
};
